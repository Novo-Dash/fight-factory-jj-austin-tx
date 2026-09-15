// ═══════════════════════════════════════════════════════════════════════════
// blog-entries.mjs — turns the post files into real HTML documents.
//
// WHY THIS EXISTS. Every page of this site ships as its own document because
// the Meta and WhatsApp scrapers run no JavaScript: whatever the served markup
// says is what a shared link shows. That matters more for a blog than for any
// other page here, since posts are the thing people actually share. A single
// client-routed /blog/:slug would hand every post the same title and the same
// preview image.
//
// So: one document per post, each with its own title, description, canonical
// and Open Graph image, generated at build time from the same content files
// the React pages read. Nothing is written by hand and nothing can drift.
//
// The generated files are build output, not source. They are listed in
// .gitignore; the post file in src/site/content/blog/posts is the source.
// ═══════════════════════════════════════════════════════════════════════════

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = join(ROOT, 'src/site/content/blog/posts')
const OUT_DIR = join(ROOT, 'blog')
const CACHE = join(ROOT, 'node_modules/.cache/blog')

const SITE = 'https://www.fightfactoryjiujitsu.com'
const NAME = 'Fight Factory Jiu Jitsu'

/**
 * Bundle a TypeScript entry into one ESM file Node can import.
 *
 * Uses whichever bundler this project ships with. It is on rolldown-vite, so
 * rolldown is the one that resolves; esbuild is kept as the fallback for a
 * project on stock Vite. Both are transitive dependencies rather than declared
 * ones, so a clear error beats an obscure resolution failure if neither is
 * there.
 */
async function bundleToNode(entry, outfile) {
  try {
    const { rolldown } = await import('rolldown')
    const bundle = await rolldown({ input: entry, platform: 'node', logLevel: 'silent' })
    await bundle.write({ file: outfile, format: 'esm' })
    await bundle.close()
    return
  } catch (err) {
    if (err?.code !== 'ERR_MODULE_NOT_FOUND') throw err
  }

  try {
    const { build } = await import('esbuild')
    await build({
      entryPoints: [entry],
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile,
      logLevel: 'silent',
    })
    return
  } catch (err) {
    if (err?.code !== 'ERR_MODULE_NOT_FOUND') throw err
  }

  throw new Error(
    'The blog build needs a bundler to read the post files, and neither rolldown nor esbuild resolved. ' +
      'Both normally arrive with Vite; run npm install.',
  )
}

/**
 * Load the posts in Node.
 *
 * The content files are TypeScript and the site reads them through
 * `import.meta.glob`, which only exists inside a Vite bundle. Rather than
 * parsing the files with regexes and hoping, esbuild bundles them into one
 * module here and Node imports it. The build sees exactly the values the page
 * will render, types and all.
 */
async function loadPosts() {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.ts')).sort()
  if (files.length === 0) throw new Error('No post files found in ' + POSTS_DIR)

  const entry = join(CACHE, 'entry.ts')
  await mkdir(CACHE, { recursive: true })
  await writeFile(
    entry,
    files
      .map((f, i) => `import { post as p${i} } from ${JSON.stringify(join(POSTS_DIR, f))}`)
      .join('\n') + `\nexport const posts = [${files.map((_, i) => `p${i}`).join(', ')}]\n`,
  )

  const bundle = join(CACHE, 'posts.mjs')
  await bundleToNode(entry, bundle)

  // A cache-busting query keeps a rebuilt bundle from being served from Node's
  // module cache inside one long-running dev server.
  const mod = await import(pathToFileURL(bundle).href + `?t=${Date.now()}`)

  const posts = mod.posts.filter((p) => !p.draft)
  const seen = new Set()
  for (const p of posts) {
    if (seen.has(p.slug)) throw new Error(`Two posts share the slug "${p.slug}"`)
    seen.add(p.slug)
    for (const [field, value] of Object.entries({ title: p.title, excerpt: p.excerpt, slug: p.slug })) {
      // The house rule, enforced where it cannot be forgotten: an em dash in a
      // title or excerpt would reach a browser tab and a shared link preview.
      if (String(value).includes('—')) {
        throw new Error(`Em dash in ${field} of "${p.slug}". Rewrite the punctuation.`)
      }
    }
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/** Escapes text going into an attribute or a text node. */
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function document_({ title, description, canonical, image, ogType, entry, slugMeta, jsonLd }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <script>
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '4326414901006955');
      fbq('track', 'PageView');
    </script>

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-RM8ZE8H789"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-RM8ZE8H789');   // GA4 (page_view automático)
      gtag('config', 'AW-18177687947'); // Google Ads (tag de remarketing automática)
    </script>

    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(canonical)}" />
${slugMeta ? `    <meta name="post-slug" content="${esc(slugMeta)}" />\n` : ''}
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${NAME}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#0b0c0d" />

    <link rel="icon" type="image/png" href="/site/brand/favicon.png" />
    <link rel="apple-touch-icon" href="/site/brand/favicon.png" />
${jsonLd ? `    <script type="application/ld+json">\n${jsonLd}\n    </script>\n` : ''}  </head>
  <body>
    <noscript>
      <style>
        .rv, .clip-in { opacity: 1 !important; transform: none !important; clip-path: none !important; }
        .mask-head .mask-line { opacity: 1 !important; transform: none !important; filter: none !important; }
      </style>
    </noscript>
    <noscript
      ><img
        height="1"
        width="1"
        style="display:none"
        alt=""
        src="https://www.facebook.com/tr?id=4326414901006955&ev=PageView&noscript=1"
    /></noscript>
    <div id="root"></div>
    <script type="module" src="${entry}"></script>
  </body>
</html>
`
}

/**
 * Writes every blog document and returns the Rollup input map.
 *
 * Output paths mirror the URLs: blog/index.html and blog/<slug>/index.html,
 * so the host serves them straight off the filesystem. No rewrite is added for
 * the blog, which keeps the SPA catch-all in vercel.json untouched.
 */
export async function buildBlogEntries() {
  const posts = await loadPosts()
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  const input = {}

  await writeFile(
    join(OUT_DIR, 'index.html'),
    document_({
      title: `Blog: results and academy news | ${NAME}, Austin TX`,
      description:
        'Competition results, academy news and straight answers about starting Brazilian Jiu-Jitsu in Austin, from the team at Fight Factory.',
      canonical: `${SITE}/blog`,
      image: `${SITE}/site/brand/og-site.jpg`,
      ogType: 'website',
      entry: '/src/site/entries/blog.tsx',
    }),
  )
  input.blog = join(OUT_DIR, 'index.html')

  for (const post of posts) {
    const dir = join(OUT_DIR, post.slug)
    await mkdir(dir, { recursive: true })
    const url = `${SITE}/blog/${post.slug}`
    const image = `${SITE}${post.cover.src}`
    const jsonLd = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image,
        datePublished: post.date,
        mainEntityOfPage: url,
        publisher: { '@type': 'Organization', name: NAME, url: SITE + '/' },
      },
      null,
      2,
    )
      .split('\n')
      .map((l) => '      ' + l)
      .join('\n')

    await writeFile(
      join(dir, 'index.html'),
      document_({
        title: `${post.title} | ${NAME}`,
        description: post.excerpt,
        canonical: url,
        image,
        ogType: 'article',
        entry: '/src/site/entries/post.tsx',
        slugMeta: post.slug,
        jsonLd,
      }),
    )
    input[`blog-${post.slug}`] = join(dir, 'index.html')
  }

  await writeSitemap(posts)
  await writeLatest(posts)
  return { input, posts }
}

/**
 * A module holding just the metadata of the most recent posts.
 *
 * The home page shows three of them. Reading the real post list there would
 * pull every post body into the bundle of the page most visitors land on, and
 * that grows by a post every couple of weeks: measured at 29 KB for the first
 * seventeen, to render three cards. This file is about 2 KB and does not grow.
 *
 * It is committed rather than ignored, because `tsc -b` runs before Vite and
 * would fail on a missing import. Every build rewrites it, so the committed
 * copy cannot go stale in the output: the bundle always uses what was written
 * here moments earlier. The diff is also a readable record of what shipped.
 */
async function writeLatest(posts, count = 6) {
  const summaries = posts.slice(0, count).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category,
    excerpt: post.excerpt,
    cover: post.cover,
  }))

  const body = JSON.stringify(summaries, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : '  ' + line))
    .join('\n')

  await writeFile(
    join(ROOT, 'src/site/content/blog/latest.generated.ts'),
    `// GENERATED FILE, DO NOT EDIT.
//
// Written by scripts/blog-entries.mjs on every build, from the post files in
// ./posts. It carries the newest ${count} posts without their bodies, so a page
// that only lists posts does not have to bundle all of them. See writeLatest()
// in that script for why it is committed instead of ignored.

import type { PostSummary } from './types'

export const LATEST: PostSummary[] = ${body}
`,
  )
}

/**
 * The sitemap, rewritten from the same list.
 *
 * It covers the fixed pages and every published post, so a post is
 * discoverable the moment it ships. Keeping it here rather than hand-editing
 * public/sitemap.xml means there is one place where "what exists on this site"
 * is decided, and a new post cannot be left out of it.
 */
async function writeSitemap(posts) {
  const fixed = [
    ['/', '1.0', 'monthly'],
    ['/about', '0.8', 'monthly'],
    ['/programs', '0.9', 'monthly'],
    ['/schedule', '0.9', 'weekly'],
    ['/blog', '0.8', 'weekly'],
    ['/contact', '0.9', 'monthly'],
  ]

  const url = (loc, priority, changefreq, lastmod) =>
    [
      '  <url>',
      `    <loc>${SITE}${loc}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n')

  const body = [
    ...fixed.map(([loc, priority, changefreq]) => url(loc, priority, changefreq)),
    ...posts.map((post) => url(`/blog/${post.slug}`, '0.6', 'yearly', post.date)),
  ].join('\n')

  await writeFile(
    join(ROOT, 'public/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  )
}
