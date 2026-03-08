import { useMemo } from 'react';
import { getThemeById, generateCustomTheme, type CustomColors } from '@/lib/colorThemes';
import { useTheme } from '@/lib/theme';
import { Mail, Briefcase, GraduationCap, Star, ChevronRight } from 'lucide-react';

interface ThemePreviewProps {
  themeId: string;
  customColors?: CustomColors;
}

const ThemePreview = ({ themeId, customColors }: ThemePreviewProps) => {
  const { theme: darkMode } = useTheme();
  const isDark = darkMode === 'dark';

  const vars = useMemo(() => {
    if (themeId === 'custom' && customColors) {
      const custom = generateCustomTheme(customColors);
      return isDark ? { ...custom.light, ...custom.dark } : custom.light;
    }
    const theme = getThemeById(themeId);
    return isDark ? { ...theme.light, ...theme.dark } : theme.light;
  }, [themeId, customColors, isDark]);

  const style = useMemo(() => {
    const s: Record<string, string> = {};
    Object.entries(vars).forEach(([key, value]) => {
      s[key] = value;
    });
    return s;
  }, [vars]);

  const hsl = (v: string) => `hsl(${v})`;

  return (
    <div
      className="rounded-xl border-2 border-border overflow-hidden shadow-lg select-none"
      style={{
        ...style,
        background: hsl(vars['--background']),
        color: hsl(vars['--foreground']),
        fontSize: '10px',
      }}
    >
      {/* Nav */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: hsl(vars['--primary']), color: hsl(vars['--primary-foreground']) }}
      >
        <span className="font-bold text-xs tracking-wide">PORTFOLIO</span>
        <div className="flex gap-3 text-[9px] opacity-80">
          <span>Trang chủ</span>
          <span>Giới thiệu</span>
          <span>Dự án</span>
          <span>Blog</span>
          <span>Liên hệ</span>
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 py-6 text-center" style={{ background: hsl(vars['--background']) }}>
        <div
          className="w-10 h-10 rounded-full mx-auto mb-2"
          style={{ background: hsl(vars['--muted']), border: `2px solid ${hsl(vars['--accent'])}` }}
        />
        <p className="font-bold text-sm" style={{ color: hsl(vars['--foreground']) }}>
          Nguyễn Văn A
        </p>
        <p className="text-[9px] mt-0.5" style={{ color: hsl(vars['--muted-foreground']) }}>
          Software Engineer & Designer
        </p>
        <div className="flex gap-2 justify-center mt-3">
          <span
            className="px-3 py-1 rounded-full text-[9px] font-semibold"
            style={{ background: hsl(vars['--primary']), color: hsl(vars['--primary-foreground']) }}
          >
            Xem dự án
          </span>
          <span
            className="px-3 py-1 rounded-full text-[9px] font-semibold border"
            style={{
              borderColor: hsl(vars['--accent']),
              color: hsl(vars['--accent']),
              background: 'transparent',
            }}
          >
            Liên hệ
          </span>
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 gap-2 px-4 py-3"
        style={{ background: hsl(vars['--muted']) }}
      >
        {[
          { num: '50+', label: 'Dự án' },
          { num: '5 năm', label: 'Kinh nghiệm' },
          { num: '30+', label: 'Khách hàng' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-bold text-xs" style={{ color: hsl(vars['--accent']) }}>{s.num}</p>
            <p className="text-[8px]" style={{ color: hsl(vars['--muted-foreground']) }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards Section */}
      <div className="px-4 py-3 space-y-2" style={{ background: hsl(vars['--background']) }}>
        <p className="font-bold text-xs flex items-center gap-1" style={{ color: hsl(vars['--foreground']) }}>
          <Star className="w-3 h-3" style={{ color: hsl(vars['--accent']) }} />
          Dự án nổi bật
        </p>
        <div className="grid grid-cols-2 gap-2">
          {['E-Commerce App', 'Portfolio CMS'].map((title) => (
            <div
              key={title}
              className="rounded-lg p-2.5 border"
              style={{
                background: hsl(vars['--card']),
                borderColor: hsl(vars['--border']),
                color: hsl(vars['--card-foreground']),
              }}
            >
              <div
                className="w-full h-8 rounded mb-1.5"
                style={{ background: hsl(vars['--muted']) }}
              />
              <p className="font-semibold text-[9px]">{title}</p>
              <p className="text-[8px] mt-0.5" style={{ color: hsl(vars['--muted-foreground']) }}>
                React · TypeScript · Supabase
              </p>
              <span
                className="inline-flex items-center gap-0.5 text-[8px] font-semibold mt-1"
                style={{ color: hsl(vars['--accent']) }}
              >
                Chi tiết <ChevronRight className="w-2 h-2" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Experience snippet */}
      <div className="px-4 py-3" style={{ background: hsl(vars['--card']), borderTop: `1px solid ${hsl(vars['--border'])}` }}>
        <p className="font-bold text-xs flex items-center gap-1 mb-2" style={{ color: hsl(vars['--foreground']) }}>
          <Briefcase className="w-3 h-3" style={{ color: hsl(vars['--secondary']) }} />
          Kinh nghiệm
        </p>
        {[
          { title: 'Senior Developer', company: 'Tech Corp', year: '2022–nay' },
          { title: 'Full-stack Dev', company: 'StartupXYZ', year: '2020–2022' },
        ].map((exp) => (
          <div key={exp.title} className="flex items-start gap-2 mb-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
              style={{ background: hsl(vars['--secondary']) }}
            />
            <div>
              <p className="text-[9px] font-semibold">{exp.title}</p>
              <p className="text-[8px]" style={{ color: hsl(vars['--muted-foreground']) }}>
                {exp.company} · {exp.year}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ background: hsl(vars['--primary']), color: hsl(vars['--primary-foreground']) }}
      >
        <span className="text-[8px] opacity-70">© 2026 Portfolio</span>
        <div className="flex gap-2">
          <Mail className="w-3 h-3 opacity-70" />
          <GraduationCap className="w-3 h-3 opacity-70" />
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
