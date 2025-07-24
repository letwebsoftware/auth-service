import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { buildDrizzleDb, buildFastifyApp } from "../src/index";
import { runMigrations } from "./setup/runMigration";
import { Config } from "../src/config";
import { usersTable } from "../src/db/schema";

let app: ReturnType<typeof buildFastifyApp>;
let db: ReturnType<typeof buildDrizzleDb>;
let config = Config().get();

beforeAll(async () => {
  app = buildFastifyApp();
  db = buildDrizzleDb();
  await runMigrations();
  await app.ready();
});

beforeEach(async () => {
  await db.delete(usersTable);
});

afterAll(async () => {
  await app.close();

});

describe("Auth Service", () => {
  it("shouldnt login a user", async () => {
    const response = await request(app.server)
      .post("/login")
      .send({ email: "test2@test.com", password: "pass" });
    expect(response.status).toBe(401);
  });

  it("should register a user", async () => {
    const response = await request(app.server)
      .post("/register")
      .send({ email: "test2@test.com", password: "pass" });
    expect(response.status).toBe(201);
  });

  it("should login a user", async () => {
    
    // First, register a user
    await request(app.server)
      .post("/register")
      .send({ email: "test2@test.com", password: "pass" });

    const response = await request(app.server)
      .post("/login")
      .send({ email: "test2@test.com", password: "pass" });
    expect(response.status).toBe(200);
  });
});
