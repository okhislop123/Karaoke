import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  thumbnail: string;
}

interface SongStore {
  searchResults: Song[];
  playlist: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  
  // Actions
  setSearchResults: (songs: Song[]) => void;
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (songId: string) => void;
  reorderPlaylist: (activeId: string, overId: string) => void;
  playNext: () => void;
  playSong: (song: Song) => void;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useSongStore = create<SongStore>((set) => ({
  searchResults: [],
  playlist: [],
  currentSong: null,
  isPlaying: false,

  setSearchResults: (songs) => set({ searchResults: songs }),
  
  addToPlaylist: (song) => set((state) => ({
    playlist: [...state.playlist, song]
  })),
  
  removeFromPlaylist: (songId) => set((state) => ({
    playlist: state.playlist.filter(song => song.id !== songId)
  })),
  
  reorderPlaylist: (activeId, overId) => set((state) => {
    const oldIndex = state.playlist.findIndex(song => song.id === activeId);
    const newIndex = state.playlist.findIndex(song => song.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return state;
    
    const newPlaylist = [...state.playlist];
    const movedSong = newPlaylist.splice(oldIndex, 1)[0];
    if (movedSong) {
      newPlaylist.splice(newIndex, 0, movedSong);
    }
    
    return { playlist: newPlaylist };
  }),
  
  playSong: (song) => set((state) => {
    // Remove the song from playlist if it exists
    const updatedPlaylist = state.playlist.filter(s => s.id !== song.id);
    return {
      currentSong: song,
      playlist: updatedPlaylist,
      isPlaying: true
    };
  }),
  
  playNext: () => set((state) => {
    if (state.playlist.length === 0) {
      return { currentSong: null, isPlaying: false };
    }
    
    const [nextSong, ...remainingSongs] = state.playlist;
    return {
      currentSong: nextSong,
      playlist: remainingSongs,
      isPlaying: true
    };
  }),
  
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying })
})); 