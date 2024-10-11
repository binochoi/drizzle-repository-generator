// sum.test.js
import { describe, expect, test } from 'vitest'
import { db, client } from 'src/mocks/db';
import { user, userLocal as local, userOauth as oauth } from 'src/mocks/schema';
import { Repository } from 'src/Repository';

type User = Omit<typeof user.$inferSelect & typeof local.$inferSelect, 'id'>;

const userMocks: User[] = [{
    mail: 'bonoself@gmail.com',
    name: 'binochoi',
    password: 'asd123',
    phoneNumber: '+81 1082918271',
}]
const repo = Repository(db, user, { local });

test('try to connect db', async () => client.connect())
describe('insert', () => {
    test('insert one', async () => {
        repo.insert({
            ...userMocks[0],
        });
    })
    test('insert with join', async () => {
        const record = await repo.find().returnFirst();
        expect(record).toMatchObject(userMocks[0]);
    })
})