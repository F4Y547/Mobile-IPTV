import { XMLParser } from 'fast-xml-parser';
import { EPGProgram } from '../types';

interface XmltvProgramme {
  '@_channel': string;
  '@_start': string;
  '@_stop': string;
  title?: { '#text'?: string } | string;
  sub_title?: any;
  desc?: { '#text'?: string } | string;
  category?: any;
  icon?: any;
}

interface XmltvChannel {
  '@_id': string;
  'display-name'?: { '#text'?: string } | string;
  icon?: any;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  isArray: (name: string) => ['programme', 'channel'].includes(name),
});

function normalizeText(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (val['#text']) return val['#text'];
  return '';
}

function parseXmltvDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const cleaned = dateStr.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*[+-].*$/, '$1-$2-$3T$4:$5:$6Z');
  if (cleaned !== dateStr) return cleaned;
  const parts = dateStr.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (parts) {
    return `${parts[1]}-${parts[2]}-${parts[3]}T${parts[4]}:${parts[5]}:${parts[6]}Z`;
  }
  return dateStr;
}

export function parseEPG(xmlContent: string): {
  channels: { tvgId: string; name: string }[];
  programs: EPGProgram[];
} {
  try {
    const json = parser.parse(xmlContent);
    const tv = json.tv || {};

    const xmlChannels: XmltvChannel[] = tv.channel || [];
    const channelMap: Record<string, string> = {};
    const channels = xmlChannels.map((ch) => {
      const tvgId = ch['@_id'] || '';
      const name = normalizeText(ch['display-name']) || tvgId;
      if (tvgId) channelMap[tvgId] = name;
      return { tvgId, name };
    });

    const programmes: XmltvProgramme[] = tv.programme || [];
    const programs: EPGProgram[] = programmes.map((prog, i) => ({
      id: `epg_${i}_${prog['@_channel'] || ''}`,
      channel_tvg_id: prog['@_channel'] || '',
      title: normalizeText(prog.title) || 'Unknown',
      description: normalizeText(prog.desc) || undefined,
      start_time: parseXmltvDate(prog['@_start'] || ''),
      end_time: parseXmltvDate(prog['@_stop'] || ''),
      category: typeof prog.category === 'string' ? prog.category : undefined,
    }));

    return { channels, programs };
  } catch {
    return { channels: [], programs: [] };
  }
}

export function getCurrentProgram(programs: EPGProgram[], tvgId: string): EPGProgram | undefined {
  const now = new Date();
  return programs.find((p) => {
    if (p.channel_tvg_id !== tvgId) return false;
    const start = new Date(p.start_time);
    const end = new Date(p.end_time);
    return now >= start && now <= end;
  });
}

export function getNextProgram(programs: EPGProgram[], tvgId: string): EPGProgram | undefined {
  const now = new Date();
  return programs
    .filter((p) => p.channel_tvg_id === tvgId && new Date(p.start_time) > now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];
}
