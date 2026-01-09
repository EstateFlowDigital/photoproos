// Multi-media components for galleries
// Supports photos, videos, 3D tours, floor plans, and aerial footage

// Video components
export {
  VideoEmbed,
  VideoThumbnail,
  type VideoProvider,
  type VideoEmbedProps,
  type VideoThumbnailProps,
} from "./video-embed";

// 3D Tour components
export {
  TourEmbed,
  TourThumbnail,
  type TourProvider,
  type TourEmbedProps,
  type TourThumbnailProps,
} from "./tour-embed";

// Floor plan components
export {
  FloorPlanViewer,
  FloorPlanThumbnail,
  FloorSelector,
  type FloorPlanType,
  type FloorPlanViewerProps,
  type FloorPlanThumbnailProps,
  type FloorSelectorProps,
} from "./floor-plan-viewer";

// Polymorphic asset renderer
export {
  AssetRenderer,
  MediaTypeFilter,
  getAssetIcon,
  getAssetTypeLabel,
  type Asset,
  type AssetMediaType,
  type RenderMode,
  type AssetRendererProps,
  type MediaTypeFilterProps,
} from "./asset-renderer";
