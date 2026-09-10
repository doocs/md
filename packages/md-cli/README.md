# md-cli

Local CLI for [doocs/md](https://github.com/doocs/md). It starts an Express process that:

- proxies the editor UI to [https://md.doocs.org/](https://md.doocs.org/)
- serves a local `/upload` endpoint (and `/public` static files)
- binds to `127.0.0.1` only

It does **not** render Markdown by itself. Offline / fully private hosting should use the Docker image instead.

## Installation

### Install locally

```bash
npm install @doocs/md-cli
```

### Install globally

```bash
npm install -g @doocs/md-cli
```

## Usage

### Default setup

```bash
md-cli
```

Then open `http://127.0.0.1:8800`.

### Custom port

```bash
md-cli port=8899
```

### Optional uniCloud upload

If `spaceId` and `clientSecret` are set, `/upload` forwards files to a dcloud service space. Otherwise files stay under `public/upload`.

```bash
md-cli spaceId=<id> clientSecret=<secret>
```

## Maintainers

- [yanglbme](https://github.com/yanglbme) – Core maintainer.
- [YangFong](https://github.com/yangfong) – Core maintainer.
- [xw](https://github.com/wll8) – Contributor.
- [thinkasany](https://www.npmjs.com/~thinkerwing) – Contributor.
