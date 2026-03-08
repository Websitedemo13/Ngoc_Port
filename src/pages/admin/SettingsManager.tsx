import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    footer_tagline: '',
    footer_text: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['footer_tagline', 'footer_text']);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach(item => { map[item.key] = item.value || ''; });
      setSettings({ footer_tagline: map.footer_tagline || '', footer_text: map.footer_text || '' });
    } catch (error: any) {
      toast.error('Không thể tải cài đặt');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
        if (error) throw error;
      }
      toast.success('Đã lưu cài đặt');
    } catch (error: any) {
      toast.error(error.message || 'Lưu thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cài đặt Footer</h1>
          <p className="text-sm text-muted-foreground">Cấu hình nội dung footer hiển thị trên website</p>
        </div>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Lưu
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
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
            <strong>Lưu ý:</strong> Các cài đặt này điều khiển nội dung footer hiển thị trên tất cả các trang công khai.
          </p>
        </div>
      </form>
    </div>
  );
}
