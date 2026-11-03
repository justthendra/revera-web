export default function robots() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://revera.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

