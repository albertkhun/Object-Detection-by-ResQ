import { useRef, useState } from "react";
 
export default function UploadZone({ onImageSelect, imagePreview }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
 
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onImageSelect(file);
  };
 
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) onImageSelect(file);
  };
 
  return (
    <div
      className={`upload-zone card ${dragging ? "drag-over" : ""}`}
      onClick={() => !imagePreview && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      {imagePreview ? (
        <div className="preview-container">
          <img src={imagePreview} alt="Preview" className="preview-img" />
          <div className="preview-overlay">
            <button className="change-btn" onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>
              ↑ Change Image
            </button>
          </div>
        </div>
      ) : (
        <div className="upload-inner">
          <div className="upload-icon">⬡</div>
          <p className="upload-text">Drop image here or click to upload</p>
          <p className="upload-sub">PNG, JPG, WEBP · Max 20MB</p>
        </div>
      )}
    </div>
  );
}
 