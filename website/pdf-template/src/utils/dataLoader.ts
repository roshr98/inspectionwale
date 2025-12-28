import placeholdersData from '../data/placeholders.json';

// Helper function to replace empty strings with "NA"
function replaceEmptyWithNA(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj === '' ? 'NA' : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceEmptyWithNA(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = replaceEmptyWithNA(obj[key]);
    }
  }
  return result;
}

export function getInspectionData() {
  // Try to load from localStorage first
  const savedData = localStorage.getItem('inspectionData');
  
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      // Replace empty strings with "NA" for report display
      return replaceEmptyWithNA(data);
    } catch (error) {
      console.error('Error parsing saved inspection data:', error);
      return replaceEmptyWithNA(placeholdersData);
    }
  }
  
  // Return default placeholders if no saved data
  return replaceEmptyWithNA(placeholdersData);
}

export function saveInspectionData(data: any) {
  localStorage.setItem('inspectionData', JSON.stringify(data));
}

export function clearInspectionData() {
  localStorage.removeItem('inspectionData');
}
