/**
 * Types for the generator, which is plain JavaScript because it runs in Node
 * before Rollup starts. Only the shape vite.config.ts consumes is declared.
 */
export interface BlogEntries {
  /** Rollup input map: name -> absolute path of a generated document. */
  input: Record<string, string>
  /** The published posts, newest first. */
  posts: { slug: string; title: string; date: string }[]
}

export function buildBlogEntries(): Promise<BlogEntries>
