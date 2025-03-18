
/**
 * API service for communicating with the backend
 */

const API_BASE_URL = 'http://localhost:8000';

export interface UploadResponse {
  message: string;
  download_url: string;
}

export const uploadVideo = async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();
  
  // Create a promise that will resolve with the response
  const promise = new Promise<UploadResponse>((resolve, reject) => {
    xhr.open('POST', `${API_BASE_URL}/upload/`);
    
    // Handle progress updates if a callback is provided
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`HTTP error ${xhr.status}: ${xhr.statusText}`));
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Network error occurred'));
    };
    
    xhr.ontimeout = () => {
      reject(new Error('Request timed out'));
    };
  });
  
  // Send the request
  xhr.send(formData);
  
  return promise;
};

export const getDownloadUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

export interface LicensePlateResponse {
  license_plates: { x1: number; y1: number; x2: number; y2: number; confidence: number; text: string }[];
}


export const detectLicensePlate = async (file: File): Promise<LicensePlateResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/detect_license_plate/', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};


