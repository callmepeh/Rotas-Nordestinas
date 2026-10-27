/** Encodes an image for storage in the destination database. Configure object storage
 * and replace this adapter for production catalogs with large image collections. */
export async function uploadImage(file: File, _folder = "sugestoes"): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Selecione um arquivo de imagem.");
  if (file.size > 4 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 4 MB.");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Não foi possível ler a imagem."));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}
