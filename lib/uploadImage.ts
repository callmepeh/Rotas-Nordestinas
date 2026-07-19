import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const BUCKET_NAME = "rotas-nordestinas";

/**
 * Uploads an image to Supabase Storage and returns the public URL.
 */
export async function uploadImage(
  file: File,
  folder: string = "sugestoes"
): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Generate a unique file path
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    // If bucket doesn't exist, tell user how to create it
    if (error.message?.includes("bucket")) {
      throw new Error(
        `Bucket "${BUCKET_NAME}" não encontrado. Crie um bucket público com este nome no Supabase Dashboard > Storage.`
      );
    }
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}
