import { useCustomSectionsByPage } from '@/hooks/useCustomSections';
import { cn } from '@/lib/utils';
import RichContent from './RichContent';

interface Props {
  page: string;
}

const bgStyles: Record<string, string> = {
  default: '',
  muted: 'bg-muted/30',
  accent: 'bg-primary/5',
  dark: 'bg-navy-gradient text-primary-foreground',
};

export default function CustomSections({ page }: Props) {
  const { data: sections } = useCustomSectionsByPage(page);

  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <section
          key={section.id}
          className={cn('py-16 md:py-20', bgStyles[section.background_style || 'default'])}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {section.show_title && (
                <div className="text-center mb-10">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-muted-foreground text-lg">{section.subtitle}</p>
                  )}
                </div>
              )}

              {section.image_url && (
                <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={section.image_url}
                    alt={section.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {section.content && (
                <RichContent
                  html={section.content}
                  className="prose prose-lg max-w-none dark:prose-invert"
                />
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
