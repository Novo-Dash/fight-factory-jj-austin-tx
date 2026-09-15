// Serves dist/ through the real rewrite list in vercel.json, so a clean path
// such as /about behaves here exactly as it will in production. The
// host-conditional root rewrite is honoured too: pass a host as the third
// argument to rehearse the domain cutover.
//
//   node serve-dist.mjs 4173
//   node serve-dist.mjs 4174 www.fightfactoryjiujitsu.com
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const PORT = Number(process.argv[2] ?? 4173)
const FORCED_HOST = process.argv[3] ?? null
const DIST = new URL('./dist/', import.meta.url).pathname
const conf = JSON.parse(await readFile(new URL('./vercel.json', import.meta.url), 'utf8'))

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

/**
 * Vercel's `:param` placeholders, turned into a real regexp and back.
 * Without this the blog rules read as literal text here, every post falls to
 * the SPA catch-all, and a local check would show the landing page where
 * production correctly shows the post. A rehearsal that lies is worse than no
 * rehearsal.
 */
function compileRewrite(source, destination) {
  const names = []
  const pattern = source.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => {
    names.push(name)
    return '([^/]+)'
  })
  const target = names.reduce(
    (acc, name, i) => acc.split(`:${name}`).join(`$${i + 1}`),
    destination,
  )
  return { re: new RegExp(`^${pattern}$`), target }
}

function resolveRewrite(pathname, host) {
  for (const r of conf.rewrites ?? []) {
    const { re, target } = compileRewrite(r.source, r.destination)
    if (!re.test(pathname)) continue
    if (r.has?.length) {
      const ok = r.has.every((h) => {
        if (h.type !== 'host') return false
        return new RegExp(`^${h.value}$`).test(host ?? '')
      })
      if (!ok) continue
    }
    return pathname.replace(re, target)
  }
  return pathname
}

async function send(res, file, code = 200) {
  const body = await readFile(file)
  res.writeHead(code, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' })
  res.end(body)
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://x')
  const pathname = decodeURIComponent(url.pathname)
  const host = FORCED_HOST ?? req.headers.host?.split(':')[0] ?? ''

  // A real asset always wins over any rewrite.
  const direct = join(DIST, normalize(pathname))
  if (pathname !== '/' && direct.startsWith(DIST)) {
    try {
      const info = await stat(direct)
      if (info.isFile()) return void (await send(res, direct))
    } catch {
      /* fall through to the rewrite list */
    }
  }

  const target = join(DIST, normalize(resolveRewrite(pathname, host)))
  try {
    return void (await send(res, target))
  } catch {
    return void (await send(res, join(DIST, 'index.html'), 200))
  }
}).listen(PORT, () => {
  console.log(`dist on http://localhost:${PORT}${FORCED_HOST ? `  host=${FORCED_HOST}` : ''}`)
})
