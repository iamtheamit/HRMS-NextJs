import apiClient from '@/shared/api/apiClient';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type UploadedMediaItem = {
  originalName: string;
  fieldName: string;
  mimeType: string;
  bytes: number;
  publicId: string;
  url: string;
  format?: string;
  resourceType: string;
  width?: number | null;
  height?: number | null;
  createdAt?: string;
};

type UploadResponse = {
  total: number;
  files: UploadedMediaItem[];
};

export async function uploadMediaFilesApi(
  files: File[],
  options?: { folder?: string; resourceType?: 'auto' | 'image' | 'video' | 'raw' }
) {
  if (!files.length) {
    return [] as UploadedMediaItem[];
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  if (options?.folder) {
    formData.append('folder', options.folder);
  }

  if (options?.resourceType) {
    formData.append('resourceType', options.resourceType);
  }

  const res = await apiClient.post<ApiResponse<UploadResponse>>('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data.files;
}
