import { useLanguage } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mail, MapPin, Linkedin, Github, Twitter } from 'lucide-react';

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

  const getSocialUrl = (provider: string) => {
    return socialLinks?.find(l => l.provider.toLowerCase() === provider.toLowerCase())?.url;
  };

  if (!profile) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            {/* Profile Image */}
            <div className="md:col-span-1">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.name}
                  className="w-full aspect-square object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-muted rounded-lg" />
              )}
            </div>

            {/* Profile Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="font-serif text-4xl font-bold mb-2">
                  {profile.name}
                </h1>
                <p className="text-xl text-primary mb-4">
                  {profile.title}
                </p>
                <p className="text-lg text-muted-foreground">
                  {profile.quote}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-4 border-t border-border">
                {contact?.email && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail size={20} className="text-primary" />
                    <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact?.location && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin size={20} className="text-primary" />
                    <span>{contact.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                {getSocialUrl('linkedin') && (
                  <a href={getSocialUrl('linkedin')} target="_blank" rel="noopener noreferrer"
                    className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Linkedin size={20} />
                  </a>
                )}
                {getSocialUrl('github') && (
                  <a href={getSocialUrl('github')} target="_blank" rel="noopener noreferrer"
                    className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Github size={20} />
                  </a>
                )}
                {getSocialUrl('twitter') && (
                  <a href={getSocialUrl('twitter')} target="_blank" rel="noopener noreferrer"
                    className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Twitter size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {aboutSection && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl font-bold mb-8">
                {aboutSection.headline}
              </h2>
              <div className="prose prose-lg max-w-none text-foreground">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {aboutSection.description}
                </p>
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
