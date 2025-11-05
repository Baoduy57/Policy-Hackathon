"use client";

import React, { useState, useCallback, DragEvent } from "react";
import { Submission } from "../types";
import { CloseIcon, UploadIcon } from "./icons";
import { HiOutlineDocumentText, HiOutlineX } from "react-icons/hi";

interface UploadModalProps {
  onClose: () => void;
  teamId: string;
  teamName: string;
  topic: string;
  onSubmissionSuccess: (submission: Submission) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  onClose,
  teamId,
  teamName,
  topic,
  onSubmissionSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (
      allowedTypes.includes(selectedFile.type) &&
      selectedFile.size <= 10 * 1024 * 1024
    ) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Vui lòng upload file PDF, TXT hoặc PPT dưới 10MB.");
      setFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(e.dataTransfer.files[0]);

      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.files = dataTransfer.files;
      }
    }
  };

  const handleFileRemove = () => {
    setFile(null);
  };

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      setUploadProgress(10);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("teamId", teamId);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const uploadData = await uploadResponse.json();
      setUploadProgress(40);

      setUploadProgress(50);
      const submitResponse = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          teamName,
          topic,
          notes,
          fileId: uploadData.fileId,
          fileName: uploadData.fileName,
          fileSize: uploadData.fileSize,
        }),
      });

      if (!submitResponse.ok) {
        throw new Error("Failed to submit");
      }

      setUploadProgress(90);

      setUploadProgress(100);
      setTimeout(() => {
        const newSubmission: Submission = {
          teamId,
          teamName,
          file,
          fileId: uploadData.fileId,
          fileName: uploadData.fileName,
          fileSize: uploadData.fileSize,
          notes,
          submittedAt: new Date(),
          topic,
        };
        onSubmissionSuccess(newSubmission);
      }, 300);
    } catch (error: any) {
      console.error("[Submit] Error:", error);
      setError(error.message || "Failed to upload. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [file, notes, teamId, teamName, topic, onSubmissionSuccess]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Submit Your Presentation
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Presentation File
            </label>

            {file ? (
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-300">
                <div className="flex items-center gap-2">
                  <HiOutlineDocumentText className="h-6 w-6 text-sky-600" />
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleFileRemove}
                  disabled={isUploading}
                  className="text-slate-500 hover:text-red-600 disabled:opacity-50"
                  aria-label="Remove file"
                >
                  <HiOutlineX className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md transition-colors
                  ${isDragging ? "bg-sky-50 border-sky-500" : ""}`}
              >
                <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.txt,.ppt,.pptx"
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF, TXT, PPT, PPTX - tối đa 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700"
            >
              Optional Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              placeholder="Any additional notes for the judges..."
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center text-slate-500 mt-1">
                {uploadProgress < 100
                  ? `Uploading... ${uploadProgress}%`
                  : "Success!"}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading || !file}
            className="px-4 py-2 bg-blue-600 text-white border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isUploading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
