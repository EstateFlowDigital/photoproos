"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
  type Dispatch,
} from "react";

// =============================================================================
// Types
// =============================================================================

interface Photo {
  id: string;
  url: string;
  originalUrl?: string;
  filename: string;
  width?: number;
  height?: number;
  exif?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    focalLength?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: Date;
}

// =============================================================================
// State Shape
// =============================================================================

export interface GalleryState {
  // Theme
  theme: "light" | "dark";

  // Active Modal (only one at a time)
  activeModal:
    | "lightbox"
    | "qr"
    | "download"
    | "feedback"
    | "compare"
    | "selection"
    | "shortcuts"
    | null;

  // Lightbox State
  lightbox: {
    photoIndex: number | null;
    zoomLevel: number;
    panPosition: { x: number; y: number };
    isDragging: boolean;
    dragStart: { x: number; y: number };
    showExif: boolean;
  };

  // Slideshow State
  slideshow: {
    active: boolean;
    index: number;
    playing: boolean;
    interval: number;
  };

  // Selection State
  selection: {
    mode: boolean;
    selectedIds: Set<string>;
    showPanel: boolean;
  };

  // Compare State
  compare: {
    mode: boolean;
    photoIds: string[];
  };

  // Favorites State
  favorites: {
    ids: Set<string>;
    showOnly: boolean;
    togglingId: string | null;
  };

  // Download State
  download: {
    isDownloading: boolean;
    isZipDownloading: boolean;
    status: "idle" | "preparing" | "downloading" | "complete" | "error";
    progress: number;
    current: number;
    total: number;
  };

  // Comments State
  comments: {
    selectedPhotoId: string | null;
    items: Comment[];
    isLoading: boolean;
    isSubmitting: boolean;
    counts: Record<string, number>;
    // Form state
    newComment: string;
    authorName: string;
  };

  // Feedback State
  feedback: {
    type: "feedback" | "feature" | "issue";
    message: string;
    name: string;
    email: string;
    isSubmitting: boolean;
    submitted: boolean;
  };

  // Rating State
  ratings: {
    photoRatings: Record<string, { average: number; count: number }>;
    userRatings: Record<string, number>;
    isSubmitting: boolean;
    hoverRating: number;
  };

  // UI State
  ui: {
    showLinkCopied: boolean;
    expirationCountdown: {
      days: number;
      hours: number;
      minutes: number;
    } | null;
  };
}

// =============================================================================
// Actions
// =============================================================================

export type GalleryAction =
  // Theme
  | { type: "SET_THEME"; theme: "light" | "dark" }

  // Modal
  | { type: "OPEN_MODAL"; modal: NonNullable<GalleryState["activeModal"]> }
  | { type: "CLOSE_MODAL" }

  // Lightbox
  | { type: "OPEN_LIGHTBOX"; photoIndex: number }
  | { type: "CLOSE_LIGHTBOX" }
  | { type: "LIGHTBOX_NEXT"; totalPhotos: number }
  | { type: "LIGHTBOX_PREV"; totalPhotos: number }
  | { type: "LIGHTBOX_GO_TO"; index: number }
  | { type: "SET_ZOOM"; level: number }
  | { type: "SET_PAN"; position: { x: number; y: number } }
  | { type: "START_DRAG"; position: { x: number; y: number } }
  | { type: "END_DRAG" }
  | { type: "TOGGLE_EXIF" }
  | { type: "RESET_ZOOM" }

  // Slideshow
  | { type: "START_SLIDESHOW"; index?: number }
  | { type: "STOP_SLIDESHOW" }
  | { type: "SLIDESHOW_NEXT"; totalPhotos: number }
  | { type: "SLIDESHOW_PREV"; totalPhotos: number }
  | { type: "SLIDESHOW_GO_TO"; index: number }
  | { type: "TOGGLE_SLIDESHOW_PLAYING" }
  | { type: "SET_SLIDESHOW_INTERVAL"; interval: number }

  // Selection
  | { type: "TOGGLE_SELECTION_MODE" }
  | { type: "TOGGLE_PHOTO_SELECTED"; photoId: string }
  | { type: "SELECT_ALL"; photoIds: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "TOGGLE_SELECTION_PANEL" }

  // Compare
  | { type: "TOGGLE_COMPARE_MODE" }
  | { type: "ADD_TO_COMPARE"; photoId: string }
  | { type: "REMOVE_FROM_COMPARE"; photoId: string }
  | { type: "CLEAR_COMPARE" }

  // Favorites
  | { type: "SET_FAVORITES"; ids: Set<string> }
  | { type: "TOGGLE_FAVORITE"; photoId: string }
  | { type: "SET_TOGGLING_FAVORITE"; photoId: string | null }
  | { type: "TOGGLE_FAVORITES_ONLY" }

  // Download
  | { type: "START_DOWNLOAD" }
  | { type: "START_ZIP_DOWNLOAD" }
  | { type: "SET_DOWNLOAD_STATUS"; status: GalleryState["download"]["status"] }
  | { type: "SET_DOWNLOAD_PROGRESS"; progress: number; current?: number; total?: number }
  | { type: "DOWNLOAD_COMPLETE" }
  | { type: "DOWNLOAD_ERROR" }
  | { type: "RESET_DOWNLOAD" }

  // Comments
  | { type: "SELECT_PHOTO_FOR_COMMENTS"; photoId: string | null }
  | { type: "SET_COMMENTS"; comments: Comment[] }
  | { type: "SET_COMMENTS_LOADING"; isLoading: boolean }
  | { type: "SET_COMMENTS_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_COMMENT_COUNTS"; counts: Record<string, number> }
  | { type: "UPDATE_COMMENT_TEXT"; text: string }
  | { type: "UPDATE_COMMENT_AUTHOR"; name: string }
  | { type: "CLEAR_COMMENT_FORM" }

  // Feedback
  | { type: "SET_FEEDBACK_TYPE"; feedbackType: GalleryState["feedback"]["type"] }
  | { type: "UPDATE_FEEDBACK_MESSAGE"; message: string }
  | { type: "UPDATE_FEEDBACK_NAME"; name: string }
  | { type: "UPDATE_FEEDBACK_EMAIL"; email: string }
  | { type: "SET_FEEDBACK_SUBMITTING"; isSubmitting: boolean }
  | { type: "FEEDBACK_SUBMITTED" }
  | { type: "RESET_FEEDBACK" }

  // Ratings
  | { type: "SET_PHOTO_RATINGS"; ratings: Record<string, { average: number; count: number }> }
  | { type: "SET_USER_RATINGS"; ratings: Record<string, number> }
  | { type: "SET_RATING_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_HOVER_RATING"; rating: number }
  | { type: "UPDATE_PHOTO_RATING"; photoId: string; rating: { average: number; count: number } }
  | { type: "UPDATE_USER_RATING"; photoId: string; rating: number }

  // UI
  | { type: "SHOW_LINK_COPIED" }
  | { type: "HIDE_LINK_COPIED" }
  | { type: "SET_EXPIRATION_COUNTDOWN"; countdown: GalleryState["ui"]["expirationCountdown"] };

// =============================================================================
// Initial State
// =============================================================================

export const initialGalleryState: GalleryState = {
  theme: "dark",
  activeModal: null,

  lightbox: {
    photoIndex: null,
    zoomLevel: 1,
    panPosition: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    showExif: false,
  },

  slideshow: {
    active: false,
    index: 0,
    playing: true,
    interval: 4000,
  },

  selection: {
    mode: false,
    selectedIds: new Set(),
    showPanel: false,
  },

  compare: {
    mode: false,
    photoIds: [],
  },

  favorites: {
    ids: new Set(),
    showOnly: false,
    togglingId: null,
  },

  download: {
    isDownloading: false,
    isZipDownloading: false,
    status: "idle",
    progress: 0,
    current: 0,
    total: 0,
  },

  comments: {
    selectedPhotoId: null,
    items: [],
    isLoading: false,
    isSubmitting: false,
    counts: {},
    newComment: "",
    authorName: "",
  },

  feedback: {
    type: "feedback",
    message: "",
    name: "",
    email: "",
    isSubmitting: false,
    submitted: false,
  },

  ratings: {
    photoRatings: {},
    userRatings: {},
    isSubmitting: false,
    hoverRating: 0,
  },

  ui: {
    showLinkCopied: false,
    expirationCountdown: null,
  },
};

// =============================================================================
// Reducer
// =============================================================================

export function galleryReducer(
  state: GalleryState,
  action: GalleryAction
): GalleryState {
  switch (action.type) {
    // Theme
    case "SET_THEME":
      return { ...state, theme: action.theme };

    // Modal
    case "OPEN_MODAL":
      return { ...state, activeModal: action.modal };
    case "CLOSE_MODAL":
      return { ...state, activeModal: null };

    // Lightbox
    case "OPEN_LIGHTBOX":
      return {
        ...state,
        activeModal: "lightbox",
        lightbox: {
          ...state.lightbox,
          photoIndex: action.photoIndex,
          zoomLevel: 1,
          panPosition: { x: 0, y: 0 },
        },
      };
    case "CLOSE_LIGHTBOX":
      return {
        ...state,
        activeModal: null,
        lightbox: { ...state.lightbox, photoIndex: null, zoomLevel: 1 },
      };
    case "LIGHTBOX_NEXT":
      return {
        ...state,
        lightbox: {
          ...state.lightbox,
          photoIndex:
            state.lightbox.photoIndex !== null
              ? (state.lightbox.photoIndex + 1) % action.totalPhotos
              : 0,
          zoomLevel: 1,
          panPosition: { x: 0, y: 0 },
        },
      };
    case "LIGHTBOX_PREV":
      return {
        ...state,
        lightbox: {
          ...state.lightbox,
          photoIndex:
            state.lightbox.photoIndex !== null
              ? (state.lightbox.photoIndex - 1 + action.totalPhotos) % action.totalPhotos
              : 0,
          zoomLevel: 1,
          panPosition: { x: 0, y: 0 },
        },
      };
    case "LIGHTBOX_GO_TO":
      return {
        ...state,
        lightbox: {
          ...state.lightbox,
          photoIndex: action.index,
          zoomLevel: 1,
          panPosition: { x: 0, y: 0 },
        },
      };
    case "SET_ZOOM":
      return {
        ...state,
        lightbox: { ...state.lightbox, zoomLevel: action.level },
      };
    case "SET_PAN":
      return {
        ...state,
        lightbox: { ...state.lightbox, panPosition: action.position },
      };
    case "START_DRAG":
      return {
        ...state,
        lightbox: {
          ...state.lightbox,
          isDragging: true,
          dragStart: action.position,
        },
      };
    case "END_DRAG":
      return {
        ...state,
        lightbox: { ...state.lightbox, isDragging: false },
      };
    case "TOGGLE_EXIF":
      return {
        ...state,
        lightbox: { ...state.lightbox, showExif: !state.lightbox.showExif },
      };
    case "RESET_ZOOM":
      return {
        ...state,
        lightbox: {
          ...state.lightbox,
          zoomLevel: 1,
          panPosition: { x: 0, y: 0 },
        },
      };

    // Slideshow
    case "START_SLIDESHOW":
      return {
        ...state,
        slideshow: {
          ...state.slideshow,
          active: true,
          index: action.index ?? 0,
          playing: true,
        },
      };
    case "STOP_SLIDESHOW":
      return {
        ...state,
        slideshow: { ...state.slideshow, active: false, playing: false },
      };
    case "SLIDESHOW_NEXT":
      return {
        ...state,
        slideshow: {
          ...state.slideshow,
          index: (state.slideshow.index + 1) % action.totalPhotos,
        },
      };
    case "SLIDESHOW_PREV":
      return {
        ...state,
        slideshow: {
          ...state.slideshow,
          index:
            (state.slideshow.index - 1 + action.totalPhotos) % action.totalPhotos,
        },
      };
    case "SLIDESHOW_GO_TO":
      return {
        ...state,
        slideshow: { ...state.slideshow, index: action.index },
      };
    case "TOGGLE_SLIDESHOW_PLAYING":
      return {
        ...state,
        slideshow: { ...state.slideshow, playing: !state.slideshow.playing },
      };
    case "SET_SLIDESHOW_INTERVAL":
      return {
        ...state,
        slideshow: { ...state.slideshow, interval: action.interval },
      };

    // Selection
    case "TOGGLE_SELECTION_MODE":
      return {
        ...state,
        selection: {
          ...state.selection,
          mode: !state.selection.mode,
          selectedIds: state.selection.mode ? new Set() : state.selection.selectedIds,
        },
      };
    case "TOGGLE_PHOTO_SELECTED": {
      const newSelectedIds = new Set(state.selection.selectedIds);
      if (newSelectedIds.has(action.photoId)) {
        newSelectedIds.delete(action.photoId);
      } else {
        newSelectedIds.add(action.photoId);
      }
      return {
        ...state,
        selection: { ...state.selection, selectedIds: newSelectedIds },
      };
    }
    case "SELECT_ALL":
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedIds: new Set(action.photoIds),
        },
      };
    case "CLEAR_SELECTION":
      return {
        ...state,
        selection: { ...state.selection, selectedIds: new Set() },
      };
    case "TOGGLE_SELECTION_PANEL":
      return {
        ...state,
        selection: {
          ...state.selection,
          showPanel: !state.selection.showPanel,
        },
      };

    // Compare
    case "TOGGLE_COMPARE_MODE":
      return {
        ...state,
        compare: {
          ...state.compare,
          mode: !state.compare.mode,
          photoIds: state.compare.mode ? [] : state.compare.photoIds,
        },
      };
    case "ADD_TO_COMPARE":
      if (state.compare.photoIds.length >= 2) return state;
      return {
        ...state,
        compare: {
          ...state.compare,
          photoIds: [...state.compare.photoIds, action.photoId],
        },
      };
    case "REMOVE_FROM_COMPARE":
      return {
        ...state,
        compare: {
          ...state.compare,
          photoIds: state.compare.photoIds.filter((id) => id !== action.photoId),
        },
      };
    case "CLEAR_COMPARE":
      return {
        ...state,
        compare: { ...state.compare, photoIds: [] },
      };

    // Favorites
    case "SET_FAVORITES":
      return {
        ...state,
        favorites: { ...state.favorites, ids: action.ids },
      };
    case "TOGGLE_FAVORITE": {
      const newFavoriteIds = new Set(state.favorites.ids);
      if (newFavoriteIds.has(action.photoId)) {
        newFavoriteIds.delete(action.photoId);
      } else {
        newFavoriteIds.add(action.photoId);
      }
      return {
        ...state,
        favorites: { ...state.favorites, ids: newFavoriteIds },
      };
    }
    case "SET_TOGGLING_FAVORITE":
      return {
        ...state,
        favorites: { ...state.favorites, togglingId: action.photoId },
      };
    case "TOGGLE_FAVORITES_ONLY":
      return {
        ...state,
        favorites: { ...state.favorites, showOnly: !state.favorites.showOnly },
      };

    // Download
    case "START_DOWNLOAD":
      return {
        ...state,
        download: { ...state.download, isDownloading: true, status: "preparing" },
      };
    case "START_ZIP_DOWNLOAD":
      return {
        ...state,
        download: { ...state.download, isZipDownloading: true, status: "preparing" },
        activeModal: "download",
      };
    case "SET_DOWNLOAD_STATUS":
      return {
        ...state,
        download: { ...state.download, status: action.status },
      };
    case "SET_DOWNLOAD_PROGRESS":
      return {
        ...state,
        download: {
          ...state.download,
          progress: action.progress,
          current: action.current ?? state.download.current,
          total: action.total ?? state.download.total,
        },
      };
    case "DOWNLOAD_COMPLETE":
      return {
        ...state,
        download: {
          ...state.download,
          isDownloading: false,
          isZipDownloading: false,
          status: "complete",
          progress: 100,
        },
      };
    case "DOWNLOAD_ERROR":
      return {
        ...state,
        download: {
          ...state.download,
          isDownloading: false,
          isZipDownloading: false,
          status: "error",
        },
      };
    case "RESET_DOWNLOAD":
      return {
        ...state,
        download: initialGalleryState.download,
        activeModal: null,
      };

    // Comments
    case "SELECT_PHOTO_FOR_COMMENTS":
      return {
        ...state,
        comments: { ...state.comments, selectedPhotoId: action.photoId },
      };
    case "SET_COMMENTS":
      return {
        ...state,
        comments: { ...state.comments, items: action.comments },
      };
    case "SET_COMMENTS_LOADING":
      return {
        ...state,
        comments: { ...state.comments, isLoading: action.isLoading },
      };
    case "SET_COMMENTS_SUBMITTING":
      return {
        ...state,
        comments: { ...state.comments, isSubmitting: action.isSubmitting },
      };
    case "SET_COMMENT_COUNTS":
      return {
        ...state,
        comments: { ...state.comments, counts: action.counts },
      };
    case "UPDATE_COMMENT_TEXT":
      return {
        ...state,
        comments: { ...state.comments, newComment: action.text },
      };
    case "UPDATE_COMMENT_AUTHOR":
      return {
        ...state,
        comments: { ...state.comments, authorName: action.name },
      };
    case "CLEAR_COMMENT_FORM":
      return {
        ...state,
        comments: { ...state.comments, newComment: "", authorName: "" },
      };

    // Feedback
    case "SET_FEEDBACK_TYPE":
      return {
        ...state,
        feedback: { ...state.feedback, type: action.feedbackType },
      };
    case "UPDATE_FEEDBACK_MESSAGE":
      return {
        ...state,
        feedback: { ...state.feedback, message: action.message },
      };
    case "UPDATE_FEEDBACK_NAME":
      return {
        ...state,
        feedback: { ...state.feedback, name: action.name },
      };
    case "UPDATE_FEEDBACK_EMAIL":
      return {
        ...state,
        feedback: { ...state.feedback, email: action.email },
      };
    case "SET_FEEDBACK_SUBMITTING":
      return {
        ...state,
        feedback: { ...state.feedback, isSubmitting: action.isSubmitting },
      };
    case "FEEDBACK_SUBMITTED":
      return {
        ...state,
        feedback: { ...state.feedback, submitted: true, isSubmitting: false },
      };
    case "RESET_FEEDBACK":
      return {
        ...state,
        feedback: initialGalleryState.feedback,
        activeModal: null,
      };

    // Ratings
    case "SET_PHOTO_RATINGS":
      return {
        ...state,
        ratings: { ...state.ratings, photoRatings: action.ratings },
      };
    case "SET_USER_RATINGS":
      return {
        ...state,
        ratings: { ...state.ratings, userRatings: action.ratings },
      };
    case "SET_RATING_SUBMITTING":
      return {
        ...state,
        ratings: { ...state.ratings, isSubmitting: action.isSubmitting },
      };
    case "SET_HOVER_RATING":
      return {
        ...state,
        ratings: { ...state.ratings, hoverRating: action.rating },
      };
    case "UPDATE_PHOTO_RATING":
      return {
        ...state,
        ratings: {
          ...state.ratings,
          photoRatings: {
            ...state.ratings.photoRatings,
            [action.photoId]: action.rating,
          },
        },
      };
    case "UPDATE_USER_RATING":
      return {
        ...state,
        ratings: {
          ...state.ratings,
          userRatings: {
            ...state.ratings.userRatings,
            [action.photoId]: action.rating,
          },
        },
      };

    // UI
    case "SHOW_LINK_COPIED":
      return {
        ...state,
        ui: { ...state.ui, showLinkCopied: true },
      };
    case "HIDE_LINK_COPIED":
      return {
        ...state,
        ui: { ...state.ui, showLinkCopied: false },
      };
    case "SET_EXPIRATION_COUNTDOWN":
      return {
        ...state,
        ui: { ...state.ui, expirationCountdown: action.countdown },
      };

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

interface GalleryContextValue {
  state: GalleryState;
  dispatch: Dispatch<GalleryAction>;

  // Computed values
  selectedCount: number;
  hasSelection: boolean;
  compareCount: number;
  favoriteCount: number;
  isLightboxOpen: boolean;
  isSlideshowActive: boolean;

  // Convenience action creators
  actions: {
    // Lightbox
    openLightbox: (photoIndex: number) => void;
    closeLightbox: () => void;
    nextPhoto: (totalPhotos: number) => void;
    prevPhoto: (totalPhotos: number) => void;
    setZoom: (level: number) => void;
    resetZoom: () => void;

    // Slideshow
    startSlideshow: (index?: number) => void;
    stopSlideshow: () => void;
    togglePlaying: () => void;

    // Selection
    toggleSelectionMode: () => void;
    togglePhotoSelected: (photoId: string) => void;
    selectAll: (photoIds: string[]) => void;
    clearSelection: () => void;

    // Compare
    toggleCompareMode: () => void;
    addToCompare: (photoId: string) => void;
    removeFromCompare: (photoId: string) => void;

    // Favorites
    toggleFavorite: (photoId: string) => void;
    toggleFavoritesOnly: () => void;

    // Modal
    openModal: (modal: NonNullable<GalleryState["activeModal"]>) => void;
    closeModal: () => void;

    // Theme
    setTheme: (theme: "light" | "dark") => void;

    // UI
    showLinkCopied: () => void;
  };
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface GalleryProviderProps {
  children: ReactNode;
  initialState?: Partial<GalleryState>;
}

export function GalleryProvider({
  children,
  initialState,
}: GalleryProviderProps) {
  const [state, dispatch] = useReducer(galleryReducer, {
    ...initialGalleryState,
    ...initialState,
  });

  // Computed values
  const selectedCount = state.selection.selectedIds.size;
  const hasSelection = selectedCount > 0;
  const compareCount = state.compare.photoIds.length;
  const favoriteCount = state.favorites.ids.size;
  const isLightboxOpen = state.activeModal === "lightbox";
  const isSlideshowActive = state.slideshow.active;

  // Action creators
  const actions = useMemo(
    () => ({
      // Lightbox
      openLightbox: (photoIndex: number) =>
        dispatch({ type: "OPEN_LIGHTBOX", photoIndex }),
      closeLightbox: () => dispatch({ type: "CLOSE_LIGHTBOX" }),
      nextPhoto: (totalPhotos: number) =>
        dispatch({ type: "LIGHTBOX_NEXT", totalPhotos }),
      prevPhoto: (totalPhotos: number) =>
        dispatch({ type: "LIGHTBOX_PREV", totalPhotos }),
      setZoom: (level: number) => dispatch({ type: "SET_ZOOM", level }),
      resetZoom: () => dispatch({ type: "RESET_ZOOM" }),

      // Slideshow
      startSlideshow: (index?: number) =>
        dispatch({ type: "START_SLIDESHOW", index }),
      stopSlideshow: () => dispatch({ type: "STOP_SLIDESHOW" }),
      togglePlaying: () => dispatch({ type: "TOGGLE_SLIDESHOW_PLAYING" }),

      // Selection
      toggleSelectionMode: () => dispatch({ type: "TOGGLE_SELECTION_MODE" }),
      togglePhotoSelected: (photoId: string) =>
        dispatch({ type: "TOGGLE_PHOTO_SELECTED", photoId }),
      selectAll: (photoIds: string[]) =>
        dispatch({ type: "SELECT_ALL", photoIds }),
      clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),

      // Compare
      toggleCompareMode: () => dispatch({ type: "TOGGLE_COMPARE_MODE" }),
      addToCompare: (photoId: string) =>
        dispatch({ type: "ADD_TO_COMPARE", photoId }),
      removeFromCompare: (photoId: string) =>
        dispatch({ type: "REMOVE_FROM_COMPARE", photoId }),

      // Favorites
      toggleFavorite: (photoId: string) =>
        dispatch({ type: "TOGGLE_FAVORITE", photoId }),
      toggleFavoritesOnly: () => dispatch({ type: "TOGGLE_FAVORITES_ONLY" }),

      // Modal
      openModal: (modal: NonNullable<GalleryState["activeModal"]>) =>
        dispatch({ type: "OPEN_MODAL", modal }),
      closeModal: () => dispatch({ type: "CLOSE_MODAL" }),

      // Theme
      setTheme: (theme: "light" | "dark") =>
        dispatch({ type: "SET_THEME", theme }),

      // UI
      showLinkCopied: () => {
        dispatch({ type: "SHOW_LINK_COPIED" });
        setTimeout(() => dispatch({ type: "HIDE_LINK_COPIED" }), 2000);
      },
    }),
    []
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      selectedCount,
      hasSelection,
      compareCount,
      favoriteCount,
      isLightboxOpen,
      isSlideshowActive,
      actions,
    }),
    [
      state,
      selectedCount,
      hasSelection,
      compareCount,
      favoriteCount,
      isLightboxOpen,
      isSlideshowActive,
      actions,
    ]
  );

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useGallery() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
}

// =============================================================================
// Selector Hooks (for performance optimization)
// =============================================================================

export function useGalleryState<T>(selector: (state: GalleryState) => T): T {
  const { state } = useGallery();
  return selector(state);
}

export function useLightbox() {
  const { state, dispatch, actions } = useGallery();
  return {
    ...state.lightbox,
    isOpen: state.activeModal === "lightbox",
    open: actions.openLightbox,
    close: actions.closeLightbox,
    next: actions.nextPhoto,
    prev: actions.prevPhoto,
    setZoom: actions.setZoom,
    resetZoom: actions.resetZoom,
    toggleExif: () => dispatch({ type: "TOGGLE_EXIF" }),
  };
}

export function useSlideshow() {
  const { state, actions, dispatch } = useGallery();
  return {
    ...state.slideshow,
    start: actions.startSlideshow,
    stop: actions.stopSlideshow,
    togglePlaying: actions.togglePlaying,
    setInterval: (interval: number) =>
      dispatch({ type: "SET_SLIDESHOW_INTERVAL", interval }),
    next: (totalPhotos: number) =>
      dispatch({ type: "SLIDESHOW_NEXT", totalPhotos }),
    prev: (totalPhotos: number) =>
      dispatch({ type: "SLIDESHOW_PREV", totalPhotos }),
    goTo: (index: number) => dispatch({ type: "SLIDESHOW_GO_TO", index }),
  };
}

export function useSelection() {
  const { state, selectedCount, hasSelection, actions } = useGallery();
  return {
    mode: state.selection.mode,
    selectedIds: state.selection.selectedIds,
    showPanel: state.selection.showPanel,
    count: selectedCount,
    hasSelection,
    toggleMode: actions.toggleSelectionMode,
    togglePhoto: actions.togglePhotoSelected,
    selectAll: actions.selectAll,
    clear: actions.clearSelection,
  };
}

export function useFavorites() {
  const { state, favoriteCount, actions, dispatch } = useGallery();
  return {
    ids: state.favorites.ids,
    showOnly: state.favorites.showOnly,
    togglingId: state.favorites.togglingId,
    count: favoriteCount,
    toggle: actions.toggleFavorite,
    toggleShowOnly: actions.toggleFavoritesOnly,
    setToggling: (photoId: string | null) =>
      dispatch({ type: "SET_TOGGLING_FAVORITE", photoId }),
    setFavorites: (ids: Set<string>) =>
      dispatch({ type: "SET_FAVORITES", ids }),
  };
}

export function useCompare() {
  const { state, compareCount, actions } = useGallery();
  return {
    mode: state.compare.mode,
    photoIds: state.compare.photoIds,
    count: compareCount,
    canAdd: compareCount < 2,
    toggleMode: actions.toggleCompareMode,
    add: actions.addToCompare,
    remove: actions.removeFromCompare,
    clear: () => actions.removeFromCompare, // Will need dispatch for CLEAR_COMPARE
  };
}
