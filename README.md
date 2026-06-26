# 唐萍遥的个人主页

个人主页：[jialuncao.github.io](https://jialuncao.github.io)

## Structure

```
index.html              ← homepage (single page)
assets/css/homepage.css ← styles
assets/js/homepage.js   ← GSAP animations + guppyLLM chat
images/                 ← avatar, favicons
google_scholar_crawler/ ← GitHub Action for citation stats
```

## Local Preview

```bash
python3 -m http.server 8079
```

Then open `http://localhost:8079` (or use SSH tunnel: `ssh -L 8079:localhost:8079 user@server`).

If the port is already in use:

```bash
fuser -k 8079/tcp && python3 -m http.server 8079
```

## Update Content

Edit `index.html` directly. Common updates:

**Add a publication** — find the year block, add a line:
```html
<div class="pub-item">[P3] <span class="me">唐萍遥</span>.
<em>项目标题.</em> <strong>时间</strong>.
<a href="https://...">[链接]</a></div>
```

**Add a news item** — find `<!-- News -->`, add at the top:
```html
<div class="news-item"><span class="n-date">2027.01</span><span>Your news here.</span></div>
```

**Add a new page** (e.g. students, group) — create `students.html` at root, link the same CSS:
```html
<link rel="stylesheet" href="assets/css/homepage.css">
```

## Deploy

```bash
git add -A
git commit -m "Update homepage"
git push
```

Site auto-deploys via GitHub Pages (no build step — `.nojekyll` skips Jekyll).

## Acknowledgements

- Originally based on [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io)
- Animations powered by [GSAP](https://greensock.com/gsap/)
- Color palette inspired by [Nord](https://www.nordtheme.com/)
