"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Clock, Smile, Heart, ThumbsUp, Coffee, Flag, Hash } from "lucide-react";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  position?: "above" | "below";
  recentEmojis?: string[];
}

// Emoji categories with common emojis
const EMOJI_CATEGORIES = {
  recent: {
    icon: Clock,
    label: "Recently Used",
    emojis: [] as string[], // Populated from props
  },
  smileys: {
    icon: Smile,
    label: "Smileys & People",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
      "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
      "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜",
      "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
      "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬",
      "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷",
      "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴",
      "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐",
      "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳",
      "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭",
      "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱",
      "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️",
    ],
  },
  gestures: {
    icon: ThumbsUp,
    label: "Gestures & Body",
    emojis: [
      "👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️",
      "🤟", "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆",
      "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙",
      "💪", "🦾", "🙏", "✍️", "🤳", "💅", "🦵", "🦶",
      "👂", "🦻", "👃", "👀", "👁️", "👅", "👄", "💋",
      "🧠", "🫀", "🫁", "🦷", "🦴", "👶", "🧒", "👦",
      "👧", "🧑", "👱", "👨", "🧔", "👩", "🧓", "👴",
      "👵", "🙍", "🙎", "🙅", "🙆", "💁", "🙋", "🧏",
    ],
  },
  hearts: {
    icon: Heart,
    label: "Hearts & Love",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
      "💘", "💝", "💟", "❤️‍🔥", "❤️‍🩹", "💌", "💐", "🌹",
      "🥀", "🌷", "🌸", "💮", "🏵️", "🌺", "🌻", "🌼",
    ],
  },
  objects: {
    icon: Coffee,
    label: "Objects & Food",
    emojis: [
      "☕", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺",
      "🍻", "🥂", "🥃", "🥤", "🧋", "🧃", "🧉", "🧊",
      "🍽️", "🍴", "🥄", "🔪", "🏺", "🌰", "🥜", "🍞",
      "🥐", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞",
      "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔",
      "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯",
      "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜", "🍲",
      "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚",
    ],
  },
  activities: {
    icon: Flag,
    label: "Activities & Sports",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉",
      "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍",
      "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿",
      "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌",
      "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "🤺",
      "⛹️", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽",
      "🚣", "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉",
      "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", "🎪", "🎭",
    ],
  },
  symbols: {
    icon: Hash,
    label: "Symbols",
    emojis: [
      "✅", "❌", "❓", "❗", "💯", "🔥", "⭐", "🌟",
      "✨", "⚡", "💫", "💥", "💢", "💦", "💨", "🕳️",
      "💣", "💬", "👁️‍🗨️", "🗨️", "🗯️", "💭", "💤", "🔔",
      "🔕", "🎵", "🎶", "🔇", "🔈", "🔉", "🔊", "📢",
      "📣", "📯", "🔔", "🔕", "🎼", "🎤", "🎧", "📻",
      "🎷", "🪗", "🎸", "🎹", "🎺", "🎻", "🪕", "🥁",
      "🪘", "📱", "📲", "☎️", "📞", "📟", "📠", "💻",
      "🖥️", "🖨️", "⌨️", "🖱️", "🖲️", "💾", "💿", "📀",
    ],
  },
};

// Quick reactions shown prominently
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👀"];

export function EmojiPicker({
  isOpen,
  onClose,
  onSelect,
  position = "above",
  recentEmojis = [],
}: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>("smileys");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get emojis for current category
  const getCategoryEmojis = () => {
    if (activeCategory === "recent") {
      return recentEmojis.length > 0 ? recentEmojis : QUICK_REACTIONS;
    }
    return EMOJI_CATEGORIES[activeCategory].emojis;
  };

  // Filter emojis by search
  const filteredEmojis = searchQuery
    ? Object.values(EMOJI_CATEGORIES)
        .flatMap((cat) => cat.emojis)
        .filter((emoji) => emoji.includes(searchQuery))
    : getCategoryEmojis();

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
    onClose();
  };

  const positionClasses = position === "above"
    ? "bottom-full mb-2"
    : "top-full mt-2";

  return (
    <div
      ref={containerRef}
      className={`absolute left-0 ${positionClasses} z-50 w-80 rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl`}
      role="dialog"
      aria-label="Emoji picker"
    >
      {/* Quick Reactions */}
      <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] p-2">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl hover:bg-[var(--background-hover)] transition-colors"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="border-b border-[var(--card-border)] p-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-0 bg-[var(--background-tertiary)] py-2 pl-9 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex items-center gap-1 border-b border-[var(--card-border)] px-2 py-1 overflow-x-auto">
          {(Object.entries(EMOJI_CATEGORIES) as [keyof typeof EMOJI_CATEGORIES, typeof EMOJI_CATEGORIES.smileys][]).map(
            ([key, category]) => {
              const Icon = category.icon;
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
                  }`}
                  title={category.label}
                  aria-label={category.label}
                  aria-pressed={isActive}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="max-h-64 overflow-y-auto p-2">
        {!searchQuery && (
          <p className="mb-2 text-xs font-medium text-[var(--foreground-muted)]">
            {EMOJI_CATEGORIES[activeCategory].label}
          </p>
        )}
        <div className="grid grid-cols-8 gap-0.5">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => handleEmojiClick(emoji)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl hover:bg-[var(--background-hover)] transition-colors"
              aria-label={`Select ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {filteredEmojis.length === 0 && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-[var(--foreground-muted)]">No emojis found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact reaction picker for inline use
interface ReactionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export function ReactionPicker({ isOpen, onClose, onSelect }: ReactionPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMore, setShowMore] = useState(false);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="absolute z-50 rounded-full border border-[var(--card-border)] bg-[var(--card)] p-1 shadow-xl"
      role="menu"
      aria-label="Reaction options"
    >
      <div className="flex items-center gap-0.5">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSelect(emoji)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[var(--background-hover)] transition-colors text-lg"
            role="menuitem"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={() => setShowMore(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[var(--background-hover)] transition-colors text-sm text-[var(--foreground-muted)]"
          aria-label="More reactions"
        >
          +
        </button>
      </div>

      {showMore && (
        <EmojiPicker
          isOpen={showMore}
          onClose={() => { setShowMore(false); onClose(); }}
          onSelect={handleSelect}
          position="below"
        />
      )}
    </div>
  );
}
