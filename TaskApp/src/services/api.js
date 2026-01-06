import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/env';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
    this.accessToken = null;
    this.refreshToken = null;
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  async getAccessToken() {
    if (!this.accessToken) {
      this.accessToken = await AsyncStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  async getRefreshToken() {
    if (!this.refreshToken) {
      this.refreshToken = await AsyncStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  async saveTokens(accessToken, refreshToken) {
    await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    this.setTokens(accessToken, refreshToken);
  }

  async clearTokens() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    this.accessToken = null;
    this.refreshToken = null;
  }

  async refreshAccessToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success) {
        await this.saveTokens(data.data.accessToken, refreshToken);
        return data.data.accessToken;
      } else {
        throw new Error(data.message || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      throw error;
    }
  }

  async makeRequest(url, options = {}) {
    let accessToken = await this.getAccessToken();

    const makeCall = async (token) => {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return fetch(`${this.baseURL}${url}`, {
        ...options,
        headers,
      });
    };

    try {
      let response = await makeCall(accessToken);

      if (response.status === 401 || response.status === 403) {
        try {
          accessToken = await this.refreshAccessToken();
          response = await makeCall(accessToken);
        } catch (refreshError) {
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async login(phone, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        await this.saveTokens(data.data.accessToken, data.data.refreshToken);
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  }

  async g_login(email) {
    try {
      const response = await fetch(`${this.baseURL}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        await this.saveTokens(data.data.accessToken, data.data.refreshToken);
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const refreshToken = await this.getRefreshToken();

      if (refreshToken) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async getProfile() {
    const response = await this.makeRequest(`/auth/profile`, {
      method: 'GET',
    });
    return response.json();
  }

  async isAuthenticated() {
    const accessToken = await this.getAccessToken();
    return !!accessToken;
  }

  async get(url) {
    try {
      const response = await this.makeRequest(url, {
        method: 'GET',
      });
      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async post(url, data) {
    try {
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async put(url, data) {
    try {
      const response = await this.makeRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async delete(url, data = null) {
    try {
      const options = {
        method: 'DELETE',
      };
      if (data) {
        options.body = JSON.stringify(data);
      }
      const response = await this.makeRequest(url, options);
      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(url, filename, options = {}) {
    try {
      const accessToken = await this.getAccessToken();
      const fullUrl = `${this.baseURL}${url}`;

      console.log('Starting download from:', fullUrl);

      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your storage to download files',
              buttonPositive: 'OK',
            }
          );

          console.log('Storage permission:', granted);

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('Storage permission denied, attempting download anyway');
          }
        } catch (permErr) {
          console.warn('Permission error:', permErr);
        }

        const tryDirs = [RNFS.DownloadDirectoryPath, RNFS.ExternalDirectoryPath].filter(Boolean);
        if (!tryDirs.length) {
          throw new Error('Unable to resolve download directory');
        }

        let dest = '';
        let lastErr = null;

        for (const dir of tryDirs) {
          try {
            const dirExists = await RNFS.exists(dir);
            if (!dirExists) {
              await RNFS.mkdir(dir);
            }

            const extIndex = filename.lastIndexOf('.');
            const baseName = extIndex !== -1 ? filename.substring(0, extIndex) : filename;
            const ext = extIndex !== -1 ? filename.substring(extIndex) : '';

            let candidate = `${dir}/${filename}`;
            let counter = 1;
            while (await RNFS.exists(candidate)) {
              candidate = `${dir}/${baseName}(${counter})${ext}`;
              counter += 1;
            }

            dest = candidate;

            const result = await RNFS.downloadFile({
              fromUrl: fullUrl,
              toFile: dest,
              headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            }).promise;

            if (!result.statusCode || result.statusCode < 200 || result.statusCode >= 300) {
              throw new Error(`HTTP ${result.statusCode || 'unknown'}`);
            }

            const exists = await RNFS.exists(dest);
            if (!exists) {
              throw new Error('File was not saved to device');
            }

            const stats = await RNFS.stat(dest);
            if (!stats.size || stats.size === 0) {
              throw new Error('Downloaded file is empty');
            }

            try {
              await FileViewer.open(dest, { showOpenWithDialog: true });
            } catch (viewerError) {
              console.log('File saved but could not open viewer:', viewerError);
            }

            return {
              success: true,
              path: dest,
              message: `File saved successfully!\nLocation: ${dest}`,
            };
          } catch (err) {
            console.warn(`Download attempt failed for dir ${dir}:`, err?.message || err);
            lastErr = err;
            dest = '';
          }
        }

        throw lastErr || new Error('Download failed');
      } else {
        let dest = `${RNFS.DocumentDirectoryPath}/${filename}`;

        console.log('Download path (iOS):', dest);

        const result = await RNFS.downloadFile({
          fromUrl: fullUrl,
          toFile: dest,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }).promise;

        console.log('iOS download result:', result);

        if (!result.statusCode || result.statusCode < 200 || result.statusCode >= 300) {
          throw new Error(`HTTP ${result.statusCode || 'unknown'}`);
        }

        const exists = await RNFS.exists(dest);
        if (!exists) {
          throw new Error('File was not saved to device');
        }

        const stats = await RNFS.stat(dest);
        if (!stats.size || stats.size === 0) {
          throw new Error('Downloaded file is empty');
        }

        try {
          await FileViewer.open(dest, { showOpenWithDialog: true });
        } catch (viewerError) {
          console.log('File saved but could not open viewer:', viewerError);
        }

        return {
          success: true,
          path: dest,
          message: `File saved successfully!\nLocation: ${dest}`,
        };
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download failed', error.message || 'Unable to download file');
      throw error;
    }
  }
}

export default new ApiService();
