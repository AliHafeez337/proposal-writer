import api from './api';

// Save items with pricing
export const savePricing = async (proposalId, data) => {
  const response = await api.post(`/pricing/${proposalId}/items`, data);
  return response.data;
}