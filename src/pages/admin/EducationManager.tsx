import { useState, useEffect } from 'react';
import { useAllEducation, useCreateEducation, useUpdateEducation, useDeleteEducation } from '@/hooks/useEducation';
import { useReorderItems } from '@/hooks/useReorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, X, GraduationCap } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableRow } from '@/components/admin/SortableRow';
import type { Education, EducationInsert, EducationUpdate } from '@/lib/supabase/education';

export default function EducationManager() {
  const { data: educations, isLoading } = useAllEducation();
  const createEducation = useCreateEducation();
  const updateEducation = useUpdateEducation();
  const deleteEducation = useDeleteEducation();
  const reorder = useReorderItems('education');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState({
    degree: '', institution: '', field: '', year: '',
    description: '', achievements: [] as string[], sort_order: 0,
  });
  const [achievementInput, setAchievementInput] = useState('');
  const [localItems, setLocalItems] = useState<Education[]>([]);

  useEffect(() => {
    if (educations) setLocalItems(educations);
  }, [educations]);

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
    if (editingEducation) {
      setFormData({
        degree: editingEducation.degree, institution: editingEducation.institution,
        field: editingEducation.field || '', year: editingEducation.year,
        description: editingEducation.description || '',
        achievements: editingEducation.achievements || [], sort_order: editingEducation.sort_order || 0,
      });
    } else { resetForm(); }
  }, [editingEducation]);

  const resetForm = () => {
    setFormData({ degree: '', institution: '', field: '', year: '', description: '', achievements: [], sort_order: 0 });
    setAchievementInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.degree || !formData.institution || !formData.year) {
      toast.error('Bằng cấp, trường và năm là bắt buộc');
      return;
    }
    try {
      if (editingEducation) {
        await updateEducation.mutateAsync({ id: editingEducation.id, updates: formData as EducationUpdate });
      } else {
        await createEducation.mutateAsync(formData as EducationInsert);
      }
      setIsDialogOpen(false);
      setEditingEducation(null);
      resetForm();
    } catch (error) { console.error('Error:', error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await deleteEducation.mutateAsync(id);
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
          <h1 className="text-2xl font-bold text-foreground">Quản lý học vấn</h1>
          <p className="text-sm text-muted-foreground">Kéo thả để sắp xếp thứ tự hiển thị</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingEducation(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Thêm học vấn</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingEducation ? 'Sửa học vấn' : 'Thêm học vấn mới'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bằng cấp / Chứng chỉ *</Label>
                  <Input value={formData.degree} onChange={(e) => setFormData(p => ({ ...p, degree: e.target.value }))} placeholder="Cử nhân, Thạc sĩ, Chứng chỉ IELTS..." required />
                  <p className="text-xs text-muted-foreground mt-1">Ví dụ: Cử nhân Quản trị Kinh doanh</p>
                </div>
                <div>
                  <Label>Trường / Tổ chức *</Label>
                  <Input value={formData.institution} onChange={(e) => setFormData(p => ({ ...p, institution: e.target.value }))} placeholder="Đại học Kinh tế, British Council..." required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Chuyên ngành / Lĩnh vực</Label>
                  <Input value={formData.field} onChange={(e) => setFormData(p => ({ ...p, field: e.target.value }))} placeholder="Quản trị Kinh doanh..." />
                </div>
                <div>
                  <Label>Năm *</Label>
                  <Input value={formData.year} onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))} placeholder="2018-2022" required />
                </div>
              </div>
              <div>
                <Label>Mô tả chi tiết</Label>
                <RichTextEditor content={formData.description} onChange={(html) => setFormData(p => ({ ...p, description: html }))} placeholder="Mô tả về chương trình học..." />
              </div>
              <div>
                <Label>Thành tựu & Giải thưởng</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={achievementInput} onChange={(e) => setAchievementInput(e.target.value)} placeholder="GPA 3.8/4.0, Sinh viên xuất sắc..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())} />
                  <Button type="button" onClick={addAchievement} size="icon"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-1">
                  {formData.achievements.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
                      <GraduationCap className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                      <span className="flex-1 text-sm">{a}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeAchievement(i)} className="h-6 w-6 p-0"><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">{editingEducation ? 'Cập nhật' : 'Tạo mới'}</Button>
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
              <TableHead>Bằng cấp</TableHead>
              <TableHead>Trường / Tổ chức</TableHead>
              <TableHead>Chuyên ngành</TableHead>
              <TableHead>Năm</TableHead>
              <TableHead>Thành tựu</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {localItems.length > 0 ? localItems.map((edu) => (
                  <SortableRow key={edu.id} id={edu.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary/60 shrink-0" />
                        {edu.degree}
                      </div>
                    </TableCell>
                    <TableCell>{edu.institution}</TableCell>
                    <TableCell>{edu.field && <Badge variant="outline" className="text-xs">{edu.field}</Badge>}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{edu.year}</TableCell>
                    <TableCell>
                      {edu.achievements && edu.achievements.length > 0 && (
                        <Badge className="text-xs bg-primary/10 text-primary border-0">{edu.achievements.length} thành tựu</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingEducation(edu); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(edu.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </SortableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      Chưa có học vấn nào. Nhấn "Thêm học vấn" để bắt đầu.
                    </TableCell>
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
