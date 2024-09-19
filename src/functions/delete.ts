import { getTableColumns } from "drizzle-orm";
import { PgDatabase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { DrizzlePgTable, UnionToIntersection } from "src/types";
import { getConditionQuery } from "src/utils/createWhereQuery";
import { pickObjectProps } from "src/utils/pickObjectProps";

const update = <
    TTable extends PgTableWithColumns<any>,
    TSubTablesWith extends [string, DrizzlePgTable][],
>(
    db: PgDatabase<any ,any, any>,
    table: TTable,
    subTablesWith: TSubTablesWith,
) => {
    return <
        TEntity extends TMainEntity & TSubEntity,
        TMainEntity extends TTable['$inferInsert'],
        TSubEntity extends UnionToIntersection<TSubTablesWith[number][1]['$inferInsert']>,
        TResult extends Partial<TMainResult & TSubResult>,
        TMainResult extends TTable['$inferSelect'],
        TSubResult extends UnionToIntersection<TSubTablesWith[number][1]['$inferSelect']>,
    >(data: Partial<TEntity>) => db.transaction(
        async tx => {
            const query = tx.delete(table);
            const [mainData] = await query.where(
                getConditionQuery(
                    pickObjectProps(data, getTableColumns(table)),
                    getTableColumns(table)
                )
            ).returning();
            const result = subTablesWith
                .map<DrizzlePgTable>(([_, tables]) => tables as any)
                .map(
                    (subtable) => {
                        const payload = pickObjectProps(data, getTableColumns(subtable));
                        const isNotInsertionOfThisTable = Object.keys(payload).length === 0;
                        if(isNotInsertionOfThisTable) {
                            return;
                        }
                        const query = tx.delete(subtable);
                        return query.where(
                            getConditionQuery(payload, getTableColumns(subtable))
                        );
                    }
                )
            const row = await Promise.all(
                result
                    .map(async (query) => {
                        const row = (await query) || [];
                        if(!row) {
                            return [];
                        }
                        return Object.entries(row);
                    })
            )
            return {
                ...mainData,
                ...Object.fromEntries(row.flat()),
            } as TResult
        })
}

export default update;