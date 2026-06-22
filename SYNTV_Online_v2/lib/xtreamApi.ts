import axios from 'axios';
import {
  XtreamAuthResponse, XtreamCategory, XtreamStream, XtreamSeries, XtreamEpisode,
} from '../types';

function buildClient(serverUrl: string, username: string, password: string) {
  const base = serverUrl.replace(/\/+$/, '');
  return {
    playerApi: `${base}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    liveUrl: `${base}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}`,
    seriesUrl: `${base}/series/${encodeURIComponent(username)}/${encodeURIComponent(password)}`,
  };
}

export async function testXtreamConnection(
  serverUrl: string, username: string, password: string
): Promise<XtreamAuthResponse> {
  const { playerApi } = buildClient(serverUrl, username, password);
  const { data } = await axios.get(playerApi, { timeout: 15000 });
  if (!data || data.user_info?.auth !== 1) {
    throw new Error(data?.user_info?.message || 'Invalid Xtream Codes credentials');
  }
  return data;
}

export async function fetchLiveCategories(
  serverUrl: string, username: string, password: string
): Promise<XtreamCategory[]> {
  const { playerApi } = buildClient(serverUrl, username, password);
  const { data } = await axios.get(`${playerApi}&action=get_live_categories`, { timeout: 15000 });
  return data || [];
}

export async function fetchLiveStreams(
  serverUrl: string, username: string, password: string
): Promise<XtreamStream[]> {
  const { playerApi, liveUrl } = buildClient(serverUrl, username, password);
  const { data } = await axios.get(`${playerApi}&action=get_live_streams`, { timeout: 30000 });
  return (data || []).map((s: XtreamStream) => ({
    ...s,
    stream_url: (s as any).stream_url || `${liveUrl}/${s.stream_id}.m3u8`,
  }));
}

export async function fetchVodCategories(
  serverUrl: string, username: string, password: string
): Promise<XtreamCategory[]> {
  const { playerApi } = buildClient(serverUrl, username, password);
  const { data } = await axios.get(`${playerApi}&action=get_vod_categories`, { timeout: 15000 });
  return data || [];
}

export async function fetchVodStreams(
  serverUrl: string, username: string, password: string
): Promise<any[]> {
  const { playerApi } = buildClient(serverUrl, username, password);
  const { data } = await axios.get(`${playerApi}&action=get_vod_streams`, { timeout: 30000 });
  return data || [];
}

export async function fetchSeriesCategories(
  serverUrl: string, username: string, password: string
): Promise<XtreamCategory[]> {
  const { playerApi } = buildClient(serverUrl, username, password);
  const { data } = await axios.get(`${playerApi}&action=get_series_categories`, { timeout: 15000 });
  return data || [];
}

export async function fetchSeriesList(
  serverUrl: string, username: string, password: string
): Promise<XtreamSeries[]> {
  const { playerApi } = buildClient(serverUrl, username, password);
  const { data } = await axios.get(`${playerApi}&action=get_series`, { timeout: 30000 });
  return data || [];
}

export async function fetchSeriesInfo(
  serverUrl: string, username: string, password: string, seriesId: number
): Promise<{ seasons: { season_number: number; episodes: XtreamEpisode[] }[] }> {
  const { playerApi } = buildClient(serverUrl, username, password);
  const { data } = await axios.get(
    `${playerApi}&action=get_series_info&series_id=${seriesId}`, { timeout: 15000 }
  );
  return data?.episodes || { seasons: [] };
}

export function buildXtreamStreamUrl(
  serverUrl: string, username: string, password: string, streamId: number, type: 'live' | 'series' = 'live'
): string {
  const base = serverUrl.replace(/\/+$/, '');
  if (type === 'series') {
    return `${base}/series/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.m3u8`;
  }
  return `${base}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.m3u8`;
}
