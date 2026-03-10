'use client';
import dynamic from 'next/dynamic';
import type { Lang, Scenario } from '@/types';

const QAStudySession = dynamic(() => import('./QAStudySession'), { ssr: false });

interface Props {
  lang: Lang;
  scenario: Scenario;
}

export default function QAStudySessionNoSSR(props: Props) {
  return <QAStudySession {...props} />;
}
