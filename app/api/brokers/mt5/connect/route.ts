import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const METAAPI_BASE        = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const METAAPI_CLIENT_BASE = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

function metaApiError(rawText: string, status: number): string {
  try {
    const parsed = JSON.parse(rawText);
    // MetaApi validation errors include a `details` array with field-level messages
    if (Array.isArray(parsed.details) && parsed.details.length > 0) {
      const detail = parsed.details[0];
      const field = detail.parameter ?? detail.field ?? "";
      const msg   = detail.message ?? detail.msg ?? "";
      return field ? `${field}: ${msg}` : msg;
    }
    return parsed.message ?? parsed.error ?? parsed.title ?? rawText;
  } catch {
    return rawText;
  }
}

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { login, password, server, accountName } = await req.json();

  if (!login || !password || !server) {
    return NextResponse.json({ error: "login, password and server are required" }, { status: 400 });
  }

  const token = process.env.METAAPI_TOKEN;
  if (!token) return NextResponse.json({ error: "MetaApi token not configured" }, { status: 500 });

  // 1. Provision account on MetaApi
  const provisionUrl = `${METAAPI_BASE}/users/current/accounts`;
  const provisionBody = {
    login:       String(login),    // must be a string
    password,
    name:        accountName ?? `MT5 · ${login}`,
    server,                        // e.g. "TrenoMarketsLimited-Main"
    platform:    "mt5",            // lowercase required by MetaApi
    application: "MetaApi",
    magic:       0,
  };

  console.log("[mt5/connect] POST", provisionUrl);
  console.log("[mt5/connect] request body:", JSON.stringify({ ...provisionBody, password: "[redacted]" }));

  let metaAccountId: string;
  try {
    const provisionRes = await fetch(provisionUrl, {
      method: "POST",
      headers: {
        "auth-token":   token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(provisionBody),
    });

    const rawText = await provisionRes.text();
    console.log("[mt5/connect] provision response", provisionRes.status, rawText);

    if (!provisionRes.ok) {
      // 409 = account already exists — look it up instead
      if (provisionRes.status === 409) {
        const listUrl = `${METAAPI_BASE}/users/current/accounts?limit=100`;
        console.log("[mt5/connect] 409 conflict — listing accounts:", listUrl);

        const listRes = await fetch(listUrl, { headers: { "auth-token": token } });
        const listText = await listRes.text();
        console.log("[mt5/connect] list response", listRes.status, listText);

        if (listRes.ok) {
          const accounts: Array<{ id: string; login: string }> = JSON.parse(listText);
          const existing = accounts.find((a) => String(a.login) === String(login));
          if (existing) {
            metaAccountId = existing.id;
            console.log("[mt5/connect] found existing account", metaAccountId);
          } else {
            return NextResponse.json(
              { error: `Account ${login} not found after 409. ${metaApiError(rawText, provisionRes.status)}` },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Could not list accounts after 409: ${metaApiError(listText, listRes.status)}` },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: metaApiError(rawText, provisionRes.status) },
          { status: provisionRes.status >= 500 ? 502 : 400 }
        );
      }
    } else {
      const provisioned = JSON.parse(rawText);
      metaAccountId = provisioned.id;
      console.log("[mt5/connect] provisioned new account", metaAccountId);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mt5/connect] network error:", message);
    return NextResponse.json(
      { error: `Network error reaching MetaApi: ${message}` },
      { status: 502 }
    );
  }

  // 2. Deploy the account (start connection)
  const deployUrl = `${METAAPI_BASE}/users/current/accounts/${metaAccountId}/deploy`;
  console.log("[mt5/connect] POST deploy:", deployUrl);
  try {
    const deployRes = await fetch(deployUrl, {
      method: "POST",
      headers: { "auth-token": token },
    });
    const deployText = await deployRes.text();
    console.log("[mt5/connect] deploy response", deployRes.status, deployText);
  } catch (err) {
    console.warn("[mt5/connect] deploy failed (non-fatal):", err);
  }

  // 3. Fetch account info (balance) — may not be ready yet on first deploy
  let balance = "—";
  const infoUrl = `${METAAPI_CLIENT_BASE}/users/current/accounts/${metaAccountId}/account-information`;
  console.log("[mt5/connect] GET account info:", infoUrl);
  try {
    const infoRes = await fetch(infoUrl, { headers: { "auth-token": token } });
    const infoText = await infoRes.text();
    console.log("[mt5/connect] account-info response", infoRes.status, infoText);
    if (infoRes.ok) {
      const info = JSON.parse(infoText);
      if (info?.balance != null) {
        balance = `$${Number(info.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
      }
    }
  } catch (err) {
    console.warn("[mt5/connect] account-info failed (non-fatal):", err);
  }

  // 4. Persist in Supabase
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("broker_connections")
    .upsert(
      {
        user_id:         user.id,
        broker:          "mt5",
        display_name:    accountName ?? `MetaTrader 5 · ${login}`,
        account_id:      String(login),
        balance,
        server,
        meta_account_id: metaAccountId,
        status:          "connected",
        last_sync:       new Date().toISOString(),
      },
      { onConflict: "user_id,broker,server" }
    )
    .select()
    .single();

  if (error) {
    console.error("[mt5/connect] supabase upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, connection: data });
}
