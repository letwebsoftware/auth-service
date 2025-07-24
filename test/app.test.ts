import { it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { buildDrizzleDb, buildFastifyApp } from "../src/index";
import { runMigrations } from "./setup/runMigration";
import { usersTable } from "../src/db/schema";

let app: ReturnType<typeof buildFastifyApp>;
let db: ReturnType<typeof buildDrizzleDb>;

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

  expect(response.body).toHaveProperty("token");
  expect(response.body).toHaveProperty("refreshToken");
  expect(response.status).toBe(200);
});

it("should not register a user with missing fields", async () => {
  const response = await request(app.server)
    .post("/register")
    .send({ email: "test2@test.com" });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe("Email and password are required");
});

it("should not login a user with missing fields", async () => {
  const response = await request(app.server)
    .post("/login")
    .send({ email: "test2@test.com" });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe("Email and password are required");
});

it("should not login a user with wrong password", async () => {
  // First, register a user
  await request(app.server)
    .post("/register")
    .send({ email: "test2@test.com", password: "pass" });

  const response = await request(app.server)
    .post("/login")
    .send({ email: "test2@test.com", password: "wrongpass" });

  expect(response.status).toBe(401);
  expect(response.body.error).toBe("Unauthorized");
});

it("should refresh a token", async () => {
  // First, register a user
  await request(app.server)
    .post("/register")
    .send({ email: "test2@test.com", password: "pass" });

  // Then, login to get the refresh token
  const loginResponse = await request(app.server)
    .post("/login")
    .send({ email: "test2@test.com", password: "pass" });

  const response = await request(app.server)
    .post("/refresh")
    .send({ refreshToken: loginResponse.body.refreshToken });

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("token");
  expect(response.body).toHaveProperty("refreshToken");
});