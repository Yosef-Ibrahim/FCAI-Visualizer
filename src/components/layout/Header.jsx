import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { useT } from '../../hooks/useT';
import LanguageSwitcher from './LanguageSwitcher';

const ROUTE_TITLE_KEYS = {
  '/': 'routes.home',
  '/courses/data-structure': 'routes.data-structure',
  '/courses/advanced-data-structure': 'routes.advanced-data-structure',
  '/courses/information-theory-compression': 'catalog:course.information-theory-compression.title',
  '/courses/information-theory-compression/lossless': 'catalog:topic.lossless-compression.title',
  '/courses/information-theory-compression/lossy': 'catalog:topic.lossy-compression.title',
  '/courses/data-structure/sorting': 'catalog:topic.sorting.title',
  '/courses/data-structure/searching': 'catalog:topic.searching.title',
  '/courses/data-structure/graphs': 'catalog:topic.graphs.title',
  '/courses/advanced-data-structure/trees': 'routes.course-trees',
  '/courses/advanced-data-structure/avl-tree': 'routes.course-avl-tree',
  '/courses/advanced-data-structure/red-black-tree': 'routes.course-red-black-tree',
  '/courses/advanced-data-structure/b-tree': 'catalog:topic.b-tree.title',
  '/sorting': 'routes.sorting',
  '/searching': 'routes.searching',
  '/data-structures': 'routes.data-structures',
  '/trees': 'routes.trees',
  '/graphs': 'routes.graphs',
  '/practice': 'routes.practice',
  '/compare': 'routes.compare',
};

// Route slugs resolvable via the algorithm/catalog/data-structure namespaces.
const ALGORITHM_SLUGS = new Set([
  'bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'counting', 'radix',
  'linear-search', 'binary-search', 'jump-search',
  'bst', 'avl', 'rbt',
  'bfs', 'dfs', 'dijkstra', 'prim', 'kruskal',
]);
const TOPIC_SLUGS = new Set(['arrays', 'stacks', 'queues', 'linked-lists']);
const DS_TYPE_KEYS = {
  'array': 'types.array.label',
  'stack': 'types.stack.label',
  'queue': 'types.queue.label',
  'singly-ll': 'types.singly.label',
  'doubly-ll': 'types.doubly.label',
  'circular-ll': 'types.circular.label',
  'ordered-ll': 'types.ordered.label',
};

/** Localized page title from the current route; falls back to the 404 title. */
function resolveTitle(pathname, t) {
  if (ROUTE_TITLE_KEYS[pathname]) return t(ROUTE_TITLE_KEYS[pathname]);
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return 'FCAI-Visualizer';
  const slug = parts[parts.length - 1];
  if (ALGORITHM_SLUGS.has(slug)) return t(`algorithms:${slug}.name`);
  if (TOPIC_SLUGS.has(slug)) return t(`catalog:topic.${slug}.title`);
  if (DS_TYPE_KEYS[slug]) return t(`dataStructures:${DS_TYPE_KEYS[slug]}`);
  return t('notFound.title');
}

export default function Header({ onToggleSidebar, theme, onToggleTheme }) {
  const location = useLocation();
  const t = useT();
  const title = resolveTitle(location.pathname, t);

  // Keep the browser tab aligned with the localized header title.
  useEffect(() => {
    document.title = `${title} · FCAI-Visualizer`;
  }, [title]);

  return (
    <header className="app-header">
      <button
        onClick={onToggleSidebar}
        className="icon-button mobile-menu-button"
        title={t('header.toggleNav')}
        aria-label={t('header.toggleNav')}
      >
        <Menu size={19} />
      </button>

      <div className="header-title-group">
        <p className="header-eyebrow">{t('header.eyebrow')}</p>
        <div className="header-title">{title}</div>
      </div>

      <LanguageSwitcher />

      <button
        onClick={onToggleTheme}
        className="theme-toggle"
        aria-label={t('header.switchTheme', {
          mode: t(theme === 'dark' ? 'theme.light' : 'theme.dark'),
        })}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        <span>{t('theme.modeLabel', { name: t(theme === 'dark' ? 'theme.light' : 'theme.dark') })}</span>
      </button>
      <Link className="header-help-link" to="/practice">{t('header.startLearning')}</Link>
    </header>
  );
}
