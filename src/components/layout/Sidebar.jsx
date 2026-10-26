import { Link, NavLink } from 'react-router-dom';
import {
  Binary,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileArchive,
  GitBranch,
  Home,
  Image,
  Layers,
  ListOrdered,
  Network,
  Scale,
  Search,
  Sparkles,
  TreePine,
  Trophy,
  Workflow,
} from 'lucide-react';
import { useT } from '../../hooks/useT';
import './Sidebar.css';
import logo from '../../../assets/ddc-logo-transparent.png';

// Labels resolve through the catalog namespace at render time so switching
// language re-renders without remounting the sidebar.
const COURSE_LINKS = [
  {
    key: 'data-structure',
    to: '/courses/data-structure',
    icon: Layers,
    children: [
      { key: 'arrays', to: '/courses/data-structure/arrays', icon: Binary },
      { key: 'stacks', to: '/courses/data-structure/stacks', icon: Layers },
      { key: 'queues', to: '/courses/data-structure/queues', icon: Workflow },
      { key: 'linked-lists', to: '/courses/data-structure/linked-lists', icon: GitBranch },
      { key: 'sorting', to: '/courses/data-structure/sorting', icon: ListOrdered },
      { key: 'searching', to: '/courses/data-structure/searching', icon: Search },
      { key: 'graphs', to: '/courses/data-structure/graphs', icon: Network },
    ],
  },
  {
    key: 'advanced-data-structure',
    to: '/courses/advanced-data-structure',
    icon: GitBranch,
    children: [
      { key: 'trees', to: '/courses/advanced-data-structure/trees', icon: TreePine },
      { key: 'avl-tree', to: '/courses/advanced-data-structure/avl-tree', icon: TreePine },
      { key: 'red-black-tree', to: '/courses/advanced-data-structure/red-black-tree', icon: TreePine },
      { key: 'b-tree', to: '/courses/advanced-data-structure/b-tree', icon: TreePine },
    ],
  },
  {
    key: 'information-theory-compression',
    to: '/courses/information-theory-compression',
    icon: FileArchive,
    children: [
      { key: 'lossless-compression', to: '/courses/information-theory-compression/lossless', icon: FileArchive },
      { key: 'lossy-compression', to: '/courses/information-theory-compression/lossy', icon: Image },
    ],
  },
];

const TOOLS = [
  { key: 'practice', to: '/practice', icon: Trophy },
  { key: 'compare', to: '/compare', icon: Scale },
];

function SidebarLink({ to, label, icon: Icon, onNavigate, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={label}
      aria-label={label}
      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
    >
      <Icon size={17} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const t = useT();
  const handleNavigate = () => {
    if (window.matchMedia('(max-width: 1199px)').matches) onToggle();
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`} aria-label={t('nav.mainNavigation')}>
      <Link
        to="/"
        className="sidebar-brand"
        onClick={handleNavigate}
        title={t('nav.home')}
        aria-label={t('nav.homeLink')}
      >
        <img src={logo} alt="" className="sidebar-brand-logo" />
        <span className="sidebar-brand-copy">
          <strong>FCAI-CU</strong>
          <small>{t('nav.brandTagline')}</small>
        </span>
      </Link>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={onToggle}
        title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
        aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRight size={17} className="rtl-flip" /> : <ChevronLeft size={17} className="rtl-flip" />}
      </button>

      <nav className="sidebar-nav">
        <p className="sidebar-section-title">{t('nav.workspace')}</p>
        <SidebarLink
          to="/"
          label={t('nav.home')}
          icon={Home}
          onNavigate={handleNavigate}
          end
        />

        <p className="sidebar-section-title">{t('nav.courses')}</p>
        {COURSE_LINKS.map((course) => {
          const Icon = course.icon;
          return (
            <section className="sidebar-course" key={course.to}>
              <Link
                to={course.to}
                className="sidebar-course-heading"
                onClick={handleNavigate}
                title={t(`catalog:course.${course.key}.title`)}
                aria-label={t(`catalog:course.${course.key}.title`)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{t(`catalog:course.${course.key}.title`)}</span>
              </Link>
              <div className="sidebar-course-topics">
                {course.children.map((item) => (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={t(`catalog:topic.${item.key}.title`)}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <p className="sidebar-section-title">{t('nav.learningTools')}</p>
        {TOOLS.map((tool) => (
          <SidebarLink
            key={tool.to}
            to={tool.to}
            icon={tool.icon}
            label={t(`catalog:tool.${tool.key}.title`)}
            onNavigate={handleNavigate}
          />
        ))}

        <div className="sidebar-support-card">
          <div className="sidebar-support-icon"><Sparkles size={16} /></div>
          <strong>{t('sidebar.supportTitle')}</strong>
          <span>{t('sidebar.supportBody')}</span>
          <Link to="/practice" onClick={handleNavigate}>
            {t('sidebar.supportLink')} <Trophy size={14} />
          </Link>
        </div>
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-footer-mark"><BookOpen size={15} /></span>
        <span>{t('sidebar.faculty')}<br /><b>{t('sidebar.university')}</b></span>
        <span className="sidebar-footer-cu">CU</span>
      </div>
    </aside>
  );
}
