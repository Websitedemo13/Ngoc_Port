import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import { Plus, Trash2, Save, GripVertical, Sparkles, Link2, Share2, LayoutTemplate } from 'lucide-react';

type Skill = { id: string; name: string; sort_order: number | null };
type Social = { id: string; provider: string; url: string; sort_order: number | null };
type Footer = { id: string; section: string; label: string; url: string; sort_order: number | null };

export default function BrandingManager() {
  const qc = useQueryClient();

  // ===== ABOUT =====
  const { data: about } = useQuery({
    queryKey: ['about_section'],
    queryFn: async () => {
      const { data } = await supabase.from('about_section').select('*').maybeSingle();
      return data;
    },
  });
  const [aboutForm, setAboutForm] = useState({ headline: '', description: '', image_url: '' });
  useEffect(() => {
    if (about) setAboutForm({
      headline: about.headline || '',
      description: about.description || '',
      image_url: about.image_url || '',
    });
  }, [about]);

  const saveAbout = async () => {
    try {
      if (about?.id) {
        await supabase.from('about_section').update(aboutForm).eq('id', about.id);
      } else {
        await supabase.from('about_section').insert(aboutForm);
      }
      qc.invalidateQueries({ queryKey: ['about_section'] });
      toast.success('Đã lưu About');
    } catch (e: any) { toast.error(e.message); }
  };

  // ===== SKILLS =====
  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ['skills_admin'],
    queryFn: async () => {
      const { data } = await supabase.from('skills').select('*').order('sort_order');
      return (data as Skill[]) || [];
    },
  });
  const [newSkill, setNewSkill] = useState('');
  const addSkill = async () => {
    if (!newSkill.trim()) return;
    await supabase.from('skills').insert({ name: newSkill.trim(), sort_order: skills.length });
    setNewSkill('');
    qc.invalidateQueries({ queryKey: ['skills_admin'] });
    qc.invalidateQueries({ queryKey: ['skills'] });
    toast.success('Đã thêm');
  };
  const delSkill = async (id: string) => {
    await supabase.from('skills').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['skills_admin'] });
    qc.invalidateQueries({ queryKey: ['skills'] });
  };

  // ===== SOCIAL =====
  const { data: socials = [] } = useQuery<Social[]>({
    queryKey: ['social_admin'],
    queryFn: async () => {
      const { data } = await supabase.from('social_links').select('*').order('sort_order');
      return (data as Social[]) || [];
    },
  });
  const [newSocial, setNewSocial] = useState({ provider: '', url: '' });
  const addSocial = async () => {
    if (!newSocial.provider.trim() || !newSocial.url.trim()) return;
    await supabase.from('social_links').insert({ ...newSocial, sort_order: socials.length });
    setNewSocial({ provider: '', url: '' });
    qc.invalidateQueries({ queryKey: ['social_admin'] });
    toast.success('Đã thêm');
  };
  const delSocial = async (id: string) => {
    await supabase.from('social_links').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['social_admin'] });
  };

  // ===== FOOTER LINKS =====
  const { data: footerLinks = [] } = useQuery<Footer[]>({
    queryKey: ['footer_admin'],
    queryFn: async () => {
      const { data } = await supabase.from('footer_links').select('*').order('section').order('sort_order');
      return (data as Footer[]) || [];
    },
  });
  const [newFooter, setNewFooter] = useState({ section: 'company', label: '', url: '' });
  const addFooter = async () => {
    if (!newFooter.label.trim() || !newFooter.url.trim()) return;
    await supabase.from('footer_links').insert({ ...newFooter, sort_order: footerLinks.length });
    setNewFooter({ section: newFooter.section, label: '', url: '' });
    qc.invalidateQueries({ queryKey: ['footer_admin'] });
    toast.success('Đã thêm');
  };
  const delFooter = async (id: string) => {
    await supabase.from('footer_links').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['footer_admin'] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trang & Branding</h1>
        <p className="text-sm text-muted-foreground">Quản lý About, Skills, Social, Footer trong một nơi</p>
      </div>

      <Tabs defaultValue="about" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="about"><Sparkles className="w-4 h-4 mr-1.5" />About</TabsTrigger>
          <TabsTrigger value="skills"><LayoutTemplate className="w-4 h-4 mr-1.5" />Skills</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="w-4 h-4 mr-1.5" />Social</TabsTrigger>
          <TabsTrigger value="footer"><Link2 className="w-4 h-4 mr-1.5" />Footer</TabsTrigger>
        </TabsList>

        {/* ABOUT */}
        <TabsContent value="about">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Tiêu đề</Label>
                <Input value={aboutForm.headline} onChange={(e) => setAboutForm(p => ({ ...p, headline: e.target.value }))} placeholder="Về tôi" />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea value={aboutForm.description} onChange={(e) => setAboutForm(p => ({ ...p, description: e.target.value }))} rows={6} placeholder="Mô tả ngắn về bạn..." />
              </div>
              <MediaUpload label="Ảnh About" value={aboutForm.image_url} onChange={(url) => setAboutForm(p => ({ ...p, image_url: url }))} accept="image/*" maxSizeMB={5} />
              <Button onClick={saveAbout}><Save className="w-4 h-4 mr-2" />Lưu</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SKILLS */}
        <TabsContent value="skills">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Ví dụ: Sales Strategy, Negotiation..." onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
                <Button onClick={addSkill}><Plus className="w-4 h-4 mr-1" />Thêm</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <div key={s.id} className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 text-sm">
                    <GripVertical className="w-3 h-3 opacity-30" />
                    <span>{s.name}</span>
                    <button onClick={() => delSkill(s.id)} className="opacity-0 group-hover:opacity-100 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {!skills.length && <p className="text-sm text-muted-foreground">Chưa có kỹ năng nào</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOCIAL */}
        <TabsContent value="social">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-2">
                <Input value={newSocial.provider} onChange={(e) => setNewSocial(p => ({ ...p, provider: e.target.value }))} placeholder="facebook, linkedin..." />
                <Input value={newSocial.url} onChange={(e) => setNewSocial(p => ({ ...p, url: e.target.value }))} placeholder="https://..." />
                <Button onClick={addSocial}><Plus className="w-4 h-4 mr-1" />Thêm</Button>
              </div>
              <div className="space-y-2">
                {socials.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <span className="font-medium capitalize w-32">{s.provider}</span>
                    <a href={s.url} target="_blank" rel="noopener" className="flex-1 text-sm text-muted-foreground truncate hover:text-primary">{s.url}</a>
                    <Button variant="ghost" size="icon" onClick={() => delSocial(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
                {!socials.length && <p className="text-sm text-muted-foreground">Chưa có liên kết mạng xã hội</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER */}
        <TabsContent value="footer">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr_auto] gap-2">
                <select value={newFooter.section} onChange={(e) => setNewFooter(p => ({ ...p, section: e.target.value }))} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="company">Company</option>
                  <option value="resources">Resources</option>
                  <option value="legal">Legal</option>
                  <option value="quick">Quick links</option>
                </select>
                <Input value={newFooter.label} onChange={(e) => setNewFooter(p => ({ ...p, label: e.target.value }))} placeholder="Tên hiển thị" />
                <Input value={newFooter.url} onChange={(e) => setNewFooter(p => ({ ...p, url: e.target.value }))} placeholder="/about hoặc https://..." />
                <Button onClick={addFooter}><Plus className="w-4 h-4 mr-1" />Thêm</Button>
              </div>
              {['company', 'resources', 'legal', 'quick'].map(section => {
                const items = footerLinks.filter(l => l.section === section);
                if (!items.length) return null;
                return (
                  <div key={section}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{section}</p>
                    <div className="space-y-1.5">
                      {items.map(l => (
                        <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card text-sm">
                          <span className="font-medium w-40 truncate">{l.label}</span>
                          <span className="flex-1 text-muted-foreground truncate">{l.url}</span>
                          <Button variant="ghost" size="icon" onClick={() => delFooter(l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {!footerLinks.length && <p className="text-sm text-muted-foreground">Chưa có liên kết footer</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
