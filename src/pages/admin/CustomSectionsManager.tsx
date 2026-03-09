import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import {
  useAllCustomSections,
  useCreateCustomSection,
  useUpdateCustomSection,
  useDeleteCustomSection,
} from '@/hooks/useCustomSections';
import type { CustomSection } from '@/lib/supabase/customSections';

const PAGES = [
  { value: 'home', label: 'Trang chủ' },
  { value: 'about', label: 'Giới thiệu' },
  { value: 'experience', label: 'Kinh nghiệm' },
  { value: 'education', label: 'Học vấn' },
  { value: 'projects', label: 'Dự án' },
  { value: 'activities', label: 'Hoạt động' },
  { value: 'blog', label: 'Blog' },
  { value: 'contact', label: 'Liên hệ' },
  { value: 'store', label: 'Cửa hàng' },
];

const BG_STYLES = [
  { value: 'default', label: 'Mặc định' },
  { value: 'muted', label: 'Xám nhẹ' },
  { value: 'accent', label: 'Nhấn màu' },
  { value: 'dark', label: 'Tối (Navy)' },
];

const emptySection: Partial<CustomSection> = {
  title: '',
  subtitle: '',
  content: '',
  image_url: '',
  page: 'home',
  section_type: 'content',
  sort_order: 0,
  published: true,
  show_title: true,
  background_style: 'default',
};

export default function CustomSectionsManager() {
  const { data: sections, isLoading } = useAllCustomSections();
  const createMut = useCreateCustomSection();
  const updateMut = useUpdateCustomSection();
  const deleteMut = useDeleteCustomSection();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CustomSection> | null>(null);
  const [filterPage, setFilterPage] = useState<string>('all');

  const filtered = sections?.filter(s => filterPage === 'all' || s.page === filterPage) || [];

  const openNew = () => {
    setEditing({ ...emptySection, sort_order: (sections?.length || 0) });
    setOpen(true);
  };

  const openEdit = (s: CustomSection) => {
    setEditing({ ...s });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title) { toast.error('Cần nhập tiêu đề'); return; }
    try {
      if (editing.id) {
        await updateMut.mutateAsync(editing as CustomSection);
        toast.success('Đã cập nhật section');
      } else {
        await createMut.mutateAsync(editing);
        toast.success('Đã tạo section mới');
      }
      setOpen(false);
      setEditing(null);
    } catch {
      toast.error('Lỗi khi lưu section');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa section này?')) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success('Đã xóa');
    } catch {
      toast.error('Lỗi khi xóa');
    }
  };

  const togglePublish = async (s: CustomSection) => {
    await updateMut.mutateAsync({ id: s.id, published: !s.published } as any);
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Custom Sections</h1>
          <p className="text-muted-foreground text-sm">Tạo và quản lý các section tùy chỉnh trên mỗi trang</p>
        </div>
        <Button onClick={openNew}><Plus size={16} className="mr-1" /> Thêm Section</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={filterPage === 'all' ? 'default' : 'outline'} onClick={() => setFilterPage('all')}>Tất cả</Button>
        {PAGES.map(p => (
          <Button key={p.value} size="sm" variant={filterPage === p.value ? 'default' : 'outline'} onClick={() => setFilterPage(p.value)}>
            {p.label}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Chưa có section nào. Nhấn "Thêm Section" để bắt đầu.</CardContent></Card>
        )}
        {filtered.map(s => (
          <Card key={s.id} className="group">
            <CardContent className="p-4 flex items-center gap-4">
              <GripVertical size={16} className="text-muted-foreground/40" />
              {s.image_url && <img src={s.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{s.title}</h3>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{PAGES.find(p => p.value === s.page)?.label || s.page}</span>
                  {!s.published && <span className="text-xs text-muted-foreground">(Ẩn)</span>}
                </div>
                {s.subtitle && <p className="text-sm text-muted-foreground truncate">{s.subtitle}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => togglePublish(s)}>
                  {s.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil size={16} /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 size={16} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Chỉnh sửa Section' : 'Tạo Section mới'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trang hiển thị</Label>
                  <Select value={editing.page} onValueChange={v => setEditing({ ...editing, page: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PAGES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Kiểu nền</Label>
                  <Select value={editing.background_style || 'default'} onValueChange={v => setEditing({ ...editing, background_style: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BG_STYLES.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Tiêu đề *</Label>
                <Input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Ví dụ: Thành tựu nổi bật" />
              </div>
              <div>
                <Label>Phụ đề</Label>
                <Input value={editing.subtitle || ''} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Mô tả ngắn cho section" />
              </div>

              <div>
                <Label>Hình ảnh</Label>
                <MediaUpload value={editing.image_url || ''} onChange={url => setEditing({ ...editing, image_url: url })} />
              </div>

              <div>
                <Label>Nội dung</Label>
                <RichTextEditor content={editing.content || ''} onChange={c => setEditing({ ...editing, content: c })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thứ tự sắp xếp</Label>
                  <Input type="number" value={editing.sort_order || 0} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-3 pt-5">
                  <div className="flex items-center gap-2">
                    <Switch checked={editing.published ?? true} onCheckedChange={v => setEditing({ ...editing, published: v })} />
                    <Label>Xuất bản</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editing.show_title ?? true} onCheckedChange={v => setEditing({ ...editing, show_title: v })} />
                    <Label>Hiện tiêu đề</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                  {editing.id ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
