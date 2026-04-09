# smc2sfc2

SNES ROM converter.

A web app to batch convert SNES ROM formats from .smc to .sfc or vice versa.

Fork of [mwmccarthy/smc2sfc2](https://github.com/mwmccarthy/smc2sfc2), revived after the original project was abandoned and its Heroku deployment taken down.

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
- [ ] Support renaming files
- [ ] Accept ROMs inside zip archives
- [ ] Serve back individually zipped ROMs
- [ ] Pull game info from thegamesdb.net
