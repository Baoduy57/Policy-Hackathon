import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { downloadFromGridFS } from "@/lib/gridfs";

/**
 * External PDF parsing using cloud services
 * This endpoint can be used as a fallback when local parsing fails
 *
 * Supported services:
 * 1. Adobe PDF Extract API (Free tier: 500 pages/month)
 * 2. PDFShift (Free tier: 50 conversions/month)
 * 3. ILovePDF API (Free tier: 1000 requests/month)
 */

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { fileId, service = "ilovepdf" } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId is required" },
        { status: 400 }
      );
    }

    console.log(
      `[Parse PDF External] Using service: ${service}, fileId: ${fileId}`
    );

    // Download file from GridFS
    const fileBuffer = await downloadFromGridFS(fileId);

    let extractedText = "";

    switch (service) {
      case "simple":
        // Simple extraction without external service (regex-based)
        extractedText = await parseWithSimpleMethod(fileBuffer);
        break;

      case "ilovepdf":
        // ILovePDF API integration
        extractedText = await parseWithILovePDF(fileBuffer);
        break;

      case "adobe":
        // Adobe PDF Extract API
        extractedText = await parseWithAdobe(fileBuffer);
        break;

      default:
        throw new Error(`Unknown service: ${service}`);
    }

    console.log(`[Parse PDF External] Extracted ${extractedText.length} chars`);

    return NextResponse.json({
      success: true,
      text: extractedText,
      length: extractedText.length,
      service: service,
    });
  } catch (error: any) {
    console.error("[Parse PDF External] Error:", error);
    return NextResponse.json(
      { error: "Failed to parse PDF", details: error.message },
      { status: 500 }
    );
  }
}

// Simple method - Extract text streams from PDF buffer
async function parseWithSimpleMethod(buffer: Buffer): Promise<string> {
  try {
    const pdfText = buffer.toString("utf8");

    // Extract text between stream objects (very basic)
    const textMatches = pdfText.match(new RegExp("BT\\s+(.*?)\\s+ET", "gs"));

    if (!textMatches) {
      throw new Error("No text found in PDF");
    }

    let extractedText = "";
    textMatches.forEach((match) => {
      // Remove PDF operators and extract strings
      const strings = match.match(/\((.*?)\)/g);
      if (strings) {
        strings.forEach((str) => {
          extractedText += str.replace(/[()]/g, "") + " ";
        });
      }
    });

    return extractedText.trim();
  } catch (error) {
    throw new Error("Simple PDF extraction failed");
  }
}

// ILovePDF API integration (requires API key)
async function parseWithILovePDF(buffer: Buffer): Promise<string> {
  const apiKey = process.env.ILOVEPDF_API_KEY;

  if (!apiKey) {
    throw new Error("ILOVEPDF_API_KEY not configured");
  }

  try {
    // Step 1: Get server to upload file
    const authResponse = await fetch("https://api.ilovepdf.com/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_key: apiKey }),
    });

    const authData = await authResponse.json();
    const token = authData.token;

    // Step 2: Start task
    const startResponse = await fetch(
      "https://api.ilovepdf.com/v1/start/pdftxt",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const startData = await startResponse.json();
    const taskId = startData.task;
    const serverUrl = startData.server;

    // Step 3: Upload file
    const formData = new FormData();
    formData.append("task", taskId);
    // Convert Buffer to Blob properly
    const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/pdf",
    });
    formData.append("file", blob, "document.pdf");

    const uploadResponse = await fetch(`https://${serverUrl}/v1/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const uploadData = await uploadResponse.json();
    const fileServerId = uploadData.server_filename;

    // Step 4: Process
    const processResponse = await fetch(`https://${serverUrl}/v1/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: taskId,
        files: [{ server_filename: fileServerId }],
      }),
    });

    const processData = await processResponse.json();
    const downloadUrl = processData.download_url;

    // Step 5: Download extracted text
    const textResponse = await fetch(`https://${serverUrl}${downloadUrl}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const extractedText = await textResponse.text();

    return extractedText;
  } catch (error) {
    throw new Error(`ILovePDF API error: ${error}`);
  }
}

// Adobe PDF Extract API (requires credentials)
async function parseWithAdobe(buffer: Buffer): Promise<string> {
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Adobe credentials not configured");
  }

  // Adobe PDF Extract API implementation
  // Requires @adobe/pdfservices-node-sdk
  throw new Error("Adobe PDF Extract not implemented yet");
}
