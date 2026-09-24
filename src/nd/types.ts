// Shape of src/nd/client.ts, the only per-academy file of the Novo Dash kit.
export type Audience = 'adults' | 'kids'

export type Client = {
  /** logo and photo: paths in the LP's public/ (logo reads on the dark brand panel; photo sits behind it). */
  academy: { name: string; phone: string; address: string; mapsUrl: string; logo?: string; photo?: string }
  ghl: { locationId: string; leadWebhookUuid: string }
  /** Brand panel and form texts; defaults in config.ts. proof = Google rating line, shown with five stars. */
  copy?: {
    eyebrow?: string
    panelTitle?: string
    panelText?: string
    bullets?: string[]
    proof?: string
    formTitle?: string
    formText?: string
    confirm?: string
  }
  /** CRM source when the visit carries no paid click id. */
  source: string
  tracking: {
    pixel: string
    ga4: string
    ads: string
    adsLeadLabel: string
    adsBookedLabel: string
    clarity: string
  }
  booking: {
    /** Campaign pages can narrow the classes to one audience. */
    audience: Audience | null
    /** GHL calendar id -> display label or hidden. Webhooks always carry the raw GHL name. */
    programOverrides: Record<string, { label?: string; hide?: boolean }>
    /** "calendarId|HH:MM" of classes the academy retired while GHL catches up. */
    retiredSlots: string[]
  }
}
