import { useLanguage } from '@/lib/i18n';
import { usePublishedActivities } from '@/hooks/useActivities';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const Activities = () => {
  const { language } = useLanguage();
  const { data: activities, isLoading } = usePublishedActivities();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            {language === 'en' ? 'Activities & Leadership' : 'Hoạt động & Lãnh đạo'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'Community involvement, leadership roles, and extracurricular contributions.'
              : 'Tham gia cộng đồng, vai trò lãnh đạo và đóng góp ngoại khóa.'}
          </p>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              {language === 'en' ? 'Loading...' : 'Đang tải...'}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activities.map((activity, index) => (
                <Card key={activity.id} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  {activity.image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-serif text-xl font-bold">
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
            <div className="text-center text-muted-foreground py-12">
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
