import SearchBar from "@/components/SearchBar";
import Playlist from "@/components/Playlist";
import AudioPlayer from "@/components/AudioPlayer";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md shadow border-b border-gray-100 sticky top-0 z-50">
        <div className="mx-auto py-2 px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Karaoke App
              </h1>
              <p className="text-gray-500 text-sm">
                Nghe nhạc và hát karaoke online
              </p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="mt-8 px-4">
        <div className="flex flex-col md:flex-row gap-8 mx-auto">
          <div className="w-full md:w-[70%]">
            <AudioPlayer />
          </div>
          <div className="w-full md:w-[30%]">
            <div className="mb-6">
              <SearchBar />
            </div>
            <Playlist />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
