import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ContactSection from './ContactSection';
import { useLocale } from '../../hooks/useLocale';

const THEME_KEY = 'fcai_visualizer_theme';

export default function Layout() {
  const { locale } = useLocale();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 1199);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1199px)');
    const handleChange = (e) => {
      setSidebarCollapsed(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  // ── Theme: read from localStorage, default to the academic light theme ─
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      return 'light';
    }
    return 'light';
  });

  // Apply theme to <html data-theme="..."> whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn('Unable to save theme preference:', error);
    }
  }, [theme]);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);
  const toggleTheme   = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="app-layout">
      {!sidebarCollapsed && (
        <div
          className="sidebar-overlay visible"
          role="button"
          tabIndex={0}
          aria-label="Close navigation"
          onClick={toggleSidebar}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') toggleSidebar();
          }}
        />
      )}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="app-main">
        <Header
          onToggleSidebar={toggleSidebar}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        {/* key={locale} remounts route content on language switch so any
            imperative visualizers and page state reinitialize in-context. */}
        <main className="app-content" key={locale}>
          <Outlet />
          <ContactSection />
        </main>
      </div>
    </div>
  );
}
