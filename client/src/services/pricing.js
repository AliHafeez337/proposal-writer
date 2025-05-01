import api from './api';

export const savePricing = async (proposalId, data) => {
  const response = await api.post(`/pricing/${proposalId}/items`, data);
  return response.data;
}

export const savePaymentSchedule = async (proposalId, data) => {
  const response = await api.post(`/pricing/${proposalId}/milestones`, data);
  return response.data;
}