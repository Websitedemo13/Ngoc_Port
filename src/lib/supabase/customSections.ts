import { supabase } from '@/integrations/supabase/client';

export interface CustomSection {
  id: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  page: string;
  section_type: string;
  sort_order: number | null;
  published: boolean | null;
  show_title: boolean | null;
  background_style: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const customSectionsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('custom_sections')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data as CustomSection[];
  },

  async getByPage(page: string) {
    const { data, error } = await supabase
      .from('custom_sections')
      .select('*')
      .eq('page', page)
      .eq('published', true)
      .order('sort_order');
    if (error) throw error;
    return data as CustomSection[];
  },

  async create(section: Partial<CustomSection>) {
    const { data, error } = await supabase
      .from('custom_sections')
      .insert(section as any)
      .select()
      .single();
    if (error) throw error;
    return data as CustomSection;
  },

  async update(id: string, section: Partial<CustomSection>) {
    const { data, error } = await supabase
      .from('custom_sections')
      .update(section as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as CustomSection;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('custom_sections')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
