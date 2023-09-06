import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }
  render() {
    return (
      <Html>
        <Head>
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
          />
        <script
        dangerouslySetInnerHTML={{
          __html: `history.scrollRestoration = "manual"`,
        }}
      />
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@100;400;600&family=Inter:wght@400;600;700&family=Playball&family=Playfair+Display:wght@400;600;900&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
        </Head>
        <body className="overflow-x-hidden">
          <Main />
          <NextScript />
          <div id="modal-root">
          </div>
        </body>
      </Html>
    )
  }
}

export default MyDocument
