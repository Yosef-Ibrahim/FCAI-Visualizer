import { useState } from 'react';
import {
  ArrowRight,
  Binary,
  Brain,
  Cpu,
  GitBranch,
  GitCompareArrows,
  Grid3x3,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/shared/CourseCard';
import {
  advancedDataStructureCourse,
  algorithmDesignCourse,
  dataStructureCourse,
  informationTheoryCourse,
  operatingSystemsCourse,
} from '../data/courses';
import { useT } from '../hooks/useT';
import '../styles/CourseCatalog.css';

const TOOLS = [
  { id: 'practice', route: '/practice', icon: Brain, color: 'violet' },
  { id: 'compare', route: '/compare', icon: GitCompareArrows, color: 'green' },
];

const PREVIEWS = [
  { id: 'data-structure', icon: Layers, stat: 'n = 7', meta: 'O(n log n)' },
  { id: 'advanced-data-structure', icon: GitBranch, stat: 'h = 3', meta: 'O(log n)' },
  { id: 'algorithms', icon: Grid3x3, stat: 'n × W', meta: 'O(nW)' },
  { id: 'operating-systems', icon: Cpu, stat: 'P1–P4', meta: 'O(n)' },
  { id: 'information-theory-compression', icon: Binary, stat: '0 1 0 1', meta: '38%' },
];

function SortingPreview() {
  return (
    <div className="pv-bars">
      {[44, 66, 36, 82, 58, 72, 30].map((height, index) => (
        <span key={`${height}-${index}`} style={{ '--h': `${height}%`, '--i': index }} />
      ))}
    </div>
  );
}

function TreePreview() {
  const nodes = [
    [110, 24, 8, 'root'],
    [58, 66, 4, ''],
    [162, 66, 12, ''],
    [30, 104, 2, ''],
    [86, 104, 6, ''],
    [134, 104, 10, ''],
    [190, 104, 14, ''],
  ];
  return (
    <svg className="pv-tree" viewBox="0 0 220 128" aria-hidden="true">
      <circle className="pv-tree-halo" cx="110" cy="24" r="18" />
      <path d="M110 24 L58 66 M110 24 L162 66 M58 66 L30 104 M58 66 L86 104 M162 66 L134 104 M162 66 L190 104" />
      {nodes.map(([cx, cy, value, className], index) => (
        <g
          key={value}
          className={`pv-tree-node${className ? ` pv-tree-node--${className}` : ''}`}
          style={{ '--i': index }}
        >
          <circle cx={cx} cy={cy} r="12" />
          <text x={cx} y={cy} dominantBaseline="central" textAnchor="middle">{value}</text>
        </g>
      ))}
    </svg>
  );
}

function GridPreview() {
  return (
    <div className="pv-cells">
      {Array.from({ length: 24 }, (_, index) => (
        <span key={index} style={{ '--i': index }} />
      ))}
    </div>
  );
}

function GanttPreview() {
  const blocks = [
    { grow: 34, color: 'var(--accent)' },
    { grow: 22, color: 'var(--accent3)' },
    { grow: 28, color: 'var(--accent4)' },
    { grow: 16, color: 'var(--accent2)' },
  ];
  return (
    <div className="pv-gantt">
      {blocks.map((block, index) => (
        <span
          key={block.color}
          style={{ '--w': block.grow, '--c': block.color, '--i': index }}
        />
      ))}
      <i className="pv-playhead" />
    </div>
  );
}

function CompressionPreview() {
  const bits = ['1', '0', '1', '1', '0', '1', '0', '0', '1', '0', '1', '1', '0', '1'];
  return (
    <div className="pv-compress">
      <div className="pv-bits">
        {bits.map((bit, index) => (
          <span key={`${bit}-${index}`} style={{ '--i': index }}>{bit}</span>
        ))}
      </div>
      <div className="pv-meter"><span /></div>
    </div>
  );
}

function SubjectPreview({ id }) {
  if (id === 'advanced-data-structure') return <TreePreview />;
  if (id === 'algorithms') return <GridPreview />;
  if (id === 'operating-systems') return <GanttPreview />;
  if (id === 'information-theory-compression') return <CompressionPreview />;
  return <SortingPreview />;
}

function LearningToolCard({ tool }) {
  const t = useT();
  const Icon = tool.icon;

  return (
    <Link to={tool.route} className={`learning-tool-card learning-tool-card--${tool.color}`}>
      <span className="learning-tool-icon"><Icon size={21} /></span>
      <span className="learning-tool-copy">
        <strong>{t(`catalog:tool.${tool.id}.title`)}</strong>
        <span>{t(`catalog:tool.${tool.id}.description`)}</span>
      </span>
      <span className="learning-tool-action">
        {t(`catalog:tool.${tool.id}.action`)} <ArrowRight size={14} className="rtl-flip" />
      </span>
    </Link>
  );
}

export default function Home() {
  const t = useT();
  const [preview, setPreview] = useState(PREVIEWS[0].id);
  const activePreview = PREVIEWS.find((item) => item.id === preview) ?? PREVIEWS[0];

  return (
    <div className="home-page page animate-in">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-kicker"><Sparkles size={14} /> {t('home:hero.kicker')}</span>
          <h1>{t('home:hero.titleLine1')}<br /><span>{t('home:hero.titleLine2')}</span></h1>
          <p>{t('home:hero.subtitle')}</p>
          <Link className="home-primary-link" to="/courses/data-structure">
            {t('home:hero.cta')} <ArrowRight size={17} className="rtl-flip" />
          </Link>
          <div className="home-proof-points">
            <span><i /> {t('home:hero.proof1')}</span>
            <span><i /> {t('home:hero.proof2')}</span>
          </div>
        </div>

        <div className="home-hero-visual">
          <span className="hero-aurora hero-aurora--one" aria-hidden="true" />
          <span className="hero-aurora hero-aurora--two" aria-hidden="true" />

          <div className="hero-stage">
            <div className="hero-stage-head">
              <span className="hero-stage-dot" aria-hidden="true" />
              <span className="hero-stage-dot" aria-hidden="true" />
              <span className="hero-stage-dot" aria-hidden="true" />
              <span className="hero-stage-title" aria-live="polite">
                {t(`home:hero.previews.${activePreview.id}`)}
              </span>
            </div>
            <div className="hero-stage-body" key={preview} aria-hidden="true">
              <SubjectPreview id={preview} />
            </div>
            <div className="hero-stage-foot" aria-hidden="true">
              <span>{activePreview.stat}</span>
              <span>{activePreview.meta}</span>
            </div>
          </div>

          <div className="hero-prints" role="group" aria-label={t('home:hero.previewsLabel')}>
            {PREVIEWS.map((item) => {
              const Icon = item.icon;
              const label = t(`home:hero.previews.${item.id}`);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`hero-print${preview === item.id ? ' is-active' : ''}`}
                  onClick={() => setPreview(item.id)}
                  aria-pressed={preview === item.id}
                  aria-label={label}
                  title={label}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-courses" aria-labelledby="home-courses-title">
        <div className="home-section-heading">
          <div>
            <span className="section-eyebrow">{t('home:courses.eyebrow')}</span>
            <h2 id="home-courses-title">{t('home:courses.title')}</h2>
          </div>
          <p>{t('home:courses.subtitle')}</p>
        </div>
        <div className="course-card-grid">
          <CourseCard course={dataStructureCourse} to="/courses/data-structure" />
          <CourseCard course={advancedDataStructureCourse} to="/courses/advanced-data-structure" />
          <CourseCard course={algorithmDesignCourse} to="/courses/algorithms" />
          <CourseCard course={operatingSystemsCourse} to="/courses/operating-systems" />
          <CourseCard course={informationTheoryCourse} to="/courses/information-theory-compression" />
        </div>
      </section>

      <section className="home-tools" aria-labelledby="home-tools-title">
        <div className="home-section-heading home-section-heading--compact">
          <div>
            <span className="section-eyebrow">{t('home:tools.eyebrow')}</span>
            <h2 id="home-tools-title">{t('home:tools.title')}</h2>
          </div>
        </div>
        <div className="learning-tools-grid">
          {TOOLS.map((tool) => <LearningToolCard key={tool.id} tool={tool} />)}
        </div>
      </section>

      <footer className="home-footer">
        <span>FCAI-CU</span>
        <span>{t('home:footer.faculty')}</span>
      </footer>
    </div>
  );
}
