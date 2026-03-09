import { useLanguage } from '@/lib/i18n';
import { useAllEducation } from '@/hooks/useEducation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, GraduationCap, ChevronRight, BookOpen } from 'lucide-react';

const Education = () => {
  const { language } = useLanguage();
  const { data: educationList, isLoading } = useAllEducation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-gradient text-primary-foreground py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            {language === 'en' ? 'Academic Background' : 'Nền tảng học vấn'}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            {language === 'en' ? 'Education' : 'Học vấn'}
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Academic qualifications, certifications, and continuous learning journey.'
              : 'Bằng cấp, chứng chỉ và hành trình học tập không ngừng.'}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-40 bg-muted rounded-xl" />
                </div>
              ))}
            </div>
          ) : educationList && educationList.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

              <div className="space-y-8">
                {educationList.map((edu, index) => (
                  <div key={edu.id} className="relative flex gap-6 md:gap-10 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Timeline dot */}
                    <div className="hidden md:flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-secondary border-4 border-background shadow-sm z-10" />
                    </div>

                    <Card className="flex-1 card-premium border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 md:p-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                            <Calendar size={12} />
                            {edu.year}
                          </span>
                          {edu.field && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <BookOpen size={12} />
                              {edu.field}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-3 mb-1">
                          <GraduationCap size={20} className="text-primary mt-1 shrink-0" />
                          <h3 className="font-serif text-2xl font-bold">{edu.degree}</h3>
                        </div>
                        <p className="text-secondary font-medium mb-4 ml-8">{edu.institution}</p>

                        {edu.description && (
                          <div
                            className="text-muted-foreground leading-relaxed mb-4 prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: edu.description }}
                          />
                        )}

                        {edu.achievements && edu.achievements.length > 0 && (
                          <div className="pt-4 border-t border-border">
                            <h4 className="text-sm font-semibold mb-3 text-foreground">
                              {language === 'en' ? 'Achievements & Awards' : 'Thành tựu & Giải thưởng'}
                            </h4>
                            <ul className="space-y-2">
                              {edu.achievements.map((achievement, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <ChevronRight size={14} className="text-secondary mt-0.5 shrink-0" />
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              {language === 'en' ? 'No education data available.' : 'Chưa có dữ liệu học vấn.'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Education;
