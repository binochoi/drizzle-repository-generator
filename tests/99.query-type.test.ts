import { describe, expect, test } from 'vitest'
import { db } from "src/mocks/db";
import { user, userLocal as local } from "src/mocks/schema";
import { Repository } from "src/Repository";
import { OrderBy } from 'src/types';



const repo = Repository(db, user);
const repoWith = Repository(db, user, { local });

test('insert for test mock', async () => {
    await db.transaction(async (tx) => {
        const repo = Repository(tx, user, { local });
        const insertPromises = Array.from({ length: 100 }, (_, i) => 
            repo.insert({
                mail: `${i}@gmail.com`,
                name: `${i}`,
                password: `pw-${i}`,
                phoneNumber: `+82 1028192839${i}`,
            })
        );
        await Promise.all(insertPromises);
    })
})
describe('complex query', async () => {
    const find = (orderBy: OrderBy<any>) => repo.find().returnMany({
        limit: 5,
        offset: 0,
        orderBy,
    });
    test('find asc', async () => {
        const [record] = await find([
            ['id', 'asc'],
        ]);
        expect(record.id).lessThan(100);
    })
    test('find desc', async () => {
        const [record] = await find(['id', 'desc']);
        expect(record.id).greaterThan(100);
    })
    test('find intersection array', async () => {
        const record = await repoWith.with('local').find([
            ['id', '>', 60],
            ['id', '<', 80],
        ]).returnMany({
            limit: 10,
            offset: 0,
        });
        expect(record.length).toBe(10);
    })
    test('find object query', async () => {
        const record = await repoWith.with('local').find({
            id: 33,
        }).returnFirst();
        expect(record).toMatchObject({
            id: 33,
        });
    })
    test('update with array query', async () => {
        const record = await repo
            .update({
                name: 'updated',
            })
            .where(['id', '=', 33])
        expect(record).toMatchObject({ name: 'updated', id: 33 });
    })
    test('delete with object query', async () => {
        const record = await repo.delete({ id: 30 })
        expect(record).toMatchObject({ id: 30 });
    })
})