import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, ImageIcon, X } from 'lucide-react';
import { MediaUpload } from '@/components/admin/MediaUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableRow } from '@/components/admin/SortableRow';
import { useReorderItems } from '@/hooks/useReorder';
import {
  useAllActivities, useCreateActivity, useUpdateActivity, useDeleteActivity,
  useToggleActivityPublished, useToggleActivityFeatured,
} from '@/hooks/useActivities';
import type { Activity, ActivityInsert, ActivityUpdate } from '@/lib/supabase/activities';

export default function ActivitiesManager() {
  const { data: activities, isLoading } = useAllActivities();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const togglePublished = useToggleActivityPublished();
  const toggleFeatured = useToggleActivityFeatured();
  const reorder = useReorderItems('activities');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', content: '', image_url: '', category: '',
    date: '', location: '', link: '', published: false, featured: false, sort_order: 0,
  });
  const [localItems, setLocalItems] = useState<Activity[]>([]);

  useEffect(() => { if (activities) setLocalItems(activities); }, [activities]);

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

  useEffect(() => {
    if (editingActivity) {
      setFormData({
        title: editingActivity.title, description: editingActivity.description || '',
        content: editingActivity.content || '', image_url: editingActivity.image_url || '',
        category: editingActivity.category || '', date: editingActivity.date || '',
        location: editingActivity.location || '', link: editingActivity.link || '',
        published: editingActivity.published || false, featured: editingActivity.featured || false,
        sort_order: editingActivity.sort_order || 0,
      });
    } else { resetForm(); }
  }, [editingActivity]);

  const resetForm = () => {
    setFormData({ title: '', description: '', content: '', image_url: '', category: '', date: '', location: '', link: '', published: false, featured: false, sort_order: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { toast.error('Tiêu đề là bắt buộc'); return; }
    try {
      if (editingActivity) {
        await updateActivity.mutateAsync({ id: editingActivity.id, updates: formData as ActivityUpdate });
      } else {
        await createActivity.mutateAsync(formData as ActivityInsert);
      }
      setIsDialogOpen(false);
      setEditingActivity(null);
      resetForm();
    } catch (error) { console.error('Error:', error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa hoạt động này?')) {
      await deleteActivity.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý hoạt động</h1>
          <p className="text-sm text-muted-foreground">Kéo thả để sắp xếp thứ tự hiển thị</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingActivity(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Thêm hoạt động</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingActivity ? 'Sửa hoạt động' : 'Thêm hoạt động mới'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Ảnh bìa</Label>
                {formData.image_url ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden group border border-border">
                    <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button type="button" size="sm" variant="secondary" className="shadow-lg" onClick={() => setFormData(p => ({ ...p, image_url: '' }))}><X className="h-4 w-4 mr-1" /> Xóa ảnh</Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><ImageIcon className="h-6 w-6 text-primary/60" /></div>
                    <p className="text-sm text-muted-foreground">Tải lên ảnh bìa hoạt động</p>
                  </div>
                )}
                <div className="mt-2"><MediaUpload label="" value={formData.image_url} onChange={(url) => setFormData(p => ({ ...p, image_url: url }))} accept="image/*" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tiêu đề *</Label><Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required /></div>
                <div><Label>Danh mục</Label><Input value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} placeholder="Tình nguyện, Sự kiện..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Ngày</Label><Input value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} placeholder="01/2024" /></div>
                <div><Label>Địa điểm</Label><Input value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} /></div>
              </div>
              <div><Label>Link</Label><Input value={formData.link} onChange={(e) => setFormData(p => ({ ...p, link: e.target.value }))} /></div>
              <div><Label>Mô tả ngắn</Label><Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
              <div><Label>Nội dung chi tiết</Label><RichTextEditor content={formData.content} onChange={(html) => setFormData(p => ({ ...p, content: html }))} /></div>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2"><Switch checked={formData.published} onCheckedChange={(checked) => setFormData(p => ({ ...p, published: checked }))} /><Label>Xuất bản</Label></div>
                <div className="flex items-center space-x-2"><Switch checked={formData.featured} onCheckedChange={(checked) => setFormData(p => ({ ...p, featured: checked }))} /><Label>Nổi bật</Label></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">{editingActivity ? 'Cập nhật' : 'Tạo mới'}</Button>
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
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Xuất bản</TableHead>
              <TableHead>Nổi bật</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {localItems.length > 0 ? localItems.map((activity) => (
                  <SortableRow key={activity.id} id={activity.id}>
                    <TableCell>
                      {activity.image_url ? (
                        <div className="w-12 h-8 rounded overflow-hidden border border-border"><img src={activity.image_url} alt="" className="w-full h-full object-cover" /></div>
                      ) : (
                        <div className="w-12 h-8 rounded bg-muted flex items-center justify-center border border-border"><ImageIcon className="h-4 w-4 text-muted-foreground/40" /></div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div><span className="font-medium">{activity.title}</span>{activity.date && <span className="text-xs text-muted-foreground ml-2">{activity.date}</span>}</div>
                    </TableCell>
                    <TableCell>{activity.category && <Badge variant="outline" className="text-xs">{activity.category}</Badge>}</TableCell>
                    <TableCell><Switch checked={activity.published || false} onCheckedChange={() => togglePublished.mutate({ id: activity.id, published: !activity.published })} /></TableCell>
                    <TableCell><Switch checked={activity.featured || false} onCheckedChange={() => toggleFeatured.mutate({ id: activity.id, featured: !activity.featured })} /></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingActivity(activity); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(activity.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </SortableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Chưa có hoạt động nào.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </SortableContext>
          </DndContext>
        </Table>
      </div>
    </div>
  );
}
