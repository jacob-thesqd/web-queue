# Web Queue Application

A Next.js application that displays strategy member data from Supabase with a modern design.

## Features

- CalSans font implementation
- Dynamic header with church name
- Squad logo display
- Dot grid background pattern
- Supabase data integration
- Responsive design

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Configuration

The application uses a global configuration file located at `src/config/globalConfig.ts`. You can modify this file to enable/disable features or change basic settings:

```typescript
export const globalConfig = {
  logoPath: "/squad-logo.svg",
  faviconPath: "/favicon.ico",
  siteTitle: "Web Queue",
  fontFamily: "CalSans",
  components: {
    header: true,
    logo: true,
    dotGridBackground: true,
  }
};
```

## Project Structure

- `src/app` - Next.js app router files
- `src/components` - React components
- `src/lib/supabase` - Supabase client and API functions
- `src/config` - Application configuration
- `public` - Static assets and fonts

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- CalSans font

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
