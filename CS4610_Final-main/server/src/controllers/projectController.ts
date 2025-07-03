import { Request, Response } from "express";
import { prisma } from "../index";

export const projectController = {
  // Get all projects
  getAllProjects: async (req: Request, res: Response) => {
    try {
      const projects = await prisma.project.findMany({
        include: {
          memberships: true,
          todoLists: true,
          boards: true,
        },
      });

      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to retrieve projects" });
    }
  },

  // Get project by ID
  getProjectById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          todoLists: {
            include: {
              items: true,
            },
          },
          boards: {
            include: {
              posts: true,
            },
          },
        },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to retrieve project" });
      return;
    }
  },

  // Get projects for a specific user
  getUserProjects: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
      }

      const projects = await prisma.project.findMany({
        where: {
          memberships: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          memberships: true,
          todoLists: true,
          boards: true,
        },
      });

      res.json(projects);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ error: "Failed to retrieve user projects" });
    }
  },

  // Create a new project
  createProject: async (req: Request, res: Response) => {
    try {
      const { name, description, isActive, userId } = req.body;

      if (!name) {
        res.status(400).json({ error: "Project name is required" });
      }

      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
      }

      const result = await prisma.$transaction(async (prisma) => {
        const project = await prisma.project.create({
          data: {
            name,
            description,
            isActive: isActive ?? true,
          },
        });

        // Create the membership with OWNER role
        const membership = await prisma.projectMembership.create({
          data: {
            projectId: project.id,
            userId: userId,
            role: "OWNER",
          },
        });

        return { project, membership };
      });

      res.status(201).json(result.project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  },

  // Update a project
  updateProject: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      const project = await prisma.project.update({
        where: { id },
        data: {
          name,
          description,
          isActive,
        },
      });

      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  },

  // Delete a project
  deleteProject: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.$transaction([
        prisma.discussionPost.deleteMany({
          where: {
            board: {
              projectId: id,
            },
          },
        }),
        prisma.discussionBoard.deleteMany({
          where: { projectId: id },
        }),
        prisma.toDoItem.deleteMany({
          where: {
            list: {
              projectId: id,
            },
          },
        }),
        prisma.toDoList.deleteMany({
          where: { projectId: id },
        }),
        prisma.projectMembership.deleteMany({
          where: { projectId: id },
        }),
        prisma.project.delete({
          where: { id },
        }),
      ]);

      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  },
};
