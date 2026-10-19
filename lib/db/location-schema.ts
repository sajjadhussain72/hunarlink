import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const serviceLocation = pgTable('service_location', { id: uuid('id').defaultRandom().primaryKey(), name: text('name').notNull(), region: text('region').notNull(), parentLocationId: uuid('parent_location_id'), description: text('description'), active: boolean('active').notNull().default(true), serviceAvailable: boolean('service_available').notNull().default(true), createdAt: timestamp('created_at').notNull().defaultNow(), updatedAt: timestamp('updated_at').notNull().defaultNow() })
export const professionalLocation = pgTable('professional_location', { professionalId: uuid('professional_id').notNull(), locationId: uuid('location_id').notNull() })
export type ServiceLocation = typeof serviceLocation.$inferSelect
export type NewServiceLocation = typeof serviceLocation.$inferInsert

export const initialLocations = [
  { name: 'Gilgit', region: 'Gilgit-Baltistan', description: 'Gilgit region' },
  { name: 'Hunza', region: 'Gilgit-Baltistan', description: 'Hunza region' },
  { name: 'Gilgit City', region: 'Gilgit' }, { name: 'Danyor', region: 'Gilgit' }, { name: 'Nomal', region: 'Gilgit' }, { name: 'Kondass', region: 'Gilgit' }, { name: 'Sekwar', region: 'Gilgit' },
  { name: 'Central Hunza', region: 'Hunza' }, { name: 'Aliabad', region: 'Hunza' }, { name: 'Karimabad', region: 'Hunza' }, { name: 'Altit', region: 'Hunza' }, { name: 'Ganish', region: 'Hunza' },
] as const

export const locationRegions = ['Gilgit', 'Hunza'] as const
