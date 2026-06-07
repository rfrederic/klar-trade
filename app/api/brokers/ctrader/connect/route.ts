import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const CT_BASE    = "https://openapi.ctrader.com";
const CT_AUTH    = `${CT_BASE}/apps/auth`;

function getAppBaseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host  = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId, clientSecret } = await req.json();
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "clientId and clientSecret are required" }, { status: 400 });
  }

  // Store a pending connection so the callback can retrieve the credentials.
  // meta_account_id holds encoded credentials for token refresh throughout the lifetime of the connection.
  const supabase = createServiceClient();
  const { data: connRow, error: connErr } = await supabase
    .from("broker_connections")
    .upsert(
      {
        user_id:         user.id,
        broker:          "ctrader",
        display_name:    `cTrader · ${clientId}`,
        account_id:      "",                // filled after OAuth
        server:          clientId,          // clientId doubles as the unique "server" key
        meta_account_id: JSON.stringify({ clientId, clientSecret }),
        access_token:    "",
        refresh_token:   "",
        balance:         "—",
        status:          "pending",
        last_sync:       null,
      },
      { onConflict: "user_id,broker,server" }
    )
    .select("id")
    .single();

  if (connErr || !connRow) {
    console.error("[ctrader/connect] upsert error:", connErr);
    return NextResponse.json({ error: connErr?.message ?? "Could not store connection" }, { status: 500 });
  }

  const redirectUri = `${getAppBaseUrl(req)}/api/brokers/ctrader/callback`;
  const authUrl = new URL(CT_AUTH);
  authUrl.searchParams.set("client_id",     clientId);
  authUrl.searchParams.set("redirect_uri",  redirectUri);
  authUrl.searchParams.set("scope",         "trading");
  authUrl.searchParams.set("response_type", "code");
  // Use the DB row ID as state so the callback can look up credentials
  authUrl.searchParams.set("state",         connRow.id);

  console.log("[ctrader/connect] auth URL:", authUrl.toString());
  return NextResponse.json({ authUrl: authUrl.toString(), redirectUri });
}
