import { useState, useEffect } from 'react';
import { useAllPosts, useCreatePost, useUpdatePost, useDeletePost, useTogglePostPublished } from '@/hooks/useBlog';
import { useReorderItems } from '@/hooks/useReorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import { slugify } from '@/lib/slugify';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableRow } from '@/components/admin/SortableRow';
import type { BlogPost, BlogPostInsert, BlogPostUpdate } from '@/lib/supabase/blog';

export default function BlogManager() {
  const { data: posts = [], isLoading } = useAllPosts();
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();
  const togglePublishedMutation = useTogglePostPublished();
  const reorder = useReorderItems('blogs');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPostInsert>>({
    title: '', slug: '', excerpt: '', content: '', image_url: '', published: false, featured: false,
  });
  const [localItems, setLocalItems] = useState<BlogPost[]>([]);

  useEffect(() => { setLocalItems(posts); }, [posts]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localItems.findIndex(i => i.id === active.id);
    const newIndex = localItems.findIndex(i => i.id === over.id);
    const newItems = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(newItems);
    reorder.mutate(newItems.map((item, i) => ({ id: item.id, sort_order: i })));
  };

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title, slug: post.slug || '', excerpt: post.excerpt || '',
        content: post.content, image_url: post.image_url || '',
        published: post.published || false, featured: post.featured || false,
      });
    } else {
      setEditingPost(null);
      setFormData({ title: '', slug: '', excerpt: '', content: '', image_url: '', published: false, featured: false });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Tiêu đề và nội dung là bắt buộc');
      return;
    }
    try {
      if (editingPost) {
        await updateMutation.mutateAsync({ id: editingPost.id, updates: formData as BlogPostUpdate });
      } else {
        await createMutation.mutateAsync(formData as BlogPostInsert);
      }
      setIsDialogOpen(false);
      setEditingPost(null);
    } catch (error) { console.error('Error saving post:', error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Blog</h1>
          <p className="text-sm text-muted-foreground">Kéo thả để sắp xếp thứ tự hiển thị</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" /> Thêm bài viết</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingPost ? 'Sửa bài viết' : 'Tạo bài viết'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Tiêu đề *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: !editingPost ? slugify(e.target.value) : formData.slug })} required /></div>
              <div><Label>Slug</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} /></div>
              <div><Label>Tóm tắt</Label><Textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={3} /></div>
              <div><Label>Nội dung *</Label><RichTextEditor content={formData.content || ''} onChange={(html) => setFormData({ ...formData, content: html })} /></div>
              <MediaUpload label="Ảnh bìa" value={formData.image_url || ''} onChange={(url) => setFormData({ ...formData, image_url: url })} accept="image/*" />
              <div className="flex gap-6">
                <div className="flex items-center space-x-2"><Switch id="published" checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked })} /><Label htmlFor="published">Xuất bản</Label></div>
                <div className="flex items-center space-x-2"><Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })} /><Label htmlFor="featured">Nổi bật</Label></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">{editingPost ? 'Cập nhật' : 'Tạo mới'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Xuất bản</TableHead>
              <TableHead>Nổi bật</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {localItems.map((post) => (
                  <SortableRow key={post.id} id={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">{post.slug}</TableCell>
                    <TableCell><Switch checked={post.published || false} onCheckedChange={() => togglePublishedMutation.mutate({ id: post.id, published: !post.published })} /></TableCell>
                    <TableCell>{post.featured ? '⭐' : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(post)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </SortableRow>
                ))}
              </TableBody>
            </SortableContext>
          </DndContext>
        </Table>
      </div>
    </div>
  );
}
