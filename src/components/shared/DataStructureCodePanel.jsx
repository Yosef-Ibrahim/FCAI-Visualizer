import CodePanel from './CodePanel';
import { codeSnippets } from '../../data/algorithmData';
import { useLang } from '../../hooks/useLang';

export default function DataStructureCodePanel({ structure }) {
  const [lang, setLang] = useLang();
  const snippets = codeSnippets[structure];
  if (!snippets) return null;

  const codeByLang = Object.fromEntries(
    Object.entries(snippets).map(([language, lines]) => [
      language,
      Array.isArray(lines) ? lines.join('\n') : lines,
    ]),
  );

  return (
    <CodePanel
      codeByLang={codeByLang}
      lang={lang}
      setLang={setLang}
    />
  );
}
