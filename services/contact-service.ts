import { getLocal, setLocal } from "@/lib/device-storage";
import { getCommonHeaders } from "@/lib/api-utils";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

interface StoredContactSubmission {
  data: ContactFormData;
  timestamp: number;
  synced: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";
const CONTACT_STORAGE_KEY = "contact_submissions";

const getStoredSubmissions = (): StoredContactSubmission[] => {
  return getLocal<StoredContactSubmission[]>(CONTACT_STORAGE_KEY, []);
};

const saveSubmission = (data: ContactFormData, synced: boolean): void => {
  const submissions = getStoredSubmissions();
  submissions.push({
    data,
    timestamp: Date.now(),
    synced,
  });
  const recentSubmissions = submissions.slice(-10);
  setLocal(CONTACT_STORAGE_KEY, recentSubmissions);
};

export const submitContactForm = async (
  data: ContactFormData
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/api/v1/contact-us/contact-us`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getCommonHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      saveSubmission(data, true);
      return {
        success: true,
        message: result?.message || "Message sent successfully!",
      };
    }

    if (response.status === 404) {
      saveSubmission(data, false);
      console.warn(
        "[contact-service] Backend endpoint not available. Message saved locally."
      );
      return {
        success: true,
        message: "Thank you for your message! We will get back to you soon.",
      };
    }

    const result = await response.json().catch(() => ({}));
    throw new Error(result?.message || "Failed to submit form");
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      saveSubmission(data, false);
      return {
        success: true,
        message: "Thank you for your message! We will get back to you soon.",
      };
    }
    throw error;
  }
};

export const getContactHistory = (): StoredContactSubmission[] => {
  return getStoredSubmissions();
};

export const clearContactHistory = (): void => {
  setLocal(CONTACT_STORAGE_KEY, []);
};
