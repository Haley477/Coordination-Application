import express from "express";
import { projectController } from "../controllers/projectController";
import { projectMembershipController } from "../controllers/projectMembershipController";

const router = express.Router();

router.get("/", projectController.getAllProjects);
router.get("/user/:userId", projectController.getUserProjects);
router.get("/:id", projectController.getProjectById);
router.post("/", projectController.createProject);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

// Project membership routes
router.post("/join", projectMembershipController.joinProject);
router.post("/leave", projectMembershipController.leaveProject);
router.get(
  "/:projectId/members",
  projectMembershipController.getProjectMembers
);

export default router;
