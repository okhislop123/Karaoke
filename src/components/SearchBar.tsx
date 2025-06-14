import { useState, useEffect, useCallback } from "react";
import { useSongStore, type Song } from "@/store/useSongStore";
import { searchYoutubeVideos, getVideoDetails } from "@/services/youtube";

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { addToPlaylist, playlist } = useSongStore();

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);
    try {
      const results = await searchYoutubeVideos(query);
      
      // Get durations for all videos
      const resultsWithDuration = await Promise.all(
        results.map(async (song) => {
          const duration = await getVideoDetails(song.id);
          return { ...song, duration };
        })
      );
      
      setSearchResults(resultsWithDuration);
    } catch (error) {
      console.error("Error searching songs:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  const handleAddToPlaylist = (song: Song) => {
    addToPlaylist(song);
    // Optionally close the dropdown after adding
    // setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
  };

  const isSongInPlaylist = (songId: string) => {
    return playlist.some(song => song.id === songId);
  };

  return (
    <div className="w-full relative">
      <div className="mx-auto pb-4">
        <div className="relative">
          <div className="flex items-center bg-white rounded-lg shadow border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài hát..."
              className="w-full outline-none py-4 px-6"
              disabled={isLoading}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
            />
            {isLoading && (
              <div className="px-6 py-4 text-blue-500">
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">Đang tìm...</span>
                </div>
              </div>
            )}
          </div>
          {searchTerm && !isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <button
                onClick={handleClearSearch}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[60vh] overflow-hidden">
              {searchResults.length === 0 && !isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  <p>Không tìm thấy bài hát nào</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Kết quả tìm kiếm
                      </h3>
                      <button
                        onClick={() => setShowResults(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {searchResults.map((song) => (
                        <div
                          key={song.id}
                          className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                        >
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={song.thumbnail}
                              alt={song.title}
                              className="w-16 h-16 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                              {song.title}
                            </h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {song.artist}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatDuration(song.duration)}
                            </div>
                          </div>
                          {isSongInPlaylist(song.id) ? (
                            <div className="px-4 py-2 bg-gray-200 text-gray-500 font-medium rounded-lg">
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Đã thêm
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToPlaylist(song)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                Thêm
                              </div>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
