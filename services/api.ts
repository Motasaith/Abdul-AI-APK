import axios from 'axios';
import { Platform } from 'react-native';

// YOUR VPS IP ADDRESSES
const REMOVER_URL = 'http://167.88.43.163:8000'; 
const RESTORER_URL = 'http://167.88.43.163:8001'; 

const createFormData = (imageUri: string, fieldName: string = 'file') => {
  const fileName = imageUri.split('/').pop();
  const fileType = fileName?.split('.').pop();

  const formData = new FormData();
  formData.append(fieldName, {
    uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
    name: fileName,
    type: `image/${fileType}`,
  } as any);

  return formData;
};

// --- REMOVER ---
export const removeBackground = async (imageUri: string, signal?: AbortSignal) => {
  try {
    console.log("Uploading to Remover...");
    const formData = createFormData(imageUri, 'files');

    const response = await fetch(`${REMOVER_URL}/remove-bg?mode=auto&background_type=transparent`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'super-secret-key',
      },
      body: formData,
      signal: signal, // Pass the cancel signal here
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.results && data.results.length > 0 && data.results[0].url) {
        const relativeUrl = data.results[0].url;
        const fullUrl = relativeUrl.startsWith('http') ? relativeUrl : `${REMOVER_URL}${relativeUrl}`;
        return fullUrl;
    } else {
        throw new Error("Response missing 'results[0].url'");
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Remover request canceled');
      throw new Error('Canceled');
    }
    console.error('Remover Error:', error.message);
    throw error;
  }
};

// --- RESTORER ---
export const restoreImage = async (imageUri: string, signal?: AbortSignal) => {
  try {
    const formData = createFormData(imageUri, 'files'); 
    // Axios supports signal since v0.22.0
    const response = await axios.post(`${RESTORER_URL}/enhance?face_enhance=true`, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      signal: signal, // Pass signal to Axios
    });
    return response.data; 
  } catch (error: any) {
    if (axios.isCancel(error) || error.message === 'canceled') {
       throw new Error('Canceled');
    }
    console.error("Submit Error:", error.message); 
    throw error;
  }
};

export const checkJobStatus = async (jobId: string, signal?: AbortSignal) => {
  try {
    const response = await axios.get(`${RESTORER_URL}/status/${jobId}`, {
      headers: { 'Accept': 'application/json' },
      signal: signal,
    });
    return response.data; 
  } catch (error: any) {
    if (axios.isCancel(error)) throw new Error('Canceled');
    console.error("Status Check Error:", error.message);
    throw error;
  }
};