import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Award, BookOpen, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import { usePublishedExperiences } from '@/hooks/useExperiences';
import { useFeaturedProjects } from '@/hooks/useProjects';
import { useFeaturedPosts } from '@/hooks/useBlog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Home = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();
  const { data: experiences } = usePublishedExperiences();
  const { data: featuredProjects } = useFeaturedProjects();
  const { data: featuredPosts } = useFeaturedPosts();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section - Premium Navy */}
      <section className="relative overflow-hidden bg-navy-gradient text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles size={14} />
              {language === 'en' ? 'Sales & Business Development' : 'Kinh doanh & Phát triển'}
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {profile?.name || 'Portfolio'}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-4 font-light">
              {profile?.title || ''}
            </p>
            <p className="text-lg opacity-70 mb-10 max-w-2xl mx-auto leading-relaxed">
              {profile?.quote || ''}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold gold-shine rounded-full px-8" asChild>
                <Link to="/about">
                  {language === 'en' ? 'About Me' : 'Về tôi'}
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-full px-8" asChild>
                <Link to="/contact">
                  {language === 'en' ? 'Get in Touch' : 'Liên hệ'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Stats - Floating Cards */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, value: experiences?.length || 0, label: language === 'en' ? 'Years Experience' : 'Năm kinh nghiệm', color: 'text-primary' },
              { icon: TrendingUp, value: featuredProjects?.length || 0, label: language === 'en' ? 'Projects Completed' : 'Dự án hoàn thành', color: 'text-secondary' },
              { icon: Users, value: featuredPosts?.length || 0, label: language === 'en' ? 'Articles Written' : 'Bài viết', color: 'text-primary' },
            ].map((stat, i) => (
              <Card key={i} className="card-premium border-0 shadow-lg animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="font-serif text-3xl font-bold">{stat.value}+</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">
                {language === 'en' ? 'Portfolio' : 'Danh mục'}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                {language === 'en' ? 'Featured Projects' : 'Dự án nổi bật'}
              </h2>
            </div>
            <Button variant="ghost" className="hidden md:inline-flex text-primary" asChild>
              <Link to="/projects">
                {language === 'en' ? 'View All' : 'Xem tất cả'}
                <ArrowRight className="ml-1" size={16} />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects?.slice(0, 3).map((project, i) => (
              <Card key={project.id} className="card-premium overflow-hidden group border-0 shadow-md animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                {project.image_url && (
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-serif font-bold text-xl mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="text-secondary font-medium text-sm inline-flex items-center hover:gap-2 transition-all"
                  >
                    {language === 'en' ? 'View Project' : 'Xem chi tiết'}
                    <ArrowRight className="ml-1" size={16} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10 md:hidden">
            <Button variant="outline" asChild>
              <Link to="/projects">
                {language === 'en' ? 'View All Projects' : 'Xem tất cả dự án'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {featuredPosts && featuredPosts.length > 0 && (
        <section className="bg-muted/40 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">Blog</p>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold">
                    {language === 'en' ? 'Latest Insights' : 'Bài viết mới nhất'}
                  </h2>
                </div>
                <Button variant="ghost" className="hidden md:inline-flex text-primary" asChild>
                  <Link to="/blog">
                    {language === 'en' ? 'View All' : 'Xem tất cả'}
                    <ArrowRight className="ml-1" size={16} />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredPosts.slice(0, 3).map((post, i) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                    <Card className="card-premium h-full border-0 shadow-md overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                      {post.image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(post.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <h3 className="font-serif font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10 md:hidden">
                <Button variant="outline" asChild>
                  <Link to="/blog">
                    {language === 'en' ? 'View All Articles' : 'Xem tất cả bài viết'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-navy-gradient text-primary-foreground border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
            <CardContent className="p-12 md:p-16 text-center relative z-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                {language === 'en' ? 'Ready to collaborate?' : 'Sẵn sàng hợp tác?'}
              </h2>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                {language === 'en'
                  ? "Let's discuss how we can create value together."
                  : 'Hãy cùng thảo luận về cách chúng ta có thể tạo giá trị cùng nhau.'}
              </p>
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-10 shadow-gold gold-shine" asChild>
                <Link to="/contact">
                  {language === 'en' ? 'Get in Touch' : 'Liên hệ ngay'}
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
