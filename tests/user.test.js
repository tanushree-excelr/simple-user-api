const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");

let tokenAdmin;
let tokenGuest;
let createdUserId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("User API Tests", () => {
  it("should signup admin user", async () => {
    const res = await request(app).post("/api/users/signup").send({
      name: "Admin User",
      emailId: "admin@test.com",
      username: "admin1",
      password: "12345",
      birthdate: "1990-01-01",
      hobby: ["reading"],
      role: "admin"
    });
    expect(res.statusCode).toBe(201);
  });

  it("should login admin user", async () => {
    const res = await request(app).post("/api/users/login").send({
      emailId: "admin@test.com",
      password: "12345"
    });
    expect(res.statusCode).toBe(200);
    tokenAdmin = res.body.token;
  });

  it("should create guest user and login", async () => {
    const res1 = await request(app).post("/api/users/signup").send({
      name: "Guest",
      emailId: "guest@test.com",
      username: "guest1",
      password: "12345",
      birthdate: "2000-01-01",
      hobby: ["gaming"]
    });
    expect(res1.statusCode).toBe(201);
    createdUserId = res1.body.user._id;

    const res2 = await request(app).post("/api/users/login").send({
      emailId: "guest@test.com",
      password: "12345"
    });
    expect(res2.statusCode).toBe(200);
    tokenGuest = res2.body.token;
  });

  it("should fetch users (admin only)", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
  });

  it("should forbid guest from fetching users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${tokenGuest}`);
    expect(res.statusCode).toBe(403);
  });

  it("should delete user as admin", async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });
});
