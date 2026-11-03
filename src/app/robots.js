function getSafeBaseUrl() {
  const raw =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://revera-web.vercel.app');
  let clean = String(raw).trim();
  if (clean.startsWith('https//')) clean = 'https://' + clean.slice(7);
  else if (clean.startsWith('http//')) clean = 'http://' + clean.slice(6);
  else if (!clean.startsWith('http://') && !clean.startsWith('https://')) clean = 'https://' + clean;
  return clean.replace(/\/$/, '');
}

export default function robots() {
  const baseUrl = getSafeBaseUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

