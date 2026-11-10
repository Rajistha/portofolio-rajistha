import { getProjects } from "@/lib/data";
import { ProjectsManager } from "@/components/admin/projects-manager";

export const revalidate = 0;

export default async function AdminProjectsPage() {
  const projects = await getProjects();
  return <ProjectsManager initialProjects={projects} />;
}
