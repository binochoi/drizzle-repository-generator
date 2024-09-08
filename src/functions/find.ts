import { getTableColumns } from "drizzle-orm";
import { PgDatabase, PgSelectBase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { DrizzlePgTable, WhereQuery } from "src/types";
import { createJoinQuery } from "src/utils/createJoinQuery";
import { createWhereQuery } from "src/utils/createWhereQuery";
import { UnionToIntersection } from "type-fest";

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
            ([_, subTable]) => Object.entries(subTable._.columns)
        ).flat() || []
    ) as TSubTablesWith extends undefined ? {} : NonNullable<TSubTablesWith>[number][1]['_']['columns'];
    const fullColumns: TTable['_']['columns'] & TSubTablesWithColumns = {
        ...table._.columns,
        ...subTableColumns,
    }
    return <
        TEntity extends TMainEntity & TSubEntity,
        TMainEntity extends TTable['$inferSelect'],
        TSubEntity extends TSubTablesWith extends undefined ? {} : UnionToIntersection<NonNullable<TSubTablesWith>[number][1]['$inferSelect']>,
    >(where: WhereQuery<TEntity>) => {
        const selectQuery = createSelectQuery(db, table, subTablesWith);
        const whereQuery = createWhereQuery(selectQuery, where, fullColumns);
        if(subTablesWith) {
            const joinQuery = createJoinQuery(whereQuery, subTablesWith);
            return getReturnBase<TEntity, typeof joinQuery>(joinQuery);
        }
        return getReturnBase<TEntity, typeof whereQuery>(whereQuery);
    }
}
function getReturnBase<TEntity extends object, TQueryBase extends Omit<PgSelectBase<any, any, any, any, any, any>, 'where'>>(query: TQueryBase) {
    return {
        ...query,
        returnFirst: async (): Promise<TEntity> => query.limit(1) as any,
        returnAll: async (): Promise<TEntity[]> => query as any,
    }
}
function createSelectQuery<
    TDatabase extends PgDatabase<any ,any, any>,
    TTable extends PgTableWithColumns<any>
>(
    db: TDatabase,
    table: TTable,
    subTablesWith?: [string, DrizzlePgTable][]
) {
    return db.select({
        ...getTableColumns(table),
        ...subTablesWith?.map(([_, table]) => table).map(getTableColumns)
    })
    .from(table)
}
export default find;