import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educationAPI, type EducationInsert, type EducationUpdate } from '@/lib/supabase/education';
import { toast } from 'sonner';

export const useAllEducation = () => {
  return useQuery({
    queryKey: ['education', 'all'],
    queryFn: () => educationAPI.getAllEducation(),
  });
};

export const useCreateEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (education: EducationInsert) => educationAPI.createEducation(education),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      toast.success('Đã tạo học vấn');
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });
};

export const useUpdateEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: EducationUpdate }) =>
      educationAPI.updateEducation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      toast.success('Đã cập nhật học vấn');
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });
};

export const useDeleteEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => educationAPI.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      toast.success('Đã xóa học vấn');
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });
};
