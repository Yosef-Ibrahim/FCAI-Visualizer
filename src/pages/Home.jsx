import { ArrowRight, Brain, GitCompareArrows, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/shared/CourseCard';
import {
  advancedDataStructureCourse,
  algorithmDesignCourse,
  dataStructureCourse,
  informationTheoryCourse,
} from '../data/courses';
import { useT } from '../hooks/useT';
import '../styles/CourseCatalog.css';

const TOOLS = [
  { id: 'practice', route: '/practice', icon: Brain, color: 'violet' },
  { id: 'compare', route: '/compare', icon: GitCompareArrows, color: 'green' },
];

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
        <div className="home-hero-visual" aria-hidden="true">
          <div className="hero-grid-mark" />
          <div className="hero-node hero-node--root">DS</div>
          <div className="hero-node hero-node--left">A</div>
          <div className="hero-node hero-node--right">AI</div>
          <div className="hero-node hero-node--bottom">FCAI</div>
          <span className="hero-connection hero-connection--left" />
          <span className="hero-connection hero-connection--right" />
          <span className="hero-connection hero-connection--bottom" />
          <span className="hero-orbit hero-orbit--one" />
          <span className="hero-orbit hero-orbit--two" />
          <span className="hero-visual-label">{t('home:hero.label')}</span>
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
