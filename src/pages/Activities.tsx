import { useLanguage } from '@/lib/i18n';
import { usePublishedActivities } from '@/hooks/useActivities';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

const Activities = () => {
  const { language } = useLanguage();
  const { data: activities, isLoading } = usePublishedActivities();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-gradient text-primary-foreground py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/3 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            {language === 'en' ? 'Community' : 'Cộng đồng'}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            {language === 'en' ? 'Activities & Leadership' : 'Hoạt động & Lãnh đạo'}
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Community involvement, leadership roles, and extracurricular contributions.'
              : 'Tham gia cộng đồng, vai trò lãnh đạo và đóng góp ngoại khóa.'}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="hsl(var(--background))" /></svg>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-xl" />
                  <div className="p-6 space-y-3"><div className="h-5 bg-muted rounded w-3/4" /><div className="h-4 bg-muted rounded w-full" /></div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activities.map((activity, index) => (
                <Card key={activity.id} className="card-premium overflow-hidden group border-0 shadow-md animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                  {activity.image_url ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-navy-gradient flex items-center justify-center">
                      <Activity size={48} className="text-secondary opacity-50" />
                    </div>
                  )}
                  <CardContent className="p-6 space-y-3">
                    <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">
                      {activity.title}
                    </h3>
                    {activity.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {activity.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <Activity size={48} className="mx-auto mb-4 opacity-30" />
              {language === 'en' ? 'No activities available yet.' : 'Chưa có hoạt động nào.'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Activities;
