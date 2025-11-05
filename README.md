# simple-user-api

Beginner-friendly Node.js + Express + MongoDB project that implements:
- Signup (email/username, encrypted password, birthdate, hobbies)
- Login (returns JWT)
- Role-based access: guest (default) and admin
- Admin can update or delete other users
- GET /api/users returns aggregated hobby data:
  [
    { hobby: string, total_users: number, unique_ages: [numbers] },
    ...
  ]
- Basic Jest + Supertest test example

Instructions:
1. Copy `.env.example` to `.env` and update values.
2. Run `npm install`.
3. Start MongoDB locally.
4. Use `npm run dev` to run with nodemon.
5. Run tests with `npm test`.

Note: To make a user admin manually, update the `role` field for a user in MongoDB to "admin".
