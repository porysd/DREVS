import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createSchema("auth").execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropSchema("auth").cascade().execute()
}