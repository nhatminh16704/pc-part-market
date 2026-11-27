import { apiClient } from '@/lib/axios';

export type UploadPurpose = 'avatar' | 'product' | 'category';

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  overwrite: boolean;
}

export const mediaApi = {
  getUploadSignature: async (purpose: UploadPurpose): Promise<UploadSignature> => {
    const response = await apiClient.post<UploadSignature>('/media/signature', { purpose });
    return response.data;
  },

  uploadImage: async (file: File, purpose: UploadPurpose): Promise<string> => {
    const sig = await mediaApi.getUploadSignature(purpose);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sig.apiKey);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('signature', sig.signature);
    formData.append('folder', sig.folder);
    formData.append('public_id', sig.publicId);
    formData.append('overwrite', String(sig.overwrite));

    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || 'Tải ảnh lên Cloudinary thất bại.');
    }

    const data = await res.json();
    return data.secure_url as string;
  },
};
