import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Playlist, Channel, Movie, Series, User } from '../types';

interface AppState {
  user: User | null;
  playlists: Playlist[];
  favoriteChannels: Channel[];
  favoriteMovies: Movie[];
  favoriteSeries: Series[];
  isOnboarded: boolean;
  isLoggedIn: boolean;
  activePlaylist: Playlist | null;
}

type Action =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ONBOARDED' }
  | { type: 'ADD_PLAYLIST'; payload: Playlist }
  | { type: 'REMOVE_PLAYLIST'; payload: string }
  | { type: 'SET_ACTIVE_PLAYLIST'; payload: Playlist }
  | { type: 'TOGGLE_FAV_CHANNEL'; payload: Channel }
  | { type: 'TOGGLE_FAV_MOVIE'; payload: Movie }
  | { type: 'TOGGLE_FAV_SERIES'; payload: Series };

const initialState: AppState = {
  user: null,
  playlists: [],
  favoriteChannels: [],
  favoriteMovies: [],
  favoriteSeries: [],
  isOnboarded: false,
  isLoggedIn: false,
  activePlaylist: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isLoggedIn: true };
    case 'LOGOUT':
      return { ...initialState, isOnboarded: state.isOnboarded };
    case 'SET_ONBOARDED':
      return { ...state, isOnboarded: true };
    case 'ADD_PLAYLIST':
      return { ...state, playlists: [...state.playlists, action.payload] };
    case 'REMOVE_PLAYLIST':
      return { ...state, playlists: state.playlists.filter(p => p.id !== action.payload) };
    case 'SET_ACTIVE_PLAYLIST':
      return { ...state, activePlaylist: action.payload };
    case 'TOGGLE_FAV_CHANNEL': {
      const exists = state.favoriteChannels.find(c => c.id === action.payload.id);
      return {
        ...state,
        favoriteChannels: exists
          ? state.favoriteChannels.filter(c => c.id !== action.payload.id)
          : [...state.favoriteChannels, action.payload],
      };
    }
    case 'TOGGLE_FAV_MOVIE': {
      const exists = state.favoriteMovies.find(m => m.id === action.payload.id);
      return {
        ...state,
        favoriteMovies: exists
          ? state.favoriteMovies.filter(m => m.id !== action.payload.id)
          : [...state.favoriteMovies, action.payload],
      };
    }
    case 'TOGGLE_FAV_SERIES': {
      const exists = state.favoriteSeries.find(s => s.id === action.payload.id);
      return {
        ...state,
        favoriteSeries: exists
          ? state.favoriteSeries.filter(s => s.id !== action.payload.id)
          : [...state.favoriteSeries, action.payload],
      };
    }
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export { initialState as initialAppState };

