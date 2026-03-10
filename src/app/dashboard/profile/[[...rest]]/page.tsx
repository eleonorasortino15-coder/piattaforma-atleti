import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center py-10">
      <UserProfile appearance={{ baseTheme: dark }} />
    </div>
  );
}
