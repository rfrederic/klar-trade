import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();

  const [{ data: notes, error: nErr }, { data: folders, error: fErr }] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, category, folder_id, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("note_folders")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at"),
  ]);

  if (nErr) return NextResponse.json({ error: nErr.message }, { status: 500 });
  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 500 });

  return NextResponse.json({ notes: notes ?? [], folders: folders ?? [] });
}

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, content, category, folder_id } = body;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: title ?? "Untitled",
      content: content ?? "",
      category: category ?? "",
      folder_id: folder_id ?? null,
      updated_at: new Date().toISOString(),
    })
    .select("id, title, category, folder_id, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data }, { status: 201 });
}
