# smc2sfc2

SNES ROM converter.

A web app to batch convert SNES ROM formats from .smc to .sfc or vice versa.

Fork of [mwmccarthy/smc2sfc2](https://github.com/mwmccarthy/smc2sfc2), revived and rewritten after the original project was abandoned and its Heroku deployment taken down.

### What's new in this fork

The original project included a TODO with features that were never implemented. This fork picks up where it left off and completes them:

- Support renaming files before download
- Accept ROMs inside zip archives
- Serve back individually zipped ROMs

On top of that, this fork introduces:

- Full rewrite: React + Python/Flask + Webpack replaced with Astro + vanilla TypeScript
- Drag & drop file upload
- SHA-256 deduplication via Web Crypto API (replaced md5 dependency)
- Modern Docker setup with Nginx + security headers

### Live

https://smc2sfc2.tebita.xyz

### Tech stack

- [Astro](https://astro.build/) (static site)
- TypeScript
- [fflate](https://github.com/101arrowz/fflate) (ZIP creation)
- Nginx (Docker)

### Run

```
docker build -t smc2sfc2 .
docker run -p 8080:80 smc2sfc2
```

The app will be available at http://localhost:8080.

### Development

```
npm install
npm run dev
```

### TODO

- [x] Validate input files
- [x] Migrate to Astro (remove React, Material UI, Python/Flask, Webpack)
- [x] Drag & drop file upload
- [x] Support renaming files
- [x] Accept ROMs inside zip archives
- [x] Serve back individually zipped ROMs
- [x] Add security headers to Nginx config (CSP, X-Frame-Options, X-Content-Type-Options)
- [x] ROM counter
- [x] Human-readable file sizes
- [x] SNES favicon
- [x] Persist preferences in localStorage
- [x] PWA support (offline use)
- [x] Accessibility (aria labels, keyboard navigation)
- [x] Responsive design (mobile optimization)
