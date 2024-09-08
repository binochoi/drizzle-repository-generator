import { and, eq, SQL } from "drizzle-orm";
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
        getConditionQuery(where, fullColumns)
    );

function getConditionQuery(where: WhereQuery<any>, fullColumns: FullColumns): SQL | undefined {
    if(isArrayQueryRow(where)) {
        return getConditionOfArrayQueryRow(where, fullColumns);
    }
    else if(isArrayQuery(where)) {
        return and(
            ...where.map((row) => getConditionOfArrayQueryRow(row, fullColumns)),
        )
    } else {
        return and(
            ...Object.entries(where).map(([key, val]) => eq(fullColumns[key], val)),
        )
    }
}
function getConditionOfArrayQueryRow(where: WhereArrayQueryRow<any>, fullColumns: FullColumns) {
    const [key, condition, val] = where;
    return getWhereCondition(condition)(fullColumns[key as any], val);
}
function isArrayQueryRow(where: WhereQuery<any>): where is WhereArrayQueryRow<any> {
    return Array.isArray(where) && Array.isArray(where[0]);
}
function isArrayQuery(where: WhereQuery<any>): where is WhereArrayQuery<any> {
    return Array.isArray(where);
}