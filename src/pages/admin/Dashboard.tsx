import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  User, Briefcase, FolderOpen, Activity, FileText,
  Image, Settings, LogOut, LayoutDashboard, BookOpen,
  Award, Sun, Moon
} from 'lucide-react';
import { useAllPosts } from '@/hooks/useBlog';
import { usePublishedExperiences } from '@/hooks/useExperiences';
import { useTheme } from '@/lib/theme';

const menuItems = [
  { path: '/admin/profile', icon: User, label: 'Hồ sơ', desc: 'Quản lý thông tin cá nhân', color: 'from-blue-500/10 to-blue-600/5' },
  { path: '/admin/experiences', icon: Briefcase, label: 'Kinh nghiệm', desc: 'Thêm và chỉnh sửa kinh nghiệm', color: 'from-emerald-500/10 to-emerald-600/5' },
  { path: '/admin/projects', icon: FolderOpen, label: 'Dự án', desc: 'Quản lý dự án portfolio', color: 'from-violet-500/10 to-violet-600/5' },
  { path: '/admin/activities', icon: Activity, label: 'Hoạt động', desc: 'Quản lý hoạt động', color: 'from-orange-500/10 to-orange-600/5' },
  { path: '/admin/blog', icon: FileText, label: 'Blog', desc: 'Viết và xuất bản bài viết', color: 'from-rose-500/10 to-rose-600/5' },
  { path: '/admin/media', icon: Image, label: 'Thư viện', desc: 'Quản lý hình ảnh và tệp', color: 'from-cyan-500/10 to-cyan-600/5' },
  { path: '/admin/settings', icon: Settings, label: 'Cài đặt', desc: 'Cấu hình footer và site', color: 'from-slate-500/10 to-slate-600/5' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: posts } = useAllPosts();
  const { data: experiences } = usePublishedExperiences();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Đã đăng xuất');
    navigate('/admin');
  };

  const stats = [
    { label: 'Bài viết', value: posts?.length || 0, icon: BookOpen },
    { label: 'Kinh nghiệm', value: experiences?.length || 0, icon: Award },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar + Content layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 min-h-screen bg-primary text-primary-foreground flex-col">
          <div className="p-6 border-b border-primary-foreground/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <LayoutDashboard size={20} className="text-secondary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Admin Panel</h2>
                <p className="text-xs opacity-60">Portfolio CMS</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-primary-foreground/10 transition-colors group"
              >
                <item.icon size={18} className="opacity-70 group-hover:opacity-100" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-primary-foreground/10 space-y-1">
            <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-primary-foreground/10 transition-colors w-full text-left opacity-70 hover:opacity-100">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-primary-foreground/10 transition-colors w-full text-left opacity-70 hover:opacity-100">
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Mobile header */}
          <header className="lg:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between">
            <h1 className="font-bold text-lg">Admin Dashboard</h1>
            <div className="flex items-center gap-1">
              <Button onClick={toggleTheme} variant="ghost" size="sm">
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut size={16} />
              </Button>
            </div>
          </header>

          <div className="p-6 md:p-8">
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Quản lý nội dung portfolio của bạn</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {menuItems.map((item, i) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`bg-gradient-to-br ${item.color} bg-card border border-border rounded-xl p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group animate-fade-in`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
