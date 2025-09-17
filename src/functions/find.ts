import { Column, getTableColumns } from "drizzle-orm";
import { PgDatabase, PgSelectBase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { JoinNullability, SelectResult } from "drizzle-orm/query-builders/select.types";
import { DrizzlePgTable, OrderBy, Simplify, UnionToIntersection, WhereQuery } from "src/types";
import { createJoinQuery } from "src/utils/createJoinQuery";
import { createOrderQuery } from "src/utils/createOrderQuery";
import { createWhereQuery } from "src/utils/createWhereQuery";
import { mergeObjectArray } from "src/utils/mergeObjectArray";
import { IsAny } from "type-fest";
type ReturningParams<TEntity extends object> = {
    offset?: number,
    limit?: number,
    orderBy?: OrderBy<keyof TEntity & string>,
}

const find = <
    TTable extends PgTableWithColumns<any>,
    TSubTablesWith extends [string, DrizzlePgTable][] | undefined,
    TSubTablesWithColumns extends (TSubTablesWith extends undefined ? {} : NonNullable<TSubTablesWith>[number][1]['_']['columns']),
    TSelectBase extends PgSelectBase<any, any, any>,
>(
    db: PgDatabase<any ,any, any>,
    table: TTable,
    subTablesWith: TSubTablesWith,
    selectBase?: TSelectBase,
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
        const selectQuery = selectBase || createSelectQuery(db, table, subTablesWith || []);
        const whereQuery = createWhereQuery(selectQuery, where || {}, fullColumns);
        const query = where ? whereQuery : selectQuery;
        if(subTablesWith) {
            const joinQuery = createJoinQuery(query as any, table, subTablesWith);
            return getReturnBase<TEntity, typeof joinQuery, TSelectBase>(joinQuery, fullColumns);
        }
        return getReturnBase<TEntity, typeof whereQuery, TSelectBase>(
            whereQuery,
            fullColumns
        );
    }
}
function getReturnBase<TEntity extends object, TQueryBase extends Omit<PgSelectBase<any, any, any, any, any, any>, 'where'>, TSelect extends PgSelectBase<any, any, any>,
>(
    query: TQueryBase,
    fullColumns: Record<string, Column>
) {
    type Selection = SelectResult<TSelect, 'single', Record<string, JoinNullability>>['_']['selection'];
    type Result = IsAny<Selection> extends true ? TEntity : Selection;
    return {
        returnFirst: async (): Promise<Result | null> => (await query.limit(1) as any)[0] || null,
        returnMany: async ({ limit, offset, orderBy }: ReturningParams<Result> = {}): Promise<Result[]> => {
            let queryResult = (query as any)
            .offset(offset || 0)
            .limit(limit || 200)
            if(orderBy) {
                const state = createOrderQuery(orderBy, fullColumns);
                return queryResult.orderBy(...(Array.isArray(state) ? state : [state]));
            }
            return queryResult;
        },
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
    const subtableColumns = mergeObjectArray(
        subTablesWith
            .map(([_, table]) => table)
            .map((table) => getTableColumns(table))
    )
    return db.select({
        ...subtableColumns,
        ...getTableColumns(table),
    })
    .from(table)
}
export default find;