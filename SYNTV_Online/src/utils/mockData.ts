import { Channel, Movie, Series, Category, EPGProgram, OnboardingSlide } from '../types';

export const onboardingSlides: OnboardingSlide[] = [
  {
    title: 'Watch Your IPTV Anywhere',
    subtitle: 'Add your legal IPTV playlist and enjoy live TV on your phone.',
    image: '',
  },
  {
    title: 'Live TV, Movies & Series',
    subtitle: 'Browse channels, VOD, and series in one premium mobile app.',
    image: '',
  },
  {
    title: 'Smart TV Guide',
    subtitle: 'Follow live programs with EPG support and favorites.',
    image: '',
  },
];

export const categories: Category[] = [
  { id: '1', name: 'Sports', icon: 'trophy', channelCount: 45, gradient: ['#00AEEF', '#7C3AED'] as const },
  { id: '2', name: 'News', icon: 'newspaper', channelCount: 32, gradient: ['#22C55E', '#059669'] as const },
  { id: '3', name: 'Movies', icon: 'film', channelCount: 28, gradient: ['#7C3AED', '#EF4444'] as const },
  { id: '4', name: 'Kids', icon: 'happy', channelCount: 24, gradient: ['#F59E0B', '#F97316'] as const },
  { id: '5', name: 'Entertainment', icon: 'tv', channelCount: 38, gradient: ['#EC4899', '#7C3AED'] as const },
  { id: '6', name: 'Music', icon: 'musical-notes', channelCount: 19, gradient: ['#00AEEF', '#22C55E'] as const },
  { id: '7', name: 'Religious', icon: 'rose', channelCount: 15, gradient: ['#F59E0B', '#D97706'] as const },
  { id: '8', name: 'Documentary', icon: 'videocam', channelCount: 21, gradient: ['#64748B', '#475569'] as const },
];

export const liveChannels: Channel[] = [
  {
    id: 'ch1', name: 'ESPN HD', logo: 'https://img.icons8.com/color/48/espn.png',
    category: 'Sports', url: '', isFavorite: true, isLive: true, viewers: 12450,
  },
  {
    id: 'ch2', name: 'CNN International', logo: 'https://img.icons8.com/color/48/cnn.png',
    category: 'News', url: '', isFavorite: false, isLive: true, viewers: 8720,
  },
  {
    id: 'ch3', name: 'HBO Max', logo: 'https://img.icons8.com/color/48/hbo.png',
    category: 'Movies', url: '', isFavorite: true, isLive: false,
  },
  {
    id: 'ch4', name: 'National Geographic', logo: 'https://img.icons8.com/color/48/national-geographic.png',
    category: 'Documentary', url: '', isFavorite: false, isLive: true, viewers: 3450,
  },
  {
    id: 'ch5', name: 'Cartoon Network', logo: 'https://img.icons8.com/color/48/cartoon-network.png',
    category: 'Kids', url: '', isFavorite: false, isLive: true, viewers: 5670,
  },
  {
    id: 'ch6', name: 'MTV', logo: 'https://img.icons8.com/color/48/mtv.png',
    category: 'Music', url: '', isFavorite: false, isLive: true, viewers: 4210,
  },
  {
    id: 'ch7', name: 'BBC World News', logo: 'https://img.icons8.com/color/48/bbc.png',
    category: 'News', url: '', isFavorite: true, isLive: true, viewers: 9830,
  },
  {
    id: 'ch8', name: 'Fox Sports', logo: 'https://img.icons8.com/color/48/fox.png',
    category: 'Sports', url: '', isFavorite: false, isLive: true, viewers: 11200,
  },
  {
    id: 'ch9', name: 'Discovery Channel', logo: 'https://img.icons8.com/color/48/discovery.png',
    category: 'Documentary', url: '', isFavorite: false, isLive: true, viewers: 2890,
  },
  {
    id: 'ch10', name: 'Nickelodeon', logo: 'https://img.icons8.com/color/48/nickelodeon.png',
    category: 'Kids', url: '', isFavorite: false, isLive: true, viewers: 6340,
  },
];

export const movies: Movie[] = [
  {
    id: 'mv1', title: 'Dune: Part Two', year: 2024, category: 'Sci-Fi', rating: 8.6,
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop: '', duration: '2h 46m', description: 'Paul Atreides unites with the Fremen to seek revenge.',
    url: '', isFavorite: true,
  },
  {
    id: 'mv2', title: 'Oppenheimer', year: 2023, category: 'Drama', rating: 8.4,
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop: '', duration: '3h 0m', description: 'The story of American scientist J. Robert Oppenheimer.',
    url: '', isFavorite: true,
  },
  {
    id: 'mv3', title: 'The Batman', year: 2022, category: 'Action', rating: 7.8,
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdrop: '', duration: '2h 56m', description: 'When a sadistic serial killer begins murdering key political figures.',
    url: '', isFavorite: false,
  },
  {
    id: 'mv4', title: 'Interstellar', year: 2014, category: 'Sci-Fi', rating: 8.7,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop: '', duration: '2h 49m', description: "A team of explorers travel through a wormhole in space.",
    url: '', isFavorite: true,
  },
  {
    id: 'mv5', title: 'The Dark Knight', year: 2008, category: 'Action', rating: 9.0,
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911Ba1rT0J0U9oD.jpg',
    backdrop: '', duration: '2h 32m', description: 'When the menace known as the Joker wreaks havoc.',
    url: '', isFavorite: true,
  },
  {
    id: 'mv6', title: 'Inception', year: 2010, category: 'Sci-Fi', rating: 8.8,
    poster: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    backdrop: '', duration: '2h 28m', description: 'A thief who steals corporate secrets through dream-sharing technology.',
    url: '', isFavorite: false,
  },
];

export const series: Series[] = [
  {
    id: 'sr1', title: 'Game of Thrones', year: 2011, category: 'Fantasy', rating: 9.2,
    poster: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWN3hbHnUy7Rc2.jpg',
    backdrop: '', description: 'Nine noble families fight for control over the lands of Westeros.',
    isFavorite: true,
    seasons: [
      {
        id: 's1', number: 1,
        episodes: [
          { id: 'ep1', number: 1, title: 'Winter Is Coming', duration: '62m', thumbnail: '', url: '', isWatched: true },
          { id: 'ep2', number: 2, title: 'The Kingsroad', duration: '56m', thumbnail: '', url: '', isWatched: true },
        ],
      },
      {
        id: 's2', number: 2,
        episodes: [
          { id: 'ep3', number: 1, title: 'The North Remembers', duration: '58m', thumbnail: '', url: '', isWatched: false },
        ],
      },
    ],
  },
  {
    id: 'sr2', title: 'Breaking Bad', year: 2008, category: 'Drama', rating: 9.5,
    poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L2UNN2gLfl2QHr.jpg',
    backdrop: '', description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    isFavorite: true,
    seasons: [
      {
        id: 's3', number: 1,
        episodes: [
          { id: 'ep4', number: 1, title: 'Pilot', duration: '58m', thumbnail: '', url: '', isWatched: true },
        ],
      },
    ],
  },
  {
    id: 'sr3', title: 'Stranger Things', year: 2016, category: 'Sci-Fi', rating: 8.7,
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0m4b2kRCTBDh73R7fC1.jpg',
    backdrop: '', description: 'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces.',
    isFavorite: false,
    seasons: [
      {
        id: 's4', number: 1,
        episodes: [
          { id: 'ep5', number: 1, title: 'Chapter One: The Vanishing of Will Byers', duration: '50m', thumbnail: '', url: '', isWatched: false },
        ],
      },
    ],
  },
];

export const epgData: EPGProgram[] = [
  { id: 'epg1', channelId: 'ch1', title: 'NFL Live', description: 'Live coverage of NFL games.', startTime: new Date(), endTime: new Date(Date.now() + 3600000), category: 'Sports', isLive: true },
  { id: 'epg2', channelId: 'ch1', title: 'SportsCenter', description: 'Sports news and highlights.', startTime: new Date(Date.now() + 3600000), endTime: new Date(Date.now() + 7200000), category: 'Sports' },
  { id: 'epg3', channelId: 'ch2', title: 'World News Tonight', description: 'Global news coverage.', startTime: new Date(), endTime: new Date(Date.now() + 3600000), category: 'News', isLive: true },
  { id: 'epg4', channelId: 'ch3', title: 'The Batman', description: '2022 action film.', startTime: new Date(), endTime: new Date(Date.now() + 9000000), category: 'Movies', isLive: true },
  { id: 'epg5', channelId: 'ch4', title: 'Planet Earth III', description: 'Nature documentary series.', startTime: new Date(), endTime: new Date(Date.now() + 3600000), category: 'Documentary', isLive: true },
];

export const continueWatching = movies.slice(0, 3);
