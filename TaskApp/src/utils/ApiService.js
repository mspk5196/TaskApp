// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_URL } from '../config/env';
// import { Platform, Alert, PermissionsAndroid } from 'react-native';
// import RNFS from 'react-native-fs';
// import FileViewer from 'react-native-file-viewer';

// class ApiService {
//   constructor() {
//     this.baseURL = API_URL;
//     this.accessToken = null;
//     this.refreshToken = null;
//   }

//   // Set tokens
//   setTokens(accessToken, refreshToken) {
//     this.accessToken = accessToken;
//     this.refreshToken = refreshToken;
//   }


//         } else if (error.message.includes('500')) {
//           errorMessage = 'Server error occurred. Please try again later.';
//         } else {
//           errorMessage = error.message;
//         }
//       }

//       throw new Error(errorMessage);
//     }
//   }

//   /**
//    * Upload a file to the API
//    * @param {string} url - API endpoint (relative to baseURL)
//    * @param {object} file - File object from DocumentPicker
//    * @param {string} fieldName - Form field name (default: 'file')
//    * @param {object} additionalData - Additional form data to send
//    * @returns {Promise} - Upload result
//    */
//   async uploadFile(url, file, fieldName = 'file', additionalData = {}) {
//     try {
//       const accessToken = await this.getAccessToken();
//       const formData = new FormData();

//       // Append the file
//       formData.append(fieldName, {
//         uri: file.fileCopyUri || file.uri,
//         name: file.name || 'upload.file',
//         type: file.type || 'application/octet-stream',
//       });

//       // Append additional data
//       Object.keys(additionalData).forEach((key) => {
//         formData.append(key, additionalData[key]);
//       });

//       const response = await fetch(`${this.baseURL}${url}`, {
//         method: 'POST',
//         headers: {
//           ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
//           // Note: Don't set Content-Type for FormData, browser/fetch will set it with boundary
//         },
//         body: formData,
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         throw new Error(data.message || 'Upload failed');
//       }

//       return {
//         success: true,
//         data,
//       };
//     } catch (error) {
//       console.error('Upload error:', error);
//       throw new Error(`Failed to upload file: ${error.message}`);
//     }
//   }
// }

// export default new ApiService();


import api from '../services/api';

export default api;