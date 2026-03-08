import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const FaviconUpdater = () => {
  const { data: siteSettings } = useSiteSettings();

  useEffect(() => {
    if (siteSettings?.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteSettings.favicon_url;
    }
  }, [siteSettings?.favicon_url]);

  return null;
};

export default FaviconUpdater;
