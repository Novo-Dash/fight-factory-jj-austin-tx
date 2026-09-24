import raw from './client'
import type { Client } from './types'

export const client = raw as Client

export const copy = {
  panelTitle: 'Your first class is free.',
  panelText: 'One full class, no cost, nothing to sign afterwards.',
  formTitle: 'Book a free class',
  confirm: 'Confirm my free class',
  ...client.copy,
}

/** Webhook 2 and get_programs: the shared n8n flow, fixed for every academy. */
export const BOOKING_WEBHOOK = 'https://n8n.novodash.com/webhook/landing-page-booking'

/** Webhook 1: the [ND] Primary Workflow inbound trigger of the academy's sub-account. */
export const LEAD_WEBHOOK =
  client.ghl.locationId && client.ghl.leadWebhookUuid
    ? `https://services.leadconnectorhq.com/hooks/${client.ghl.locationId}/webhook-trigger/${client.ghl.leadWebhookUuid}`
    : ''
