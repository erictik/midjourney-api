export type UploadParam = {
  filename: string;
  file_size: number;
  id: number | string;
};
export type UploadSlot = {
  id: number;
  upload_filename: string;
  upload_url: string;
};
export type DiscordImage = {
  id: number | string;
  filename: string;
  upload_filename: string;
};
