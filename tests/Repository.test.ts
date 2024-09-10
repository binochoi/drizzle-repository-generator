// sum.test.js
import { expect, test } from 'vitest'
import { db } from 'src/mocks/db';
import { user, userLocal as local } from 'src/mocks/schema';
import { Repository } from 'src/Repository';

type User = Omit<typeof user.$inferSelect & typeof local.$inferSelect, 'id'>;

const users: User[] = [{
    mail: 'bonoself@gmail.com',
    name: 'binochoi',
    password: 'asd123',
    phoneNumber: '+81 1082918271'
}]
const repo = Repository(db, user);
test('insert', async () => {
    const data = await repo.insert({
        password: 'a',
        mail: 'asdsa',
    });
    expect(data).toEqual({ ...users[0], id: 1 });
});
// test('find', async () => {
//     const data = await repo.find({ id: 1 }).returnFirst();
//     if(!data) {
//         throw new Error('data is not exist');
//     }
//     expect(data).toEqual({
//         id: 1,
//         mail: 'bonoself@gmail.com',
//         name: 'binochoi',
//         phoneNumber: '+81 1082918271'
//     });
// });