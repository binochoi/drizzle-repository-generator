# Installation
```
pnpm add drizzle-repository-generator
```
# How to use
## basic
```ts
const repo = Repository(db, user);
// find
await repo.find({ id }).returnFirst();
// insert
await repo.insert(data);
// upsert
await repo.insert(data, { onConflict: 'update' });
// update
await repo.update(data).where({ id: 1 });
// delete
await repo.delete(where);
```
## complex query
### find
```ts
const repo = Repository(db, user, { local });
await repo.with('local').find({ id }).returnFirst();
await repo.with('local').find(['id', '=', 2]).returnFirst();
await repo.with('local').find(eq(/** ... */)).returnFirst();
await repo.with('local').find([
    ['name', 'like', '%john%'],
    ['age', '>', 20],
    // ...
]).returnMany();
```
### DML
```ts
// update
await repo.update(data).where({
    id: 1,
    name: 'john',
});
await repo.delete(data).where([
    'id', '=', 1,
    'name', '=', 'john',
]);
```
## transaction
```ts
await db.transaction((tx) => {
    const userRepo = Repository(tx, user);
    const sessionRepo = Repository(tx, session);
    await userRepo.insert(user);
    await sessionRepo.insert(session);
})
```

# compatible
- **postgres** implemented only
- **sqlite** considering

# Warn
- primary key have to fixed to be `id` yet. cause every table mapped by this.
- tests are not enough. please open issue whenever finding bugs for appreciate.

# TODO
- [ ] Support selecting specific columns when returning (through select() chain)
- [ ] Allow choosing whether to return data or not
- [ ] Remove explicit record type from returning promise

# understanding how to work
[deepwiki link](https://deepwiki.com/binochoi/drizzle-repository-generator)
(thx to [regenrek](https://github.com/regenrek))

# contributing
**docker compose prerequired**
1. copy .env.example -> .env
2. docker compose up (for execute pg server)
3. test your feature with `test` script