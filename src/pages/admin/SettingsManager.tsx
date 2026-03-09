import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MediaUpload } from '@/components/admin/MediaUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Eye, EyeOff, Image, Globe, Plus, Trash2, GripVertical, Palette, Check, Monitor, BookmarkPlus, Bookmark, X, Type, LayoutTemplate } from 'lucide-react';
import ThemePreview from '@/components/admin/ThemePreview';
import { useQueryClient } from '@tanstack/react-query';
import { COLOR_THEMES, applyColorTheme, type CustomColors } from '@/lib/colorThemes';
import { FONT_THEMES, applyFontTheme } from '@/lib/fontThemes';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { PAGE_HERO_KEYS, DEFAULT_HEROES, type PageHeroes, type PageHeroConfig } from '@/hooks/usePageHeroes';
import { MediaUpload as MediaUploadHero } from '@/components/admin/MediaUpload';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

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

interface SavedTheme {
  name: string;
  colors: CustomColors;
  createdAt: string;
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
  const [fontTheme, setFontTheme] = useState('inter-lora');
  const [customColors, setCustomColors] = useState<CustomColors>({ primary: '#1e2a4a', secondary: '#d4a017', accent: '#d4a017', bg: '#ffffff' });
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [newThemeName, setNewThemeName] = useState('');
  const [pageHeroes, setPageHeroes] = useState<PageHeroes>({ ...DEFAULT_HEROES });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSocialLinks();
  }, []);

  const loadSettings = async () => {
    try {
      const allKeys = [
        'logo_url', 'favicon_url', 'site_name', 'footer_tagline', 'footer_text', 'color_theme', 'custom_theme_colors', 'saved_custom_themes', 'font_theme', 'page_heroes',
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
      setFontTheme(map.font_theme || 'inter-lora');
      if (map.custom_theme_colors) {
        try { setCustomColors(JSON.parse(map.custom_theme_colors)); } catch { /* ignore */ }
      }
      if (map.saved_custom_themes) {
        try { setSavedThemes(JSON.parse(map.saved_custom_themes)); } catch { /* ignore */ }
      }
      if (map.page_heroes) {
        try { setPageHeroes({ ...DEFAULT_HEROES, ...JSON.parse(map.page_heroes) }); } catch { /* ignore */ }
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
      // Save saved custom themes
      {
        const { error } = await supabase.from('settings').upsert({ key: 'saved_custom_themes', value: JSON.stringify(savedThemes) }, { onConflict: 'key' });
        if (error) throw error;
      }
      // Save font theme
      {
        const { error } = await supabase.from('settings').upsert({ key: 'font_theme', value: fontTheme }, { onConflict: 'key' });
        if (error) throw error;
      }
      // Save page heroes
      {
        const { error } = await supabase.from('settings').upsert({ key: 'page_heroes', value: JSON.stringify(pageHeroes) }, { onConflict: 'key' });
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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

          {/* Saved Custom Themes */}
          {colorTheme === 'custom' && (
            <div className="mt-4 p-5 rounded-xl border border-border bg-muted/30 space-y-4">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Bảng màu đã lưu</p>
              </div>

              {/* Save current */}
              <div className="flex gap-2">
                <Input
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="Tên bảng màu (VD: Thương hiệu chính)"
                  className="text-sm h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!newThemeName.trim()}
                  onClick={() => {
                    const theme: SavedTheme = {
                      name: newThemeName.trim(),
                      colors: { ...customColors },
                      createdAt: new Date().toISOString(),
                    };
                    setSavedThemes(prev => [...prev, theme]);
                    setNewThemeName('');
                    toast.success(`Đã lưu "${theme.name}". Nhấn "Lưu tất cả" để đồng bộ.`);
                  }}
                  className="shrink-0"
                >
                  <BookmarkPlus className="h-4 w-4 mr-1" />
                  Lưu
                </Button>
              </div>

              {/* List saved themes */}
              {savedThemes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Chưa có bảng màu nào được lưu. Chọn màu rồi nhấn "Lưu" ở trên.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedThemes.map((theme, index) => (
                    <div
                      key={index}
                      className="group relative flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setCustomColors({ ...theme.colors });
                        applyColorTheme('custom', darkMode === 'dark', theme.colors);
                      }}
                    >
                      <div className="flex gap-1 shrink-0">
                        {(['primary', 'secondary', 'accent', 'bg'] as const).map((k) => (
                          <div
                            key={k}
                            className="w-5 h-5 rounded border border-black/10"
                            style={{ background: theme.colors[k] }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium truncate flex-1">{theme.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSavedThemes(prev => prev.filter((_, i) => i !== index));
                          toast.info(`Đã xóa "${theme.name}". Nhấn "Lưu tất cả" để đồng bộ.`);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mini Website Preview */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Xem trước giao diện</p>
            </div>
            <div className="max-w-md mx-auto">
              <ThemePreview
                themeId={colorTheme}
                customColors={colorTheme === 'custom' ? customColors : undefined}
              />
            </div>
          </div>
        </div>

        {/* Font Theme Picker */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Type className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Font chữ Website</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Chọn cặp font chữ cho tiêu đề và nội dung. Thay đổi sẽ áp dụng ngay sau khi lưu.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FONT_THEMES.map((ft) => {
              const isActive = fontTheme === ft.id;
              return (
                <button
                  key={ft.id}
                  type="button"
                  onClick={() => {
                    setFontTheme(ft.id);
                    applyFontTheme(ft.id);
                  }}
                  className={cn(
                    "relative text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
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
                  <p className="font-semibold text-sm mb-1">{ft.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{ft.description}</p>
                  <div className="space-y-1 rounded-lg bg-muted/50 p-3 border border-border">
                    <p className="text-sm font-bold" style={{ fontFamily: ft.heading }}>
                      Tiêu đề mẫu — Heading
                    </p>
                    <p className="text-xs leading-relaxed" style={{ fontFamily: ft.body }}>
                      Đây là đoạn văn mẫu để xem trước font chữ. The quick brown fox jumps over the lazy dog. 0123456789
                    </p>
                  </div>
                </button>
              );
            })}
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

        {/* Page Hero Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Hero Banner từng trang</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Tùy chỉnh tiêu đề, phụ đề, nhãn và ảnh nền cho hero banner của từng trang. Có thể ẩn hero nếu không cần.
          </p>
          <div className="space-y-3">
            {PAGE_HERO_KEYS.map(({ key, label }) => {
              const hero = pageHeroes[key] || DEFAULT_HEROES[key];
              const updateHero = (field: keyof PageHeroConfig, value: string | boolean) => {
                setPageHeroes(prev => ({
                  ...prev,
                  [key]: { ...(prev[key] || DEFAULT_HEROES[key]), [field]: value },
                }));
              };
              return (
                <Collapsible key={key}>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {hero.visible !== false ? (
                            <Eye className="h-4 w-4 text-primary" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm">{label}</span>
                          {hero.visible === false && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Đã ẩn</span>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Hiển thị Hero Banner</Label>
                          <Switch
                            checked={hero.visible !== false}
                            onCheckedChange={(checked) => updateHero('visible', checked)}
                          />
                        </div>
                        {hero.visible !== false && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-medium">Nhãn (VI)</Label>
                                <Input
                                  value={hero.label_vi || ''}
                                  onChange={(e) => updateHero('label_vi', e.target.value)}
                                  placeholder="VD: Hành trình sự nghiệp"
                                  className="text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-medium">Nhãn (EN)</Label>
                                <Input
                                  value={hero.label_en || ''}
                                  onChange={(e) => updateHero('label_en', e.target.value)}
                                  placeholder="e.g. Career Journey"
                                  className="text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-medium">Tiêu đề (VI)</Label>
                                <Input
                                  value={hero.title_vi || ''}
                                  onChange={(e) => updateHero('title_vi', e.target.value)}
                                  placeholder="Tiêu đề chính tiếng Việt"
                                  className="text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-medium">Tiêu đề (EN)</Label>
                                <Input
                                  value={hero.title_en || ''}
                                  onChange={(e) => updateHero('title_en', e.target.value)}
                                  placeholder="Main title in English"
                                  className="text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-medium">Phụ đề (VI)</Label>
                                <Input
                                  value={hero.subtitle_vi || ''}
                                  onChange={(e) => updateHero('subtitle_vi', e.target.value)}
                                  placeholder="Mô tả ngắn tiếng Việt"
                                  className="text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-medium">Phụ đề (EN)</Label>
                                <Input
                                  value={hero.subtitle_en || ''}
                                  onChange={(e) => updateHero('subtitle_en', e.target.value)}
                                  placeholder="Short description in English"
                                  className="text-sm"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Ảnh nền Hero (tuỳ chọn)</Label>
                              <MediaUpload
                                value={hero.background_image_url || ''}
                                onChange={(url) => updateHero('background_image_url', url)}
                                label=""
                                accept="image/*"
                                maxSizeMB={5}
                              />
                              {hero.background_image_url && (
                                <div className="relative group">
                                  <img src={hero.background_image_url} alt="Hero bg" className="h-24 w-full object-cover rounded-lg" />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => updateHero('background_image_url', '')}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>

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
