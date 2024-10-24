import { PgDatabase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { EntityBase, QueryResult, SubTablesWith, SubTypesToInsertEntity, SubTypesToSelectEntity, UnionToIntersection } from "src/types";
import { createDeleteQuery } from "./delete/index";
import { mergeObjectArray } from "src/utils/mergeObjectArray";

const remove = <
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
                execute: () => db.transaction(async (tx) => {
                    const rows = await Promise.all(
                        createDeleteQuery(tx, table, subTablesWith)(data).filter((q) => q)
                    )
                    return mergeObjectArray(rows) as unknown as void;
                }),
                returning: () => db.transaction(async (tx) => {
                    const rows = await Promise.all(
                        createDeleteQuery(tx, table, subTablesWith)(data).filter((q) => q).map((q) => q!.returning().then(([row]) => row))
                    )
                    return mergeObjectArray(rows) as TResult;
                }),
                toSQLarray: () => createDeleteQuery(db, table, subTablesWith)(data).map((q) => q?.toSQL())
            })
}

export default remove;
