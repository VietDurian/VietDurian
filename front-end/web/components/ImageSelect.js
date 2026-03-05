import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

export default function ImageSelect({
  label = "Ảnh minh họa",
  hint = "(tuỳ chọn)",
  value,
  onChange,
  accept = ".jpg,.jpeg,.png,.heic,.heif",
  maxSizeMB = 5,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/heif",
  ];

  const onFileChange = (selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      onChange?.("");
      return;
    }

    const maxFileSize = maxSizeMB * 1024 * 1024;
    if (
      !allowedTypes.includes(selectedFile.type) ||
      selectedFile.size > maxFileSize
    ) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFile(selectedFile);
        onChange?.(reader.result, selectedFile);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    onFileChange(droppedFile);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    setFile(null);
    onChange?.("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const preview = value || "";

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        {label} <span className="text-gray-400 font-normal">{hint}</span>
      </label>

      <div
        onClick={() => !preview && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          preview
            ? "border-emerald-200 bg-emerald-50/40 cursor-default"
            : dragging
              ? "border-emerald-400 bg-emerald-50 cursor-pointer scale-[1.01]"
              : "border-gray-200 bg-gray-50/60 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer",
        ].join(" ")}
      >
        {preview ? (
          <div className="flex items-center gap-3 p-4">
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-16 object-cover rounded-lg border border-emerald-100 shrink-0"
            />
            <div className="flex-1 min-w-0 pr-8">
              <p className="text-sm font-medium text-gray-700 truncate">
                {file?.name || "Ảnh đã chọn"}
              </p>
              {file?.size ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-9 px-4 gap-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm mb-1">
              <Upload className="w-[18px] h-[18px]" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              Nhấn để tải ảnh từ máy
            </p>
            <p className="text-xs text-gray-400">
              PNG/JPG/HEIC tối đa {maxSizeMB}MB
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />
      </div>
    </div>
  );
}
