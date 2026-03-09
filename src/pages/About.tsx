import { useLanguage } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import { usePageHeroes } from '@/hooks/usePageHeroes';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MapPin, Linkedin, Github, Twitter, GraduationCap, Award } from 'lucide-react';

const About = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();

  const { data: aboutSection } = useQuery({
    queryKey: ['about_section'],
    queryFn: async () => {
      const { data, error } = await supabase.from('about_section').select('*').maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: socialLinks } = useQuery({
    queryKey: ['social_links'],
    queryFn: async () => {
      const { data, error } = await supabase.from('social_links').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: contact } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contacts').select('*').maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase.from('skills').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: education } = useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const { data, error } = await supabase.from('education').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const getSocialUrl = (provider: string) => {
    return socialLinks?.find(l => l.provider.toLowerCase() === provider.toLowerCase())?.url;
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <div className="h-32 w-32 rounded-full bg-muted mx-auto" />
            <div className="h-6 bg-muted rounded w-48 mx-auto" />
            <div className="h-4 bg-muted rounded w-64 mx-auto" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-navy-gradient opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              {/* Profile Image */}
              <div className="md:col-span-1 flex justify-center">
                {profile.profile_image_url ? (
                  <div className="relative">
                    <img
                      src={profile.profile_image_url}
                      alt={profile.name}
                      className="w-56 h-56 md:w-full md:h-auto md:aspect-square object-cover rounded-2xl shadow-navy"
                    />
                    <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-secondary/20 rounded-2xl -z-10" />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-muted rounded-2xl" />
                )}
              </div>

              {/* Profile Info */}
              <div className="md:col-span-2 space-y-6 animate-fade-in">
                <div>
                  <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">
                    {language === 'en' ? 'About Me' : 'Giới thiệu'}
                  </p>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
                    {profile.name}
                  </h1>
                  <p className="text-xl text-secondary font-medium mb-4">
                    {profile.title}
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {profile.quote}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-6 pt-4">
                  {contact?.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail size={16} className="text-secondary" />
                      {contact.email}
                    </a>
                  )}
                  {contact?.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={16} className="text-secondary" />
                      {contact.location}
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3 pt-2">
                  {getSocialUrl('linkedin') && (
                    <a href={getSocialUrl('linkedin')} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      <Linkedin size={18} />
                    </a>
                  )}
                  {getSocialUrl('github') && (
                    <a href={getSocialUrl('github')} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      <Github size={18} />
                    </a>
                  )}
                  {getSocialUrl('twitter') && (
                    <a href={getSocialUrl('twitter')} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      <Twitter size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {aboutSection && (
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl font-bold mb-8">
                {aboutSection.headline}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                {aboutSection.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Award size={24} className="text-secondary" />
              <h2 className="font-serif text-3xl font-bold">
                {language === 'en' ? 'Skills & Expertise' : 'Kỹ năng & Chuyên môn'}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span key={skill.id} className="px-4 py-2 rounded-full bg-muted text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <GraduationCap size={24} className="text-secondary" />
                <h2 className="font-serif text-3xl font-bold">
                  {language === 'en' ? 'Education' : 'Học vấn'}
                </h2>
              </div>
              <div className="space-y-6">
                {education.map((edu) => (
                  <Card key={edu.id} className="card-premium border-0 shadow-sm">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-serif text-xl font-bold">{edu.degree}</h3>
                          <p className="text-secondary font-medium">{edu.institution}</p>
                          {edu.field && <p className="text-sm text-muted-foreground">{edu.field}</p>}
                        </div>
                        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full w-fit">{edu.year}</span>
                      </div>
                      {edu.description && <p className="text-muted-foreground mt-3">{edu.description}</p>}
                      {edu.achievements && edu.achievements.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {edu.achievements.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default About;
