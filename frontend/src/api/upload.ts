import { api } from "./client";

export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<{ url: string }>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<{ url: string; name: string; size: number; type: string }>(
      '/upload/file',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return res.data;
  },
};
