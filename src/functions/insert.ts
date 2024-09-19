import { getTableColumns } from "drizzle-orm";
import { PgDatabase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { DrizzlePgTable, UnionToIntersection } from "src/types";
import { pickObjectProps } from "src/utils/pickObjectProps";
import { SetOptional } from "type-fest";

const insert = <
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
        TResult extends TMainResult & TSubResult,
        TMainResult extends TTable['$inferSelect'],
        TSubResult extends UnionToIntersection<TSubTablesWith[number][1]['$inferSelect']>,
    >(data: SetOptional<TEntity, 'id'>) => db.transaction(
        async tx => {
            const values = pickObjectProps(data, table) as any;
            const [mainData] = await tx.insert(table).values(values).returning();
            const { id } = mainData;
            const result = subTablesWith
                .map<DrizzlePgTable>(([_, tables]) => tables as any)
                .map(
                    (subtable) => {
                        const payload = pickObjectProps(data, getTableColumns(subtable));
                        const isNotInsertionOfThisTable = Object.keys(payload).length === 0;
                        if(isNotInsertionOfThisTable) {
                            return;
                        }
                        return tx.insert(subtable).values({ ...payload, id }).returning();
                    }
                )
            const row = await Promise.all(
                result
                    .map(async (query) => {
                        const [row] = (await query) || [];
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

export default insert;