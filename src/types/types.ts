import { DrizzlePgTable } from ".";

export type Simplify<T> = {[KeyType in keyof T]: T[KeyType]} & {};
export type UnionToIntersection<Union> = (
	// `extends unknown` is always going to be the case and is used to convert the
	// `Union` into a [distributive conditional
	// type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
	Union extends unknown
		// The union type is used as the only argument to a function since the union
		// of function arguments is an intersection.
		? (distributedUnion: Union) => void
		// This won't happen.
		: never
		// Infer the `Intersection` type since TypeScript represents the positional
		// arguments of unions of functions as an intersection of the union.
) extends ((mergedIntersection: infer Intersection) => void)
	// The `& Union` is to allow indexing by the resulting type
	? Intersection & Union
	: never;
	

export type AnyToObj<T> = T extends any ? {} : T;
export type SubTablesWith = [string, DrizzlePgTable][];
export type SubTypesToInsertEntity<T extends SubTablesWith> = UnionToIntersection<AnyToObj<T[number][1]['$inferInsert']>>;
export type SubTypesToSelectEntity<T extends SubTablesWith> = UnionToIntersection<AnyToObj<T[number][1]['$inferSelect']>>;