// Cloudflare R2 Storage Utilities
export {
  r2Client,
  generateFileKey,
  getPublicUrl,
  isAllowedImageType,
  isValidFileSize,
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  uploadFile,
  deleteFile,
  deleteFiles,
  deleteFolder,
  fileExists,
  getFileMetadata,
  generateBatchPresignedUrls,
  extractKeyFromUrl,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from "./r2";

export type {
  UploadedFile,
  PresignedUrlOptions,
  PresignedUrlResponse,
  AllowedImageType,
} from "./r2";
