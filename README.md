# smc2sfc2

SNES ROM converter.

A web app to batch convert SNES ROM formats from .smc to .sfc or vice versa.

Fork of [mwmccarthy/smc2sfc2](https://github.com/mwmccarthy/smc2sfc2), revived after the original project was abandoned and its Heroku deployment taken down.

### Run

```
docker compose up --build
```

The app will be available at http://localhost:8000.

### TODO

- [x] Validate input files
- [ ] Migrate to Astro (remove React, Material UI, Python/Flask, Webpack)
- [ ] Support renaming files
- [ ] Accept ROMs inside zip archives
- [ ] Serve back individually zipped ROMs
- [ ] Pull game info from thegamesdb.net
