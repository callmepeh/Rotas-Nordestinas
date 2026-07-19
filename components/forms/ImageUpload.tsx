"use client";

import React, { useRef, useState } from "react";
import { FaUpload, FaSpinner, FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";
import { uploadImage } from "@/lib/uploadImage";
import "./ImageUpload.css";

interface ImageUploadProps {
  /** Called with the public URL after a successful upload */
  onUploadComplete?: (url: string) => void;
  /** Optional folder prefix inside the bucket (default: "sugestoes") */
  folder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  folder = "sugestoes",
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setStatus("idle");
    setErrorMsg(null);

    // Auto-upload
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      setUploadedUrl(url);
      setStatus("success");
      onUploadComplete?.(url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setStatus("error");
      setErrorMsg(err.message || "Erro ao fazer upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    if (uploading || status === "success") return;
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setFileName(null);
    setPreview(null);
    setStatus("idle");
    setUploadedUrl(null);
    setErrorMsg(null);
    onUploadComplete?.("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`image-upload-container ${
        status === "success" ? "upload-success" : ""
      } ${status === "error" ? "upload-error" : ""} ${
        uploading ? "uploading" : ""
      }`}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
        disabled={uploading}
      />

      {preview && status !== "error" ? (
        <div className="upload-preview-wrapper">
          <img
            src={preview}
            alt="Preview"
            className="upload-preview"
          />
          {status === "success" && (
            <div className="upload-status-badge success">
              <FaCheckCircle />
            </div>
          )}
          {uploading && (
            <div className="upload-status-badge uploading">
              <FaSpinner className="spinner-icon" />
            </div>
          )}
        </div>
      ) : (
        <div className="upload-content">
          <FaUpload className="upload-icon" />
          <span className="upload-text">
            {uploading
              ? "Enviando..."
              : fileName || "Carregar imagem"}
          </span>
          <p className="upload-description">
            {uploading
              ? "Aguarde enquanto sua imagem é enviada..."
              : "Clique para selecionar uma imagem (JPG, PNG ou GIF)"}
          </p>
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="upload-error-msg">
          <FaExclamationCircle /> {errorMsg}
        </div>
      )}

      {uploadedUrl && (
        <button
          type="button"
          className="upload-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          title="Remover imagem"
        >
          <FaTimes />
        </button>
      )}

      {!uploading && status === "idle" && !preview && (
        <button type="button" className="upload-button" onClick={handleClick}>
          Selecionar
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
