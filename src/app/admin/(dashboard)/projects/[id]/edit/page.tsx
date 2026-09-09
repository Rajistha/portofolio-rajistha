import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { getProjectById, getTechStacks } from "@/lib/data";
import { updateProject } from "@/lib/actions/projects";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, techStacks] = await Promise.all([getProjectById(id), getTechStacks()]);

  if (!project) notFound();

  const action = updateProject.bind(null, id);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">Edit Project</h1>
      <ProjectForm action={action} project={project} techStacks={techStacks} />
    </div>
  );
}
