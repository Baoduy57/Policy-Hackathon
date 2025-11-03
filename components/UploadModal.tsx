import React, { useState, useCallback } from "react";
import { Submission } from "../types";
import { CloseIcon, UploadIcon } from "./icons";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Basic validation for presentation files
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
        // 10MB limit
        setFile(selectedFile);
        setError("");
      } else {
        setError("Vui lòng upload file PDF, TXT hoặc PPT dưới 10MB.");
        setFile(null);
      }
    }
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
      // Step 1: Upload file to server (30%)
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

      console.log("[Upload] File uploaded to GridFS:", uploadData);

      // Step 2: Submit to database (70%)
      setUploadProgress(50);
      const submitResponse = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          teamName,
          topic,
          notes,
          fileId: uploadData.fileId, // MongoDB GridFS ObjectId
          fileName: uploadData.fileName,
          fileSize: uploadData.fileSize,
        }),
      });

      if (!submitResponse.ok) {
        throw new Error("Failed to submit");
      }

      const submitData = await submitResponse.json();
      setUploadProgress(90);

      console.log("[Submit] Submission created:", submitData);

      // Step 3: Success (100%)
      setUploadProgress(100);
      setTimeout(() => {
        const newSubmission: Submission = {
          teamId,
          teamName,
          file,
          fileId: uploadData.fileId, // MongoDB GridFS ObjectId
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
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
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {file ? (
                  <p className="text-sm text-green-600 font-semibold">
                    {file.name}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    PDF, TXT, PPT, PPTX - tối đa 10MB
                  </p>
                )}
              </div>
            </div>
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
            />
          </div>

          {isUploading && (
            <div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center text-slate-500 mt-1">
                {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading || !file}
            className="px-4 py-2 bg-blue-600 text-white border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isUploading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
