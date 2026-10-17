import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

// Значения по умолчанию для всего сайта
const DEFAULT_TITLE = "karbyd — мини-социальная сеть";
const DEFAULT_DESCRIPTION =
  "Общайся, делись фотографиями и находи новых друзей в karbyd.";
const DEFAULT_IMAGE = "https://karbyd.vercel.app/og-image.png";
const BASE_URL = "https://karbyd.vercel.app";

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = "website",
}: SEOProps) {
  return (
    <Helmet>
      {/* Базовые теги для поисковиков */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph (Telegram, VK, WhatsApp, Facebook) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="karbyd" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
