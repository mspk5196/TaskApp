import ENV from '../config/env';

const api = async (endpoint, options = {}) => {
  const url = `${ENV.API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw { status: response.status, ...data };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default api;
