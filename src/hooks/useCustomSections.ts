import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customSectionsAPI, type CustomSection } from '@/lib/supabase/customSections';

export const useAllCustomSections = () =>
  useQuery({ queryKey: ['custom_sections'], queryFn: customSectionsAPI.getAll });

export const useCustomSectionsByPage = (page: string) =>
  useQuery({
    queryKey: ['custom_sections', page],
    queryFn: () => customSectionsAPI.getByPage(page),
  });

export const useCreateCustomSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: Partial<CustomSection>) => customSectionsAPI.create(s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom_sections'] }),
  });
};

export const useUpdateCustomSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...s }: Partial<CustomSection> & { id: string }) => customSectionsAPI.update(id, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom_sections'] }),
  });
};

export const useDeleteCustomSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customSectionsAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom_sections'] }),
  });
};
