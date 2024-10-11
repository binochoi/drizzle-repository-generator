## TODO
- DML 할 때 리턴 타입이 payload에 따라 달라져야 함
- Promise 반환 시 타입에 record 데이터도 껴있는 문제

# prerequisites
각 테이블들은 같은 이름의 column을 소지하면 안 됨.
해당 제약조건을 지킨다면 모든 table을 하나의 entity처럼 다룰 수 있음.

# How to use
### find
```ts
const repo = Repository(db, user);
await repo.find({ id }).returnFirst();
```
### find with
```ts
const repo = Repository(db, user, { local });
await repo.with('local').find({ id }).returnFirst();
```
### insert
```ts
await repo.insert(data);
```
### update
```ts
await repo.update(data).where({ id: 1 });
```
### delete
```ts
await repo.delete(where);
```
### transaction
```ts
await db.transaction((tx) => {
    const userRepo = Repository(tx, user);
    const sessionRepo = Repository(tx, session);
    await userRepo.insert(user);
    await sessionRepo.insert(session);
})
```