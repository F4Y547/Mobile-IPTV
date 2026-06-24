# SYNTV Online

**80+ live TV channels streaming free in HD** — Sports, FIFA World Cup 2026, News, Entertainment, Movies, Kids, Documentary, Religious & Music.

🌐 **Live site:** https://mobile-iptv.vercel.app

---

## Features

- 📺 **80+ live channels** across 8 categories
- ⚽ **FIFA World Cup 2026** hero section with live stream
- 📅 **Match schedule** with live countdown timers
- 📊 **Live score ticker** scrolling across every page
- 🎬 **HLS streaming** via hls.js with auto-reconnect
- 📱 **Fully mobile-optimised** — hamburger menu, responsive cards, touch scrolling
- 🔍 **Search** by channel name or category
- 📌 **Sticky mini player** — keep watching while browsing
- 🌑 **Premium red/black** cinematic dark theme

## Screenshots

| Home | Watch | Mobile |
|---|---|---|
| FIFA WC 2026 hero + score ticker | Full-screen HLS player + sidebar | Hamburger menu + touch-friendly cards |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 6 |
| Routing | wouter |
| Streaming | hls.js |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animation | Framer Motion |
| Language | TypeScript 5.9 |
| Package manager | pnpm workspaces |
| Deployment | Vercel |

---

## Project Structure

```
artifacts/syntv/
├── src/
│   ├── components/        # UI components
│   │   ├── Navbar.tsx     # Sticky nav + mobile hamburger drawer
│   │   ├── ScoreTicker.tsx        # Live score bar (top of every page)
│   │   ├── MatchScheduleBanner.tsx # WC 2026 fixtures + countdown
│   │   ├── CategoryRow.tsx        # Netflix-style horizontal scroll rows
│   │   ├── HlsPlayer.tsx          # hls.js video player
│   │   └── MiniPlayer.tsx         # Sticky mini player (bottom-right)
│   ├── pages/
│   │   ├── HomePage.tsx   # Hero + match schedule + channel rows
│   │   ├── WatchPage.tsx  # Full player + related channels
│   │   ├── CategoryPage.tsx
│   │   └── SearchPage.tsx
│   ├── data/
│   │   └── channels.ts    # All 80+ channel definitions
│   └── context/
│       └── PlayerContext.tsx  # Global playback state
├── public/
│   ├── sitemap.xml        # Full sitemap (85+ URLs)
│   └── robots.txt
└── index.html             # SEO meta tags + OG image
```

---

## Categories

| Category | Channels |
|---|---|
| ⚽ Sports | FIFA WC 2026, T Sports, Star Sports, Sony Sports, Willow HD, PTV Sports, A Sports, FIFA+, DD Sports and more |
| 📰 News | Jamuna TV, Somoy TV, Ekattor HD, Channel 24, ATN News, News 24, DBC News |
| 🎭 Entertainment | BTV, NTV, Bangla Vision, ATN Bangla, Maasranga TV, Deepto TV, Channel I and more |
| 🎬 Movies | Zee Cinema, Star Gold, Goldmines, Movie Sphere, Action Hollywood, Cineedge and more |
| 👶 Kids | Doraemon, Tom & Jerry, Cartoon Network, Motu Patlu, Jungle Book, Zoo Moo |
| 🌿 Documentary | Discovery, Nat Geo HD, Wild Earth, Outdoor Channel, Real Wild, Insight TV, TravelXP |
| 🕌 Religious | Makka Live, Madina Live, Saudi Quran, Peace TV Bangla, Madani TV, Azan TV |
| 🎵 Music | Music Bangla, YRF Music, 9XM, Sangeet Bangla, Party Universe |

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter @workspace/syntv run dev

# Typecheck
pnpm run typecheck

# Build for production
pnpm --filter @workspace/syntv run build
```

> Requires Node.js 20+ and pnpm 9+

---

## Deployment

Deployed via Vercel. The `vercel.json` at the repo root handles the build and SPA routing.

To deploy your own instance:
1. Fork this repo
2. Import into [Vercel](https://vercel.com)
3. Vercel auto-detects `vercel.json` and deploys

---

## License

[MIT](./LICENSE) © 2026 SYNTV Online
