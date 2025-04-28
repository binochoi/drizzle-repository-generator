import { client } from "src/mocks/db";
import { test } from "vitest";


test('try to connect db', async () => client.connect())