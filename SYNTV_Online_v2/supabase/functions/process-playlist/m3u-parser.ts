export interface ParsedChannel {
  name: string;
  streamUrl: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  groupTitle?: string;
  category?: string;
  country?: string;
  language?: string;
}

export function parseM3U(content: string): ParsedChannel[] {
  const channels: ParsedChannel[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('#EXTINF:')) continue;

    const infoLine = line;
    const urlLine = i + 1 < lines.length ? lines[i + 1].trim() : '';

    if (!urlLine || urlLine.startsWith('#')) continue;

    const name = extractName(infoLine);
    const tvgId = extractAttribute(infoLine, 'tvg-id');
    const tvgName = extractAttribute(infoLine, 'tvg-name');
    const tvgLogo = extractAttribute(infoLine, 'tvg-logo');
    const groupTitle = extractAttribute(infoLine, 'group-title');

    const category = groupTitle || 'Uncategorized';

    channels.push({
      name,
      streamUrl: urlLine,
      tvgId: tvgId || undefined,
      tvgName: tvgName || undefined,
      tvgLogo: tvgLogo || undefined,
      groupTitle: groupTitle || undefined,
      category,
    });
  }

  return channels;
}

export function extractCategories(channels: ParsedChannel[]): string[] {
  const cats = new Set<string>();
  channels.forEach((c) => {
    if (c.category) cats.add(c.category);
  });
  return Array.from(cats).sort();
}

export function countChannelsByCategory(channels: ParsedChannel[]): Record<string, number> {
  const counts: Record<string, number> = {};
  channels.forEach((c) => {
    const cat = c.category || 'Uncategorized';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return counts;
}

function extractName(infoLine: string): string {
  const parts = infoLine.split(',');
  return parts.length > 1 ? parts.slice(1).join(',').trim() : 'Unknown';
}

function extractAttribute(line: string, attr: string): string | null {
  const regex = new RegExp(`${attr}="([^"]*)"`, 'i');
  const match = line.match(regex);
  return match ? match[1] : null;
}
