import jwt from "@fastify/jwt";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { hashPassword } from "./utils/hashing";
import { Config } from "./config";
import { usersTable } from "./db/schema";
import * as schema from "./db/schema";
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const config = Config().get;

export const buildDrizzleDb = () => {
  const pool = mysql.createPool({
    uri: config().mysqlConnectionString,
  });
  const db = drizzle(pool, { schema, mode: "default" });
  return db;
};

export const buildFastifyApp = () => {
  const app = Fastify({
  });

  app.register(cors, { origin: true });

  app.register(jwt, {
    secret: config().jwtSecret,
  });

  const db = buildDrizzleDb();

  app.post("/register", async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    if (email && password) {

      const existingUser = await db.query.usersTable.findFirst({
        where: (fields, operators) => operators.eq(fields.email, email),
      });

      if (existingUser) {
        return res.status(409).send({ error: "User already exists" });
      }

      const hashedPassword = await hashPassword(
        password,
        config().passwordSalt,
        config().passwordHashAlgorithm
      );

      const user = {
        email,
        password: hashedPassword,
      };

      await db.insert(usersTable).values(user);

      res.status(201).send({ message: "User registered successfully" });
    }
    res.status(400).send({ error: "Email and password are required" });
  });

  app.post("/login", async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    if (email && password) {
      const user = await db.query.usersTable.findFirst({
        where: (fields, operators) => operators.eq(fields.email, email),
      });

    if (!user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

      const hashedPassword = await hashPassword(
        password,
        config().passwordSalt,
        config().passwordHashAlgorithm
      );

      if (user.password !== hashedPassword) {
        return res.status(401).send({ error: "Unauthorized" });
      }

      const token = app.jwt.sign({ email: user.email, id: user.id }, { expiresIn: '1h' });
      const refreshToken = app.jwt.sign({ email: user.email, id: user.id }, { expiresIn: '7d' });
      return res.send({ token, refreshToken });
    }
    return res.status(400).send({ error: "Email and password are required" });
  });

  app.post("/verify", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).send({ error: "Token required" });
      }
      const decoded = app.jwt.verify(token);
      return { user: decoded };
    } catch (err) {
      return res.status(401).send({ error: "Invalid token", message: (err as Error).message });
    }
  });

  app.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      return res.status(401).send({ error: "Refresh token required" });
    }
    try {
      const decoded = app.jwt.verify(refreshToken) as { email: string; id: number };

      const user = await db.query.usersTable.findFirst({
        where: (fields, operators) => operators.eq(fields.email, decoded.email),
      });

      if (!user) {
        return res.status(401).send({ error: "Unauthorized" });
      }

      const newToken = app.jwt.sign({ email: decoded.email, id: decoded.id }, { expiresIn: '1h' });
      const newRefreshToken = app.jwt.sign({ email: decoded.email, id: decoded.id }, { expiresIn: '7d' });
      return res.send({ token: newToken, refreshToken: newRefreshToken });
    } catch (err) {
      return res.status(401).send({ error: "Invalid refresh token", message: (err as Error).message });
    }
  });

  return app;
};
