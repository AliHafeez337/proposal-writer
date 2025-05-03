// src/services/proposals.js
import api from './api';

// Create a new proposal
export const createProposal = async (data) => {
  const response = await api.post('/proposals', data);
  return response.data;
};

// Get a proposal
export const getProposal = async (proposalId) => {
  const response = await api.get(`/proposals/${proposalId}`);
  return response.data;
};

// Update proposal files
export const uploadProposalFiles = async (proposalId, files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await api.post(`/proposals/${proposalId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Delete a proposal file
export const deleteProposalFile = async (proposalId, fileId) => {
  const response = await api.delete(`/proposals/${proposalId}/files/${fileId}`);
  return response.data;
};

// Update proposal title and description
export const updateTitleDescription = async (proposalId, data) => {
  const response = await api.patch(`/proposals/${proposalId}/title`, data);
  return response.data;
};

// Delete a proposal
export const deleteProposal = async (proposalId) => {
  const response = await api.delete(`/proposals/${proposalId}`);
  return response.data;
};


// Save a section
export const saveSection = async (proposalId, section, data) => {
  const response = await api.patch(`/proposals/${proposalId}/section/${section}`, {
    "value": data
  });
  return response.data;
}