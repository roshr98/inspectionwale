// Helper to extract image URLs for report rendering
import { getImageDisplayUrl, ImageData } from './imageHandler';

export function getReportImageUrl(imageData: ImageData | string | undefined): string {
  if (!imageData) {
    return ''; // Return empty string for missing images
  }
  
  return getImageDisplayUrl(imageData);
}
