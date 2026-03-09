import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTheme } from '@/lib/theme';
import {
  User, Briefcase, FolderOpen, Activity, FileText,
  Image, Settings, LogOut, LayoutDashboard, GraduationCap,
  Sun, Moon, Menu, X, ChevronRight, Blocks, ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/profile', icon: User, label: 'Hồ sơ' },
  { path: '/admin/experiences', icon: Briefcase, label: 'Kinh nghiệm' },
  { path: '/admin/education', icon: GraduationCap, label: 'Học vấn' },
  { path: '/admin/projects', icon: FolderOpen, label: 'Dự án' },
  { path: '/admin/activities', icon: Activity, label: 'Hoạt động' },
  { path: '/admin/blog', icon: FileText, label: 'Blog' },
  { path: '/admin/store', icon: ShoppingBag, label: 'Cửa hàng' },
  { path: '/admin/custom-sections', icon: Blocks, label: 'Custom Sections' },
  { path: '/admin/media', icon: Image, label: 'Thư viện' },
  { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Đã đăng xuất');
    navigate('/admin');
  };

  const currentPage = menuItems.find(item => location.pathname === item.path);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo area */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--navy-dark))] to-[hsl(var(--navy-light))] flex items-center justify-center shadow-md">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Portfolio CMS</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-[hsl(var(--navy-dark))] to-[hsl(var(--navy-main))] text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={18} className={cn(isActive ? "text-[hsl(var(--gold-main))]" : "opacity-70 group-hover:opacity-100")} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-lg">
          <div className="flex items-center justify-between h-14 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground hidden sm:inline">Admin</span>
                {currentPage && (
                  <>
                    <ChevronRight size={14} className="text-muted-foreground hidden sm:inline" />
                    <span className="font-semibold text-foreground">{currentPage.label}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden lg:flex">
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="lg:hidden">
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
