# Djallits — personal website

A responsive, static personal website for `djallits.github.io`, with About, Posts,
Uses, Portfolio, Projects, and a printable Resume. An animated canvas illustration
adds motion without a graphics framework. Reduced motion, keyboard navigation,
mobile navigation, and system font fallbacks are supported.

## Development

Use Node.js 22 or later (CI uses Node.js 24). No dependencies or installation are required.

```sh
npm run build
npm test
npm run dev
```

The development server listens on port 4321. Stop and rerun it after edits to rebuild.
Generated files are in `dist/` and are ignored by Git.

Work on `develop` or a feature branch; never directly on `master`. Use Conventional
Commits with an imperative subject, such as `feat: add a project case study`.
Squash merge reviewed work into `master`.

## Content

Edit `content/site.json`. The initial copy is intentionally general: experience,
article text, tools, portfolio contributions, and projects must be supplied and
verified before publishing personal claims. Empty sections show honest coming-soon
messages rather than fictional entries.

- `uses`, `portfolio`, and `projects`: arrays of `{ "title", "description", "category", "url", "tags" }`. URLs are optional HTTPS links.
- `resume.summary`: professional summary; `resume.skills`: array of strings.
- `resume.experience` and `resume.education`: arrays of `{ "title", "organization", "period", "description" }`.
- `posts`: array of `{ "slug", "title", "date", "excerpt", "paragraphs", "tags", "sourceUrl", "linkedinExtract" }`.
  Use a lowercase hyphenated slug, `YYYY-MM-DD` date, and an array of paragraphs.
  `sourceUrl` is an optional HTTPS link to the original article.

Posts build into `/posts/<slug>/`. `dist/linkedin-extracts.txt` contains the supplied
LinkedIn extracts (falling back to excerpts), followed by full-article links. Keep
teasers specific and useful; preserve the author's facts and point of view when
editing source articles. No posts are fabricated from inaccessible LinkedIn content.

The resume has a Print / save PDF button and a dedicated print stylesheet.
Update the name and biographical copy with your preferred professional identity.

## GitHub Pages

After reviewing and squash merging `develop` into `master`, select **GitHub Actions**
as the source under the repository's **Settings → Pages**. The Pages workflow builds,
tests, and deploys `dist/`. Deployment is restricted to `master`; developing this
site does not publish it. The site assumes the root domain `https://djallits.github.io`.
Google Fonts are optional external enhancements; the site works with system fonts
when font loading is unavailable.
