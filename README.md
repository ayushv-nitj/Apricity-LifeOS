# ⚡ Apricity — Personal Life OS

> A cyber-themed personal life management dashboard. Treat your life like an RPG — level up your skills, complete daily quests, and track every domain of your life in one command center.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?style=flat-square&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-cyan?style=flat-square&logo=tailwindcss)

---

## Features

- **RPG Progression System** — XP, levels, operative stats (STR / INT / CHA / STM)
- **Quest Log** — Add, complete, and delete daily tasks with XP rewards
- **Life Balance Radar** — Visualize balance across Health, Career, Learning, Relations, Finance, Mental
- **Focus Mode** — Pomodoro timer with animated ring and break mode
- **Mood & Energy Tracker** — Log daily status with auto-save
- **Knowledge Vault** — Markdown-supported notes with auto-save
- **Analytics** — Weekly productivity charts, time allocation pie, 30-day XP timeline
- **Workout Tracker** — Log sessions, track strength stats and streaks
- **Diet Tracker** — Macro logging, water intake tracker
- **Relationships & Family** — Affinity meters, bond levels, birthday reminders
- **Goals / Bucket List** — Category-based goals with progress tracking
- **System Feed** — Live activity log with achievements and XP gains
- **Secure Auth** — NextAuth.js with bcrypt, JWT sessions, MongoDB storage
- **Responsive** — Full desktop layout + mobile slide-out nav

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Auth | NextAuth.js (Auth.js) v5 |
| Database | MongoDB + Mongoose |
| Password | bcryptjs |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/apricity.git
cd apricity

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the root:

```env
MONGODB_URI=mongodb://localhost:27017/apricity
NEXTAUTH_SECRET=your-super-secret-key-change-this
NEXTAUTH_URL=http://localhost:3000
```

> For production, generate a strong secret: `openssl rand -base64 32`

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

Hit **"Register Operative"** to create your account, then log in.

---

## Project Structure

```
apricity/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── signup/         # Registration page
│   ├── (dashboard)/
│   │   ├── layout.tsx      # Dashboard shell (sidebar + right panel)
│   │   └── dashboard/
│   │       ├── page.tsx    # Main dashboard
│   │       ├── tasks/      # Work & task management
│   │       ├── academics/  # Study tracker
│   │       ├── workout/    # Fitness tracker
│   │       ├── diet/       # Nutrition tracker
│   │       ├── relationships/
│   │       ├── family/
│   │       ├── goals/      # Bucket list & quests
│   │       ├── notes/      # Knowledge vault
│   │       ├── analytics/  # Charts & insights
│   │       └── settings/
│   └── api/                # REST API routes
├── components/
│   ├── dashboard/          # Dashboard widgets
│   └── sidebar/            # Sidebar, right panel, mobile nav
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── mongodb.ts          # DB connection
│   └── utils.ts            # cn() helper
├── models/                 # Mongoose schemas
│   ├── User.ts
│   ├── Task.ts
│   ├── Goal.ts
│   ├── Note.ts
│   └── Mood.ts
└── proxy.ts                # Auth middleware
```

---

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Roadmap

- [ ] AI Life Advisor (weekly habit analysis + suggestions)
- [ ] Calendar integration with event sync
- [ ] Life Timeline (milestone history)
- [ ] Daily Reflection journal with prompts
- [ ] Smart reminders (push notifications)
- [ ] Skill tree visual modal
- [ ] Achievement unlock animations
- [ ] Weekly life report PDF export
- [ ] Light theme toggle
- [ ] OAuth providers (Google, GitHub)

---

## License

MIT — use it, fork it, build on it.
