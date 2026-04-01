import { supabase } from './supabase';

export const storageService = {
  async uploadImage(
    file: File,
    bucket: string,
    folder: string = ''
  ): Promise<string> {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  async deleteImage(bucket: string, path: string): Promise<void> {
    const pathParts = path.split(`${bucket}/`);
    const filePath = pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  },

  async listImages(bucket: string, folder?: string): Promise<string[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '', { limit: 100 });

    if (error) throw error;

    return (data || [])
      .filter(f => f.metadata?.mimetype?.startsWith('image/'))
      .map(f => {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(`${folder || ''}/${f.name}`);
        return urlData.publicUrl;
      });
  },
};

export const menuStorage = {
  upload: (file: File) => storageService.uploadImage(file, 'menu-images', 'menu'),
  delete: (path: string) => storageService.deleteImage('menu-images', path),
};

export const adsStorage = {
  upload: (file: File) => storageService.uploadImage(file, 'ad-images', 'ads'),
  delete: (path: string) => storageService.deleteImage('ad-images', path),
};

export const profileStorage = {
  upload: (file: File) => storageService.uploadImage(file, 'profile-images', 'profiles'),
  delete: (path: string) => storageService.deleteImage('profile-images', path),
};