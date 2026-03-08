import { useState } from 'react';
import { useAllMedia, useCreateMediaItem } from '@/hooks/useMedia';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Upload, Loader2, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { MediaItem } from '@/lib/supabase/media';

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  accept?: 'image' | 'video' | 'all';
}

export function MediaPicker({ open, onOpenChange, onSelect, accept = 'image' }: MediaPickerProps) {
  const { data: media = [], isLoading } = useAllMedia();
  const createMediaItem = useCreateMediaItem();
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>(accept === 'all' ? 'all' : accept);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const filteredMedia = media.filter((item) => {
    const matchesFilter = filter === 'all' || item.file_type?.startsWith(filter);
    const matchesSearch = searchQuery === '' ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt_text_en?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(fileName);

      await createMediaItem.mutateAsync({
        filename: file.name,
        url: publicUrl,
        file_type: file.type,
        file_size: file.size,
      });

      setSelectedUrl(publicUrl);
      toast.success('File uploaded');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onOpenChange(false);
      setSelectedUrl(null);
      setSearchQuery('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn hình ảnh / Select Media</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm... / Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="image">Ảnh</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Upload area */}
        <div className="flex items-center gap-3 p-3 border border-dashed border-border rounded-lg bg-muted/30">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <label className="flex-1 cursor-pointer">
            <span className="text-sm text-muted-foreground">
              Tải lên tệp mới / Upload new file
            </span>
            <Input
              type="file"
              accept={accept === 'video' ? 'video/*' : accept === 'image' ? 'image/*' : 'image/*,video/*'}
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Không tìm thấy / No results' : 'Chưa có tệp nào / No media yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-1">
              {filteredMedia.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedUrl(item.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
                    selectedUrl === item.url
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  {item.file_type?.startsWith('image') ? (
                    <img
                      src={item.url}
                      alt={item.alt_text_en || item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {selectedUrl === item.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary rounded-full p-1">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <p className="text-[10px] text-white truncate">{item.filename}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy / Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedUrl}>
            Chọn / Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
