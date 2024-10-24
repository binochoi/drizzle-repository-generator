import { PgDatabase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { EntityBase, QueryResult, SubTablesWith, SubTypesToInsertEntity, SubTypesToSelectEntity, UnionToIntersection } from "src/types";
import { createDeleteQuery } from "./delete/index";
import { mergeObjectArray } from "src/utils/mergeObjectArray";
import { createThenable } from "src/utils/createThenable";

const update = <
    TTable extends PgTableWithColumns<any>,
    TSubTablesWith extends SubTablesWith,
>(
    db: PgDatabase<any ,any, any>,
    table: TTable,
    subTablesWith: TSubTablesWith,
) => {
    return <
        TResult extends QueryResult<TTable, TSubTablesWith>,
    >(data: Partial<EntityBase<TTable, TSubTablesWith>>) => ({
                ...createThenable<TResult>(
                    async () => db.transaction(async (tx) => {
                        const rows = await Promise.all(
                            createDeleteQuery(tx, table, subTablesWith)(data)
                                .filter((q) => q)
                                .map((q) => q!.returning())
                        )
                        return mergeObjectArray(rows) as TResult;
                    }
                )),
                toSQLarray: () => createDeleteQuery(db, table, subTablesWith)(data).map((q) => q?.toSQL())
            })
}

export default update;