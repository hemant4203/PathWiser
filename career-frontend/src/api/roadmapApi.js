import apiClient from './apiClient';

export const fetchRoadmaps = async (page = 0) => {
  try {
    const response = await apiClient.get(`api/roadmap?page=${page}&size=10`);
    return response.data;
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return [];
  }
};

export const getAllRoadmaps = fetchRoadmaps;

export const compareRoadmaps = async (path1Id, path2Id) => {
  try {
    const response = await apiClient.get(`api/roadmap/compare?id1=${path1Id}&id2=${path2Id}`);
    return { data: response.data };
  } catch (error) {
    console.error("Error comparing roadmaps:", error);
    throw error;
  }
};

export const fetchRoadmapDetail = async (id) => {
  try {
    const response = await apiClient.get(`api/roadmap/${id}`);
    return { data: response.data };
  } catch (error) {
    console.error(`Error fetching details for roadmap ${id}:`, error);
    throw error;
  }
};