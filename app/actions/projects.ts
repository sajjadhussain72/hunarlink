"use server";

// Re-export project actions from modularized files
export {
  getPublishedProjects,
  getProject,
  getAdminProjects,
} from "@/lib/actions/projects/read";
export {
  createProject,
  addProjectImage,
} from "@/lib/actions/projects/create";
export {
  updateProjectStatus,
  deleteProject,
} from "@/lib/actions/projects/update";

