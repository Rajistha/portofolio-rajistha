import { ProjectForm } from "@/components/admin/project-form";
import { getTechStacks } from "@/lib/data";
import { createProject } from "@/lib/actions/projects";

export default async function NewProjectPage() {
  const techStacks = await getTechStacks();

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">New Project</h1>
      <ProjectForm action={createProject} techStacks={techStacks} />
    </div>
  );
}
