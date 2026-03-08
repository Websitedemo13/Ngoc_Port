import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const keys = ['logo_url', 'favicon_url', 'site_name', 'footer_tagline', 'footer_text'];
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .in('key', keys);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach(item => { map[item.key] = item.value || ''; });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
};
