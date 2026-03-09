import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PageHeroConfig {
  visible: boolean;
  title_vi: string;
  title_en: string;
  subtitle_vi: string;
  subtitle_en: string;
  label_vi: string;
  label_en: string;
  background_image_url: string;
}

export type PageHeroes = Record<string, PageHeroConfig>;

export const PAGE_HERO_KEYS = [
  { key: 'about', label: 'Giới thiệu (About)' },
  { key: 'experience', label: 'Kinh nghiệm (Experience)' },
  { key: 'education', label: 'Học vấn (Education)' },
  { key: 'projects', label: 'Dự án (Projects)' },
  { key: 'activities', label: 'Hoạt động (Activities)' },
  { key: 'blog', label: 'Blog' },
  { key: 'contact', label: 'Liên hệ (Contact)' },
  { key: 'store', label: 'Cửa hàng (Store)' },
];

export const DEFAULT_HEROES: PageHeroes = {
  about: { visible: true, title_vi: 'Về tôi', title_en: 'About Me', subtitle_vi: '', subtitle_en: '', label_vi: 'Giới thiệu', label_en: 'Introduction', background_image_url: '' },
  experience: { visible: true, title_vi: 'Kinh nghiệm làm việc', title_en: 'Professional Experience', subtitle_vi: 'Hành trình phát triển, lãnh đạo và đóng góp có ý nghĩa tại các tổ chức khác nhau.', subtitle_en: 'A journey of growth, leadership, and impactful contributions across various organizations.', label_vi: 'Hành trình sự nghiệp', label_en: 'Career Journey', background_image_url: '' },
  education: { visible: true, title_vi: 'Học vấn', title_en: 'Education', subtitle_vi: 'Bằng cấp, chứng chỉ và hành trình học tập không ngừng.', subtitle_en: 'Academic qualifications, certifications, and continuous learning journey.', label_vi: 'Nền tảng học vấn', label_en: 'Academic Background', background_image_url: '' },
  projects: { visible: true, title_vi: 'Dự án & Nghiên cứu', title_en: 'Projects & Case Studies', subtitle_vi: 'Khám phá danh mục các dự án có tác động và sáng kiến chiến lược của tôi.', subtitle_en: 'Explore my portfolio of impactful projects and strategic initiatives.', label_vi: 'Danh mục', label_en: 'Portfolio', background_image_url: '' },
  activities: { visible: true, title_vi: 'Hoạt động & Lãnh đạo', title_en: 'Activities & Leadership', subtitle_vi: 'Tham gia cộng đồng, vai trò lãnh đạo và đóng góp ngoại khóa.', subtitle_en: 'Community involvement, leadership roles, and extracurricular contributions.', label_vi: 'Cộng đồng', label_en: 'Community', background_image_url: '' },
  blog: { visible: true, title_vi: 'Bài viết & Chia sẻ', title_en: 'Insights & Articles', subtitle_vi: 'Chia sẻ về lãnh đạo, quan hệ quốc tế và phát triển nghề nghiệp.', subtitle_en: 'Thoughts on leadership, international relations, and professional development.', label_vi: 'Blog', label_en: 'Blog', background_image_url: '' },
  contact: { visible: true, title_vi: 'Kết nối với tôi', title_en: "Let's Connect", subtitle_vi: 'Tôi luôn sẵn sàng thảo luận về cơ hội mới, hợp tác hoặc chỉ để trò chuyện.', subtitle_en: "I'm always open to discussing new opportunities, collaborations, or just having a conversation.", label_vi: 'Liên hệ', label_en: 'Contact', background_image_url: '' },
  store: { visible: true, title_vi: 'Cửa hàng', title_en: 'Store', subtitle_vi: 'Sản phẩm, khóa học và tài liệu', subtitle_en: 'Products, courses & resources', label_vi: 'Mua sắm', label_en: 'Shop', background_image_url: '' },
};

export function usePageHeroes() {
  const { data, isLoading } = useQuery({
    queryKey: ['page-heroes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'page_heroes')
        .maybeSingle();
      if (error) throw error;
      if (data?.value) {
        try {
          return JSON.parse(data.value) as PageHeroes;
        } catch {
          return DEFAULT_HEROES;
        }
      }
      return DEFAULT_HEROES;
    },
  });

  return { heroes: data || DEFAULT_HEROES, isLoading };
}


