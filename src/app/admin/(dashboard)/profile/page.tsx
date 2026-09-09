import { ProfileForm } from "@/components/admin/profile-form";
import { getProfile } from "@/lib/data";
import { updateProfile } from "@/lib/actions/profile";

export default async function AdminProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    return <p className="text-muted">No profile row found. Run the schema.sql seed first.</p>;
  }

  const action = updateProfile.bind(null, profile.id);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">Profile</h1>
      <ProfileForm action={action} profile={profile} />
    </div>
  );
}
