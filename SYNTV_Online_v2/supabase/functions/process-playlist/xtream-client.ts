export class XtreamClient {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(serverUrl: string, username: string, password: string) {
    this.baseUrl = serverUrl.replace(/\/+$/, '');
    this.username = encodeURIComponent(username);
    this.password = encodeURIComponent(password);
  }

  private async fetch(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=${endpoint}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'SYNTV-Online/2.0' },
    });

    if (!response.ok) {
      throw new Error(`Xtream API error: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async authenticate(): Promise<boolean> {
    try {
      const data = await this.fetch('');
      return data?.user_info?.auth === 1;
    } catch {
      return false;
    }
  }

  async getLiveCategories(): Promise<any[]> {
    const data = await this.fetch('get_live_categories');
    return data || [];
  }

  async getLiveStreams(): Promise<any[]> {
    const data = await this.fetch('get_live_streams');
    return data || [];
  }

  async getVodCategories(): Promise<any[]> {
    const data = await this.fetch('get_vod_categories');
    return data || [];
  }

  async getVodStreams(): Promise<any[]> {
    const data = await this.fetch('get_vod_streams');
    return data || [];
  }

  async getSeries(): Promise<any[]> {
    const data = await this.fetch('get_series');
    return data || [];
  }

  async getSeriesInfo(seriesId: number): Promise<any> {
    return this.fetch(`get_series_info&series_id=${seriesId}`);
  }

  async getEpgChannels(): Promise<any[]> {
    const data = await this.fetch('get_all_channels');
    return data || [];
  }

  async getShortEpg(streamId: number, limit = 5): Promise<any[]> {
    const data = await this.fetch(`get_short_epg&stream_id=${streamId}&limit=${limit}`);
    return data?.epg_list || [];
  }
}
