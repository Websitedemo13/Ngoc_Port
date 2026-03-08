import { supabase } from '@/integrations/supabase/client';

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  file_type: string | null;
  file_size: number | null;
  alt_text_en: string | null;
  alt_text_vi: string | null;
  created_at: string;
}

export type MediaItemInsert = {
  filename: string;
  url: string;
  file_type?: string | null;
  file_size?: number | null;
  alt_text_en?: string | null;
  alt_text_vi?: string | null;
};

export const mediaAPI = {
  async getAllMedia(): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('media_library' as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as unknown as MediaItem[]) || [];
  },

  async getMediaByType(fileType: string): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('media_library' as any)
      .select('*')
      .eq('file_type', fileType)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as unknown as MediaItem[]) || [];
  },

  async createMediaItem(media: MediaItemInsert): Promise<MediaItem> {
    const { data, error } = await supabase
      .from('media_library' as any)
      .insert(media as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as MediaItem;
  },

  async updateMediaItem(id: string, updates: Partial<MediaItemInsert>): Promise<MediaItem> {
    const { data, error } = await supabase
      .from('media_library' as any)
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as MediaItem;
  },

  async deleteMediaItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('media_library' as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
