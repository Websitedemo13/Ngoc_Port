import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Minus, Undo, Redo,
  Image as ImageIcon, Youtube as YoutubeIcon, Link as LinkIcon,
  Type, Heading1, Heading2, Heading3, Highlighter,
  Palette, Loader2, Upload, X
} from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
);

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#cccccc',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1',
];

const RichTextEditor = ({ content, onChange, placeholder = 'Bắt đầu viết nội dung...' }: RichTextEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Placeholder.configure({ placeholder }),
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'rounded-lg overflow-hidden my-4' } }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML() && content) {
      editor.commands.setContent(content);
    }
  }, [content]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ảnh phải nhỏ hơn 10MB');
        return;
      }
      setUploading(true);
      try {
        const ext = file.name.split('.').pop();
        const path = `editor/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('portfolio-media').upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-media').getPublicUrl(path);
        editor?.chain().focus().setImage({ src: publicUrl }).run();
        toast.success('Đã tải ảnh lên');
      } catch (err: any) {
        toast.error('Lỗi tải ảnh: ' + err.message);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, [editor]);

  const handleVideoUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video phải nhỏ hơn 50MB');
        return;
      }
      setUploading(true);
      try {
        const ext = file.name.split('.').pop();
        const path = `editor/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('portfolio-media').upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-media').getPublicUrl(path);
        editor?.chain().focus().insertContent(
          `<video controls class="w-full rounded-lg my-4"><source src="${publicUrl}" type="${file.type}"></video>`
        ).run();
        toast.success('Đã tải video lên');
      } catch (err: any) {
        toast.error('Lỗi tải video: ' + err.message);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, [editor]);

  const addLink = useCallback(() => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setLinkUrl('');
  }, [editor, linkUrl]);

  const addYoutube = useCallback(() => {
    if (!youtubeUrl) return;
    editor?.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl('');
  }, [editor, youtubeUrl]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* ═══ Toolbar ═══ */}
      <div className="border-b border-border bg-muted/30 p-1.5 flex flex-wrap items-center gap-0.5">
        {/* Undo / Redo */}
        <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác">
          <Undo size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại">
          <Redo size={16} />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <MenuButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} title="Đoạn văn">
          <Type size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={16} />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text formatting */}
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="In đậm (Ctrl+B)">
          <Bold size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="In nghiêng (Ctrl+I)">
          <Italic size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Gạch chân (Ctrl+U)">
          <UnderlineIcon size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Gạch ngang">
          <Strikethrough size={16} />
        </MenuButton>

        {/* Color */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Màu chữ" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
              <Palette size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-5 gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded-md border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                />
              ))}
            </div>
            <button
              type="button"
              className="text-xs text-muted-foreground mt-2 hover:text-foreground"
              onClick={() => editor.chain().focus().unsetColor().run()}
            >
              Xóa màu
            </button>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <MenuButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} isActive={editor.isActive('highlight')} title="Highlight">
          <Highlighter size={16} />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment */}
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Căn trái">
          <AlignLeft size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
          <AlignCenter size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Căn phải">
          <AlignRight size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Căn đều">
          <AlignJustify size={16} />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Danh sách">
          <List size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Danh sách số">
          <ListOrdered size={16} />
        </MenuButton>

        {/* Quote & Code */}
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Trích dẫn">
          <Quote size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code block">
          <Code size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
          <Minus size={16} />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Media */}
        <MenuButton onClick={handleImageUpload} disabled={uploading} title="Chèn ảnh">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        </MenuButton>

        <MenuButton onClick={handleVideoUpload} disabled={uploading} title="Tải video lên">
          <Upload size={16} />
        </MenuButton>

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Chèn link" className={`p-1.5 rounded-md transition-colors cursor-pointer ${editor.isActive('link') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <LinkIcon size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <p className="text-sm font-medium mb-2">Chèn liên kết</p>
            <div className="flex gap-2">
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="text-sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
              />
              <Button size="sm" onClick={addLink}>OK</Button>
            </div>
            {editor.isActive('link') && (
              <button
                type="button"
                className="text-xs text-destructive mt-2 hover:underline"
                onClick={() => editor.chain().focus().unsetLink().run()}
              >
                Xóa link
              </button>
            )}
          </PopoverContent>
        </Popover>

        {/* YouTube */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Nhúng YouTube" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
              <YoutubeIcon size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <p className="text-sm font-medium mb-2">Nhúng video YouTube</p>
            <div className="flex gap-2">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="text-sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addYoutube())}
              />
              <Button size="sm" onClick={addYoutube}>OK</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ═══ Bubble Menu ═══ */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }} className="bg-card border border-border rounded-lg shadow-lg p-1 flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
            <Bold size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
            <Italic size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
            <UnderlineIcon size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} isActive={editor.isActive('highlight')} title="Highlight">
            <Highlighter size={14} />
          </MenuButton>
        </BubbleMenu>
      )}

      {/* ═══ Editor Content ═══ */}
      <EditorContent editor={editor} />

      {/* ═══ Footer status ═══ */}
      <div className="border-t border-border bg-muted/20 px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>{editor.storage.characterCount?.characters?.() ?? editor.getText().length} ký tự</span>
        {uploading && (
          <span className="flex items-center gap-1 text-primary">
            <Loader2 size={12} className="animate-spin" /> Đang tải lên...
          </span>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
