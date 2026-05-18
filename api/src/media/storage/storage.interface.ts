export type StoragePutInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type StoragePutResult = {
  bucket: string;
  key: string;
  url: string;
};

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export interface StorageService {
  putObject(input: StoragePutInput): Promise<StoragePutResult>;
  deleteObject(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
