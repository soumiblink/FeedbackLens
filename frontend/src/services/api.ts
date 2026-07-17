import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const uploadFeedback = async (file?: File, text?: string) => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (text) {
    formData.append('text', text);
  }
  const response = await api.post('/upload-feedback', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getMemories = async () => {
  const response = await api.get('/memory');
  return response.data;
};

export const getRoutingLogs = async () => {
  const response = await api.get('/routing-log');
  return response.data;
};

export const getReport = async () => {
  const response = await api.get('/report');
  return response.data;
};

export const getModelStats = async () => {
  const response = await api.get('/model-stats');
  return response.data;
};

export const resetData = async () => {
  const response = await api.post('/reset');
  return response.data;
};

export const getFeedback = async (sentiment?: string, type?: string) => {
  const params: { sentiment?: string; type?: string } = {};
  if (sentiment) params.sentiment = sentiment;
  if (type) params.type = type;
  
  const response = await api.get('/feedback', { params });
  return response.data;
};

export const getOpportunities = async (priority_level?: string) => {
  const params: { priority_level?: string } = {};
  if (priority_level) params.priority_level = priority_level;
  
  const response = await api.get('/opportunities', { params });
  return response.data;
};

export const getOpportunityDetail = async (topic: string) => {
  const response = await api.get(`/opportunities/${encodeURIComponent(topic)}`);
  return response.data;
};

export const getReleaseImpact = async () => {
  const response = await api.get('/releases/impact');
  return response.data;
};

export const compareReleases = async (beforeBatch: number, afterBatch: number) => {
  const response = await api.post('/releases/compare', {
    before_batch: beforeBatch,
    after_batch: afterBatch
  });
  return response.data;
};

export const getRoadmap = async () => {
  const response = await api.get('/roadmap');
  return response.data;
};

export const createRoadmapItem = async (item: {
  topic: string;
  priority_score: number;
  priority_level: string;
  release_name: string;
  quarter: string;
  status: string;
  owner?: string;
  business_goal?: string;
}) => {
  const response = await api.post('/roadmap', item);
  return response.data;
};

export const updateRoadmapItem = async (id: number, updates: {
  status?: string;
  owner?: string;
  release_name?: string;
  quarter?: string;
  business_goal?: string;
}) => {
  const response = await api.put(`/roadmap/${id}`, updates);
  return response.data;
};

export const deleteRoadmapItem = async (id: number) => {
  const response = await api.delete(`/roadmap/${id}`);
  return response.data;
};

export const getProductHealth = async () => {
  const response = await api.get('/product-health');
  return response.data;
};

export const getCustomerSegments = async () => {
  const response = await api.get('/customer-segments');
  return response.data;
};

export const getCustomerSegmentDetail = async (segment: string) => {
  const response = await api.get(`/customer-segments/${encodeURIComponent(segment)}`);
  return response.data;
};

export const getDecision = async (topic: string) => {
  const response = await api.get(`/decision/${encodeURIComponent(topic)}`);
  return response.data;
};

export const createDecision = async (topic: string, data: {
  decision_notes?: string;
  status?: string;
}) => {
  const response = await api.post(`/decision/${encodeURIComponent(topic)}`, data);
  return response.data;
};

export const updateDecision = async (topic: string, updates: {
  decision_notes?: string;
  status?: string;
}) => {
  const response = await api.put(`/decision/${encodeURIComponent(topic)}`, updates);
  return response.data;
};

export const getSavedViews = async () => {
  const response = await api.get('/saved-views');
  return response.data;
};

export const createSavedView = async (view: {
  name: string;
  sentiment?: string;
  feedback_type?: string;
  customer_segment?: string;
  priority_level?: string;
}) => {
  const response = await api.post('/saved-views', view);
  return response.data;
};

export const deleteSavedView = async (id: number) => {
  const response = await api.delete(`/saved-views/${id}`);
  return response.data;
};

export const getChangelog = async () => {
  const response = await api.get('/changelog');
  return response.data;
};

export const createChangelogEntry = async (entry: {
  version: string;
  title: string;
  description?: string;
  related_topics?: string[];
  release_batch_id?: number;
}) => {
  const response = await api.post('/changelog', entry);
  return response.data;
};

export const updateChangelogEntry = async (id: number, updates: {
  version?: string;
  title?: string;
  description?: string;
  related_topics?: string[];
  release_batch_id?: number;
}) => {
  const response = await api.put(`/changelog/${id}`, updates);
  return response.data;
};

export const deleteChangelogEntry = async (id: number) => {
  const response = await api.delete(`/changelog/${id}`);
  return response.data;
};

export default api;
