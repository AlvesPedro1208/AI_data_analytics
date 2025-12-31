import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const getSetting = async (key: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/settings/${key}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const saveSetting = async (key: string, value: string) => {
  const response = await axios.post(`${API_BASE_URL}/settings/`, { key, value });
  return response.data;
};
