import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { usePageVisibility } from '@/hooks/usePageVisibility';

const allNavItems = [
  { path: '/', label: { en: 'Home', vi: 'Trang chủ' } },
  { path: '/about', label: { en: 'About', vi: 'Giới thiệu' } },
  { path: '/experience', label: { en: 'Experience', vi: 'Kinh nghiệm' } },
  { path: '/projects', label: { en: 'Projects', vi: 'Dự án' } },
  { path: '/activities', label: { en: 'Activities', vi: 'Hoạt động' } },
  { path: '/blog', label: { en: 'Blog', vi: 'Blog' } },
  { path: '/contact', label: { en: 'Contact', vi: 'Liên hệ' } },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { data: hiddenPages } = usePageVisibility();

  const navItems = allNavItems.filter(item =>
    item.path === '/' || !hiddenPages?.has(item.path)
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-serif font-bold text-primary">
            TRẦN BẢO NGỌC
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label[language]}
              </Link>
            ))}

            <div className="flex items-center gap-1 border-l border-border pl-4">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>EN</Button>
              <Button variant={language === 'vi' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('vi')}>VI</Button>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label[language]}
              </Link>
            ))}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>EN</Button>
              <Button variant={language === 'vi' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('vi')}>VI</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
