import { getTableColumns } from "drizzle-orm";
import { PgDatabase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { DrizzlePgTable, SubTablesWith, UnionToIntersection } from "src/types";
import { pickObjectProps } from "src/utils/pickObjectProps";
import { SubTypesToInsertEntity, SubTypesToSelectEntity } from 'src/types/types';
import { SetOptional } from "type-fest";

const insert = <
    TTable extends PgTableWithColumns<any>,
    TSubTablesWith extends SubTablesWith,
>(
    db: PgDatabase<any ,any, any>,
    table: TTable,
    subTablesWith: TSubTablesWith,
) => {
    return <
        TEntity extends TMainEntity & TSubEntity,
        TMainEntity extends TTable['$inferInsert'],
        TSubEntity extends SubTypesToInsertEntity<TSubTablesWith>,
        TResult extends TMainResult & TSubResult,
        TMainResult extends TTable['$inferSelect'],
        TSubResult extends SubTypesToSelectEntity<TSubTablesWith>,
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