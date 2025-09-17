import { SelectedFields } from "drizzle-orm";
import { PgDatabase, PgTableWithColumns } from "drizzle-orm/pg-core";
import { DrizzlePgTable } from "src/types";
import find from "./find";

const select = <
TTable extends PgTableWithColumns<any>,
TSubTablesWith extends [string, DrizzlePgTable][] | undefined,
>(
    db: PgDatabase<any ,any, any>,
    table: TTable,
    subTablesWith?: TSubTablesWith) => {
    return <TField extends SelectedFields<any, TTable>>(fields: TField) => {
        const selectQuery = db.select(fields).from(table)
        return {
            find: find(db, table, subTablesWith, selectQuery)
        }
    }
}
export default select