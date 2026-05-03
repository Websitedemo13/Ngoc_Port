import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, FileText, Package } from 'lucide-react';
import { slugify } from '@/lib/slugify';

export default function CategoriesManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <p className="text-sm text-muted-foreground">Quản lý danh mục Blog và Sản phẩm</p>
      </div>
      <Tabs defaultValue="blog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blog"><FileText className="w-4 h-4 mr-1.5" />Blog</TabsTrigger>
          <TabsTrigger value="product"><Package className="w-4 h-4 mr-1.5" />Sản phẩm</TabsTrigger>
        </TabsList>
        <TabsContent value="blog"><BlogCats /></TabsContent>
        <TabsContent value="product"><ProductCats /></TabsContent>
      </Tabs>
    </div>
  );
}

function BlogCats() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ['blog_cats_admin'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_categories').select('*').order('sort_order');
      return data || [];
    },
  });
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#3B82F6' });
  const add = async () => {
    if (!form.name.trim()) return;
    const slug = form.slug.trim() || slugify(form.name);
    const { error } = await supabase.from('blog_categories').insert({ ...form, slug, sort_order: data.length });
    if (error) return toast.error(error.message);
    setForm({ name: '', slug: '', description: '', color: '#3B82F6' });
    qc.invalidateQueries({ queryKey: ['blog_cats_admin'] });
    qc.invalidateQueries({ queryKey: ['blog_categories'] });
    toast.success('Đã thêm');
  };
  const del = async (id: string) => {
    if (!confirm('Xóa danh mục này?')) return;
    await supabase.from('blog_categories').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['blog_cats_admin'] });
  };
  return (
    <Card><CardContent className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_80px_auto] gap-2">
        <Input placeholder="Tên danh mục" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <Input placeholder="slug (tự tạo)" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
        <Input placeholder="Mô tả" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        <Input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-10 p-1" />
        <Button onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="space-y-2">
        {data.map((c: any) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <span className="w-4 h-4 rounded-full" style={{ background: c.color }} />
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">/{c.slug} {c.description && `· ${c.description}`}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => del(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        {!data.length && <p className="text-sm text-muted-foreground text-center py-4">Chưa có danh mục</p>}
      </div>
    </CardContent></Card>
  );
}

function ProductCats() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ['prod_cats_admin'],
    queryFn: async () => {
      const { data } = await supabase.from('product_categories').select('*').order('sort_order');
      return data || [];
    },
  });
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const add = async () => {
    if (!form.name.trim()) return;
    const slug = form.slug.trim() || slugify(form.name);
    const { error } = await supabase.from('product_categories').insert({ ...form, slug, sort_order: data.length });
    if (error) return toast.error(error.message);
    setForm({ name: '', slug: '', description: '' });
    qc.invalidateQueries({ queryKey: ['prod_cats_admin'] });
    toast.success('Đã thêm');
  };
  const del = async (id: string) => {
    if (!confirm('Xóa danh mục này?')) return;
    await supabase.from('product_categories').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['prod_cats_admin'] });
  };
  return (
    <Card><CardContent className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2">
        <Input placeholder="Tên danh mục" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <Input placeholder="slug (tự tạo)" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
        <Input placeholder="Mô tả" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        <Button onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="space-y-2">
        {data.map((c: any) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">/{c.slug} {c.description && `· ${c.description}`}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => del(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        {!data.length && <p className="text-sm text-muted-foreground text-center py-4">Chưa có danh mục</p>}
      </div>
    </CardContent></Card>
  );
}
