import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Experience = Tables<'experiences'>;
export type ExperienceInsert = TablesInsert<'experiences'>;
export type ExperienceUpdate = TablesUpdate<'experiences'>;

export const experiencesAPI = {
  async getAllExperiences() {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getExperience(id: string) {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createExperience(experience: ExperienceInsert) {
    const { data, error } = await supabase
      .from('experiences')
      .insert(experience)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateExperience(id: string, updates: ExperienceUpdate) {
    const { data, error } = await supabase
      .from('experiences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteExperience(id: string) {
    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
