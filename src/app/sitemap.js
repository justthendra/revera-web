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

export default function sitemap() {
  const baseUrl = getSafeBaseUrl();
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}

