import { getTableColumns } from "drizzle-orm";
import { PgDatabase, PgTableWithColumns, PgTransaction } from "drizzle-orm/pg-core";
import { DrizzlePgTable, SubTablesWith } from "src/types";
import { getWhereConditionQuery } from "src/utils/createWhereQuery";
import { pickObjectProps } from "src/utils/pickObjectProps";

export const createDeleteQuery = <
TTable extends PgTableWithColumns<any>,
TSubTablesWith extends SubTablesWith,
>(
    dbOrTx: PgTransaction<any, any, any> | PgDatabase<any, any, any>,
    table: TTable,
    subTablesWith: TSubTablesWith,
) => (data: object) => {
    const mainQuery = dbOrTx.delete(table).where(
        getWhereConditionQuery(
            pickObjectProps(data, getTableColumns(table)),
            getTableColumns(table)
        )
    )
    const subQueries = subTablesWith
        .map<DrizzlePgTable>(([_, tables]) => tables as any)
        .map(
            (subtable) => {
                const payload = pickObjectProps(data, getTableColumns(subtable));
                const isNotInsertionOfThisTable = Object.keys(payload).length === 0;
                if(isNotInsertionOfThisTable) {
                    return;
                }
                const query = dbOrTx.delete(subtable);
                return query.where(
                    getWhereConditionQuery(payload, getTableColumns(subtable))
                )
            }
        )
    const fullQueries = [mainQuery, ...subQueries];
    return fullQueries;
}