// Image handling utilities for mobile camera and gallery uploads

export interface ImageData {
  url?: string;
  base64?: string;
  fileName?: string;
  uploadedAt?: string;
}

// Image dimension presets for different report layouts
export const IMAGE_DIMENSIONS = {
  LARGE: { width: 800, height: 280 }, // Large images (vehicle views)
  SMALL: { width: 400, height: 120 }, // Small images (2-3 per row)
  MEDIUM: { width: 600, height: 200 }, // Medium images
};

// Calculate dimensions to match report layout
function calculateReportDimensions(imageType: 'large' | 'small' | 'medium' = 'large') {
  const presets = {
    large: IMAGE_DIMENSIONS.LARGE,
    small: IMAGE_DIMENSIONS.SMALL,
    medium: IMAGE_DIMENSIONS.MEDIUM,
  };
  return presets[imageType];
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Compress image to match report dimensions
export async function compressImage(
  base64: string, 
  maxSizeKB: number = 500,
  imageType: 'large' | 'small' | 'medium' = 'large'
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetDimensions = calculateReportDimensions(imageType);
      
      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;
      const targetAspectRatio = targetDimensions.width / targetDimensions.height;
      
      let width = targetDimensions.width;
      let height = targetDimensions.height;
      
      // Adjust dimensions to maintain aspect ratio while fitting target
      if (aspectRatio > targetAspectRatio) {
        // Image is wider than target
        height = Math.round(width / aspectRatio);
      } else {
        // Image is taller than target
        width = Math.round(height * aspectRatio);
      }
      
      // Ensure we don't exceed target dimensions
      if (width > targetDimensions.width) {
        width = targetDimensions.width;
        height = Math.round(width / aspectRatio);
      }
      if (height > targetDimensions.height) {
        height = targetDimensions.height;
        width = Math.round(height * aspectRatio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Start with quality 0.85 and reduce if needed
      let quality = 0.85;
      let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until size is acceptable
      while (compressedBase64.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1;
        compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      }
      
      console.log(`🖼️ Compressed ${imageType} image: ${img.width}x${img.height} → ${width}x${height} (${Math.round(compressedBase64.length / 1024)}KB)`);
      
      resolve(compressedBase64);
    };
  });
}

// Handle file upload
export async function handleImageUpload(file: File): Promise<ImageData> {
  try {
    // Convert to base64
    let base64 = await fileToBase64(file);
    
    // Compress if larger than 500KB
    const sizeKB = base64.length / 1024;
    if (sizeKB > 500) {
      console.log(`Compressing image from ${Math.round(sizeKB)}KB...`);
      base64 = await compressImage(base64, 500);
      console.log(`Compressed to ${Math.round(base64.length / 1024)}KB`);
    }
    
    return {
      base64,
      fileName: file.name,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error handling image upload:', error);
    throw error;
  }
}

// Get display URL (base64 or regular URL)
export function getImageDisplayUrl(imageData: ImageData | string): string {
  if (typeof imageData === 'string') {
    return imageData; // Legacy URL format
  }
  
  if (imageData.base64) {
    return imageData.base64;
  }
  
  if (imageData.url) {
    return imageData.url;
  }
  
  return '';
}

// Check if localStorage has enough space
export function checkStorageSpace(): { available: boolean; usedMB: number; totalMB: number } {
  try {
    const used = new Blob(Object.values(localStorage)).size;
    const usedMB = used / (1024 * 1024);
    const totalMB = 10; // Approximate localStorage limit
    
    return {
      available: usedMB < totalMB * 0.9, // 90% threshold
      usedMB: parseFloat(usedMB.toFixed(2)),
      totalMB
    };
  } catch (error) {
    return {
      available: true,
      usedMB: 0,
      totalMB: 10
    };
  }
}

// Clear old images if storage is full
export function optimizeStorage() {
  const storage = checkStorageSpace();
  
  if (!storage.available) {
    console.warn(`⚠️ Storage is ${storage.usedMB}MB / ${storage.totalMB}MB. Consider clearing old data.`);
    return false;
  }
  
  return true;
}