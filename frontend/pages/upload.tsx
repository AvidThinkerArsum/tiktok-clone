import { useUser, useAuth } from "@clerk/nextjs";
import supabase from "../lib/supabase";
import { useState } from "react";

export default function UploadPage() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSignedIn) return <div>You must be signed in to upload.</div>;

  const handleUpload = async () => {
    if (!videoFile || !title) return alert("Title and video are required");

    const token = await getToken({ template: "supabase" });
    await supabase.auth.setSession({
    access_token: token!,
    refresh_token: "", // not needed with Clerk
  });

    console.log("Uploading as user:", user.id);

    setLoading(true);

    const fileExt = videoFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, videoFile);

    if (uploadError) {
      console.error("Upload failed:", uploadError); // 👈 shows real reason
      alert("Upload failed");
      setLoading(false);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    const videoUrl = publicUrlData?.publicUrl;

    // Save to videos table
    const { error: insertError } = await supabase.from("videos").insert([
      {
        title,
        video_url: videoUrl,
        user_id: user.id,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      alert("Failed to save video metadata");
    } else {
      alert("Video uploaded successfully!");
      setTitle("");
      setVideoFile(null);
    }

    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Upload Page</h1>
      <p className="mb-4 text-gray-400">
        Welcome, {user.username || user.emailAddresses[0].emailAddress}
      </p>

      <input
        type="text"
        placeholder="Enter video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block mb-4 w-full p-2 bg-gray-700 text-white rounded"
      />

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
        className="block mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}