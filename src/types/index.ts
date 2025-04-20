import { PgColumn, PgTableWithColumns } from "drizzle-orm/pg-core"
import { SubTablesWith, SubTypesToInsertEntity, SubTypesToSelectEntity } from "./types";
export * from './types'
export type DrizzlePgTable = PgTableWithColumns<{
	dialect: "pg";
	columns: any;
	schema: any;
	name: any;
}>

export type Entity = {
    [K: string]: any;
};
export type WhereObjectQuery<TEntity extends Entity> = Partial<TEntity>;
export type WhereCondition = '=' | '<' | '<=' | '>' | '>=' | 'like';
export type WhereArrayQueryRow<TEntity extends Entity> = {
    [K in keyof TEntity]: [K, WhereCondition, TEntity[K]]
}[keyof TEntity];
export type WhereArrayQuery<TEntity extends Entity> = WhereArrayQueryRow<TEntity>[];
export type WhereQuery<TEntity extends Entity> = WhereObjectQuery<TEntity> | WhereArrayQuery<TEntity> | WhereArrayQueryRow<TEntity>
export type FullColumns = {
    [K: string]: PgColumn<any>
};

export type EntityBase<
TTable extends PgTableWithColumns<any>,
TSubTablesWith extends SubTablesWith
> = TTable['$inferInsert'] & SubTypesToInsertEntity<TSubTablesWith>;
export type QueryResult<
TTable extends PgTableWithColumns<any>,
TSubTablesWith extends SubTablesWith
> = TTable['$inferSelect'] & SubTypesToSelectEntity<TSubTablesWith>