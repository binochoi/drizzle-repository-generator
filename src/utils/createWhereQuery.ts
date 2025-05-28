import { and, eq, SQL,  } from "drizzle-orm";
import { PgSelectBase } from "drizzle-orm/pg-core";
import { Entity, FullColumns, WhereArrayQuery, WhereArrayQueryRow, WhereQuery } from "src/types";
import { getWhereCondition } from "src/utils/getWhereCondition";

export const createWhereQuery = <
    TQuery extends PgSelectBase<any, any, any>,
    TFullColumns extends FullColumns,
    TEntity extends Entity>(
    query: TQuery,
    where: WhereQuery<TEntity>,
    fullColumns: TFullColumns
) => query.where(
        getWhereConditionQuery(where, fullColumns)
    );

export function getWhereConditionQuery(where: WhereQuery<any>, fullColumns: FullColumns): SQL | undefined {
    if(is2DArrayQuery(where)) {
        return and(
            ...where.map((row) => getConditionOfArrayQueryRow(row, fullColumns)),
        )
    }
    if(isArrayQuery(where)) {
        return getConditionOfArrayQueryRow(where as any, fullColumns);
    }
    if(isSqlQuery(where)) {
        return where;
    }
    return and(
        ...Object.entries(where).map(([key, val]) => eq(fullColumns[key], val)),
    )
}
function getConditionOfArrayQueryRow(where: WhereArrayQueryRow<any>, fullColumns: FullColumns) {
    const [key, condition, val] = where;
    const whereCondition = getWhereCondition(condition);
    const column = fullColumns[key as any];
    if(condition === 'like') {
        return whereCondition(column, val);
    }
    return getWhereCondition(condition)(val, column);
}
function is2DArrayQuery(where: WhereQuery<any>): where is WhereArrayQueryRow<any> {
    return Array.isArray(where) && Array.isArray(where[0]);
}
function isArrayQuery(where: WhereQuery<any>): where is WhereArrayQuery<any> {
    return Array.isArray(where);
}
function isSqlQuery(where: WhereQuery<any>): where is SQL {
    return 'getSQL' in where;
}