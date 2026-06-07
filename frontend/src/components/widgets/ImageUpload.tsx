import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import { IconUpload, IconX } from "@tabler/icons-react";
import { uploadFile } from "../../api/_upload";
import { toast } from "react-toastify";


interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = "Upload Image" }) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>("");

  // Revoke blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const getFullImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("blob:")) return path;
    // Already absolute URL
    if (path.startsWith("http")) return path;
    // Relative path like /uploads/xxx.png — served via Vite proxy from same origin
    return path;
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB!");
      return;
    }

    // Show instant local preview immediately
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);
    setUploading(true);

    try {
      const url = await uploadFile(file);
      onChange(url);
      setLocalPreview(""); // server URL takes over
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload image. Check that the backend is running.");
      setLocalPreview("");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setLocalPreview("");
  };

  // localPreview (blob) takes priority, then server URL, then nothing
  const displaySrc = localPreview || getFullImageUrl(value);
  const hasImage = Boolean(displaySrc);

  return (
    <Box>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Box
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          width: "100%",
          minHeight: 160,
          border: `2px dashed ${hasImage ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: "12px",
          bgcolor: hasImage
            ? alpha(theme.palette.primary.main, 0.04)
            : theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
          },
        }}
      >
        {hasImage ? (
          <>
            <Box
              component="img"
              src={displaySrc}
              alt="Preview"
              sx={{
                width: "100%",
                height: 160,
                objectFit: "cover",
                display: "block",
                opacity: uploading ? 0.5 : 1,
                transition: "opacity 0.2s",
              }}
            />
            {uploading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(0,0,0,0.35)",
                  gap: 1,
                }}
              >
                <CircularProgress size={28} sx={{ color: "white" }} />
                <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
                  Uploading...
                </Typography>
              </Box>
            )}
            {!uploading && (
              <IconButton
                onClick={handleRemove}
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(200,0,0,0.75)" },
                }}
              >
                <IconX size={16} />
              </IconButton>
            )}
          </>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconUpload size={26} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                Click or drag &amp; drop to upload
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PNG, JPG or WEBP · Max 5 MB
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImageUpload;
