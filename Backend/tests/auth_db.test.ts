import {describe, beforeAll, afterAll, beforeEach, afterEach, it, expect} from 'bun:test'
import {PostgresJSDialect} from 'kysely-postgres-js'
import postgres from 'postgres'
import {Kysely, Migrator, FileMigrationProvider, NO_MIGRATIONS, sql} from 'kysely'
import {type DB} from 'kysely-codegen'
import * as path from 'node:path'
import { promises as fs } from 'node:fs'

describe("database authentication", () => {
  let db:Kysely<DB>| undefined = undefined;
  const postgresDB = postgres({
    database: 'postgres',
    host: 'localhost',
    max: 10,
    port: 5432,
    user: 'postgres',
    password: 'admin123'
  })
  let migrator:Migrator | undefined = undefined;
  beforeAll( async () => {
    db = new Kysely({
      dialect: new PostgresJSDialect({
        postgres:postgresDB,
    }), })
    migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        // This needs to be an absolute path.
        migrationFolder: path.join(__dirname, '../migrations'),
      }),
    })
    await migrator.migrateToLatest()
    afterAll( async () => {
      await migrator?.migrateTo(NO_MIGRATIONS)
      await db?.destroy();
    })
  })
  
  it("it should create a user", async () => {
    const result = await db?.insertInto("auth.basic_user").values({
      email: "sample@email.com",
      password: await Bun.password.hash("sample123")
    }).returningAll().executeTakeFirst()
    expect(result?.password).not.toBe("sample123")
  })
  it("it should find a user by email and password", async () => {
    const result = await db?.selectFrom("auth.basic_user")
      .select(["auth.basic_user.email", "auth.basic_user.id", "auth.basic_user.password"])
      .where("auth.basic_user.email", "=", "sample@email.com")
      .executeTakeFirst()
    expect(await Bun.password.verify("sample123", result?.password || "")).toBeTrue()
    if(result){
      result.password = undefined as any;
    }
    expect(result?.email).toBe("sample@email.com")
    expect(result?.password).toBeUndefined()
  })
  it("it should update the user password and updated_at", async () => {
    const result = await db?.updateTable("auth.basic_user").set({
      password: await Bun.password.hash("sample55"),
      updated_at: sql`current_timestamp`
    }).returningAll().executeTakeFirst()
    expect(result?.password).not.toBe("sample55")
    expect(result?.updated_at).not.toEqual(result?.created_at)
  })
  it("it should delete a user by email", async () => {
    const result = await db?.deleteFrom("auth.basic_user").where("auth.basic_user.email", "=", "sample@email.com").executeTakeFirst();
    expect(result?.numDeletedRows).toBe(1n);
  })
})