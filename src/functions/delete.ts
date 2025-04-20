import { PgDatabase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { WhereQuery, EntityBase, QueryResult, SubTablesWith, SubTypesToInsertEntity, SubTypesToSelectEntity, UnionToIntersection } from "src/types";
import { createDeleteQuery } from "./delete/index";
import { mergeObjectArray } from "src/utils/mergeObjectArray";
import { Simplify } from "type-fest";

const remove = <
    TTable extends PgTableWithColumns<any>,
    TSubTablesWith extends SubTablesWith,
>(
    db: PgDatabase<any ,any, any>,
    table: TTable,
    subTablesWith: TSubTablesWith,
) => {
    return <
        TEntity extends Simplify<TMainEntity & TSubEntity>,
        TMainEntity extends TTable['$inferSelect'],
        TResult extends QueryResult<TTable, TSubTablesWith>,
        TSubEntity extends TSubTablesWith extends undefined ? {} : UnionToIntersection<NonNullable<TSubTablesWith>[number][1]['$inferSelect']>,
    >(where: WhereQuery<TEntity>) => db.transaction(async (tx) => {
        const rows = await Promise.all(
            createDeleteQuery(tx, table, subTablesWith)(where)
                .filter((q) => q)
                .map((q) => q!.returning())
        )
        .then((rows) => rows.map(([row]) => row))
        return mergeObjectArray(rows) as TResult;
    })
}

export default remove;