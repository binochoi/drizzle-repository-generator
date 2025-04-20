import { sql } from "drizzle-orm";
import { db } from "src/mocks/db";
import { user, userLocal as local, userOauth as oauth } from "src/mocks/schema";
db
    .execute(sql`
        DROP TABLE IF EXISTS
            ${user},
            ${local},
            ${oauth}
        CASCADE;
    `)
    .execute()
    .then(() => process.exit(0));