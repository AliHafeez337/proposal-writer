import api from './api';

// AI-related API calls

export const analyzeProposal = async (proposalId, data) => {
  const response = await api.post(`/ai/${proposalId}/process`, data);
  return response.data;
}

export const analyzeProposal1 = async (proposalId, data) => {
  const response = await api.post(`/ai/${proposalId}/analyze`, data);
  return response.data;
}

export const generateProposal = async (proposalId) => {
  const response = await api.post(`/ai/${proposalId}/generate`);
  return response.data;
}