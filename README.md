# smc2sfc2

SNES ROM converter.

A web app to batch convert SNES ROM formats from .smc to .sfc or vice versa.

Fork of [mwmccarthy/smc2sfc2](https://github.com/mwmccarthy/smc2sfc2), revived and rewritten after the original project was abandoned and its Heroku deployment taken down.

### What's new in this fork

Full rewrite of the original project. React + Python/Flask + Webpack replaced with Astro + vanilla TypeScript. Everything runs client-side, no backend needed.

- Drag & drop file upload
- Rename files before download
- Accept and serve ROMs inside zip archives (with collision-safe naming)
- ROM metadata display: title, region, video standard, memory map, ROM/RAM size, ROM type, coprocessor, and checksum validation
- SHA-256 deduplication (Web Crypto API)
- Human-readable file sizes and ROM counter
- Distinct error feedback for duplicates vs invalid ROMs
- PWA support (installable, works offline)
- Accessibility (ARIA labels, keyboard navigation)
- Responsive design (mobile optimized)
- Modern Docker setup with Nginx + security headers (CSP, HSTS, etc.)

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
