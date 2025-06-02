import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes'; // ✅ Import ThemeProvider
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Dynamically load Google Fonts with multiple weights
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Acme:wght@100;200;300;400;600&family=Crimson+Pro:wght@100;200;300;400;600&family=Carter+One:wght@400&family=Athiti:wght@100;200;300;400;600&family=Livvic:wght@100;200;300;400;600&family=Darker+Grotesque:wght@100;200;300;400;600&family=Gupter:wght@100;200;300;400;600&family=Glegoo:wght@100;200;300;400;600&family=Yrsa:wght@100;200;300;400;600&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system"> {/* ✅ Enable theme switching */}
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
