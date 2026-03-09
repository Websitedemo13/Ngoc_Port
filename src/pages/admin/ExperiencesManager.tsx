import { useState, useEffect } from 'react';
import { useAllExperiences, useCreateExperience, useUpdateExperience, useDeleteExperience } from '@/hooks/useExperiences';
import { useReorderItems } from '@/hooks/useReorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableRow } from '@/components/admin/SortableRow';
import type { Experience, ExperienceInsert, ExperienceUpdate } from '@/lib/supabase/experiences';

export default function ExperiencesManager() {
  const { data: experiences = [], isLoading } = useAllExperiences();
  const createMutation = useCreateExperience();
  const updateMutation = useUpdateExperience();
  const deleteMutation = useDeleteExperience();
  const reorder = useReorderItems('experiences');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    title: '', company: '', year: '', location: '', description: '', achievements: [] as string[], sort_order: 0,
  });
  const [achievementInput, setAchievementInput] = useState('');
  const [localItems, setLocalItems] = useState<Experience[]>([]);

  useEffect(() => { setLocalItems(experiences); }, [experiences]);

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

  const handleOpenDialog = (experience?: Experience) => {
    if (experience) {
      setEditingExperience(experience);
      setFormData({
        title: experience.title, company: experience.company, year: experience.year,
        location: experience.location || '', description: experience.description || '',
        achievements: experience.achievements || [], sort_order: experience.sort_order || 0,
      });
    } else {
      setEditingExperience(null);
      setFormData({ title: '', company: '', year: '', location: '', description: '', achievements: [], sort_order: 0 });
    }
    setAchievementInput('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.year) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    try {
      if (editingExperience) {
        await updateMutation.mutateAsync({ id: editingExperience.id, updates: formData as ExperienceUpdate });
      } else {
        await createMutation.mutateAsync(formData as ExperienceInsert);
      }
      setIsDialogOpen(false);
    } catch (error) { console.error('Error saving:', error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const addAchievement = () => {
    if (!achievementInput.trim()) return;
    setFormData(prev => ({ ...prev, achievements: [...prev.achievements, achievementInput.trim()] }));
    setAchievementInput('');
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== index) }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý kinh nghiệm</h1>
          <p className="text-sm text-muted-foreground">Kéo thả để sắp xếp thứ tự hiển thị</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" /> Thêm</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingExperience ? 'Sửa kinh nghiệm' : 'Thêm kinh nghiệm'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Chức danh *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
              <div><Label>Công ty *</Label><Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Năm *</Label><Input value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder="2020-2023" required /></div>
                <div><Label>Địa điểm</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
              </div>
              <div><Label>Mô tả</Label><RichTextEditor content={formData.description} onChange={(html) => setFormData({ ...formData, description: html })} placeholder="Mô tả công việc..." /></div>
              <div>
                <Label>Thành tựu</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={achievementInput} onChange={(e) => setAchievementInput(e.target.value)} placeholder="Thêm thành tựu..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())} />
                  <Button type="button" onClick={addAchievement}><Plus className="h-4 w-4" /></Button>
                </div>
                {formData.achievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg mb-1">
                    <span className="flex-1 text-sm">{a}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAchievement(i)}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">{editingExperience ? 'Cập nhật' : 'Tạo mới'}</Button>
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
              <TableHead>Chức danh</TableHead>
              <TableHead>Công ty</TableHead>
              <TableHead>Năm</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {localItems.map((exp) => (
                  <SortableRow key={exp.id} id={exp.id}>
                    <TableCell className="font-medium">{exp.title}</TableCell>
                    <TableCell>{exp.company}</TableCell>
                    <TableCell>{exp.year}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(exp)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(exp.id)}><Trash2 className="h-4 w-4" /></Button>
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
