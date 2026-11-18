// The <html> shell shared by the two root layouts: (home)/layout.tsx and
// [lang]/layout.tsx. Each passes its document language, so /it and /es pages
// declare it in the static HTML.
import './globals.css';
import pkg from '../../package.json';

export default function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Crimson+Text:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <footer>{`v${pkg.version}`}</footer>
      </body>
    </html>
  );
}
