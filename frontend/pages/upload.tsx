import { useUser } from "@clerk/nextjs";

export default function UploadPage() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) return <div>You must be signed in to upload.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Upload Page</h1>
      <p>Welcome, {user.username || user.emailAddresses[0].emailAddress}</p>
    </div>
  );
}