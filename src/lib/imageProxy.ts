export function getProxyUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.includes('pub-4b1522a337474571adb7aefec13e7526.r2.dev') && !url.startsWith('/_next/image')) {
    return `/_next/image?url=${encodeURIComponent(url)}&w=1080&q=75`;
  }
  return url;
}
