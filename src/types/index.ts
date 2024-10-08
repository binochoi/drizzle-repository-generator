import { PgColumn, PgTableWithColumns } from "drizzle-orm/pg-core"
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
export type WhereArrayQueryRow<TEntity extends Entity> = [keyof TEntity, WhereCondition, TEntity[keyof TEntity]];
export type WhereArrayQuery<TEntity extends Entity> = WhereArrayQueryRow<TEntity>[];
export type WhereQuery<TEntity extends Entity> = WhereObjectQuery<TEntity> | WhereArrayQuery<TEntity> | WhereArrayQueryRow<TEntity>
export type FullColumns = {
    [K: string]: PgColumn<any>
};