import { API_BASE_URL } from "@/constants";

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    key: string;
    mimetype: string;
    size: number;
  };
}

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    // Using the specific URL provided by the user for this feature
    // Ideally this should be configurable, but sticking to requirements
    const UPLOAD_URL = `${API_BASE_URL}/api/v1/upload`;

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: {
        "x-admin-secret": "privora_admin_secret_123",
        // 'Cookie' is handled automatically by the browser with credentials: 'include'
        // forcing specific cookie header in browser env is unsafe/blocked usually
      },
      body: formData,
      credentials: "include", 
    });

    if (!res.ok) {
      throw new Error("Failed to upload image");
    }

    const json: UploadResponse = await res.json();

    if (!json.success) {
      throw new Error(json.message || "Image upload failed");
    }

    return json.data.key;
  },
};
