import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type TableName = 'education' | 'experiences' | 'projects' | 'activities' | 'blogs';

const queryKeyMap: Record<TableName, string[]> = {
  education: ['education'],
  experiences: ['experiences'],
  projects: ['projects'],
  activities: ['activities'],
  blogs: ['blog-posts'],
};

export const useReorderItems = (table: TableName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      const promises = items.map(item =>
        supabase.from(table).update({ sort_order: item.sort_order }).eq('id', item.id)
      );
      const results = await Promise.all(promises);
      const error = results.find(r => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyMap[table] });
      toast.success('Đã cập nhật thứ tự');
    },
    onError: (error: Error) => {
      toast.error(`Lỗi sắp xếp: ${error.message}`);
    },
  });
};
