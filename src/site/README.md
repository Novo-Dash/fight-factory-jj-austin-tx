# Fight Factory Jiu Jitsu — institutional site

The multi-page site that replaces `fightfactoryjiujitsu.com`. It lives in the
**same repo and the same Vercel project** as the landing page, per the one
client / one repo / one project rule.

Three things share this repo and they do not touch each other:

| What | Document | Served at |
|---|---|---|
| Paid-traffic landing page | `index.html` | `lp.fightfactoryjiujitsu.com/` |
| `/kids` and `/back-to-school` | `index.html` (client-routed) | `/kids`, `/back-to-school` |
| **This site** | `home.html`, `about.html`, … | `/home`, `/about`, … |

## Why one HTML document per page

Every page is its own Vite entry (`vite.config.ts` → `build.rollupOptions.input`).
That is the only way each URL gets a real `<title>`, meta description, canonical
and Open Graph markup in the **served** markup — a single client-routed app
cannot, and Meta's scraper runs no JavaScript. Rollup hoists React and the
shared components into one chunk, so the second page a visitor opens is nearly
free.

Cross-page motion is the browser's own **cross-document view transitions**
(`@view-transition { navigation: auto }` in `site.css`). No router, no
JavaScript, and an ordinary navigation where it is unsupported.

## Routing and the domain cutover

`vercel.json` maps clean paths to documents. Two things there matter:

- The **host-conditional rewrite** sends `/` to `home.html` only when the host
  is `fightfactoryjiujitsu.com` or `www.fightfactoryjiujitsu.com`. Until that
  domain is attached, `lp.fightfactoryjiujitsu.com/` keeps serving the landing
  page exactly as before and this site is reviewed at `/home`.
- The SPA catch-all stays **last**, or `/kids` and `/back-to-school` would fall
  through.

**The cutover is therefore only: add `fightfactoryjiujitsu.com` +
`www.fightfactoryjiujitsu.com` to the Vercel project. No code change.** To make
`/home` redirect to `/` afterwards, add a redirect — do not remove the rewrite.

Rehearse it locally:

```bash
npm run build
node serve-dist.mjs 4183                                   # /home, /about, …
node serve-dist.mjs 4184 www.fightfactoryjiujitsu.com      # / serves the site
```

## Stylesheet isolation

`site.css` opens with `@import "tailwindcss" source(none)` plus an explicit
`@source` list (this folder and `../booking`). `src/index.css` carries the
matching `@source not "./site"` **and** `@source not "../*.mjs"`.

Result, verified rather than assumed: the landing page's stylesheet builds
**byte-identical** to what `master` produces — 28,763 bytes, same content hash.

⚠️ Prose in files at the **repo root** is still scanned by the landing page's
Tailwind, so an ordinary English word in a comment there can become a rule in
that bundle. The `@source not "../*.mjs"` line covers `serve-dist.mjs` and
`shot.mjs`; for `vite.config.ts` and the `.html` documents, keep the wording
plain and diff `dist/assets/main-*.css` against a `master` build before pushing.

## Booking and tracking

The form is the shared `src/booking` module, **not forked**. Two small additions
were made to it, both backward compatible:

- `sendLeadWebhook(data, source?)` and `sendBookingWebhook(data, source?)` take
  an optional source label, defaulting to the landing page's. `source` is an
  existing field of the fixed n8n contract — its **value** changes, never the
  field set.
- `BookingForm` accepts `source`. This site passes `SITE_SOURCE`
  (`"Website - Institutional"`), so the CRM can tell a website enquiry from an
  ad lead.

Only the shell belongs to the site (`layout/SiteBookingModal.tsx`), and the form
is skinned by redefining `--radius-*` in this site's `@theme` rather than by
duplicating the module. Any `<a href="#book">` or `#start` anywhere in the
markup opens the modal. `/contact` renders the same form inline and fires the
funnel's opening event on mount, the way the `/book` route does.

Verified end to end with both webhook hosts intercepted by **hostname regex**
(never a path glob — a glob that misses sends the lead to the real CRM), so
nothing was written to the CRM:

- Webhook 1 carries name, e-mail, phone, `program`, `audience`, `child_name`
  for kids only, `source`, and the UTM/gclid attribution captured on arrival.
- Webhook 2 carries exactly `parent_name`, `child_name` (kids only), `email`,
  `phone`, `calendar_id`, `location_id`, `stage`, `appointment_date`,
  `appointment_time`, `source`. Nothing added, nothing removed.
- Meta PageView / ViewContent / Lead / Schedule; GA4 view_content /
  generate_lead / trial_booked; two Google Ads conversions; Enhanced
  Conversions `user_data` set before the Lead conversion.

Live availability for all four GHL calendars was confirmed read-only via
`action: "get_slots"`, which creates no lead.

**GA4 is still missing.** The documents load Google Ads (`AW-18177687947`) only;
the GA4 Measurement ID has never been supplied. Every helper is guarded, so the
GA4 events above are no-ops until the id arrives — swap the loader id in the
five `.html` documents and add `gtag('config','G-XXXXXXX')`.

## Where the content comes from

Everything quoted from the academy is verbatim and marked as such in the file it
lives in:

| Content | File |
|---|---|
| Welcome, about, approach, trial, contact and schedule copy | `content/site.ts` |
| The five values | `content/site.ts` |
| Programme descriptions and class types | `content/programs.ts` |
| The weekly class grid | `content/schedule.ts` |
| Every instructor biography and credential | `content/staff.ts` |
| The five Google reviews, in full | `content/testimonials.ts` |
| Athletes, titles and this season's results | `content/record.ts` |

The weekly grid merges two authoritative sources: **adult** classes come from
the academy's own live schedule app (the Rollpay feed the old site embedded on
`/schedule`), and **kids** classes come from the academy's printed schedule
poster, whose times match the open hours of the four kids calendars in the GHL
sub-account. One difference between the two is flagged in the file rather than
silently resolved: the printed poster shows Saturday as a single 10:30 AM –
12:30 PM Gi class, while the live app shows 9:30 AM Women's + 11:00 AM Gi. The
live app is newer, so it is what the grid shows.

## Content the academy still owes

Rendered as visible `Pending` markers, never invented:

| What | Where |
|---|---|
| Membership pricing | `content/site.ts` → `PENDING.pricing` (Programs, Contact FAQ) |
| Caleb Tackett's portrait and biography | `content/staff.ts` |
| GA4 Measurement ID | the five `.html` documents |
| A photograph of the women's class itself | `pages/HomePage.tsx` bento tile |

## Carousels

Three sections use `components/DragRail.tsx`: the academy timeline, the photo
strip under it and the gallery in section 05. Native horizontal scrolling does
the moving, so a trackpad, a touch swipe, the arrow keys and the scrollbar work
without any of the component's code running. On top of that it adds what a mouse
cannot otherwise do — press-and-drag with momentum, and a magnetic settle onto
the nearest frame when the throw runs down.

Three details are load-bearing:

- **Scroll snapping is switched off for the duration of a drag.** Left on, the
  browser pulls against every `scrollLeft` write and the rail stutters.
- **A drag that travelled more than a few pixels swallows the click after it**,
  or throwing the rail by a card would also open that card. It does that through
  a flag of its own and must never clear `travelled`: the click fires
  immediately after `pointerup`, before the first frame of the glide, so
  clearing it there wiped the measurement the settle reads and every mouse drag
  fell back to springing into place.
- **The settle rounds in the direction of the gesture**, not to whichever frame
  is nearest in absolute terms, and it measures from the frame's leading edge
  because `go()` aligns left and the CSS snaps to `snap-start`. Absolute
  rounding, or measuring from the centre while aligning to the left, is what
  makes a throw coast past a frame and get yanked backwards into it — the
  "it glitches and goes back". Snapping is also handed back only once the rail
  has been still for two frames; restoring it mid-flight lets the browser grab
  the moving rail and pull it somewhere else. Verified by throwing each rail and
  checking the rebound against the frame width: 0px on all six cases.

The programme section uses `components/ExpandRail.tsx` instead: five compressed
panels that trade width, so five rooms cost one screen rather than two. Below
`md` there is no hover to lean on, so the panels stack and open on tap — never
make a phone user guess at a hover.

**The hero is one viewport tall.** `min-h-[100svh]`, not `100vh`: on iOS the
`vh` unit includes the address bar, so a `100vh` hero has its own foot pushed
off the screen. The section is a flex column — the headline block centres itself
and the record strip parks on the floor — and `t-hero` is sized with
`min(5.1vw, 8.2vh)`, so on a short laptop the axis that is tighter wins and the
first screen holds its contents without a single height media query.

Verified at 1920×1080, 1512×945, 1440×900, 1440×780, 1366×720, 1280×800,
1024×768, 768×1024, 430×932 and 390×844: the hero measures the viewport exactly
and nothing overflows it. Below about 700px of viewport height (a 360×640
handset) the content cannot fit, and `min-h` lets the hero grow rather than
clipping anything — growing is the safe failure here.

Below `md` the review card collapses to a band — score, stars, count, one line
of quote — because the full card is 321px of a 844px screen on its own.

⚠️ **Anything on the first screen has to reveal on load, not on scroll.**
The shared observer used `top 88%` as its trigger, which is right for a section
further down the page and wrong for the foot of a 100svh hero: the record strip
landed 2px inside the line and sat at zero opacity until the visitor scrolled.
`components/scroll.ts` now splits the nodes at boot — anything whose top is
within 97% of the viewport reveals immediately, staggered — and `MaskHeading`
does the same for a heading already in view.

⚠️ **The hero's review card must live in a fixed track and a fixed frame.**
The five quotes it cycles through run from 30 to 166 characters. Two separate
things moved the page because of that, and only the first is obvious:

- The quote block resized the card. It now has a fixed height with the quote
  centred in it, and the quote is trimmed on a word boundary at 104 characters
  rather than relying on `line-clamp` alone, so the height is deterministic at
  every width instead of only the one it was checked at.
- **The card's grid track was `auto`.** An `auto` track resolves to the
  max-content of its contents, so a short quote shrank the card's column, the
  headline's `1fr` column grew, and the headline reflowed from four lines to
  three — moving the hero by a whole line even though the card itself never
  changed height. The track is pinned at `23rem`.

Checked by watching card, hero and document height across every quote at seven
widths: one value each.

## Design notes

Direction: **"THE RECORD"** — the academy's differentiator is a written
competition record, so the page is built like a record board.

- **One typeface.** Archivo, self-hosted, carried across three widths of its
  variable `wdth` axis: 125% for display, 100% for running text, 87% for
  letterspaced labels. The wordmark is a wide heavy grotesque; this is the same
  idea made typographic. Display text that is not an `h1`–`h4` must carry
  `display-line`, or it renders at 100% width and stops looking like the same
  family.
- **Signature devices:** the machinist rule (`rule-ticks`), the outlined
  chapter numeral (`chapter-num`), the data row (`record-row`), the diamond off
  the wordmark (`diamond`), and one crimson stroke per icon glyph. No card with
  a border, a shadow and a tinted icon chip anywhere on the site.
- **Icons are the site's own** (`components/Icon.tsx`), 24 grid, single 1.6
  stroke, exactly one crimson stroke per glyph. `--icon-accent` flips that
  stroke to white on a crimson ground. A library mark is the right answer in
  exactly one place: the social trademarks in the colophon.
- **Motion:** `mask-reveal-up` from the `animate-text` skill for every headline
  (`components/MaskHeading.tsx`) — per-line, enter only, GSAP with CustomEase,
  at the skill's website runtime numbers. Reveals and the clamped parallax live
  in `components/scroll.ts`.

⚠️ **Variant class names must be whole literals.** A class built as
`` `btn-${variant}` `` never appears in the source, so Tailwind's extractor
cannot see it and the utility is silently never emitted — which is how
`btn-ghost` first shipped with no border. `components/ui.tsx` maps variants to
full literal names for exactly this reason. To check the whole set at once,
compare `@utility` declarations in `site.css` against the built stylesheet.

⚠️ **The wordmark ships in two files and neither takes a CSS filter.**
`brand/wordmark-ink.webp` is for light surfaces, `brand/wordmark-light.webp`
for dark ones. `invert` on the light asset over a dark panel paints it black.
The two are also **different artwork with different proportions** (5.3:1 and
7.1:1), so the masthead sizes the wordmark by **width**, not height — matching
their heights makes one of them 50px wider than the other, which was enough to
push the masthead off the screen at 768px.

⚠️ **A rolling label needs its duplicate one line BELOW, not on top.** The
button hover moves both copies up by one line: the first leaves, the second
arrives. With the duplicate at `inset: 0` both travel out of the window together
and the button goes blank mid-hover — which is exactly how it first shipped.
`.btn-red` and `.btn-ink` also state their hover colour explicitly, because the
panel that wipes up behind the label is dark.

⚠️ **Every grid needs a base column count, and it must use `minmax(0, …)`.**
A grid with only `lg:grid-cols-…` gets one implicit `auto` track on small
screens, and a grid item's default `min-width: auto` lets it grow to its
min-content width. A rail of 15rem cards blew its column out to 1290px inside a
353px measure, and `#root { overflow-x: clip }` — which the site needs so that
`position: sticky` keeps working — hid the whole thing: no scrollbar, no
document overflow, just body copy silently guillotined at the right edge on
mobile. `grid-cols-1` is `repeat(1, minmax(0, 1fr))`, and the `minmax(0, …)` is
what caps it.

`shot.mjs` now catches this class of bug. It looks for boxes whose right edge is
past the viewport and asks whether the overflow is **contained by something that
scrolls or clips it on purpose** — a carousel card, the wide schedule grid, an
overscanned parallax image all sit inside their own frame and are fine. A box
that nothing contains except the shell's clip is the real defect. A checker that
only watches `document.scrollWidth` will never see it.

## Local development

```bash
npm run dev                        # http://localhost:5173/home.html
npm run build && node serve-dist.mjs 4183
node shot.mjs "/home,/about,/programs,/schedule,/contact"    # + overflow / reveal / 404 checks
W=390 node shot.mjs "/home"
```

`shot.mjs` fails the run if any page scrolls sideways, leaves a reveal at zero
opacity, has more or fewer than one `h1`, or requests something that 404s.

## ⚠️ The domain cutover needs one change, and it is not DNS

Found on 15/09/2026, while trying to serve the institutional home at the root
of a review domain.

**The conditional rewrite that maps `/` to `home.html` never runs.** Vercel
applies headers, then redirects, then the **filesystem**, and only then
rewrites. `/` matches `index.html` on the filesystem, so the rewrite list is
never consulted for it. Anchors in the host pattern make no difference; the
rule is simply unreachable. `/about` works because no file matches that path.

That was proven on a deploy, not reasoned about: `/about` rewrites correctly
and `/` does not, on the same deploy, with and without anchors.

**What it means for the cutover.** The plan recorded so far was "attach
fightfactoryjiujitsu.com and www, zero code". That would put the paid-traffic
LANDING PAGE at the root of the client's own domain, with the institutional
site reachable only at /home. The pages themselves are fine; the root is not.

**The fix, when it is decided:** stop having a file at the root. Rename the
landing page entry from `index.html` to `lp.html`, then let rewrites do the
routing, catch-all last:

```
/          host lp.fightfactoryjiujitsu.com   ->  /lp.html
/          host (www.)?fightfactoryjiujitsu.com -> /home.html
/(.*)                                         ->  /lp.html
```

⚠️ It touches the surface that is live and carrying ad spend, so it wants its
own round with the campaign routes (`/kids`, `/back-to-school`) checked on the
`lp.` host afterwards. It is not a change to slip in beside a content update.

Until then, the institutional home is at **/home** on every host, which is
what the review link uses.

