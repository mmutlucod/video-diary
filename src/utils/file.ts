import { Directory, File, Paths } from "expo-file-system";

import { VIDEOS_DIR_NAME } from "@/constants/app";

/** DB'deki göreli yolu ("videos/123.mp4") tam file:// URI'ye çevirir. */
export function resolveVideoUri(relativePath: string): string {
  return new File(Paths.document, relativePath).uri;
}

/**
 * Trim çıktısını (cache'te olabilir) kalıcı klasöre taşır.
 * DB'ye yazılacak göreli yolu döndürür.
 */
export function persistVideoFile(tempUri: string): string {
  const dir = new Directory(Paths.document, VIDEOS_DIR_NAME);
  dir.create({ intermediates: true, idempotent: true });

  const extension = tempUri.split("?")[0].match(/\.(\w{2,4})$/)?.[1] ?? "mp4";
  const fileName = `${Date.now()}.${extension.toLowerCase()}`;

  new File(tempUri).move(new File(dir, fileName));
  return `${VIDEOS_DIR_NAME}/${fileName}`;
}

/** Dosya yoksa veya silinemezse sessizce geçer. */
export function deleteFileIfExists(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Dosya zaten silinmiş olabilir; DB kaydı kaynak doğruluk noktası.
  }
}