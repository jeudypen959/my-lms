import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Import Google Fonts with multiple font families and weights */}
          <link
            href="https://fonts.googleapis.com/css2?family=Acme:wght@100;200;400;600&family=Crimson+Pro:wght@100;200;300;400;600&family=Carter+One&family=Yrsa:wght@100;200;300;400;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
