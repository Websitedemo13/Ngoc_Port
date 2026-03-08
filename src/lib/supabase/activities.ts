import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  category: string | null;
  date: string | null;
  location: string | null;
  link: string | null;
  published: boolean | null;
  featured: boolean | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export type ActivityInsert = Omit<Activity, 'id' | 'created_at' | 'updated_at'>;
export type ActivityUpdate = Partial<ActivityInsert>;

export const activitiesAPI = {
  async getPublishedActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as Activity[]) || [];
  },

  async getFeaturedActivities(limit?: number): Promise<Activity[]> {
    let query = supabase
      .from('activities')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('sort_order');
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as Activity[]) || [];
  },

  async getAllActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as Activity[]) || [];
  },

  async getActivity(id: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as Activity | null;
  },

  async createActivity(activity: ActivityInsert): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as Activity;
  },

  async updateActivity(id: string, updates: ActivityUpdate): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as Activity;
  },

  async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async togglePublished(id: string, published: boolean): Promise<Activity | null> {
    return this.updateActivity(id, { published });
  },

  async toggleFeatured(id: string, featured: boolean): Promise<Activity | null> {
    return this.updateActivity(id, { featured });
  },
};
