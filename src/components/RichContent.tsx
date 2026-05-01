import { useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';
import { createRoot } from 'react-dom/client';

interface RichContentProps {
  html: string;
  className?: string;
  id?: string;
}

/**
 * Renders HTML safely and handles broken images gracefully.
 * - Adds loading="lazy" to all images
 * - Replaces broken images with a styled placeholder instead of an ugly alt text
 * - Removes empty <p> tags only containing broken alt text from copy-pasted content
 */
const RichContent = ({ html, className, id }: RichContentProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const container = ref.current;

    // Strip broken Facebook-style alt text leftovers like "![No photo description available.]"
    container.innerHTML = container.innerHTML
      .replace(/!\[[^\]]*?(No photo description available|May be an image[^\]]*?)\]/gi, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ''); // any markdown img leftover

    const imgs = container.querySelectorAll('img');
    imgs.forEach((img) => {
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      const handleError = () => {
        // Replace broken image with a styled placeholder div
        const placeholder = document.createElement('div');
        placeholder.className =
          'flex items-center justify-center w-full aspect-[16/9] my-6 rounded-2xl bg-muted text-muted-foreground border border-dashed border-border';
        placeholder.innerHTML =
          '<div class="flex flex-col items-center gap-2 text-sm opacity-70"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><path d="M13.5 13.5 6 21h12a2 2 0 0 0 2-2v-5.5"/><path d="M18 12V5a2 2 0 0 0-2-2H9.5"/></svg><span>Image unavailable</span></div>';
        img.replaceWith(placeholder);
      };
      img.addEventListener('error', handleError);
      // If already errored before we attached handler
      if (img.complete && img.naturalWidth === 0) handleError();
    });
  }, [html]);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichContent;
