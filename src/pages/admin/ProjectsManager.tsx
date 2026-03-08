import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useAllProjects, useCreateProject, useUpdateProject, useDeleteProject, useToggleProjectFeatured } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import type { Project, ProjectInsert, ProjectUpdate } from '@/lib/supabase/projects';

export default function ProjectsManager() {
  const { data: projects, isLoading } = useAllProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const toggleFeatured = useToggleProjectFeatured();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', category: '', full_description: '', challenge: '', solution: '',
    image_url: '', link: '', technologies: [] as string[], featured: false, sort_order: 0,
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title, slug: editingProject.slug || '', description: editingProject.description,
        category: editingProject.category, full_description: editingProject.full_description || '',
        challenge: editingProject.challenge || '', solution: editingProject.solution || '',
        image_url: editingProject.image_url || '', link: editingProject.link || '',
        technologies: editingProject.technologies || [], featured: editingProject.featured || false,
        sort_order: editingProject.sort_order || 0,
      });
    } else {
      resetForm();
    }
  }, [editingProject]);

  const resetForm = () => {
    setFormData({ title: '', slug: '', description: '', category: '', full_description: '', challenge: '', solution: '', image_url: '', link: '', technologies: [], featured: false, sort_order: 0 });
    setTechInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Tiêu đề, mô tả và danh mục là bắt buộc');
      return;
    }
    try {
      if (editingProject) {
        await updateProject.mutateAsync({ id: editingProject.id, updates: formData as ProjectUpdate });
      } else {
        await createProject.mutateAsync(formData as ProjectInsert);
      }
      setIsDialogOpen(false);
      setEditingProject(null);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await deleteProject.mutateAsync(id);
    }
  };

  const addTech = () => {
    if (techInput.trim()) {
      setFormData(prev => ({ ...prev, technologies: [...prev.technologies, techInput.trim()] }));
      setTechInput('');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý dự án</h1>
          <p className="text-sm text-muted-foreground">Thêm và chỉnh sửa các dự án portfolio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingProject(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Thêm dự án</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingProject ? 'Sửa dự án' : 'Thêm dự án'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Premium Cover Image Section */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Ảnh bìa dự án</Label>
                {formData.image_url ? (
                  <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden group border border-border">
                    <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button type="button" size="sm" variant="secondary" className="shadow-lg" onClick={() => setFormData(p => ({ ...p, image_url: '' }))}>
                        <X className="h-4 w-4 mr-1" /> Xóa ảnh
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs text-white/80 bg-black/40 px-2 py-1 rounded">21:9 • Ảnh bìa</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-[21/9] rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-primary/60" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Tải lên ảnh bìa dự án</p>
                    <p className="text-xs text-muted-foreground/60">Khuyến nghị: 1920×820px, tỉ lệ 21:9</p>
                  </div>
                )}
                <div className="mt-2">
                  <MediaUpload label="" value={formData.image_url} onChange={(url) => setFormData(p => ({ ...p, image_url: url }))} accept="image/*" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tiêu đề *</Label><Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required /></div>
                <div><Label>Slug</Label><Input value={formData.slug} onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Danh mục *</Label><Input value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} required /></div>
                <div><Label>Link</Label><Input value={formData.link} onChange={(e) => setFormData(p => ({ ...p, link: e.target.value }))} /></div>
              </div>
              <div><Label>Mô tả ngắn *</Label><Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} required /></div>
              <div><Label>Mô tả chi tiết</Label>
                <RichTextEditor content={formData.full_description} onChange={(html) => setFormData(p => ({ ...p, full_description: html }))} placeholder="Mô tả chi tiết về dự án..." />
              </div>
              <div><Label>Thách thức</Label>
                <RichTextEditor content={formData.challenge} onChange={(html) => setFormData(p => ({ ...p, challenge: html }))} placeholder="Thách thức gặp phải..." />
              </div>
              <div><Label>Giải pháp</Label>
                <RichTextEditor content={formData.solution} onChange={(html) => setFormData(p => ({ ...p, solution: html }))} placeholder="Giải pháp đã áp dụng..." />
              </div>
              <div>
                <Label>Công nghệ</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="React, Node.js..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} />
                  <Button type="button" onClick={addTech}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, i) => (
                    <div key={i} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      <span>{tech}</span>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, technologies: p.technologies.filter((_, j) => j !== i) }))}><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.featured} onCheckedChange={(checked) => setFormData(p => ({ ...p, featured: checked }))} />
                  <Label>Nổi bật</Label>
                </div>
                <div><Label>Thứ tự</Label><Input type="number" value={formData.sort_order} onChange={(e) => setFormData(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="w-24" /></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">{editingProject ? 'Cập nhật' : 'Tạo mới'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Nổi bật</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects?.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>{project.category}</TableCell>
                <TableCell>
                  <Switch checked={project.featured || false} onCheckedChange={() => toggleFeatured.mutate({ id: project.id, featured: !project.featured })} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingProject(project); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
