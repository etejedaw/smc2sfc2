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
- Super Famicom inspired color palette (see below)
- Accessibility (ARIA labels, keyboard navigation)
- Responsive design (mobile optimized)
- Modern Docker setup with Nginx + security headers (CSP, HSTS, etc.)

### Color palette

The UI is themed after the Super Famicom: warm cartridge plastic for the page, the blue of
the X button for the chrome, and the A/B/Y buttons as the accent stripe under the toolbar,
on the progress bar and on the download menu.

| Token           | Value     | Role                                  |
| --------------- | --------- | ------------------------------------- |
| `--sfc-bg`      | `#d7d2c6` | Page background (console plastic)     |
| `--sfc-surface` | `#fffdf7` | ROM cards and menus                   |
| `--sfc-blue`    | `#2d4f9e` | Chrome: toolbar, footer, focus states |
| `--sfc-red`     | `#c2373f` | A button — destructive actions        |
| `--sfc-yellow`  | `#e8bb3a` | B button — accent                     |
| `--sfc-green`   | `#3f9556` | Y button — drop zone overlay          |
| `--sfc-ink`     | `#2b2822` | Snackbar and text                     |

All colors are CSS custom properties declared in `src/layouts/Layout.astro`, so the whole
theme can be reskinned from that single block.

### Live

- https://smc2sfc2.app.etejeda.dev

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
