import { describe, expect, test } from 'vitest'
import { db, client } from 'src/mocks/db';
import { user, userLocal as local, userOauth as oauth } from 'src/mocks/schema';
import { Repository } from 'src/Repository';
import { sql } from 'drizzle-orm';

type User = Omit<typeof user.$inferSelect & typeof local.$inferSelect, 'id'>;

const userMocks: User[] = [{
    mail: 'bonoself@gmail.com',
    name: 'binochoi',
    password: 'asd123',
    phoneNumber: '+81 1082918271',
}]
const repo = Repository(db, user, { local });
const userRepo = Repository(db, user);
// test('try to connect db', async () => client.connect())
describe('insert', () => {
    test('insert one', async () => {
        const record = await repo.insert(userMocks[0]);
        expect(record).toMatchObject(userMocks[0]);
    })
})
describe('find', () => {
    test('find with join', async () => {
        const record = await repo.with('local').find().returnFirst();
        expect(record).toMatchObject(userMocks[0]);
    })
})
const updateMock = { name: 'a', password: 'gooooo' };
describe('update', () => {
    test('update one', async () => {
        const record = await repo.update(updateMock).where({ id: 1 });
        const { password: _, ...restMock } = userMocks[0];
        expect(record).toMatchObject({
            ...restMock,
            ...updateMock,
            id: 1,
        });
    })
})
describe('delete', () => {
    test('delete one', async () => {
        const record = await repo.delete(updateMock);
        expect(record).toMatchObject({ ...userMocks[0], ...updateMock,  id: 1 });
    })
})
describe('transaction', () => {
    test('manipulate', async () => {
        await db.transaction(async (tx) => {
            const repo = Repository(tx, user);
            await repo.insert({ mail: 'one' });
            await repo.insert({ mail: 'two' });
            await repo.insert({ mail: 'three' });
        })
        const list = await db.select().from(user);
        expect(list).toHaveLength(3);
    });
})
test('upsert', async () => {
    await userRepo.insert({
        id: 112,
        name: 'mcdonald trump'
    })
    const upsertMock = {
        id: 112,
        name: 'johnzaller',
    };
    await userRepo.insert(upsertMock, { onConflict: 'update' })
    const user = await userRepo.find({ id: 112, name: 'johnzaller' }).returnFirst();
    expect(user).toMatchObject(upsertMock);
});