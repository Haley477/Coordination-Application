import express from "express";
import { prisma } from "../index";

const router = express.Router();

/**
 * Get all users
 */
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
});

/**
 * Get user by ID
 * */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        // Exclude password for security
        memberships: {
          include: {
            project: true,
          },
        },
        todoItems: true,
        createdItems: true,
        createdLists: true,
        createdBoards: true,
        posts: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});

/**
 * Create new user
 * */
router.post("/register", async (req, res) => {
  try {
    console.log("Received body:", req.body);
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
      res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        firstName,
        lastName,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

/**
 * Updated user
 * */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        firstName,
        lastName,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

/**
 * Delete user
 * */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/**
 * Login user
 * */

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const passwordValid = password === user.password;

    if (!passwordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    // Success with user data
    res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});
export default router;
