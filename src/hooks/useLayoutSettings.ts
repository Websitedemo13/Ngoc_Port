import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type HeaderStyle = 'default' | 'centered' | 'minimal';
export type FooterStyle = 'default' | 'minimal' | 'centered';

interface LayoutSettings {
  header_style: HeaderStyle;
  footer_style: FooterStyle;
}

export function useLayoutSettings() {
  return useQuery({
    queryKey: ['layout-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['header_style', 'footer_style']);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach(item => { map[item.key] = item.value; });
      return {
        header_style: (map.header_style || 'default') as HeaderStyle,
        footer_style: (map.footer_style || 'default') as FooterStyle,
      } as LayoutSettings;
    },
    staleTime: 5 * 60 * 1000,
  });
}
