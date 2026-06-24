import type { Channel } from "@/data/channels";

export type BrokenChannelIssue = "not-playing" | "wrong-channel" | "buffering" | "audio" | "other";

export type BrokenChannelReport = {
  id: string;
  channelId: string;
  channelName: string;
  issue: BrokenChannelIssue;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = "syntv_broken_channel_reports";

function readReports(): BrokenChannelReport[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBrokenChannelReport(channel: Channel, issue: BrokenChannelIssue, message: string) {
  const report: BrokenChannelReport = {
    id: `report-${Date.now()}`,
    channelId: channel.id,
    channelName: channel.name,
    issue,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };

  const reports = [report, ...readReports()].slice(0, 100);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return report;
}

export function getBrokenChannelReports() {
  return readReports();
}
