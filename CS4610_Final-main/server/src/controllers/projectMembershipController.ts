import { Request, Response } from "express";
import { prisma } from "../index";

export const projectMembershipController = {
  // Join a project
  joinProject: async (req: Request, res: Response) => {
    try {
      const { projectId, userId } = req.body;

      if (!projectId || !userId) {
        res.status(400).json({ error: "Project ID and User ID are required" });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
      }

      // Check if user is already a member of the project
      const existingMembership = await prisma.projectMembership.findFirst({
        where: {
          projectId,
          userId,
        },
      });

      if (existingMembership) {
        res
          .status(409)
          .json({ error: "User is already a member of this project" });
      }

      // Create membership
      const membership = await prisma.projectMembership.create({
        data: {
          projectId,
          userId,
          role: "USER",
        },
        include: {
          project: true,
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
      });

      res.status(201).json(membership);
    } catch (error) {
      console.error("Error joining project:", error);
      res.status(500).json({ error: "Failed to join project" });
    }
  },

  // Leave a project
  leaveProject: async (req: Request, res: Response) => {
    try {
      const { projectId, userId } = req.body;

      if (!projectId || !userId) {
        res.status(400).json({ error: "Project ID and User ID are required" });
      }

      // Check if membership exists
      const membership = await prisma.projectMembership.findFirst({
        where: {
          projectId,
          userId,
        },
      });

      if (!membership) {
        res.status(404).json({ error: "User is not a member of this project" });
      }

      // Delete membership
      await prisma.projectMembership.delete({
        where: {
          id: membership.id,
        },
      });

      res.json({ message: "Successfully left the project" });
    } catch (error) {
      console.error("Error leaving project:", error);
      res.status(500).json({ error: "Failed to leave project" });
    }
  },

  // Get project members
  // Get project members
getProjectMembers: async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const memberships = await prisma.projectMembership.findMany({
      where: { projectId },
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
    });

    // Extract and return only the user objects
    const users = memberships.map((m) => m.user);

    res.json(users);
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ error: "Failed to retrieve project members" });
  }
},
};
