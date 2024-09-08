import { eq } from "drizzle-orm";
import { PgSelectBase, PgSelectQueryBuilderBase, PgSelectWithout } from "drizzle-orm/pg-core";
import { DrizzlePgTable } from "src/types";

export function createJoinQuery<TQueryBase extends Omit<PgSelectBase<any, any, any, any, any, any, any, any>, 'where'>>(
    query: TQueryBase,
    subTablesWith: [string, DrizzlePgTable][],
) {
    for(const [_, table] of subTablesWith) {
        query = query.fullJoin(table, eq(table.id, table.id)) as any;
    }
    return query;
}