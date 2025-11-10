const express = require("express");
const router = express.Router();
const { signupUser, loginUser, getUsers, deleteUser } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/", verifyToken, getUsers);
router.delete("/:id", verifyToken, deleteUser);

module.exports = router;
