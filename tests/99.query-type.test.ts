import { describe, expect, test } from 'vitest'
import { db } from "src/mocks/db/postgres-js";
import { user, userLocal as local } from "src/mocks/schema";
import { Repository } from "src/Repository";
import { OrderBy } from 'src/types';
import { gt } from 'drizzle-orm';



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
    test('find like query', async () => {
        await repoWith.insert({
            id: 1500,
            mail: 'mockmail@example.com',
            password: 'mockpassword',
        });
        const record = await repoWith.find([
            ['mail', 'like', '%@example.com%'],
        ]).returnFirst();
        expect(record).toMatchObject({
            id: 1500,
        });
    })
    test('find sql query', async () => {
        const [record] = await repo.find(gt(user.id, 32)).returnMany({
            orderBy: ['id', 'asc'],
        });
        expect(record?.id).toBe(33);
    })
    test('update with array query', async () => {
        const record = await repoWith
            .update({
                name: 'updated',
                password: 'password_is_1234',
            })
            .where(['id', '=', 33])
        expect(record).toMatchObject({ password: 'password_is_1234', id: 33 });
    })
    test('reuse finded row that have timestamp', async () => {
        const findRecord = await repoWith.find({ id: 33 }).returnFirst();
        const insertRecord = await repoWith.insert({
            password: 'asdas',
            name: 'insert record',
        });
        const updated = await repoWith.update({
            name: 'not throwed?',
            createdAt: new Date(),
        }).where({ id: 3 })
        expect(findRecord?.createdAt instanceof Date).toBe(true)
        expect(insertRecord?.createdAt instanceof Date).toBe(true)
        expect(updated?.createdAt instanceof Date).toBe(true)
    })
    test('delete with object query', async () => {
        const record = await repo.delete({ id: 30 })
        expect(record).toMatchObject({ id: 30 });
    })
})