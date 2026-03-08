import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { applyFontTheme } from '@/lib/fontThemes';

const FontThemeApplier = () => {
  const { data: fontThemeId } = useQuery({
    queryKey: ['settings', 'font_theme'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'font_theme')
        .maybeSingle();
      return data?.value || 'inter-lora';
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (fontThemeId) {
      applyFontTheme(fontThemeId);
    }
  }, [fontThemeId]);

  return null;
};

export default FontThemeApplier;
