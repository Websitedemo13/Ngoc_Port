import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type BlogPost = Tables<'blogs'>;
export type BlogPostInsert = TablesInsert<'blogs'>;
export type BlogPostUpdate = TablesUpdate<'blogs'>;

export type BlogCategory = Tables<'blog_categories'>;
export type BlogCategoryInsert = TablesInsert<'blog_categories'>;

export const blogAPI = {
  // Get all published posts with pagination
  async getPublishedPosts(page: number = 1, limit: number = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return { posts: data, count: count || 0, hasMore: count ? to < count : false };
  },

  // Get featured posts
  async getFeaturedPosts(limit: number = 3) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get post by slug
  async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Search posts
  async searchPosts(query: string) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get all posts (admin)
  async getAllPosts() {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create post
  async createPost(post: BlogPostInsert) {
    const { data, error } = await supabase
      .from('blogs')
      .insert(post)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update post
  async updatePost(id: string, updates: BlogPostUpdate) {
    const { data, error } = await supabase
      .from('blogs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete post
  async deletePost(id: string) {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle published
  async togglePublished(id: string, published: boolean) {
    return this.updatePost(id, { published });
  },

  // Get all categories
  async getAllCategories() {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  // Create category
  async createCategory(category: BlogCategoryInsert) {
    const { data, error } = await supabase
      .from('blog_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete category
  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
