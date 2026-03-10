import { routing } from '@/i18n/routing';
import { scenarios } from '@/data/qa';

export function generateStaticParams() {
  return routing.locales.flatMap((lang) =>
    scenarios.map((s) => ({ lang, scenario: s.id }))
  );
}

type Props = { children: React.ReactNode };
export default function QALayout({ children }: Props) {
  return <>{children}</>;
}
