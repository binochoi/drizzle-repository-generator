import { eq, gt, gte, like, lt, lte } from "drizzle-orm";
import { WhereCondition } from "src/types";

export const getWhereCondition = (condition: WhereCondition) => {
    switch(condition) {
        case 'like':
            return like;
        case '<':
            return gt;
        case '<=':
            return gte;
        case '>':
            return lt;
        case '>=':
            return lte;
        case '=':
            return eq;
    }
}
