import {type Kysely , sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.withSchema("auth").createTable("basic_user")
	.addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
	.addColumn("email", "varchar", (col) => col.notNull().unique())
	.addColumn("password", "varchar", (col) => col.notNull())
	.addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`current_timestamp`))
	.addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`current_timestamp`)).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.withSchema("auth").dropTable("basic_user").cascade().execute()
}
