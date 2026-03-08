import { Linkedin, Github, Twitter, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import { useSetting } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Footer = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();
  const { data: footerTagline } = useSetting('footer_tagline');

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

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">
              {profile?.name || 'Portfolio'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {footerTagline?.value || profile?.quote || ''}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {language === 'en' ? 'Quick Links' : 'Liên kết nhanh'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                {language === 'en' ? 'About' : 'Giới thiệu'}
              </a></li>
              <li><a href="/projects" className="text-muted-foreground hover:text-primary transition-colors">
                {language === 'en' ? 'Projects' : 'Dự án'}
              </a></li>
              <li><a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                Blog
              </a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                {language === 'en' ? 'Contact' : 'Liên hệ'}
              </a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {language === 'en' ? 'Connect' : 'Kết nối'}
            </h3>
            <div className="flex gap-4">
              {getSocialUrl('linkedin') && (
                <a href={getSocialUrl('linkedin')} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin size={20} />
                </a>
              )}
              {getSocialUrl('github') && (
                <a href={getSocialUrl('github')} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github size={20} />
                </a>
              )}
              {getSocialUrl('twitter') && (
                <a href={getSocialUrl('twitter')} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter size={20} />
                </a>
              )}
              {contact?.email && (
                <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {profile?.name || 'Portfolio'}. {language === 'en' ? 'All rights reserved.' : 'Bảo lưu mọi quyền.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
