import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { applyColorTheme } from '@/lib/colorThemes';
import { useTheme } from '@/lib/theme';

const ColorThemeApplier = () => {
  const { theme: darkMode } = useTheme();

  const { data: colorThemeId } = useQuery({
    queryKey: ['settings', 'color_theme'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'color_theme')
        .maybeSingle();
      return data?.value || 'navy-gold';
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (colorThemeId) {
      applyColorTheme(colorThemeId, darkMode === 'dark');
    }
  }, [colorThemeId, darkMode]);

  return null;
};

export default ColorThemeApplier;
