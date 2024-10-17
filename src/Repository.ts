import { PgDatabase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { DrizzlePgTable, Simplify } from "./types";
import find from "./functions/find";
import insert from "./functions/insert";
import update from "./functions/update";
import remove from "./functions/delete";

export const Repository = <
    TTable extends PgTableWithColumns<any>,
    TSubTables extends Record<TSubTableName, DrizzlePgTable>,
    TSubTableName extends string,
>(
    db: PgDatabase<any ,any, any>,
    table: TTable,
    subtablesInput: TSubTables = {} as any,
    // options?: Record<string, any>
) => {
    const subTables: [TSubTableName, TSubTables[keyof TSubTables]][] = Object.entries(subtablesInput) as any;
    const withFn = <
        TWith extends (keyof TSubTables)[],
        SubTablesWith extends (TSubTableName & TWith[number]) extends never ? undefined : [
            TSubTableName & TWith[number],
            TSubTables[(keyof TSubTables) & TWith[number]]
        ][]
    >(...tableNamesWith: TWith) => {
        const subTablesWith = subTables.filter(([key]) => tableNamesWith.includes(key)) as unknown as SubTablesWith;
        return {
            find: find(db, table, subTablesWith),
        }
    }
    return {
        with: withFn,
        find: find(db, table),
        insert: insert(db, table, subTables),
        update: update(db, table, subTables),
        delete: remove(db, table, subTables),
        types: {} as {
            $inferInsert: Simplify<TTable['$inferInsert'] & TSubTables[keyof TSubTables]['$inferInsert']>,
            $inferSelect: Simplify<TTable['$inferSelect'] & TSubTables[keyof TSubTables]['$inferSelect']>,
            $SubTableKey: keyof TSubTables,
        }
    }
}
