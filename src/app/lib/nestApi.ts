// NestJS backend API client methods
import api from "./axios";

/**
 * Upload document to NestJS backend
 * @param file - The file to upload
 * @param tagIds - Array of tag IDs to associate with the document
 * @returns Promise with the document data including ID
 */
export const uploadDocumentToNest = async (
  file: File,
  tagIds: number[]
): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("tags", JSON.stringify(tagIds));

  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};

/**
 * Get documents for a user
 * @param userInfo - User email or 'all' for admin
 * @param page - Page number
 * @param limit - Items per page
 * @param search - Optional search query
 * @returns Promise with documents data
 */
export const getDocuments = async (
  userInfo: string,
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<any> => {
  const params: any = { page, limit };
  if (search) {
    params.search = search;
  }

  const response = await api.get(`/documents/${userInfo}`, { params });
  return response;
};

/**
 * Download a document
 * @param documentId - The document ID
 * @returns Promise with blob data
 */
export const downloadDocument = async (documentId: number): Promise<Blob> => {
  const response = await api.get(`/documents/download/${documentId}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Preview a document
 * @param documentId - The document ID
 * @returns Promise with blob data
 */
export const previewDocument = async (documentId: number): Promise<Blob> => {
  const response = await api.get(`/documents/preview/${documentId}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get all tags
 * @returns Promise with tags array
 */
export const getTags = async (): Promise<any> => {
  const response = await api.get("/internal/tags");
  return response.data;
};

/**
 * Create a new tag (admin only)
 * @param tagName - The tag name
 * @returns Promise with created tag
 */
export const createTag = async (tagName: string): Promise<any> => {
  const response = await api.post("/internal/tags", { tag: tagName });
  return response.data;
};

/**
 * Delete a tag (admin only)
 * @param tagId - The tag ID
 * @returns Promise with deletion result
 */
export const deleteTag = async (tagId: number): Promise<any> => {
  const response = await api.delete(`/internal/tags/${tagId}`);
  return response.data;
};

/**
 * Validate the current JWT token
 * @returns Promise with validation result and user info
 */
export const validateToken = async (): Promise<any> => {
  const response = await api.get("/auth/validate");
  return response.data;
};

export default {
  uploadDocumentToNest,
  getDocuments,
  downloadDocument,
  previewDocument,
  getTags,
  createTag,
  deleteTag,
  validateToken,
};

