import React, { useRef } from "react";

export interface ImageUploaderProps {
  label?: string;
  onChange?: (file: File | null) => void;
  value?: File | null;
  preview?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label = "Upload Image", onChange, value, preview = true }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (value && preview) {
      const url = URL.createObjectURL(value);
      setImgUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImgUrl(null);
    }
  }, [value, preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (onChange) onChange(file);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="font-medium text-sm mb-1">{label}</label>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {preview && imgUrl && (
        <img src={imgUrl} alt="Preview" className="mt-2 rounded border w-32 h-32 object-cover" />
      )}
    </div>
  );
};

export default ImageUploader;
