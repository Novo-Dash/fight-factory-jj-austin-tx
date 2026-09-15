import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { buildBlogEntries } from './scripts/blog-entries.mjs'

/**
 * NOTE ON WORDING IN THIS FILE: the landing page's stylesheet scans the
 * repository root, so an ordinary English word here can be picked up as a
 * utility name and emitted into that bundle. Keep the wording plain.
 */
/**
 * The blog ships one document per post, generated from the content files
 * before Rollup runs. See scripts/blog-entries.mjs for why. Writing a post
 * means adding a file to src/site/content/blog/posts; the document, the Open
 * Graph card and the sitemap entry follow from it with no further edit.
 */
const blog = await buildBlogEntries()

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      input: {
        // The paid-traffic landing page, plus its campaign route. Untouched.
        main: path.resolve(__dirname, 'index.html'),

        // The institutional site: one document per page, so every URL ships a
        // real title, description, canonical and Open Graph markup in the
        // served markup. A single client-routed app cannot do that, and the
        // Meta scraper runs no JavaScript. Rollup hoists React and the shared
        // components into one chunk that is cached across all of them.
        home: path.resolve(__dirname, 'home.html'),
        about: path.resolve(__dirname, 'about.html'),
        programs: path.resolve(__dirname, 'programs.html'),
        schedule: path.resolve(__dirname, 'schedule.html'),
        contact: path.resolve(__dirname, 'contact.html'),

        // The blog index and one entry per post, generated above.
        ...blog.input,
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor'
          }
          if (id.includes('node_modules/gsap')) {
            return 'gsap'
          }
        },
      },
    },
  },
})
