import { Mail, Code2, BriefcaseBusiness } from 'lucide-react';
import { useT } from '../../hooks/useT';
import './ContactSection.css';

const SOURCE_URL = 'https://github.com/Yosef-Ibrahim/FCAI-Visualizer';
const LINKEDIN_URL = 'https://www.linkedin.com/in/youssef-ibrahim-mohamed-48b068333/';
const CONTACT_EMAIL = 'youssefibrahimelisely@gmail.com';

export default function ContactSection() {
  const t = useT();

  return (
    <nav className="contact-dock" aria-label={t('contact.title')}>
      <a
        className="contact-dock-link"
        href={SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('contact.sourceLabel')}
        data-tooltip={t('contact.source')}
      >
        <Code2 size={18} aria-hidden="true" />
      </a>
      <a
        className="contact-dock-link"
        href={`mailto:${CONTACT_EMAIL}`}
        aria-label={t('contact.emailLabel')}
        data-tooltip={t('contact.email')}
      >
        <Mail size={18} aria-hidden="true" />
      </a>
      <a
        className="contact-dock-link"
        href={LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('contact.linkedinLabel')}
        data-tooltip={t('contact.linkedin')}
      >
        <BriefcaseBusiness size={18} aria-hidden="true" />
      </a>
    </nav>
  );
}
