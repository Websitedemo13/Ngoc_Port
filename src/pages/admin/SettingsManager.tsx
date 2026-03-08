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
import { COLOR_THEMES, applyColorTheme, type CustomColors } from '@/lib/colorThemes';
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
  const [customColors, setCustomColors] = useState<CustomColors>({ primary: '#1e2a4a', secondary: '#d4a017', accent: '#d4a017', bg: '#ffffff' });
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
        'logo_url', 'favicon_url', 'site_name', 'footer_tagline', 'footer_text', 'color_theme', 'custom_theme_colors',
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
      setColorTheme(map.color_theme || 'navy-gold');
      if (map.custom_theme_colors) {
        try { setCustomColors(JSON.parse(map.custom_theme_colors)); } catch { /* ignore */ }
      }
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
      // Save color theme
      {
        const { error } = await supabase.from('settings').upsert({ key: 'color_theme', value: colorTheme }, { onConflict: 'key' });
        if (error) throw error;
      }
      // Save custom theme colors
      {
        const { error } = await supabase.from('settings').upsert({ key: 'custom_theme_colors', value: JSON.stringify(customColors) }, { onConflict: 'key' });
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

        {/* Color Theme Picker */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Bảng màu Website</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Chọn bảng màu chủ đạo cho toàn bộ website. Thay đổi sẽ áp dụng ngay sau khi lưu.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLOR_THEMES.map((t) => {
              const isActive = colorTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setColorTheme(t.id);
                    applyColorTheme(t.id, darkMode === 'dark');
                  }}
                  className={cn(
                    "relative text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md group",
                    isActive
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ background: t.preview.primary }} />
                    <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ background: t.preview.secondary }} />
                    <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ background: t.preview.accent }} />
                    <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ background: t.preview.bg }} />
                  </div>
                  <div className="h-2 rounded-full mb-3 overflow-hidden flex">
                    <div className="flex-1" style={{ background: t.preview.primary }} />
                    <div className="flex-1" style={{ background: t.preview.secondary }} />
                    <div className="flex-1" style={{ background: t.preview.accent }} />
                  </div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </button>
              );
            })}

            {/* Custom Theme Card */}
            <button
              type="button"
              onClick={() => {
                setColorTheme('custom');
                applyColorTheme('custom', darkMode === 'dark', customColors);
              }}
              className={cn(
                "relative text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md group",
                colorTheme === 'custom'
                  ? "border-primary shadow-md ring-2 ring-primary/20"
                  : "border-dashed border-border hover:border-muted-foreground/30"
              )}
            >
              {colorTheme === 'custom' && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
              <div className="flex gap-1.5 mb-3">
                <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ background: customColors.primary }} />
                <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ background: customColors.secondary }} />
                <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ background: customColors.accent }} />
                <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ background: customColors.bg }} />
              </div>
              <div className="h-2 rounded-full mb-3 overflow-hidden flex">
                <div className="flex-1" style={{ background: customColors.primary }} />
                <div className="flex-1" style={{ background: customColors.secondary }} />
                <div className="flex-1" style={{ background: customColors.accent }} />
              </div>
              <p className="font-semibold text-sm">✨ Tùy chỉnh</p>
              <p className="text-xs text-muted-foreground">Tự chọn màu theo ý thích</p>
            </button>
          </div>

          {/* Custom Color Pickers */}
          {colorTheme === 'custom' && (
            <div className="mt-4 p-5 rounded-xl border border-border bg-muted/30 space-y-4">
              <p className="text-sm font-medium text-foreground">Chọn 4 màu chủ đạo:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {([
                  { key: 'primary' as const, label: 'Primary' },
                  { key: 'secondary' as const, label: 'Secondary' },
                  { key: 'accent' as const, label: 'Accent' },
                  { key: 'bg' as const, label: 'Background' },
                ]).map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-xs font-medium">{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors[key]}
                        onChange={(e) => {
                          const updated = { ...customColors, [key]: e.target.value };
                          setCustomColors(updated);
                          applyColorTheme('custom', darkMode === 'dark', updated);
                        }}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <Input
                        value={customColors[key]}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                            const updated = { ...customColors, [key]: val };
                            setCustomColors(updated);
                            applyColorTheme('custom', darkMode === 'dark', updated);
                          } else {
                            setCustomColors(prev => ({ ...prev, [key]: val }));
                          }
                        }}
                        className="font-mono text-xs h-10"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
