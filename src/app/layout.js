import './globals.css';

export const metadata = {
  title: 'GenAI Internship Platform',
  description: 'Validate your email for GenAI Internship Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* You can also define additional meta tags here */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Bootstrap CSS */}
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
