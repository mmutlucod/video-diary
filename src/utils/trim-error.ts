const MESSAGES: Record<string, string> = {
  INVALID_ARGUMENTS: "Video dosyası okunamadı. Başka bir video dene.",
  INVALID_START: "Başlangıç noktası geçersiz. Bölümü yeniden seç.",
  INVALID_END: "Seçilen bölüm videonun süresini aşıyor. Bölümü biraz geri çek.",
  INVALID_RANGE: "Seçilen aralık geçersiz. Bölümü yeniden seç.",
  INVALID_URI: "Video yolu geçersiz. Başka bir video dene.",
  FILE_NOT_FOUND: "Video dosyası bulunamadı. Videoyu yeniden seç.",
  TRIM_ERROR: "Video kırpılırken bir sorun oluştu. Tekrar dene.",
};

const FALLBACK = "Video kaydedilemedi. Tekrar dene.";

export function getTrimErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    return MESSAGES[code] ?? FALLBACK;
  }
  return FALLBACK;
}