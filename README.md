# ParaTech Portfolio

React + Vite portfolio site for ParaTech. It is configured for production deployment on Render as a static site.

## Local Development

1. Install dependencies:

```bash
npm ci
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Fill in your EmailJS values in `.env`.

4. Start the dev server:

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

The production files are generated in `dist`.

## Render Deployment

This repo includes `render.yaml`, so you can create a Render Blueprint from the repository.

Use these settings if creating a Static Site manually:

- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Node version: `22`

Add these environment variables in Render:

- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`

The site also includes a rewrite rule from `/*` to `/index.html` for SPA-safe routing.
