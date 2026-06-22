const URL_REGEX = /^https?:\/\/.+\..+/i;
const M3U_REGEX = /\.m3u(?:8)?$/i;
const XML_REGEX = /\.xml$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url.trim());
}

export function isValidM3uUrl(url: string): boolean {
  return isValidUrl(url) && M3U_REGEX.test(url);
}

export function isValidEpgUrl(url: string): boolean {
  return isValidUrl(url) && XML_REGEX.test(url);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

export function isValidXtreamUrl(url: string): boolean {
  return isValidUrl(url);
}

export function isValidPort(port: string): boolean {
  const num = parseInt(port, 10);
  return Number.isInteger(num) && num > 0 && num <= 65535;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
}

export function validatePlaylistForm(data: {
  name?: string;
  url?: string;
  epgUrl?: string;
  serverUrl?: string;
  username?: string;
  password?: string;
  type: 'm3u' | 'xtream';
}): string | null {
  if (!data.name?.trim()) return 'Playlist name is required';

  if (data.type === 'm3u') {
    if (!data.url?.trim()) return 'M3U URL is required';
    if (!isValidUrl(data.url)) return 'Invalid M3U URL format';
    if (data.epgUrl && !isValidUrl(data.epgUrl)) return 'Invalid EPG URL format';
  } else {
    if (!data.serverUrl?.trim()) return 'Server URL is required';
    if (!isValidUrl(data.serverUrl)) return 'Invalid server URL format';
    if (!data.username?.trim()) return 'Username is required';
    if (!data.password?.trim()) return 'Password is required';
  }

  return null;
}

export function validateAuthForm(data: {
  email?: string;
  password?: string;
  name?: string;
}): string | null {
  if (!data.email?.trim()) return 'Email is required';
  if (!isValidEmail(data.email)) return 'Invalid email format';
  if (!data.password?.trim()) return 'Password is required';
  if (!isValidPassword(data.password)) return 'Password must be at least 6 characters';
  if (data.name !== undefined && !isValidName(data.name)) return 'Name must be at least 2 characters';
  return null;
}
