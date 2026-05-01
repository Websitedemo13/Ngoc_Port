# Personal Portfolio

A modern, bilingual (EN/VI) personal portfolio with a full content management admin panel.

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (database, auth, storage)
- TipTap rich text editor
- TanStack Query

## Local Development

```sh
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Build

```sh
npm run build
```

## Features

- Public portfolio site (Home, About, Experience, Education, Projects, Activities, Blog, Store, Contact)
- Bilingual content (English / Vietnamese)
- Admin panel at `/admin` with:
  - Profile, About, Experiences, Education, Projects, Activities
  - Blog (categories + posts) with rich text editor
  - Store, Vouchers, Testimonials
  - Contact submissions
  - Media library
  - Site settings (theme, fonts, page heroes, favicon, logo)
- AI chatbot trained on portfolio content
- SEO-friendly slugs (Vietnamese aware)
