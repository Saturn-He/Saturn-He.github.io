# Jingfei He

Source code for my academic homepage: [saturn-he.github.io](https://saturn-he.github.io/).

The site is built with Jekyll and hosted on GitHub Pages. It is based on
[AcadHomepage](https://github.com/RayeRen/acad-homepage) by Yi Ren (MIT License, see `LICENSE`)
and on the customised version by Xu Zhang ([house-yuyu.github.io](https://house-yuyu.github.io/)).
Changes here: a teal palette, a calmer masthead, serif section headings (Source Serif 4, SIL OFL 1.1, self-hosted),
a round avatar, dark-mode contrast fixes, and a SAR / optical compare slider in the introduction
(`_sass/_jh-theme.scss`, `assets/js/compare.js`).

## Content management

- Personal and social information: `_config.yml`
- Introduction, experience and academic service: `_pages/about.md`
- Publications: `_data/pubs.json` (cards) and `_data/references.json` (bibliographic data)
- Citation formats shown by the "Cite" button: `_data/citation_outputs.json`
- News: `_data/news.json`
- Honors: `_data/honors.json`
- Navigation: `_data/navigation.yml`
- Paper thumbnails: `images/papers/` (16:9 works best)

After editing `_data/references.json`, regenerate the citation formats with:

```bash
npm ci
npm run citations:build
```

## Google Scholar citation count

The citation badge reads `gs_data.json` from the `google-scholar-stats` branch of this repository.
Run `google_scholar_crawler/git_update.sh` on a trusted machine, or trigger the
"Get Citation Data" workflow manually from the Actions page (Google Scholar often blocks GitHub runners).

## Local preview

Install the Ruby dependencies, then run:

```bash
bundle install
bundle exec jekyll serve
```

The site is available locally at `http://127.0.0.1:4000`.
