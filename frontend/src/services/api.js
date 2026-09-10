import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const studioService = {
  enhancePhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/studio/enhance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const speechService = {
  extractSlots: async ({ transcript, preferred_lang = 'hi' }) => {
    const response = await api.post('/speech/extract-slots', {
      transcript,
      preferred_lang,
    });
    return response.data;
  },

  transcribeAudio: async (audioBlob, transcript = '', preferred_lang = 'hi') => {
    const formData = new FormData();
    if (audioBlob) {
      formData.append('audio', audioBlob, 'artisan_recording.webm');
    }
    if (transcript) {
      formData.append('transcript', transcript);
    }
    formData.append('preferred_lang', preferred_lang);

    const response = await api.post('/speech/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const pricingService = {
  calculatePricing: async ({ craft_name, state, production_days, raw_material_cost }) => {
    const response = await api.post('/pricing/calculate', {
      craft_name,
      state,
      production_days: Number(production_days) || 1,
      raw_material_cost: Number(raw_material_cost) || 0,
    });
    return response.data;
  },

  getBenchmarks: async () => {
    const response = await api.get('/pricing/benchmarks');
    return response.data;
  },

  getStateWages: async () => {
    const response = await api.get('/pricing/state-wages');
    return response.data;
  },
};

export const catalogService = {
  listProducts: async (params = {}) => {
    const response = await api.get('/catalog/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/catalog/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/catalog/products', productData);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.patch(`/catalog/products/${id}`, data);
    return response.data;
  },

  toggleOndcSync: async (id) => {
    const response = await api.post(`/catalog/products/${id}/sync-ondc`);
    return response.data;
  },

  getOndcExport: async (id) => {
    const response = await api.get(`/catalog/products/${id}/ondc-export`);
    return response.data;
  },

  listArtisans: async () => {
    const response = await api.get('/catalog/artisans');
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/catalog/login', credentials);
    return response.data;
  },
};

export default api;
