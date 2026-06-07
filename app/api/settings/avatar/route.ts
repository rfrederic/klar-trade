import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "File must be under 2 MB" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;
  const buffer = new Uint8Array(await file.arrayBuffer());

  const supabase = createServiceClient();

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  // Bust the CDN cache so the browser always fetches the new image
  const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;

  // Update profiles table
  await supabase
    .from("profiles")
    .upsert({ id: user.id, avatar_url }, { onConflict: "id" });

  // Also store in auth user_metadata so Header reads it without an extra DB call
  await authClient.auth.updateUser({ data: { avatar_url } });

  return NextResponse.json({ avatar_url });
}
