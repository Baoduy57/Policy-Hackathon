import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";

let bucket: GridFSBucket | null = null;

export function getGridFSBucket(): GridFSBucket {
  if (!bucket) {
    if (!mongoose.connection.db) {
      throw new Error("MongoDB connection not established");
    }
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "submissions", // Collection name prefix
    });
    console.log("[GridFS] Bucket initialized");
  }
  return bucket;
}

// Upload file to GridFS
export async function uploadToGridFS(
  fileBuffer: Buffer,
  filename: string,
  metadata?: any
): Promise<string> {
  const bucket = getGridFSBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: metadata || {},
    });

    uploadStream.on("error", (error: any) => {
      console.error("[GridFS] Upload error:", error);
      reject(error);
    });

    uploadStream.on("finish", () => {
      console.log(
        `[GridFS] File uploaded: ${filename}, ID: ${uploadStream.id}`
      );
      resolve(uploadStream.id.toString());
    });

    uploadStream.end(fileBuffer);
  });
}

// Download file from GridFS
export async function downloadFromGridFS(fileId: string): Promise<Buffer> {
  const bucket = getGridFSBucket();

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    downloadStream.on("data", (chunk: any) => {
      chunks.push(chunk);
    });

    downloadStream.on("error", (error: any) => {
      console.error("[GridFS] Download error:", error);
      reject(error);
    });

    downloadStream.on("end", () => {
      const fileBuffer = Buffer.concat(chunks);
      console.log(
        `[GridFS] File downloaded: ${fileId}, size: ${fileBuffer.length}`
      );
      resolve(fileBuffer);
    });
  });
}

// Read file content as text
export async function readFileContent(fileId: string): Promise<string> {
  const buffer = await downloadFromGridFS(fileId);

  // Try to parse as text
  try {
    return buffer.toString("utf-8");
  } catch (error) {
    console.error("[GridFS] Failed to read as text:", error);
    throw new Error("File is not readable as text");
  }
}

// Read PDF content using pdf-parse with render options
export async function readPDFContent(fileId: string): Promise<string> {
  const buffer = await downloadFromGridFS(fileId);

  try {
    const pdfParse = require("pdf-parse");

    // Options to disable rendering completely (we only need text)
    const options = {
      max: 0, // Parse all pages
      version: "v2.0.550", // Use specific version
      // Disable all rendering to avoid canvas dependency
      pagerender: () => Promise.resolve(""),
    };

    const pdfData = await pdfParse(buffer, options);

    console.log(
      `[GridFS] PDF parsed successfully: ${pdfData.text.length} chars from ${pdfData.numpages} pages`
    );

    return pdfData.text;
  } catch (error) {
    console.error("[GridFS] Failed to parse PDF with pdf-parse:", error);

    // Fallback 1: Try pdf2json
    try {
      console.log("[GridFS] Trying pdf2json parser...");
      return await readPDFWithAlternative(buffer);
    } catch (altError) {
      console.error("[GridFS] pdf2json also failed:", altError);

      // Fallback 2: Try simple regex extraction
      try {
        console.log("[GridFS] Trying simple text extraction...");
        return await extractTextFromPDFBuffer(buffer);
      } catch (simpleError) {
        console.error("[GridFS] All PDF parsing methods failed:", simpleError);

        // Return informative message instead of throwing error
        console.warn("[GridFS] ⚠️ Returning fallback message for PDF");
        return (
          "[Thông báo: File PDF đã được tải lên thành công nhưng không thể đọc nội dung tự động. " +
          "Đây có thể là PDF phức tạp (scanned, có mã hóa, hoặc định dạng đặc biệt). " +
          "AI sẽ đánh giá dựa trên đề tài và ghi chú của bạn. " +
          "Để AI đọc được nội dung, vui lòng sử dụng file .txt hoặc PDF đơn giản hơn.]"
        );
      }
    }
  }
}

// Alternative PDF parsing using pdf2json
async function readPDFWithAlternative(buffer: Buffer): Promise<string> {
  try {
    const PDFParser = require("pdf2json");

    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          // Extract text from all pages
          let text = "";

          if (pdfData.Pages) {
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts) {
                page.Texts.forEach((textItem: any) => {
                  if (textItem.R) {
                    textItem.R.forEach((run: any) => {
                      if (run.T) {
                        try {
                          text += decodeURIComponent(run.T) + " ";
                        } catch (e) {
                          // If decodeURIComponent fails, use raw text
                          text += run.T + " ";
                        }
                      }
                    });
                  }
                });
              }
              text += "\n";
            });
          }

          const trimmedText = text.trim();
          console.log(
            `[GridFS] PDF parsed with pdf2json: ${text.length} chars (${trimmedText.length} after trim)`
          );
          
          if (trimmedText.length < 50) {
            console.log(`[GridFS] ⚠️ Very little text extracted. Sample: "${trimmedText}"`);
          }
          
          resolve(trimmedText);
        } catch (error) {
          reject(error);
        }
      });

      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    throw new Error("pdf2json not available or failed");
  }
}

// Simple text extraction from PDF buffer using regex
async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // Convert buffer to string and try to extract text
    const pdfText = buffer.toString("binary");

    // Method 1: Extract text between BT/ET operators
    const btEtRegex = new RegExp("BT\\s+(.*?)\\s+ET", "gs");
    const textMatches = pdfText.match(btEtRegex);

    if (!textMatches || textMatches.length === 0) {
      throw new Error("No text found in PDF using BT/ET extraction");
    }

    let extractedText = "";

    textMatches.forEach((match) => {
      // Extract strings within parentheses
      const strings = match.match(/\((.*?)\)/g);
      if (strings) {
        strings.forEach((str) => {
          // Remove parentheses and unescape
          const cleanStr = str
            .replace(/[()]/g, "")
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "")
            .replace(/\\t/g, " ")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")")
            .replace(/\\\\/g, "\\");

          extractedText += cleanStr + " ";
        });
      }
    });

    const finalText = extractedText.trim();

    if (finalText.length < 10) {
      throw new Error("Extracted text too short, probably failed");
    }

    console.log(
      `[GridFS] Simple extraction succeeded: ${finalText.length} chars`
    );
    return finalText;
  } catch (error) {
    console.error("[GridFS] Simple extraction failed:", error);
    throw error;
  }
}

// Delete file from GridFS
export async function deleteFromGridFS(fileId: string): Promise<void> {
  const bucket = getGridFSBucket();

  try {
    await bucket.delete(new ObjectId(fileId));
    console.log(`[GridFS] File deleted: ${fileId}`);
  } catch (error) {
    console.error("[GridFS] Delete error:", error);
    throw error;
  }
}

// Get file info
export async function getFileInfo(fileId: string): Promise<any> {
  const bucket = getGridFSBucket();

  const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();

  if (files.length === 0) {
    throw new Error("File not found");
  }

  return files[0];
}
