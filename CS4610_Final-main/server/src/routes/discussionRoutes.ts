import express from "express";
import { prisma } from "../index";

const router = express.Router();

/**
 * Get all discussion boards
 * */
router.get("/boards", async (req, res) => {
  try {
    const boards = await prisma.discussionBoard.findMany({
      include: {
        project: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        posts: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    res.json(boards);
  } catch (error) {
    console.error("Error fetching discussion boards:", error);
    res.status(500).json({ error: "Failed to retrieve discussion boards" });
  }
});

/**
 * Get all discussion boards for a specific project
 */
router.get("/project/:projectId/boards", async (req, res) => {
  try {
    const { projectId } = req.params;

    const boards = await prisma.discussionBoard.findMany({
      where: {
        projectId,
      },
      include: {
        project: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        posts: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    res.json(boards);
  } catch (error) {
    console.error("Error fetching project discussion boards:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve project discussion boards" });
  }
});

/**
 * Get a discussion board by ID
 */
router.get("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const board = await prisma.discussionBoard.findUnique({
      where: { id },
      include: {
        project: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        posts: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!board) {
      res.status(404).json({ error: "Discussion board not found" });
      return;
    }

    res.json(board);
    return;
  } catch (error) {
    console.error("Error fetching discussion board:", error);
    res.status(500).json({ error: "Failed to retrieve discussion board" });
    return;
  }
});

/**
 * Create a new discussion board
 */
router.post("/boards", async (req, res) => {
  try {
    const { projectId, name, description, createdById } = req.body;

    if (!projectId || !name || !createdById) {
      res
        .status(400)
        .json({ error: "Project ID, name, and creator ID are required" });
      return;
    }

    const board = await prisma.discussionBoard.create({
      data: {
        projectId,
        name,
        description,
        createdById,
      },
      include: {
        project: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(board);
    return;
  } catch (error) {
    console.error("Error creating discussion board:", error);
    res.status(500).json({ error: "Failed to create discussion board" });
    return;
  }
});

/**
 * Update a discussion board
 */
router.put("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedBoard = await prisma.discussionBoard.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        project: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json(updatedBoard);
    return;
  } catch (error) {
    console.error("Error updating discussion board:", error);
    res.status(500).json({ error: "Failed to update discussion board" });
    return;
  }
});

/**
 * Get all posts
 */
router.get("/posts", async (req, res) => {
  try {
    const posts = await prisma.discussionPost.findMany({
      include: {
        board: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
});

/**
 * Get all posts for a specific discussion board
 */
router.get("/boards/:boardId/posts", async (req, res) => {
  try {
    const { boardId } = req.params;

    const posts = await prisma.discussionPost.findMany({
      where: {
        boardId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
});

/**
 * Create a new post in a discussion board
 */
router.post("/posts", async (req, res) => {
  try {
    const { boardId, userId, content } = req.body;

    if (!boardId || !userId || !content) {
      res
        .status(400)
        .json({ error: "Board ID, user ID, and content are required" });
      return;
    }

    const post = await prisma.discussionPost.create({
      data: {
        boardId,
        userId,
        content,
      },
      include: {
        board: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(post);
    return;
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
    return;
  }
});

export default router;
