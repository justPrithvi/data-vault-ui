// Python RAG service API client
import { createAuthenticatedAxios } from "./axiosFactory";

const PYTHON_API_BASE_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

// Create axios instance for Python service
const pythonApi = createAuthenticatedAxios(PYTHON_API_BASE_URL);

/**
 * Upload document to Python RAG service for processing
 * @param file - The file to upload
 * @param documentId - The document ID from NestJS backend
 * @returns Promise with the response data
 */
export const uploadDocumentToPython = async (
  file: File,
  documentId: string | number
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentId", documentId.toString());

    const response = await pythonApi.post("/api/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Python service upload failed:", error);
    throw error;
  }
};

/**
 * Send chat message to Python RAG service
 * @param message - The user's message
 * @param conversationId - The conversation ID
 * @param userId - The user ID
 * @returns Promise with the response data
 */
export const sendChatMessage = async (
  message: string,
  conversationId: number,
  userId?: number
): Promise<any> => {
  try {
    const response = await pythonApi.post("/api/chat", {
      message,
      conversationId,
      userId,
    });

    return response.data;
  } catch (error) {
    console.error("Python chat service failed:", error);
    throw error;
  }
};

// Export the axios instance for direct access if needed
export { pythonApi };

export default {
  uploadDocumentToPython,
  sendChatMessage,
};

