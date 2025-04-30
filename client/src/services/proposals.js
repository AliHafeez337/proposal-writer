// src/services/proposals.js
import api from './api';

export const createProposal = async (data) => {
  const response = await api.post('/proposals', data);
  return response.data;
};

export const getProposal = async (proposalId) => {
  const response = await api.get(`/proposals/${proposalId}`);
  return response.data;
};

export const uploadProposalFiles = async (proposalId, files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await api.patch(`/proposals/${proposalId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateTitleDescription = async (proposalId, data) => {
  const response = await api.patch(`/proposals/${proposalId}/title`, data);
  return response.data;
};


export const submitProposal = async (proposalId) => {
  const response = await api.patch(`/proposals/${proposalId}/submit`);
  return response.data;
};