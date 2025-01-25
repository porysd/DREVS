import {describe, beforeAll, afterAll, beforeEach, afterEach, it, expect} from 'bun:test'
import {PostgresJSDialect} from 'kysely-postgres-js'
import postgres from 'postgres'
import {Kysely, Migrator, FileMigrationProvider, NO_MIGRATIONS, PostgresDialect} from 'kysely'
import {type DB} from 'kysely-codegen'
import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { Pool } from 'pg'

describe("database authentication", () => {
  let db:Kysely<DB>| undefined = undefined;
  const postgresDB = new Pool({
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
      dialect: new PostgresDialect({
        pool:postgresDB,
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
    const migrationRes = await migrator.migrateToLatest()
    console.log(migrationRes);
    afterAll( async () => {
      const migrationResult = await migrator?.migrateDown()
      console.log(migrationResult);
      await postgresDB.end()
    })
  })
  
  it("it should create a user", async () => {
    const result = await db?.insertInto("auth.basic_user").values({
      email: "sample@email.com",
      password: "sample123"
    }).returningAll().executeTakeFirst()
    console.log(result);
  })
})