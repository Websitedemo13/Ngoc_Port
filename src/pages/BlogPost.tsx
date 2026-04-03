import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { usePostBySlug, usePublishedPosts } from '@/hooks/useBlog';
import { useAllCategories } from '@/hooks/useBlog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Share2, Tag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { data: post, isLoading } = usePostBySlug(slug || '');
  const { data: categories } = useAllCategories();
  const { data: postsData } = usePublishedPosts(1, 50);

  const readingTime = post ? Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200)) : 0;
  const category = post?.category_id && categories?.find(c => c.id === post.category_id);

  // Related posts (same category, excluding current)
  const relatedPosts = postsData?.posts?.filter(
    p => p.id !== post?.id && p.category_id === post?.category_id
  ).slice(0, 3) || [];

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(language === 'en' ? 'Link copied!' : 'Đã sao chép link!');
      }
    } catch { /* user cancelled */ }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-12 bg-muted rounded w-2/3" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">
              {language === 'en' ? 'Article Not Found' : 'Không tìm thấy bài viết'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {language === 'en' ? "The article you're looking for doesn't exist or has been removed." : 'Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.'}
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2" size={16} />
                {language === 'en' ? 'Back to Blog' : 'Quay lại Blog'}
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const readTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <article>
        {/* Hero Image */}
        {post.image_url && (
          <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className={post.image_url ? '-mt-20 relative z-10' : 'pt-12'}>
              {/* Back button */}
              <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground hover:text-foreground">
                <Link to="/blog">
                  <ArrowLeft className="mr-2" size={16} />
                  {language === 'en' ? 'All Articles' : 'Tất cả bài viết'}
                </Link>
              </Button>

              {/* Category badge */}
              {category && (
                <Badge className="mb-4 bg-secondary/10 text-secondary border-0 hover:bg-secondary/20">
                  <Tag size={12} className="mr-1" />
                  {category.name}
                </Badge>
              )}

              {/* Title */}
              <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-6 text-foreground">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed mb-6 border-l-4 border-secondary pl-4 italic">
                  {post.excerpt}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>
                    {new Date(post.created_at!).toLocaleDateString(
                      language === 'en' ? 'en-US' : 'vi-VN',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{readingTime} {language === 'en' ? 'min read' : 'phút đọc'}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto"
                >
                  <Share2 size={14} />
                  <span>{language === 'en' ? 'Share' : 'Chia sẻ'}</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none pb-16
              prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg
              prose-blockquote:border-l-secondary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-strong:text-foreground
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-li:text-muted-foreground
              dark:prose-invert
            ">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-2xl font-bold mb-8">
                {language === 'en' ? 'Related Articles' : 'Bài viết liên quan'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => (
                  <Link key={rp.id} to={`/blog/${rp.slug}`} className="group">
                    <Card className="overflow-hidden card-premium h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                      {rp.image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img src={rp.image_url} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-serif font-bold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar size={12} />
                          {new Date(rp.created_at!).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}
                          <span className="flex items-center gap-1 ml-auto"><Clock size={12} />{readTime(rp.content)} {language === 'en' ? 'min' : 'phút'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back to blog CTA */}
      <div className="container mx-auto px-4 py-12 text-center">
        <Button variant="outline" asChild size="lg">
          <Link to="/blog">
            <ArrowLeft className="mr-2" size={16} />
            {language === 'en' ? 'Back to all articles' : 'Xem tất cả bài viết'}
          </Link>
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;
