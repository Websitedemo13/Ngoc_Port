import { useNavigate } from 'react-router-dom';
import { useAllPosts } from '@/hooks/useBlog';
import { usePublishedExperiences } from '@/hooks/useExperiences';
import { useAllProjects } from '@/hooks/useProjects';
import { useAllMedia } from '@/hooks/useMedia';
import {
  User, Briefcase, FolderOpen, Activity, FileText,
  Image, Settings, BookOpen, Award, TrendingUp, Layers, ShoppingBag, Blocks
} from 'lucide-react';

const menuItems = [
  { path: '/admin/profile', icon: User, label: 'Hồ sơ', desc: 'Quản lý thông tin cá nhân', gradient: 'from-blue-500 to-blue-600' },
  { path: '/admin/experiences', icon: Briefcase, label: 'Kinh nghiệm', desc: 'Thêm và chỉnh sửa kinh nghiệm', gradient: 'from-emerald-500 to-emerald-600' },
  { path: '/admin/projects', icon: FolderOpen, label: 'Dự án', desc: 'Quản lý dự án portfolio', gradient: 'from-violet-500 to-violet-600' },
  { path: '/admin/activities', icon: Activity, label: 'Hoạt động', desc: 'Quản lý hoạt động', gradient: 'from-orange-500 to-orange-600' },
  { path: '/admin/blog', icon: FileText, label: 'Blog', desc: 'Viết và xuất bản bài viết', gradient: 'from-rose-500 to-rose-600' },
  { path: '/admin/store', icon: ShoppingBag, label: 'Cửa hàng', desc: 'Quản lý sản phẩm, khóa học, tài liệu', gradient: 'from-amber-500 to-amber-600' },
  { path: '/admin/custom-sections', icon: Blocks, label: 'Custom Sections', desc: 'Tạo section tùy chỉnh trên mỗi trang', gradient: 'from-teal-500 to-teal-600' },
  { path: '/admin/media', icon: Image, label: 'Thư viện', desc: 'Quản lý hình ảnh và tệp', gradient: 'from-cyan-500 to-cyan-600' },
  { path: '/admin/settings', icon: Settings, label: 'Cài đặt', desc: 'Cấu hình footer và site', gradient: 'from-slate-500 to-slate-600' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: posts } = useAllPosts();
  const { data: experiences } = usePublishedExperiences();
  const { data: projects } = useAllProjects();
  const { data: media } = useAllMedia();

  const stats = [
    { label: 'Bài viết', value: posts?.length || 0, icon: BookOpen, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Kinh nghiệm', value: experiences?.length || 0, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Dự án', value: projects?.length || 0, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Media', value: media?.length || 0, icon: Image, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Quản lý nội dung portfolio của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl p-5 border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-muted-foreground" />
          Quản lý nội dung
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {menuItems.map((item, i) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-card border border-border rounded-2xl p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm`}>
                  <item.icon size={22} className="text-white" />
                </div>
                <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-lg">→</span>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
