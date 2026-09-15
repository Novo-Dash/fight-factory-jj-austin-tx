import { mountPage } from '../layout/mount'
import { PostPage } from '../pages/PostPage'
import { postBySlug } from '../content/blog'

/**
 * Which post this document is.
 *
 * Read from a meta tag the build writes into each generated file, not from
 * `location.pathname`. The served URL can be /blog/<slug> or /blog/<slug>/
 * depending on how the host resolves a directory, and a trailing slash should
 * not decide whether the page renders.
 */
const slug = document.querySelector('meta[name="post-slug"]')?.getAttribute('content') ?? ''
const post = postBySlug(slug)

if (post) {
  mountPage('/blog', <PostPage post={post} />)
} else {
  // Only reachable if a document outlived the post file that generated it.
  // The index is the honest place to land.
  window.location.replace('/blog')
}
