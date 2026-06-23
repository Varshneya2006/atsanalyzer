import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export type SupportedFileType = "pdf" | "docx";

export function detectFileType(mimetype: string, filename: string): SupportedFileType {
  if (mimetype === "application/pdf" || filename.endsWith(".pdf")) return "pdf";
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".docx")
  ) {
    return "docx";
  }
  throw new Error("Unsupported file type. Only PDF and DOCX are allowed.");
}

export async function extractTextFromFile(buffer: Buffer, fileType: SupportedFileType): Promise<string> {
  if (fileType === "pdf") {
    const data = await pdfParse(buffer);
    return data.text.trim();
  }

  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}
