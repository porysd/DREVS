import {
	DummyDriver,
	PostgresAdapter,
	PostgresIntrospector,
	PostgresQueryCompiler,
} from 'kysely'
import { defineConfig } from 'kysely-ctl'
import {PostgresJSDialect} from 'kysely-postgres-js'
import postgres from 'postgres'

export default defineConfig({
	// replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
	dialect: new PostgresJSDialect({
    postgres: postgres({
      database: 'postgres',
      host: 'localhost',
      max: 10,
      port: 5432,
      user: 'postgres',
			password: 'admin123'
    }),
  }), 
	
	//   migrations: {
	//     migrationFolder: "migrations",
	//   },
	//   plugins: [],
	//   seeds: {
	//     seedFolder: "seeds",
	//   }
})
