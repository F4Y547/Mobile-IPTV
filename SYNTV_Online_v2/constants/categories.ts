export interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  gradient: readonly [string, string];
}

export const CATEGORIES: CategoryDef[] = [
  { id: '1', name: 'Sports', icon: 'trophy', gradient: ['#00AEEF', '#7C3AED'] as const },
  { id: '2', name: 'News', icon: 'newspaper', gradient: ['#22C55E', '#059669'] as const },
  { id: '3', name: 'Movies', icon: 'film', gradient: ['#7C3AED', '#EF4444'] as const },
  { id: '4', name: 'Kids', icon: 'happy', gradient: ['#F59E0B', '#F97316'] as const },
  { id: '5', name: 'Entertainment', icon: 'tv', gradient: ['#EC4899', '#7C3AED'] as const },
  { id: '6', name: 'Music', icon: 'musical-notes', gradient: ['#00AEEF', '#22C55E'] as const },
  { id: '7', name: 'Religious', icon: 'rose', gradient: ['#F59E0B', '#D97706'] as const },
  { id: '8', name: 'Documentary', icon: 'videocam', gradient: ['#64748B', '#475569'] as const },
];
