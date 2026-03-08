import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Education = Tables<'education'>;
export type EducationInsert = TablesInsert<'education'>;
export type EducationUpdate = TablesUpdate<'education'>;

export const educationAPI = {
  async getAllEducation(): Promise<Education[]> {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getEducation(id: string): Promise<Education | null> {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createEducation(education: EducationInsert): Promise<Education> {
    const { data, error } = await supabase
      .from('education')
      .insert(education)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateEducation(id: string, updates: EducationUpdate): Promise<Education> {
    const { data, error } = await supabase
      .from('education')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteEducation(id: string): Promise<void> {
    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
