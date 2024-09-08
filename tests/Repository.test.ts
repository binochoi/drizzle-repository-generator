// sum.test.js
import { expect, test } from 'vitest'
import { db } from 'src/mocks/db';
import { user, userLocal as local } from 'src/mocks/schema';
import { Repository } from 'src/Repository.example';

(async () => {
    const repo = Repository(db, user, { local });
    const withFind = await repo
        .with('local')
        .find({
            
        })
        .returnAll()
    const find = await repo
        .find({
            id: 2
        })
        .returnFirst()
})();

// console.log(userRelations.config((a) => )); /* @DELETE  */
// test('findOne', () => {
// })