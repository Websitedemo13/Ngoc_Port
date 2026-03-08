import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type HeroSection = Tables<'hero_section'>;
export type HeroSectionUpdate = TablesUpdate<'hero_section'>;

export const profileAPI = {
  async getProfile() {
    const { data, error } = await supabase
      .from('hero_section')
      .select('*')
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(id: string, updates: HeroSectionUpdate) {
    const { data, error } = await supabase
      .from('hero_section')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
