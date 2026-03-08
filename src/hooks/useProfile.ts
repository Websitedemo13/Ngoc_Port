import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI, type HeroSectionUpdate } from '@/lib/supabase/profile';
import { toast } from 'sonner';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.getProfile(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: HeroSectionUpdate }) =>
      profileAPI.updateProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
};
