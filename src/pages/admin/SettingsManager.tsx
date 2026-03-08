import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MediaUpload } from '@/components/admin/MediaUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Eye, EyeOff, Image, Globe, Plus, Trash2, GripVertical, Palette, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { COLOR_THEMES, applyColorTheme } from '@/lib/colorThemes';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const PAGE_KEYS = [
  { key: 'page_about', label: 'Giới thiệu (About)', path: '/about' },
  { key: 'page_experience', label: 'Kinh nghiệm (Experience)', path: '/experience' },
  { key: 'page_education', label: 'Học vấn (Education)', path: '/education' },
  { key: 'page_projects', label: 'Dự án (Projects)', path: '/projects' },
  { key: 'page_activities', label: 'Hoạt động (Activities)', path: '/activities' },
  { key: 'page_blog', label: 'Blog', path: '/blog' },
  { key: 'page_contact', label: 'Liên hệ (Contact)', path: '/contact' },
];

const SOCIAL_PROVIDERS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'website', label: 'Website' },
];

interface SocialLink {
  id?: string;
  provider: string;
  url: string;
  sort_order: number;
}

export default function SettingsManager() {
  const queryClient = useQueryClient();
  const { theme: darkMode } = useTheme();
  const [settings, setSettings] = useState({
    logo_url: '',
    favicon_url: '',
    site_name: '',
    footer_tagline: '',
    footer_text: '',
  });
  const [colorTheme, setColorTheme] = useState('navy-gold');
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSocialLinks();
  }, []);

  const loadSettings = async () => {
    try {
      const allKeys = [
        'logo_url', 'favicon_url', 'site_name', 'footer_tagline', 'footer_text', 'color_theme',
        ...PAGE_KEYS.map(p => p.key),
      ];
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .in('key', allKeys);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach(item => { map[item.key] = item.value || ''; });
      setSettings({
        logo_url: map.logo_url || '',
        favicon_url: map.favicon_url || '',
        site_name: map.site_name || '',
        footer_tagline: map.footer_tagline || '',
        footer_text: map.footer_text || '',
      });
      const vis: Record<string, boolean> = {};
      PAGE_KEYS.forEach(p => { vis[p.key] = map[p.key] !== 'hidden'; });
      setPageVisibility(vis);
    } catch {
      toast.error('Không thể tải cài đặt');
    }
  };

  const loadSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      setSocialLinks(data || []);
    } catch {
      toast.error('Không thể tải social links');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save all settings
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
        if (error) throw error;
      }
      // Save page visibility
      for (const [key, visible] of Object.entries(pageVisibility)) {
        const value = visible ? 'visible' : 'hidden';
        const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
        if (error) throw error;
      }
      // Save social links: delete all then re-insert
      await supabase.from('social_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (socialLinks.length > 0) {
        const toInsert = socialLinks
          .filter(l => l.url.trim())
          .map((l, i) => ({ provider: l.provider, url: l.url.trim(), sort_order: i }));
        if (toInsert.length > 0) {
          const { error } = await supabase.from('social_links').insert(toInsert);
          if (error) throw error;
        }
      }

      // Update favicon in DOM dynamically
      if (settings.favicon_url) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = settings.favicon_url;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = settings.favicon_url;
          document.head.appendChild(newLink);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['social_links'] });
      toast.success('Đã lưu cài đặt');
    } catch (error: any) {
      toast.error(error.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks(prev => [...prev, { provider: 'linkedin', url: '', sort_order: prev.length }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string | number) => {
    setSocialLinks(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cài đặt Website</h1>
          <p className="text-sm text-muted-foreground">Logo, favicon, social links, hiển thị trang & footer</p>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Đang lưu...' : 'Lưu tất cả'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Logo & Favicon */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Image className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Logo & Favicon</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Logo Website</Label>
              <p className="text-xs text-muted-foreground">Hiển thị ở header và footer. Nên dùng ảnh PNG trong suốt.</p>
              {settings.logo_url ? (
                <div className="relative group">
                  <div className="border border-border rounded-xl p-4 bg-muted/30 flex items-center justify-center min-h-[100px]">
                    <img src={settings.logo_url} alt="Logo" className="max-h-20 max-w-full object-contain" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSettings(prev => ({ ...prev, logo_url: '' }))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : null}
              <MediaUpload
                value={settings.logo_url}
                onChange={(url) => setSettings(prev => ({ ...prev, logo_url: url }))}
                label=""
                accept="image/*"
                maxSizeMB={5}
              />
            </div>

            {/* Favicon */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Favicon</Label>
              <p className="text-xs text-muted-foreground">Icon tab trình duyệt. Nên dùng ảnh vuông PNG/ICO, 32×32 hoặc 64×64px.</p>
              {settings.favicon_url ? (
                <div className="relative group">
                  <div className="border border-border rounded-xl p-4 bg-muted/30 flex items-center justify-center min-h-[100px]">
                    <img src={settings.favicon_url} alt="Favicon" className="max-h-16 max-w-full object-contain" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSettings(prev => ({ ...prev, favicon_url: '' }))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : null}
              <MediaUpload
                value={settings.favicon_url}
                onChange={(url) => setSettings(prev => ({ ...prev, favicon_url: url }))}
                label=""
                accept="image/*"
                maxSizeMB={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="site_name">Tên website (thay thế logo text khi chưa có logo)</Label>
            <Input
              id="site_name"
              value={settings.site_name}
              onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
              placeholder="VD: TRẦN BẢO NGỌC"
              className="max-w-md mt-1"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Social Links</h2>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Các liên kết mạng xã hội hiển thị ở footer.</p>

          {socialLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
              Chưa có social link nào. Nhấn "Thêm" để bắt đầu.
            </div>
          ) : (
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <select
                    value={link.provider}
                    onChange={(e) => updateSocialLink(index, 'provider', e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[130px]"
                  >
                    {SOCIAL_PROVIDERS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <Input
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(index)} className="shrink-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Page Visibility */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Hiển thị trang</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Bật/tắt các trang trên thanh điều hướng và footer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAGE_KEYS.map((page) => (
              <div key={page.key} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  {pageVisibility[page.key] ? (
                    <Eye className="h-4 w-4 text-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <span className="text-sm font-medium">{page.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{page.path}</span>
                  </div>
                </div>
                <Switch
                  checked={pageVisibility[page.key] ?? true}
                  onCheckedChange={(checked) => setPageVisibility(prev => ({ ...prev, [page.key]: checked }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Nội dung Footer</h2>
          <div>
            <Label htmlFor="footer_tagline">Footer Tagline</Label>
            <Input
              id="footer_tagline"
              value={settings.footer_tagline}
              onChange={(e) => setSettings(prev => ({ ...prev, footer_tagline: e.target.value }))}
              placeholder="Câu tagline hiển thị ở footer"
            />
          </div>
          <div>
            <Label htmlFor="footer_text">Footer Description</Label>
            <RichTextEditor
              content={settings.footer_text}
              onChange={(html) => setSettings(prev => ({ ...prev, footer_text: html }))}
              placeholder="Mô tả ngắn gọn cho footer"
            />
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Lưu ý:</strong> Các trang bị ẩn sẽ không xuất hiện trong menu điều hướng và footer, nhưng vẫn có thể truy cập trực tiếp bằng URL.
          </p>
        </div>
      </form>
    </div>
  );
}
