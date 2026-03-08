import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Eye, EyeOff } from 'lucide-react';

const PAGE_KEYS = [
  { key: 'page_about', label: 'Giới thiệu (About)', path: '/about' },
  { key: 'page_experience', label: 'Kinh nghiệm (Experience)', path: '/experience' },
  { key: 'page_education', label: 'Học vấn (Education)', path: '/education' },
  { key: 'page_projects', label: 'Dự án (Projects)', path: '/projects' },
  { key: 'page_activities', label: 'Hoạt động (Activities)', path: '/activities' },
  { key: 'page_blog', label: 'Blog', path: '/blog' },
  { key: 'page_contact', label: 'Liên hệ (Contact)', path: '/contact' },
];

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    footer_tagline: '',
    footer_text: '',
  });
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const allKeys = ['footer_tagline', 'footer_text', ...PAGE_KEYS.map(p => p.key)];
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .in('key', allKeys);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach(item => { map[item.key] = item.value || ''; });
      setSettings({ footer_tagline: map.footer_tagline || '', footer_text: map.footer_text || '' });
      
      const vis: Record<string, boolean> = {};
      PAGE_KEYS.forEach(p => {
        vis[p.key] = map[p.key] !== 'hidden'; // default visible
      });
      setPageVisibility(vis);
    } catch (error: any) {
      toast.error('Không thể tải cài đặt');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save footer settings
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
      toast.success('Đã lưu cài đặt');
    } catch (error: any) {
      toast.error(error.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cài đặt Website</h1>
          <p className="text-sm text-muted-foreground">Quản lý footer, hiển thị trang và các cấu hình khác</p>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Đang lưu...' : 'Lưu tất cả'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Page Visibility */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Hiển thị trang</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Bật/tắt các trang trên thanh điều hướng và footer. Trang bị ẩn sẽ không hiển thị trên website công khai.
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
