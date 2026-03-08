import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useProjectBySlug } from '@/hooks/useProjects';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { data: project, isLoading } = useProjectBySlug(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">
            {language === 'en' ? 'Loading...' : 'Đang tải...'}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Project Not Found' : 'Không tìm thấy dự án'}
          </h1>
          <Button asChild>
            <Link to="/projects">
              <ArrowLeft className="mr-2" size={16} />
              {language === 'en' ? 'Back to Projects' : 'Quay lại dự án'}
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/projects">
              <ArrowLeft className="mr-2" size={16} />
              {language === 'en' ? 'Back to Projects' : 'Quay lại'}
            </Link>
          </Button>

          <div className="space-y-6">
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, i) => (
                  <Badge key={i} variant="secondary">{tech}</Badge>
                ))}
              </div>
            )}

            <h1 className="font-serif text-4xl md:text-5xl font-bold">{project.title}</h1>

            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <Badge variant="outline">{project.category}</Badge>
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors">
                  <ExternalLink size={16} />
                  <span>{language === 'en' ? 'Visit Project' : 'Truy cập dự án'}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {project.image_url && (
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <img src={project.image_url} alt={project.title} className="w-full rounded-lg shadow-lg" />
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <p className="text-lg text-muted-foreground leading-relaxed">{project.description}</p>
          </div>

          {project.challenge && (
            <div className="bg-muted/30 p-8 rounded-lg">
              <h2 className="font-serif text-2xl font-bold mb-4">
                {language === 'en' ? 'The Challenge' : 'Thách thức'}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.challenge}</p>
            </div>
          )}

          {project.solution && (
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">
                {language === 'en' ? 'Solution' : 'Giải pháp'}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.solution}</p>
            </div>
          )}

          {project.full_description && (
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: project.full_description }} />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
