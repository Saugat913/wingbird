import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, ViteClient } from 'vite-ssr-components/hono'

export const renderer = jsxRenderer(({ children, title, description }) => {
  const pageTitle = title || "Wingbird — Open-Source Code Patching & Hot-Fix Platform for Flutter";
  const pageDesc = description || "Wingbird gives your Flutter app a second chance. Patch bugs live in production with instant binary diffing (bsdiff) — no app store reviews, no waiting queue, no resubmission needed.";
  const siteUrl = "https://wingbird.dev";
  const ogImage = `${siteUrl}/logo.svg`;

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.svg" />

        <title>{pageTitle}</title>
        <meta name="title" content={pageTitle} />
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content="Flutter hot-fix, code patching, bsdiff, Flutter patches, OTA update Flutter, release tracking, open source Flutter, app store review bypass, Dart patch" />
        <meta name="author" content="Wingbird Team" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={siteUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Wingbird" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={ogImage} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Wingbird",
              "operatingSystem": "Android, iOS",
              "applicationCategory": "DeveloperApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": pageDesc,
              "url": siteUrl,
              "softwareRequirements": "Flutter SDK, Android Studio",
              "author": {
                "@type": "Organization",
                "name": "Wingbird",
                "url": "https://github.com/Saugat913/wingbird"
              }
            }),
          }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <ViteClient />
        <Link href="/src/ui/main.css" rel="stylesheet" />
      </head>
      <body class="bg-white text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  )
})
