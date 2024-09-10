import { getTableColumns } from "drizzle-orm";
import { PgDatabase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { DrizzlePgTable } from "src/types";
import { getConditionQuery } from "src/utils/createWhereQuery";
import { pickObjectProps } from "src/utils/pickObjectProps";
import { SetOptional, UnionToIntersection } from "type-fest";

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
    >(data: Partial<TEntity>) => {
        return {
            where: (where: Partial<TEntity>) => db.transaction(
                async tx => {
                    const payload = pickObjectProps(data, getTableColumns(table)) as any;
                    const whereQuery = getConditionQuery(where, getTableColumns(table));
                    let mainData;
                    if(Object.entries(payload).length !== 0) {
                        [mainData] = await tx
                            .update(table)
                            .set(payload)
                            .where(whereQuery)
                            .returning();
                    }
                    const result = subTablesWith
                        .map<DrizzlePgTable>(([_, tables]) => tables as any)
                        .map(
                            (subtable) => {
                                const payload = pickObjectProps(data, getTableColumns(subtable));
                                const isNotInsertionOfThisTable = Object.keys(payload).length === 0;
                                if(isNotInsertionOfThisTable) {
                                    return;
                                }
                                return tx
                                    .update(subtable)
                                    .set(payload)
                                    .where(
                                        getConditionQuery(where, getTableColumns(subtable)),
                                    )
                                    .returning();
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
                }
            )
        }
    }
}

export default update;