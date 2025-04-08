import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

type Video = {
  id: string;
  title: string;
  video_url: string;
  created_at: string;
  user_id: string;
};

export default function FeedPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
  
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Error fetching videos:', error);
      } else {
        setVideos(data as Video[]);
      }
    };
  
    fetchVideos();
  }, []);
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Video Feed</h1>

      <div className="space-y-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-gray-800 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-white">{video.title}</h2>
            <video
              className="w-full mt-4 rounded"
              controls
              src={video.video_url}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
