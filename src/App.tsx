import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Experience from "./pages/Experience";
import Education from "./pages/Education";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Activities from "./pages/Activities";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import ProfileManager from "./pages/admin/ProfileManager";
import ProjectsManager from "./pages/admin/ProjectsManager";
import SettingsManager from "./pages/admin/SettingsManager";
import ActivitiesManager from "./pages/admin/ActivitiesManager";
import ExperiencesManager from "./pages/admin/ExperiencesManager";
import EducationManager from "./pages/admin/EducationManager";
import BlogManager from "./pages/admin/BlogManager";
import MediaLibrary from "./pages/admin/MediaLibrary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import BackToTop from "./components/BackToTop";
import ChatbotWidget from "./components/ChatbotWidget";
import FaviconUpdater from "./components/FaviconUpdater";
import ColorThemeApplier from "./components/ColorThemeApplier";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/education" element={<Education />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<ProfileManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="activities" element={<ActivitiesManager />} />
            <Route path="experiences" element={<ExperiencesManager />} />
            <Route path="education" element={<EducationManager />} />
            <Route path="blog" element={<BlogManager />} />
            <Route path="media" element={<MediaLibrary />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BackToTop />
        <ChatbotWidget />
        <FaviconUpdater />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
