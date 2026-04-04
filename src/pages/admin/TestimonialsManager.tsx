import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Quote, GripVertical } from 'lucide-react';
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial, type Testimonial } from '@/hooks/useTestimonials';
import { useSetting } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const emptyForm = {
  name: '',
  role_vi: '',
  role_en: '',
  quote_vi: '',
  quote_en: '',
  avatar_url: '',
  published: true,
  sort_order: 0,
};

export default function TestimonialsManager() {
  const queryClient = useQueryClient();
  const { data: testimonials, isLoading } = useTestimonials();
  const { data: toggleSetting } = useSetting('show_testimonials');
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const showTestimonials = toggleSetting?.value !== 'false';

  const handleToggleSection = async (checked: boolean) => {
    await supabase.from('settings').upsert(
      { key: 'show_testimonials', value: checked ? 'true' : 'false' },
      { onConflict: 'key' }
    );
    queryClient.invalidateQueries({ queryKey: ['settings'] });
    toast.success(checked ? 'Đã bật Testimonials' : 'Đã tắt Testimonials');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: (testimonials?.length || 0) });
    setDialogOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      role_vi: t.role_vi || '',
      role_en: t.role_en || '',
      quote_vi: t.quote_vi || '',
      quote_en: t.quote_en || '',
      avatar_url: t.avatar_url || '',
      published: t.published,
      sort_order: t.sort_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.quote_vi.trim()) {
      toast.error('Tên và nhận xét tiếng Việt là bắt buộc');
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...form });
        toast.success('Đã cập nhật');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Đã thêm testimonial');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa testimonial này?')) return;
    await deleteMutation.mutateAsync(id);
    toast.success('Đã xóa');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
          <p className="text-sm text-muted-foreground">Quản lý nhận xét, đánh giá từ khách hàng/đối tác</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Hiển thị</Label>
            <Switch checked={showTestimonials} onCheckedChange={handleToggleSection} />
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Thêm
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
      ) : !testimonials?.length ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Quote className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Chưa có testimonial nào</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Thêm testimonial đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <Card key={t.id} className={`relative group overflow-hidden ${!t.published ? 'opacity-50' : ''}`}>
              {/* Gold accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-60" />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-secondary/30" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
                      👤
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.role_vi || t.role_en}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 italic">"{t.quote_vi}"</p>
                {!t.published && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Ẩn</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa Testimonial' : 'Thêm Testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ảnh đại diện</Label>
              <div className="flex items-center gap-4">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-secondary/30" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">👤</div>
                )}
                <div className="flex-1">
                  <MediaUpload
                    value={form.avatar_url}
                    onChange={(url) => setForm(prev => ({ ...prev, avatar_url: url }))}
                    label=""
                    accept="image/*"
                    maxSizeMB={5}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Tên <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Nguyễn Văn A" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Chức vụ (VI)</Label>
                <Input value={form.role_vi} onChange={(e) => setForm(prev => ({ ...prev, role_vi: e.target.value }))} placeholder="CEO, Công ty ABC" />
              </div>
              <div>
                <Label>Chức vụ (EN)</Label>
                <Input value={form.role_en} onChange={(e) => setForm(prev => ({ ...prev, role_en: e.target.value }))} placeholder="CEO, ABC Company" />
              </div>
            </div>

            <div>
              <Label>Nhận xét (VI) <span className="text-destructive">*</span></Label>
              <Textarea value={form.quote_vi} onChange={(e) => setForm(prev => ({ ...prev, quote_vi: e.target.value }))} placeholder="Nhận xét tiếng Việt..." rows={3} />
            </div>

            <div>
              <Label>Nhận xét (EN)</Label>
              <Textarea value={form.quote_en} onChange={(e) => setForm(prev => ({ ...prev, quote_en: e.target.value }))} placeholder="Testimonial in English..." rows={3} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Hiển thị</Label>
              <Switch checked={form.published} onCheckedChange={(checked) => setForm(prev => ({ ...prev, published: checked }))} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button className="flex-1" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
