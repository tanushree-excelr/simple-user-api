const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");

let tokenAdmin;
let tokenGuest;
let createdUserId;

beforeAll(async () => {
  // Ensure DB is clean
  await mongoose.connection.dropCollection("users").catch(() => {});
});

afterAll(async () => {
  await mongoose.connection.dropCollection("users").catch(() => {});
  await mongoose.connection.close();
});

describe("User API Test Suite", () => {

  it("should signup a new user successfully", async () => {
    const res = await request(app).post("/api/users/signup").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "adminpass",
      role: "admin"
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("admin@example.com");
  });

  it("should not allow duplicate email signup", async () => {
    const res = await request(app).post("/api/users/signup").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "adminpass"
    });
    expect(res.statusCode).toBe(400);
  });

  it("should login successfully and return token", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "admin@example.com",
      password: "adminpass"
    });
    expect(res.statusCode).toBe(200);
    tokenAdmin = res.body.token;
    expect(tokenAdmin).toBeDefined();
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "admin@example.com",
      password: "wrongpass"
    });
    expect(res.statusCode).toBe(401);
  });

  it("should create another guest user", async () => {
    const res = await request(app).post("/api/users/signup").send({
      name: "Guest User",
      email: "guest@example.com",
      password: "guestpass",
      role: "guest"
    });
    expect(res.statusCode).toBe(201);
    createdUserId = res.body.user._id;
  });

  it("should login as guest and get token", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "guest@example.com",
      password: "guestpass"
    });
    expect(res.statusCode).toBe(200);
    tokenGuest = res.body.token;
    expect(tokenGuest).toBeDefined();
  });

  it("should fetch users with pagination and aggregation (admin only)", async () => {
    const res = await request(app)
      .get("/api/users?page=1&limit=10")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("totalUsers");
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  it("should delete a user as admin", async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });

  it("should not allow guest to delete user", async () => {
    // Recreate a user to test guest deletion
    const newUser = await request(app).post("/api/users/signup").send({
      name: "Another User",
      email: "another@example.com",
      password: "userpass",
      role: "guest"
    });

    const res = await request(app)
      .delete(`/api/users/${newUser.body.user._id}`)
      .set("Authorization", `Bearer ${tokenGuest}`);
    expect(res.statusCode).toBe(403);
  });

  it("should return 404 for unknown route", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.statusCode).toBe(404);
  });

});
