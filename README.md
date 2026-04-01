# CafeNova

Arabic & English café ordering system with QR code table management.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Context + TanStack Query

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

## Supabase Setup

Run the SQL schema from `supabase/schema.sql` in your Supabase SQL Editor.

## Build

```bash
npm run build
```