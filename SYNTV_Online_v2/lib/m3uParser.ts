import { ParsedChannel } from '../types';

const EXTINF_REGEX = /#EXTINF:(?:-?\d+(?:\.\d+)?)(?:\s+(.*?))?,(.*)/;
const ATTR_REGEX = /(\w+)="([^"]*)"/g;
const URL_REGEX = /^https?:\/\/.+/i;
const LINE_BREAK = /\r?\n/;

export function parseM3U(content: string): ParsedChannel[] {
  const lines = content.split(LINE_BREAK);
  const channels: ParsedChannel[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line.startsWith('#EXTINF:')) continue;

    const match = line.match(EXTINF_REGEX);
    if (!match) continue;

    const attrsStr = match[1] || '';
    const channelName = match[2]?.trim() || 'Unknown';

    const attrs: Record<string, string> = {};
    let attrMatch: RegExpExecArray | null;
    const attrRegex = new RegExp(ATTR_REGEX);
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      attrs[attrMatch[1].toLowerCase()] = attrMatch[2];
    }

    const streamUrl = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
    if (!URL_REGEX.test(streamUrl)) continue;

    const dedupKey = `${channelName}|${streamUrl}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    const category = attrs['group-title'] || attrs['group-title'] || '';
    const parsed: ParsedChannel = {
      name: attrs['tvg-name'] || channelName,
      streamUrl,
      tvgId: attrs['tvg-id'] || undefined,
      tvgName: attrs['tvg-name'] || undefined,
      tvgLogo: attrs['tvg-logo'] || attrs['tvg-logo'] || undefined,
      groupTitle: category,
      category: category || 'Uncategorized',
      country: attrs['country'] || undefined,
      language: attrs['language'] || undefined,
    };

    channels.push(parsed);
  }

  return channels;
}

export function extractCategories(channels: ParsedChannel[]): string[] {
  const cats = new Set<string>();
  channels.forEach((ch) => {
    if (ch.category) cats.add(ch.category);
  });
  return Array.from(cats).sort();
}

export function countChannelsByCategory(channels: ParsedChannel[]): Record<string, number> {
  const counts: Record<string, number> = {};
  channels.forEach((ch) => {
    const cat = ch.category || 'Uncategorized';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return counts;
}
