import { Helmet } from 'react-helmet-async';
import { env } from '@/lib/env';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: 'website' | 'article';
}

const DEFAULT_DESCRIPTION =
  'Launch and trade memecoins on Solana with Meteora Dynamic Bonding Curves.';

/**
 * Per-page meta tags. Mount inside any route to override the document title
 * and OpenGraph/Twitter card image — used on the token detail page so shares
 * show the token's image and name.
 */
export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = 'website',
}: SeoProps): JSX.Element {
  const fullTitle = title ? `${title} · ${env.platformName}` : env.platformName;
  const safeImage = image || undefined;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {url ? <link rel="canonical" href={url} /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {safeImage ? <meta property="og:image" content={safeImage} /> : null}
      {url ? <meta property="og:url" content={url} /> : null}
      <meta property="og:site_name" content={env.platformName} />

      <meta name="twitter:card" content={safeImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {safeImage ? <meta name="twitter:image" content={safeImage} /> : null}
    </Helmet>
  );
}
