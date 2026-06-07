import api from "./index";

/**
 * Uploads a file (multipart/form-data) to the backend.
 * @param file The file to upload.
 * @returns The resulting URL on success.
 */
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.url;
};
