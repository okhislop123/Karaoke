import { useEffect, useRef, useState } from "react";
import { useSongStore } from "@/store/useSongStore";
import YouTube, { type YouTubeProps } from "react-youtube";

const AudioPlayer = () => {
  const playerRef = useRef<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [wasFullscreen, setWasFullscreen] = useState(false);
  const { currentSong, isPlaying, playNext, setIsPlaying } = useSongStore();

  const getVideoId = (url: string): string => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match?.[1] || "";
  };

  // Check if player is in fullscreen mode
  const checkFullscreenStatus = () => {
    if (playerRef.current) {
      try {
        // Check if document is in fullscreen mode
        const doc = document as Document & {
          webkitFullscreenElement?: Element;
          mozFullScreenElement?: Element;
          msFullscreenElement?: Element;
        };
        const isFullscreen = !!(
          document.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        );
        setWasFullscreen(isFullscreen);
      } catch (error) {
        console.log("Could not check fullscreen status:", error);
      }
    }
  };

  // Restore fullscreen mode
  const restoreFullscreen = () => {
    if (wasFullscreen && playerRef.current && isPlayerReady) {
      try {
        // Small delay to ensure player is ready
        setTimeout(() => {
          if (playerRef.current) {
            // Try to get the iframe element and request fullscreen
            const iframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement & {
              webkitRequestFullscreen?: () => Promise<void>;
              mozRequestFullScreen?: () => Promise<void>;
              msRequestFullscreen?: () => Promise<void>;
            };
            if (iframe) {
              if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
              } else if (iframe.webkitRequestFullscreen) {
                iframe.webkitRequestFullscreen();
              } else if (iframe.mozRequestFullScreen) {
                iframe.mozRequestFullScreen();
              } else if (iframe.msRequestFullscreen) {
                iframe.msRequestFullscreen();
              }
            }
          }
        }, 1000);
      } catch (error) {
        console.log("Could not restore fullscreen:", error);
      }
    }
  };

  const onReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    setIsPlayerReady(true);
    // Auto play when ready
    if (currentSong) {
      event.target.playVideo();
      // Restore fullscreen if it was active before
      restoreFullscreen();
    }
  };

  const onEnd: YouTubeProps["onEnd"] = () => {
    // Check fullscreen status before switching songs
    checkFullscreenStatus();
    playNext();
  };

  const onPlay: YouTubeProps["onPlay"] = () => {
    setIsPlaying(true);
  };

  const onPause: YouTubeProps["onPause"] = () => {
    setIsPlaying(false);
  };

  const onError: YouTubeProps["onError"] = (event) => {
    console.error("YouTube Player Error:", event.data);
    // Check fullscreen status before switching songs
    checkFullscreenStatus();
    // Skip to next song on error
    setTimeout(() => {
      playNext();
    }, 2000);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      checkFullscreenStatus();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && isPlayerReady && currentSong) {
      try {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.error("Error controlling player:", error);
      }
    }
  }, [isPlaying, isPlayerReady]);

  // Reset player ready state when song changes
  useEffect(() => {
    setIsPlayerReady(false);
  }, [currentSong?.id]);

  if (!currentSong) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 text-center border border-gray-200 min-h-[65vh] flex flex-col justify-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3">
            Chưa có bài hát nào được chọn
          </h3>
          <p className="text-gray-500 text-lg">
            Hãy thêm bài hát vào playlist và click để phát
          </p>
        </div>
      </div>
    );
  }

  const videoId = getVideoId(currentSong.url);

  if (!videoId) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-12 text-center border border-red-200">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-red-700 mb-3">
            Không thể phát video này
          </h3>
          <p className="text-red-600 text-lg">URL video không hợp lệ</p>
        </div>
      </div>
    );
  }

  const opts: YouTubeProps["opts"] = {
    height: "315",
    width: "560",
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      fs: 1,
    },
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="aspect-video bg-black rounded-t-3xl overflow-hidden">
          <YouTube
            key={videoId} // Force re-render when video changes
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onEnd={onEnd}
            onPlay={onPlay}
            onPause={onPause}
            onError={onError}
            className="w-full h-full"
          />
        </div>
        <div className="p-6 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-20 h-20 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-800 line-clamp-2 mb-2">
                {currentSong.title}
              </h3>
              <p className="text-gray-600 text-lg mb-3">{currentSong.artist}</p>
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    isPlayerReady
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isPlayerReady
                        ? "bg-green-500 animate-pulse"
                        : "bg-yellow-500 animate-spin"
                    }`}
                  ></div>
                  {isPlayerReady ? "Đã sẵn sàng" : "Đang tải..."}
                </div>
                {wasFullscreen && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Fullscreen sẽ được khôi phục
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
