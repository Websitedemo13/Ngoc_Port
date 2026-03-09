import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { usePublishedProjects } from '@/hooks/useProjects';
import PageHero from '@/components/PageHero';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Projects = () => {
  const { language } = useLanguage();
  const { data: projects, isLoading } = usePublishedProjects();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = projects ? ['all', ...Array.from(new Set(projects.map(p => p.category)))] : ['all'];
  const filtered = projects?.filter(p => {
    const matchSearch = !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-gradient text-primary-foreground py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            {language === 'en' ? 'Portfolio' : 'Danh mục'}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            {language === 'en' ? 'Projects & Case Studies' : 'Dự án & Nghiên cứu'}
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">
            {language === 'en'
              ? 'Explore my portfolio of impactful projects and strategic initiatives.'
              : 'Khám phá danh mục các dự án có tác động và sáng kiến chiến lược của tôi.'}
          </p>
          <div className="max-w-md mx-auto relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'en' ? 'Search projects...' : 'Tìm kiếm dự án...'}
              className="pl-10 bg-background text-foreground rounded-full border-none shadow-lg"
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="hsl(var(--background))" /></svg>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 2 && (
        <section className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? (language === 'en' ? 'All' : 'Tất cả') : cat}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Projects Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-xl" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((project, index) => (
                <Card key={project.id} className="card-premium overflow-hidden group border-0 shadow-md animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="aspect-video overflow-hidden relative bg-muted">
                    {project.image_url ? (
                      <>
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Search className="h-5 w-5 text-primary/40" />
                        </div>
                        <span className="text-xs text-muted-foreground/50">No cover</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-secondary/30 text-secondary">{project.category}</Badge>
                      {project.featured && (
                        <Badge className="text-xs bg-secondary/10 text-secondary border-0">
                          {language === 'en' ? 'Featured' : 'Nổi bật'}
                        </Badge>
                      )}
                    </div>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 3).map((tech, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">{tech}</span>
                        ))}
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <Link
                        to={`/projects/${project.slug}`}
                        className="text-primary font-medium text-sm inline-flex items-center hover:gap-2 transition-all"
                      >
                        {language === 'en' ? 'View Details' : 'Xem chi tiết'}
                        <ArrowRight className="ml-1" size={14} />
                      </Link>
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-secondary transition-colors">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              {language === 'en' ? 'No projects found.' : 'Không tìm thấy dự án nào.'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
