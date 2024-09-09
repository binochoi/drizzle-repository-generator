import { eq } from "drizzle-orm";
import { PgSelectBase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { DrizzlePgTable } from "src/types";

export function createJoinQuery<
    TQueryBase extends Omit<PgSelectBase<any, any, any, any, any, any, any, any>, 'where'>,
    TTable extends PgTableWithColumns<any>
>(
    query: TQueryBase,
    table: TTable,
    subTablesWith: [string, DrizzlePgTable][],
) {
    for(const [_, subTable] of subTablesWith) {
        query = query.fullJoin(subTable, eq(table.id, subTable.id)) as any;
    }
    return query;
}