import express from "express";
import { prisma } from "../index";
import { Status, Priority } from "@prisma/client";

const router = express.Router();

/**
 * List all todo lists
 * */
router.get("/lists", async (req, res) => {
  try {
    const todoLists = await prisma.toDoList.findMany({
      include: {
        project: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        items: true,
      },
    });

    res.json(todoLists);
  } catch (error) {
    console.error("Error fetching todo lists:", error);
    res.status(500).json({ error: "Failed to retrieve todo lists" });
  }
});

/**
 * Get todo list by ID
 * */
router.get("/lists/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const todoList = await prisma.toDoList.findUnique({
      where: { id },
      include: {
        project: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        items: {
          include: {
            assignedTo: {
              select: {
                id: true,
                username: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                username: true,
              },
            },
            reviewedBy: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!todoList) {
      res.status(404).json({ error: "Todo list not found" });
      return;
    }

    res.json(todoList);
    return;
  } catch (error) {
    console.error("Error fetching todo list:", error);
    res.status(500).json({ error: "Failed to retrieve todo list" });
    return;
  }
});

/**
 * Create a new todo list
 * */
router.post("/lists", async (req, res) => {
  try {
    const { projectId, name, description, createdById } = req.body;

    if (!projectId || !name || !createdById) {
      res
        .status(400)
        .json({ error: "Project ID, name, and creator ID are required" });
      return;
    }

    const todoList = await prisma.toDoList.create({
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

    res.status(201).json(todoList);
    return;
  } catch (error) {
    console.error("Error creating todo list:", error);
    res.status(500).json({ error: "Failed to create todo list" });
    return;
  }
});

/**
 * Get todo items by list ID
 * */
router.get("/items", async (req, res) => {
  try {
    const todoItems = await prisma.toDoItem.findMany({
      include: {
        list: true,
        assignedTo: {
          select: {
            id: true,
            username: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json(todoItems);
  } catch (error) {
    console.error("Error fetching todo items:", error);
    res.status(500).json({ error: "Failed to retrieve todo items" });
  }
});

/**
 * Get todo item by ID
 * */
router.get("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const todoItem = await prisma.toDoItem.findUnique({
      where: { id },
      include: {
        list: true,
        assignedTo: {
          select: {
            id: true,
            username: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!todoItem) {
      res.status(404).json({ error: "Todo item not found" });
      return;
    }

    res.json(todoItem);
  } catch (error) {
    console.error("Error fetching todo item:", error);
    res.status(500).json({ error: "Failed to retrieve todo item" });
    return;
  }
});

/**
 * Create a new todo item
 * */
router.post("/items", async (req, res) => {
  try {
    const {
      listId,
      title,
      description,
      status,
      priority,
      assignedToId,
      createdById,
      dueDate,
    } = req.body;

    if (!listId || !title || !createdById) {
      res
        .status(400)
        .json({ error: "List ID, title, and creator ID are required" });
    }

    // Validate enum values
    if (status && !Object.values(Status).includes(status)) {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }

    if (priority && !Object.values(Priority).includes(priority)) {
      res.status(400).json({ error: "Invalid priority value" });
      return;
    }

    const todoItem = await prisma.toDoItem.create({
      data: {
        listId,
        title,
        description,
        status: status || Status.TODO,
        priority: priority || Priority.MEDIUM,
        assignedToId,
        createdById,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: {
        list: true,
        assignedTo: {
          select: {
            id: true,
            username: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(todoItem);
    return;
  } catch (error) {
    console.error("Error creating todo item:", error);
    res.status(500).json({ error: "Failed to create todo item" });
    return;
  }
});

/**
 * Update a todo item
 * */
router.put("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      assignedToId,
      dueDate,
      isInReview,
      reviewedById,
      reviewedAt,
    } = req.body;

    //  Enum
    if (status && !Object.values(Status).includes(status)) {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }

    if (priority && !Object.values(Priority).includes(priority)) {
      res.status(400).json({ error: "Invalid priority value" });
      return;
    }

    const todoItem = await prisma.toDoItem.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        assignedToId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isInReview,
        reviewedById,
        reviewedAt: reviewedAt ? new Date(reviewedAt) : undefined,
      },
      include: {
        list: true,
        assignedTo: {
          select: {
            id: true,
            username: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json(todoItem);
    return;
  } catch (error) {
    console.error("Error updating todo item:", error);
    res.status(500).json({ error: "Failed to update todo item" });
    return;
  }
});

/**
 * Delete a todo item
 * */
router.delete("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const todoItem = await prisma.toDoItem.delete({
      where: { id },
    });

    res.json(todoItem);
    return;
  } catch (error) {
    console.error("Error deleting todo item:", error);
    res.status(500).json({ error: "Failed to delete todo item" });
    return;
  }
});

export default router;
