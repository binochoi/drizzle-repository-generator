import { Column, asc, desc } from "drizzle-orm";
import { OrderBy, OrderBy2DArray, OrderByArray, WhereQuery } from "src/types";
const directions = { asc, desc }
/**
 * ```ts
 * const query = createOrderQuery(['id', 'asc']);
 * const query = createOrderQuery([
 *     ['id', 'asc'],
 *     ['name', 'desc'],
 * ]);
 * const query = createOrderQuery([
 *     asc(...),
 *     desc(...),
 * ]);
 * ```
 */
export const createOrderQuery = (orderBy: OrderBy<any>, fullColumns: Record<string, Column>) => {
    if(is2DArrayQuery(orderBy)) {
        return [
            ...orderBy.map(([columnName, direction]) => directions[direction](fullColumns[columnName])),
        ];
    }
    if(isArrayQuery(orderBy)) {
        const [columnName, direction] = orderBy;
        return directions[direction](fullColumns[columnName]);
    }
    return orderBy;
};


function is2DArrayQuery(orderBy: OrderBy<any>): orderBy is OrderBy2DArray<any> {
    return Array.isArray(orderBy) && Array.isArray(orderBy[0]);
}
function isArrayQuery(orderBy: OrderBy<any>): orderBy is OrderByArray<any> {
    return Array.isArray(orderBy);
}