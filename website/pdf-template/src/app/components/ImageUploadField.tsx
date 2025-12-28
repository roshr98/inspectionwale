import React, { useState, useRef } from 'react';
import { Camera, Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
import { getImageDisplayUrl, ImageData, fileToBase64, compressImage } from '../../utils/imageHandler';

interface ImageUploadFieldProps {
  label: string;
  value: ImageData | string;
  onChange: (value: ImageData | string) => void;
  fieldName: string;
  imageType?: 'large' | 'small' | 'medium'; // Specify report layout type
}

export function ImageUploadField({ label, value, onChange, fieldName, imageType = 'large' }: ImageUploadFieldProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const currentUrl = getImageDisplayUrl(value);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert to base64 first
      const base64 = await fileToBase64(file);
      
      // Compress with specific dimensions for report layout
      const compressedBase64 = await compressImage(base64, 500, imageType);
      
      const imageData: ImageData = {
        base64: compressedBase64,
        fileName: file.name,
        uploadedAt: new Date().toISOString()
      };
      
      onChange(imageData);
      console.log(`✅ Image uploaded: ${label} (${imageType})`);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
      console.log(`✅ Image URL added: ${label}`);
    }
  };

  const handleClear = () => {
    if (confirm('Remove this image?')) {
      onChange('');
      setUrlInput('');
    }
  };

  return (
    <div className="image-upload-field">
      <label className="image-upload-label">{label}</label>
      
      {/* Image Preview */}
      {currentUrl && (
        <div className="image-preview-container">
          <img 
            src={currentUrl} 
            alt={label}
            className="image-preview"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23f3f4f6" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
            }}
          />
          <button 
            type="button"
            onClick={handleClear}
            className="image-remove-btn"
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Options */}
      <div className="image-upload-actions">
        {/* Camera Capture (Mobile) */}
        <button 
          type="button"
          onClick={handleCameraClick}
          className="btn-image-action btn-camera"
          disabled={isUploading}
          title="Take photo with camera"
        >
          <Camera size={18} />
          <span>Camera</span>
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {/* Gallery Upload */}
        <button 
          type="button"
          onClick={handleGalleryClick}
          className="btn-image-action btn-gallery"
          disabled={isUploading}
          title="Choose from gallery"
        >
          <Upload size={18} />
          <span>Gallery</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {/* URL Input Toggle */}
        <button 
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="btn-image-action btn-url"
          disabled={isUploading}
          title="Enter image URL"
        >
          <LinkIcon size={18} />
          <span>URL</span>
        </button>
      </div>

      {/* URL Input Field */}
      {showUrlInput && (
        <div className="url-input-container">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter image URL"
            className="url-input"
            onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <button 
            type="button"
            onClick={handleUrlSubmit}
            className="btn-url-submit"
          >
            Add
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="upload-progress">
          <div className="upload-spinner"></div>
          <span>Uploading...</span>
        </div>
      )}

      {/* Image Info */}
      {typeof value === 'object' && value.fileName && (
        <div className="image-info">
          <ImageIcon size={14} />
          <span className="image-filename">{value.fileName}</span>
          {value.uploadedAt && (
            <span className="image-date">
              {new Date(value.uploadedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}