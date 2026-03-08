import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogAPI, type BlogPostInsert, type BlogPostUpdate, type BlogCategoryInsert } from '@/lib/supabase/blog';
import { toast } from 'sonner';

export const usePublishedPosts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['blog-posts', 'published', page, limit],
    queryFn: () => blogAPI.getPublishedPosts(page, limit),
  });
};

export const useFeaturedPosts = (limit?: number) => {
  return useQuery({
    queryKey: ['blog-posts', 'featured', limit],
    queryFn: () => blogAPI.getFeaturedPosts(limit),
  });
};

export const usePostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'slug', slug],
    queryFn: () => blogAPI.getPostBySlug(slug),
    enabled: !!slug,
  });
};

export const useSearchPosts = (query: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'search', query],
    queryFn: () => blogAPI.searchPosts(query),
    enabled: query.length > 2,
  });
};

export const useAllPosts = () => {
  return useQuery({
    queryKey: ['blog-posts', 'all'],
    queryFn: () => blogAPI.getAllPosts(),
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: BlogPostInsert) => blogAPI.createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: BlogPostUpdate }) =>
      blogAPI.updatePost(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update post: ${error.message}`);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogAPI.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
};

export const useTogglePostPublished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      blogAPI.togglePublished(id, published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};

export const useAllCategories = () => {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogAPI.getAllCategories(),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: BlogCategoryInsert) => blogAPI.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
};
