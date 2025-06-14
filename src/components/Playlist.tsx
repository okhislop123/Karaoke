import { useSongStore, type Song } from "@/store/useSongStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  song: Song;
  index: number;
  currentSong: Song | null;
  playSong: (song: Song) => void;
  removeFromPlaylist: (songId: string) => void;
}

const SortableItem = ({
  song,
  index,
  currentSong,
  playSong,
  removeFromPlaylist,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
        isDragging
          ? "opacity-50 scale-105 shadow-2xl z-50"
          : currentSong?.id === song.id
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-lg"
          : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200 shadow-md hover:shadow-lg"
      }`}
      onClick={() => !isDragging && playSong(song)}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-mono text-sm font-semibold cursor-grab active:cursor-grabbing transition-colors duration-200"
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
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 text-gray-400 font-mono text-xs font-semibold">
          {index + 1}
        </div>
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-14 h-14 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {currentSong?.id === song.id && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
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
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold line-clamp-1 mb-1 transition-colors duration-200 ${
              currentSong?.id === song.id
                ? "text-blue-700"
                : "text-gray-800 group-hover:text-blue-600"
            }`}
          >
            {song.title}
          </h3>
          <p className="text-sm text-gray-500 truncate">{song.artist}</p>
        </div>
        {currentSong?.id === song.id && (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Đang phát</span>
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeFromPlaylist(song.id);
        }}
        className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
};

const Playlist = () => {
  const {
    playlist,
    removeFromPlaylist,
    playSong,
    currentSong,
    reorderPlaylist,
  } = useSongStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderPlaylist(active.id as string, over.id as string);
    }
  };

  if (playlist.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Playlist</h2>
          <p className="text-gray-500">Danh sách phát của bạn</p>
        </div>
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-lg">Playlist trống</p>
          <p className="text-sm text-gray-400 mt-1">
            Thêm bài hát để bắt đầu nghe nhạc
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Playlist</h2>
        <p className="text-gray-500">{playlist.length} bài hát đang chờ</p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={playlist.map((song) => song.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {playlist.map((song, index) => (
              <SortableItem
                key={song.id}
                song={song}
                index={index}
                currentSong={currentSong}
                playSong={playSong}
                removeFromPlaylist={removeFromPlaylist}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Playlist;
