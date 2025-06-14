import { useSongStore } from "@/store/useSongStore";

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SongList = () => {
  const { searchResults, addToPlaylist } = useSongStore();

  if (searchResults.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center text-gray-500 py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
          <p className="text-lg">Chưa có kết quả tìm kiếm</p>
          <p className="text-sm text-gray-400 mt-1">
            Hãy tìm kiếm bài hát yêu thích của bạn
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Kết quả tìm kiếm
        </h2>
        <p className="text-gray-500">
          {searchResults.length} bài hát được tìm thấy
        </p>
      </div>
      <div className="space-y-4">
        {searchResults.map((song) => (
          <div
            key={song.id}
            className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-20 h-20 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                {song.title}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{song.artist}</p>
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
            <button
              onClick={() => addToPlaylist(song)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongList;
