import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { usePublishedPosts, useFeaturedPosts } from '@/hooks/useBlog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Clock, Search, Star } from 'lucide-react';

const Blog = () => {
  const { language } = useLanguage();
  const { data: postsData, isLoading } = usePublishedPosts(1, 50);
  const { data: featuredPosts } = useFeaturedPosts(3);
  const [search, setSearch] = useState('');

  const posts = postsData?.posts || [];
  const filtered = search.trim()
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.excerpt || '').toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  const readingTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-gradient text-primary-foreground py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">Blog</p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            {language === 'en' ? 'Insights & Articles' : 'Bài viết & Chia sẻ'}
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">
            {language === 'en'
              ? 'Thoughts on leadership, international relations, and professional development.'
              : 'Chia sẻ về lãnh đạo, quan hệ quốc tế và phát triển nghề nghiệp.'}
          </p>
          <div className="max-w-md mx-auto relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'en' ? 'Search articles...' : 'Tìm kiếm bài viết...'}
              className="pl-10 bg-background text-foreground rounded-full border-none shadow-lg"
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="hsl(var(--background))" /></svg>
        </div>
      </section>

      {/* Featured */}
      {!search && featuredPosts && featuredPosts.length > 0 && (
        <section className="container mx-auto px-4 -mt-8 relative z-10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredPosts.map((post, i) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <Card className="overflow-hidden card-premium h-full border-0 shadow-lg animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  {post.image_url && (
                    <div className="aspect-video overflow-hidden relative">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground border-0">
                        <Star size={12} className="mr-1" />
                        {language === 'en' ? 'Featured' : 'Nổi bật'}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="font-serif font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar size={12} />{new Date(post.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{readingTime(post.content)} {language === 'en' ? 'min' : 'phút'}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl font-bold mb-8">
            {search ? (language === 'en' ? `Results for "${search}"` : `Kết quả cho "${search}"`) : (language === 'en' ? 'All Articles' : 'Tất cả bài viết')}
          </h2>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex gap-6">
                  <div className="w-32 h-24 bg-muted rounded-lg shrink-0 hidden md:block" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((post, i) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                  <Card className="card-premium border-0 shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <CardContent className="p-0">
                      <div className="flex gap-5 p-5">
                        {post.image_url && (
                          <div className="w-28 h-20 md:w-36 md:h-24 rounded-lg overflow-hidden shrink-0">
                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.excerpt}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar size={12} />{new Date(post.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}</span>
                            <span className="flex items-center gap-1"><Clock size={12} />{readingTime(post.content)} {language === 'en' ? 'min' : 'phút'}</span>
                            <span className="hidden md:inline-flex items-center gap-1 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              {language === 'en' ? 'Read' : 'Đọc'} <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              {language === 'en' ? 'No articles found.' : 'Không tìm thấy bài viết nào.'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
