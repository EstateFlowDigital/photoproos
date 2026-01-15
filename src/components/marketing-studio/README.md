# Marketing Studio

A comprehensive social media content creation suite for PhotoProOS, enabling photographers to create, preview, and export platform-ready social media content.

## Features

### Post Composer (`/super-admin/marketing-studio/composer`)

The main composition interface for creating social media posts with:

#### Layer-Based Composition
- **Text Layers** - Add and style text with full typography controls
- **Shape Layers** - Rectangles, circles with fill, stroke, and border radius
- **Image Layers** - Upload and position custom images
- **Mockup Layers** - Insert mockups from the mockup library

#### Layer Management
- Drag-and-drop positioning
- Resize handles with aspect ratio lock (Shift key)
- Layer reordering via drag
- Visibility toggle
- Layer locking with visual badge indicator
- Layer duplication
- Undo/redo history

#### Multi-Select Support
- **Cmd/Ctrl + Click** - Toggle layer selection
- **Shift + Click** - Add to selection
- **Cmd/Ctrl + A** - Select all layers
- Batch delete for selected layers
- Visual indicators (purple ring for multi-selected layers)

#### Layer Grouping
- **Cmd/Ctrl + G** - Group selected layers (2+ required)
- **Cmd/Ctrl + Shift + G** - Ungroup a group layer
- Groups behave as single units for move/resize
- Group badge shows child count
- Dashed border indicates group boundaries

#### Canvas Controls
- **Zoom** - 25% to 200% with keyboard shortcuts (Cmd/Ctrl +/-)
- **Grid overlay** - Toggleable with adjustable size
- **Snap-to-grid** - Automatic snapping during drag
- **Alignment guides** - Smart guides for centering and edge alignment

#### Toolbar Features
- **Alignment buttons** - 6-way alignment (left/center/right, top/middle/bottom)
- **Opacity slider** - Quick opacity adjustment for selected layer
- **Copy/Paste style** - Copy styles between layers (Cmd/Ctrl + Shift + C/V)
- **Lock indicator** - Visual warning when layer is locked

#### Save/Load Compositions
- Save compositions to localStorage
- Load saved compositions from dropdown
- Persists layers, background, caption, and settings

### Platform Previews

Real-time, pixel-accurate previews for 6 platforms:

| Platform | Formats | Preview Features |
|----------|---------|------------------|
| **Instagram** | Feed, Story, Reel, Carousel | Header, action bar, engagement counts |
| **LinkedIn** | Post, Article | Author info, reactions, professional layout |
| **Twitter/X** | Tweet | Engagement metrics, verified badge |
| **Facebook** | Post, Story | Reactions, shares, privacy indicator |
| **TikTok** | Video, Cover | Sound info, vertical layout |
| **Pinterest** | Pin | Board info, saves count |

### Caption Editor

Full-featured caption editing with:
- Character count with platform limits
- Hashtag counter and suggestions
- Emoji picker
- @mention formatting
- AI caption generator (tone, length, hashtags)

### Templates

40+ pre-designed templates organized by category:
- Portfolio
- Testimonial
- Before/After
- Announcement
- Behind the Scenes
- Pricing/Promo
- Educational
- Milestone

## Components

```
src/components/marketing-studio/
├── index.ts                    # Central exports
├── types.ts                    # TypeScript interfaces
├── README.md                   # This file
│
├── composer/
│   ├── caption-editor.tsx      # Caption with AI generation
│   ├── layers-panel.tsx        # Layer management sidebar
│   ├── mockup-picker.tsx       # Mockup browser
│   └── properties-panel.tsx    # Layer properties editor
│
└── previews/
    ├── instagram-preview.tsx
    ├── linkedin-preview.tsx
    ├── twitter-preview.tsx
    ├── facebook-preview.tsx
    ├── tiktok-preview.tsx
    └── pinterest-preview.tsx
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected layer(s) |
| `Escape` | Deselect all |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Cmd/Ctrl + D` | Duplicate layer |
| `Cmd/Ctrl + A` | Select all layers |
| `Cmd/Ctrl + C` | Copy to clipboard |
| `Cmd/Ctrl + E` | Export PNG |
| `Cmd/Ctrl + Shift + C` | Copy layer style |
| `Cmd/Ctrl + Shift + V` | Paste layer style |
| `Cmd/Ctrl + G` | Group selected layers |
| `Cmd/Ctrl + Shift + G` | Ungroup layer |
| `Cmd/Ctrl + +` | Zoom in |
| `Cmd/Ctrl + -` | Zoom out |
| `Cmd/Ctrl + 0` | Reset zoom to 100% |
| `T` | Add text layer |
| `I` | Add image layer |
| `S` | Add shape layer |
| `Arrow keys` | Move layer (1px) |
| `Shift + Arrow keys` | Move layer (10px) |

## Types

### Layer Types

```typescript
type LayerType = "image" | "mockup" | "text" | "shape" | "logo" | "group";

interface LayerBase {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  zIndex: number;
}

interface TextLayer extends LayerBase {
  type: "text";
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700 | 800;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
}

interface ShapeLayer extends LayerBase {
  type: "shape";
  shapeType: "rectangle" | "circle" | "line";
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius?: number;
}

interface ImageLayer extends LayerBase {
  type: "image";
  src: string;
  objectFit: "cover" | "contain" | "fill";
}

interface GroupLayer extends LayerBase {
  type: "group";
  children: Layer[];
  expanded: boolean;
}
```

### Platform Types

```typescript
type PlatformId = "instagram" | "linkedin" | "twitter" | "facebook" | "tiktok" | "pinterest";
type PostFormat = "feed" | "story" | "reel" | "carousel" | "article" | "tweet" | "cover" | "pin";
```

## Libraries

```
src/lib/marketing-studio/
├── platforms.ts      # Platform configs (limits, dimensions)
├── templates.ts      # Template definitions
├── ai-captions.ts    # AI caption generation
└── export.ts         # Export utilities (html2canvas)
```

## Usage Example

```tsx
import { InstagramPreview } from "@/components/marketing-studio/previews/instagram-preview";
import { CaptionEditor } from "@/components/marketing-studio/composer/caption-editor";

function MyComponent() {
  const [caption, setCaption] = useState("");

  return (
    <div>
      <InstagramPreview
        type="feed"
        caption={caption}
        username="photoproos"
        likes={1247}
        comments={48}
        timestamp="2 hours ago"
        hashtags={[]}
        isVerified={true}
      >
        <img src="/my-image.jpg" alt="Post content" />
      </InstagramPreview>

      <CaptionEditor
        value={caption}
        onChange={setCaption}
        platform="instagram"
        industry="commercial"
      />
    </div>
  );
}
```

## Export

The Post Composer supports:
- **PNG Export** - High-resolution image via html2canvas
- **Clipboard Copy** - Paste directly into design tools
- **Save Composition** - Store to localStorage for later editing

## Accessibility

All components follow WCAG 2.1 AA guidelines:
- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible indicators
- Screen reader announcements for state changes
- Sufficient color contrast

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `html2canvas` - Screenshot export
- `lucide-react` - Icons
- `sonner` - Toast notifications
