import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vouchersAPI, Voucher } from '@/lib/supabase/vouchers';

export function useVouchers() {
  return useQuery({ queryKey: ['vouchers'], queryFn: vouchersAPI.getAll });
}

export function useCreateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Partial<Voucher>) => vouchersAPI.create(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vouchers'] }),
  });
}

export function useUpdateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Voucher> }) => vouchersAPI.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vouchers'] }),
  });
}

export function useDeleteVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vouchersAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vouchers'] }),
  });
}
