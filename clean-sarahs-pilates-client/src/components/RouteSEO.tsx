import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://www.sarah-pilates-mb.com";
const pages: Record<string, { title: string; description: string }> = {
  "/": { title: "Private Pilates in Manhattan Beach, CA | Pilates With Sarah", description: "Explore private apparatus Pilates, duet reformer sessions, and mat classes with Pilates With Sarah in Manhattan Beach, California." },
  "/about": { title: "About Pilates With Sarah | Manhattan Beach Pilates", description: "Learn about the personalized approach to Pilates at Pilates With Sarah, including private apparatus, duet reformer, and mat sessions." },
  "/services": { title: "Private, Duet & Mat Pilates Sessions | Pilates With Sarah", description: "Explore private apparatus sessions, duet reformer Pilates, and mat classes with Pilates With Sarah in Manhattan Beach." },
  "/schedule": { title: "Schedule a Pilates Session | Pilates With Sarah", description: "View the Pilates session calendar and schedule a session with Pilates With Sarah." },
  "/contact": { title: "Contact Pilates With Sarah | Manhattan Beach, CA", description: "Contact Pilates With Sarah to ask questions about Pilates sessions and getting started in Manhattan Beach." },
};

export default function RouteSEO() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.replace(/\/$/, "") || "/";
    const page = pages[path];
    document.title = page?.title || "Page Not Found | Pilates With Sarah";
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta("description", page?.description || "Pilates With Sarah in Manhattan Beach, California.");
    setMeta("robots", page ? "index, follow" : "noindex, follow");
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = SITE + (page ? path : "/");
  }, [pathname]);
  return null;
}
