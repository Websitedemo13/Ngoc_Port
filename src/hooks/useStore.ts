import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeAPI, type Product } from '@/lib/supabase/store';

export const usePublishedProducts = (type?: string) =>
  useQuery({ queryKey: ['products', 'published', type], queryFn: () => storeAPI.getPublishedProducts(type) });

export const useAllProducts = () =>
  useQuery({ queryKey: ['products', 'all'], queryFn: storeAPI.getAllProducts });

export const useProductBySlug = (slug: string) =>
  useQuery({ queryKey: ['products', slug], queryFn: () => storeAPI.getProductBySlug(slug), enabled: !!slug });

export const useProductCategories = () =>
  useQuery({ queryKey: ['product_categories'], queryFn: storeAPI.getCategories });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<Product>) => storeAPI.createProduct(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...p }: Partial<Product> & { id: string }) => storeAPI.updateProduct(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storeAPI.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};
