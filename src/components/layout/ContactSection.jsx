import { BriefcaseBusiness, Mail, ExternalLink, Code2 } from 'lucide-react';
import { useT } from '../../hooks/useT';
import './ContactSection.css';

const SOURCE_URL = 'https://github.com/Yosef-Ibrahim/FCAI-Visualizer';
const LINKEDIN_URL = 'https://www.linkedin.com/in/youssef-ibrahim-mohamed-48b068333/';
const CONTACT_EMAIL = 'youssefibrahimelisely@gmail.com';

export default function ContactSection() {
  const t = useT();

  return (
    <footer className="contact-section" aria-labelledby="contact-title">
      <div className="contact-section-inner">
        <div className="contact-copy">
          <span className="contact-eyebrow">{t('contact.eyebrow')}</span>
          <h2 id="contact-title">{t('contact.title')}</h2>
          <p>{t('contact.description')}</p>
        </div>

        <div className="contact-links">
          <a
            className="contact-link"
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label={t('contact.emailLabel')}
          >
            <span className="contact-link-icon"><Mail size={19} /></span>
            <span className="contact-link-copy">
              <small>{t('contact.email')}</small>
              <strong>{CONTACT_EMAIL}</strong>
            </span>
          </a>

          <a
            className="contact-link"
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('contact.sourceLabel')}
          >
            <span className="contact-link-icon"><Code2 size={19} /></span>
            <span className="contact-link-copy">
              <small>{t('contact.source')}</small>
              <strong>{t('contact.sourceAction')}</strong>
            </span>
            <ExternalLink className="contact-external-icon" size={15} />
          </a>

          <a
            className="contact-link"
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('contact.linkedinLabel')}
          >
            <span className="contact-link-icon"><BriefcaseBusiness size={19} /></span>
            <span className="contact-link-copy">
              <small>{t('contact.linkedin')}</small>
              <strong>{t('contact.linkedinAction')}</strong>
            </span>
            <ExternalLink className="contact-external-icon" size={15} />
          </a>
        </div>

        <div className="contact-bottom">
          <span>FCAI-Visualizer</span>
          <span>{t('contact.madeBy')}</span>
        </div>
      </div>
    </footer>
  );
}
