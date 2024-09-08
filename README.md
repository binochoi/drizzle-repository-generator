# prerequisites
각 테이블들은 같은 이름의 column을 소지하면 안 됨.
해당 제약조건을 지킨다면 모든 table을 하나의 entity처럼 다룰 수 있음.

```ts
const repo = new Repository(db, user, {
        social: userOauth,
        local: {
            table: userLocal,
            // default is `id`
            map: ({ id }) => id,
        }
    }
);
repo.transaction();

repo
    .with('local', 'oauth')
    .find({ id })
    .returnFirst();

await repo
    .with('local')
    .find(
        ['role', '=', role.Admin],
        ['createdAt', '>', new Date()],
    )
    .returnAll()
userRepo.insert(data).returning();
userRepo
    .update({ password })
    .where({ id })
    .returning();
userRepo
    .delete()
    .where({ id })
    .returning();
userRepo
    .move()
    .where()
    .to();
```