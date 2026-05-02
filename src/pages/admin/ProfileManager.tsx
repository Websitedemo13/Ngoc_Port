import { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useSetting } from '@/hooks/useSettings';
import { useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '@/lib/supabase/settings';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Label } from '@/components/ui/label';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

export default function ProfileManager() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: heroBtnsSetting } = useSetting('show_hero_buttons');
  const qc = useQueryClient();
  const [showHeroButtons, setShowHeroButtons] = useState(true);

  useEffect(() => {
    if (heroBtnsSetting) setShowHeroButtons(heroBtnsSetting.value !== 'false');
  }, [heroBtnsSetting]);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    quote: '',
    profile_image_url: '',
    background_image_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        title: profile.title || '',
        quote: profile.quote || '',
        profile_image_url: profile.profile_image_url || '',
        background_image_url: profile.background_image_url || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (profile) {
        await updateProfile.mutateAsync({ id: profile.id, updates: formData });
      } else {
        const { error } = await supabase.from('hero_section').insert([formData]);
        if (error) throw error;
        toast.success('Profile created');
      }
      await settingsAPI.upsertSetting({ key: 'show_hero_buttons', value: showHeroButtons ? 'true' : 'false' });
      qc.invalidateQueries({ queryKey: ['settings'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý hồ sơ</h1>
          <p className="text-sm text-muted-foreground">Cập nhật thông tin cá nhân hiển thị trên trang chủ</p>
        </div>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Lưu
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Thông tin cơ bản</h2>
          <div>
            <Label htmlFor="name">Họ tên</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Trịnh Bá Lâm" />
          </div>
          <div>
            <Label htmlFor="title">Chức danh</Label>
            <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Sales & Business Development Expert" />
          </div>
          <div>
            <Label htmlFor="quote">Câu trích dẫn</Label>
            <RichTextEditor content={formData.quote} onChange={(html) => handleInputChange('quote', html)} placeholder="Kết nối – Thuyết phục – Bứt phá doanh số" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Hình ảnh</h2>
          <MediaUpload label="Ảnh đại diện" value={formData.profile_image_url} onChange={(url) => handleInputChange('profile_image_url', url)} accept="image/*" />
          <MediaUpload label="Ảnh bìa (nền hero trang chủ)" value={formData.background_image_url} onChange={(url) => handleInputChange('background_image_url', url)} accept="image/*" />
          <p className="text-xs text-muted-foreground">Ảnh bìa hiển thị làm nền cho phần hero của trang chủ. Khuyến nghị: 1920×1080, định dạng JPG.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Tùy chỉnh hero trang chủ</h2>
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Hiển thị nút CTA trên hero</Label>
              <p className="text-xs text-muted-foreground">Bật/tắt 2 nút "Về tôi" và "Liên hệ" ở phần đầu trang chủ.</p>
            </div>
            <Switch checked={showHeroButtons} onCheckedChange={setShowHeroButtons} />
          </div>
        </div>
      </form>
    </div>
  );
}
