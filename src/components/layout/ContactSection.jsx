import { useEffect, useId, useRef, useState } from 'react';
import {
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  Mail,
  Users,
  X,
} from 'lucide-react';
import { CONTACT_EMAIL, CREATORS, SOURCE_URL } from '../../data/creators';
import { useT } from '../../hooks/useT';
import './ContactSection.css';

export default function ContactSection() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="contact-dock-root" ref={rootRef}>
      {open && (
        <section
          id={dialogId}
          className="contact-about-card"
          role="dialog"
          aria-labelledby={`${dialogId}-title`}
        >
          <header className="contact-about-head">
            <div>
              <h2 id={`${dialogId}-title`} className="contact-about-title">
                {t('contact.teamTitle')}
              </h2>
              <p className="contact-about-sub">{t('contact.teamSubtitle')}</p>
            </div>
            <button
              type="button"
              className="contact-about-close"
              onClick={() => {
                setOpen(false);
                toggleBtnRef.current?.focus();
              }}
              aria-label={t('contact.closeAbout')}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <ul className="contact-creator-list">
            {CREATORS.map((creator) => (
              <li key={creator.id} className="contact-creator-row">
                <span
                  className={`contact-creator-avatar contact-creator-avatar--${creator.accent}`}
                  aria-hidden="true"
                >
                  {creator.initials}
                </span>

                <div className="contact-creator-info">
                  <strong className="contact-creator-name">{creator.name}</strong>
                  <span className="contact-creator-role">{t(creator.roleKey)}</span>
                </div>

                <div className="contact-creator-actions">
                  {creator.email && (
                    <a
                      className="contact-creator-icon-btn"
                      href={`mailto:${creator.email}`}
                      aria-label={t('contact.emailCreator', { name: creator.name })}
                      title={t('contact.email')}
                    >
                      <Mail size={14} aria-hidden="true" />
                    </a>
                  )}
                  <a
                    className="contact-creator-linkedin"
                    href={creator.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('contact.linkedinCreator', { name: creator.name })}
                  >
                    <BriefcaseBusiness size={13} aria-hidden="true" />
                    <span>{t('contact.linkedin')}</span>
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </div>
              </li>
            ))}
          </ul>

          <footer className="contact-about-footer">
            <a
              className="contact-about-repo"
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code2 size={14} aria-hidden="true" />
              <span>{t('contact.sourceAction')}</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </footer>
        </section>
      )}

      <nav className="contact-dock" aria-label={t('contact.title')}>
        <button
          ref={toggleBtnRef}
          type="button"
          className={`contact-dock-link${open ? ' is-active' : ''}`}
          aria-expanded={open}
          aria-controls={dialogId}
          aria-label={t('contact.aboutLabel')}
          data-tooltip={open ? undefined : t('contact.about')}
          onClick={() => setOpen((prev) => !prev)}
        >
          <Users size={18} aria-hidden="true" />
        </button>

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
      </nav>
    </div>
  );
}
