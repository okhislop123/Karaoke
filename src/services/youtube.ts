import { YOUTUBE_API_KEY } from "@/constant";
import type { Song } from "@/store/useSongStore";
import axios from "axios";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
  }>;
  nextPageToken?: string;
  prevPageToken?: string;
}

interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
  contentDetails: {
    duration: string;
  };
}

interface YouTubeVideoResponse {
  items: YouTubeVideoDetails[];
}

const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const [, hours, minutes, seconds] = match;
  const totalSeconds = 
    (hours ? parseInt(hours) * 3600 : 0) +
    (minutes ? parseInt(minutes) * 60 : 0) +
    (seconds ? parseInt(seconds) : 0);

  return totalSeconds;
};

export const searchYoutubeVideos = async (query: string): Promise<Song[]> => {
  try {
    // Search for videos
    const searchResponse = await axios.get<YouTubeSearchResponse>(
      `${YOUTUBE_API_BASE_URL}/search`,
      {
        params: {
          q: query,
          maxResults: 25,
          part: "id",
          type: "video",
          key: YOUTUBE_API_KEY,
        },
      }
    );

    // Get video IDs
    const videoIds = searchResponse.data.items
      .map((item) => item.id.videoId)
      .join(",");

    // Get video details
    const detailsResponse = await axios.get<YouTubeVideoResponse>(
      `${YOUTUBE_API_BASE_URL}/videos`,
      {
        params: {
          id: videoIds,
          part: "snippet,contentDetails",
          key: YOUTUBE_API_KEY,
        },
      }
    );

    return detailsResponse.data.items.map((item) => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      duration: parseDuration(item.contentDetails.duration),
      url: `https://www.youtube.com/watch?v=${item.id}`,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("YouTube API Error:", error.response?.data || error.message);
    } else {
      console.error("Error searching YouTube:", error);
    }
    throw error;
  }
};

export const getVideoDetails = async (videoId: string): Promise<number> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video details");
    }

    const data = await response.json();
    const duration = data.items[0].contentDetails.duration;

    // Convert ISO 8601 duration to seconds
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] && parseInt(match[1])) || 0;
    const minutes = (match[2] && parseInt(match[2])) || 0;
    const seconds = (match[3] && parseInt(match[3])) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  } catch (error) {
    console.error("Error fetching video details:", error);
    return 0;
  }
};
