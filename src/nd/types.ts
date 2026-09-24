// Shape of src/nd/client.ts, the only per-academy file of the Novo Dash kit.
export type Audience = 'adults' | 'kids'

export type Client = {
  academy: { name: string; phone: string; address: string; mapsUrl: string }
  ghl: { locationId: string; leadWebhookUuid: string }
  /** The academy's offer, when it is not a single free class ("free week"). */
  copy?: { panelTitle?: string; panelText?: string; formTitle?: string; confirm?: string }
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
