import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center py-10">
      <UserProfile />
    </div>
  );
}
