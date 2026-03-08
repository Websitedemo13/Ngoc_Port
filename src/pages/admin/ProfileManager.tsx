import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Label } from '@/components/ui/label';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function ProfileManager() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

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
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-2xl font-bold text-foreground">Quản lý hồ sơ / Profile</h1>
          </div>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Lưu / Save
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold">Thông tin cơ bản / Basic Info</h2>

            <div>
              <Label htmlFor="name">Họ tên / Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Trịnh Bá Lâm" />
            </div>

            <div>
              <Label htmlFor="title">Chức danh / Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Sales & Business Development Expert" />
            </div>

            <div>
              <Label htmlFor="quote">Câu trích dẫn / Quote</Label>
              <Textarea id="quote" value={formData.quote} onChange={(e) => handleInputChange('quote', e.target.value)} placeholder="Kết nối – Thuyết phục – Bứt phá doanh số" rows={3} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold">Hình ảnh / Images</h2>
            <MediaUpload label="Ảnh đại diện / Profile Image" value={formData.profile_image_url} onChange={(url) => handleInputChange('profile_image_url', url)} accept="image/*" />
            <MediaUpload label="Ảnh nền / Background Image" value={formData.background_image_url} onChange={(url) => handleInputChange('background_image_url', url)} accept="image/*" />
          </div>
        </form>
      </main>
    </div>
  );
}
