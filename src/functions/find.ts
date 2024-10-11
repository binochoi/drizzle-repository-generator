import { getTableColumns } from "drizzle-orm";
import { PgDatabase, PgSelectBase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { DrizzlePgTable, Simplify, UnionToIntersection, WhereQuery } from "src/types";
import { createJoinQuery } from "src/utils/createJoinQuery";
import { createWhereQuery } from "src/utils/createWhereQuery";

const find = <
    TTable extends PgTableWithColumns<any>,
    TSubTablesWith extends [string, DrizzlePgTable][] | undefined,
    TSubTablesWithColumns extends TSubTablesWith extends undefined ? {} : NonNullable<TSubTablesWith>[number][1]['_']['columns'],
>(
    db: PgDatabase<any ,any, any>,
    table: TTable,
    subTablesWith?: TSubTablesWith,
) => {
    const subTableColumns = Object.fromEntries(
        subTablesWith?.map(
            ([_, subTable]) => Object.entries(getTableColumns(subTable))
        ).flat() || []
    ) as TSubTablesWith extends undefined ? {} : NonNullable<TSubTablesWith>[number][1]['_']['columns'];
    const fullColumns: TTable['_']['columns'] & TSubTablesWithColumns = {
        ...getTableColumns(table),
        ...subTableColumns,
    }
    return <
        TEntity extends Simplify<TMainEntity & TSubEntity>,
        TMainEntity extends TTable['$inferSelect'],
        TSubEntity extends TSubTablesWith extends undefined ? {} : UnionToIntersection<NonNullable<TSubTablesWith>[number][1]['$inferSelect']>,
    >(where?: WhereQuery<TEntity>) => {
        const selectQuery = createSelectQuery(db, table, subTablesWith || []);
        const whereQuery = createWhereQuery(selectQuery, where || {}, fullColumns);
        const query = where ? whereQuery : selectQuery;
        if(subTablesWith) {
            const joinQuery = createJoinQuery(query, table, subTablesWith);
            return getReturnBase<TEntity, typeof joinQuery>(joinQuery);
        }
        return getReturnBase<TEntity, typeof whereQuery>(whereQuery);
    }
}
function getReturnBase<TEntity extends object, TQueryBase extends Omit<PgSelectBase<any, any, any, any, any, any>, 'where'>>(query: TQueryBase) {
    return {
        returnFirst: async (): Promise<TEntity | null> => (await query.limit(1) as any)[0],
        returnAll: async (): Promise<TEntity[]> => query as any,
        // withCount
    }
}
function createSelectQuery<
    TDatabase extends PgDatabase<any ,any, any>,
    TTable extends PgTableWithColumns<any>
>(
    db: TDatabase,
    table: TTable,
    subTablesWith: [string, DrizzlePgTable][]
) {
    const subtableColumns = subTablesWith
        .map(([_, table]) => table)
        .map((table) => getTableColumns(table))
        .reduce((prev, current) => ({
            ...prev,
            ...current,
        }), {})
    return db.select({
        ...subtableColumns,
        ...getTableColumns(table),
    })
    .from(table)
}
export default find;