"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import {
  updateVideoSettings,
  updateTourSettings,
  type VideoSettingsData,
  type TourSettingsData,
} from "@/lib/actions/media-settings";
import {
  Play,
  Box,
  Settings2,
  Eye,
  EyeOff,
  VolumeX,
  Repeat,
  Maximize2,
  ChevronDown,
  Check,
} from "lucide-react";

type VideoProvider =
  | "vimeo"
  | "youtube"
  | "bunny"
  | "mux"
  | "cloudflare"
  | "wistia"
  | "sprout"
  | "direct";

type TourProvider =
  | "matterport"
  | "iguide"
  | "cupix"
  | "zillow_3d"
  | "ricoh"
  | "kuula"
  | "other";

interface MediaSettingsClientProps {
  initialVideoSettings?: VideoSettingsData;
  initialTourSettings?: TourSettingsData;
}

const VIDEO_PROVIDERS: {
  id: VideoProvider;
  name: string;
  description: string;
  icon: string;
  color: string;
}[] = [
  {
    id: "vimeo",
    name: "Vimeo",
    description: "Professional video hosting with clean embeds",
    icon: "V",
    color: "#1ab7ea",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "World's largest video platform",
    icon: "Y",
    color: "#ff0000",
  },
  {
    id: "bunny",
    name: "Bunny Stream",
    description: "Fast, affordable video delivery",
    icon: "B",
    color: "#ff8c00",
  },
  {
    id: "mux",
    name: "Mux",
    description: "Developer-friendly video infrastructure",
    icon: "M",
    color: "#fb3c4e",
  },
  {
    id: "cloudflare",
    name: "Cloudflare Stream",
    description: "Secure, scalable video streaming",
    icon: "C",
    color: "#f38020",
  },
  {
    id: "wistia",
    name: "Wistia",
    description: "Business video hosting with analytics",
    icon: "W",
    color: "#54bbff",
  },
];

const TOUR_PROVIDERS: {
  id: TourProvider;
  name: string;
  description: string;
  icon: string;
  color: string;
}[] = [
  {
    id: "matterport",
    name: "Matterport",
    description: "Industry-leading 3D virtual tours",
    icon: "M",
    color: "#e91e63",
  },
  {
    id: "iguide",
    name: "iGuide",
    description: "Floor plans with virtual tours",
    icon: "i",
    color: "#00a651",
  },
  {
    id: "cupix",
    name: "Cupix",
    description: "360° virtual tours for construction",
    icon: "C",
    color: "#2196f3",
  },
  {
    id: "zillow_3d",
    name: "Zillow 3D Home",
    description: "Free 3D tours for real estate",
    icon: "Z",
    color: "#006aff",
  },
  {
    id: "ricoh",
    name: "Ricoh Tours",
    description: "Ricoh Theta 360° tours",
    icon: "R",
    color: "#cc0000",
  },
  {
    id: "kuula",
    name: "Kuula",
    description: "Easy 360° virtual tours",
    icon: "K",
    color: "#7c3aed",
  },
];

export function MediaSettingsClient({
  initialVideoSettings,
  initialTourSettings,
}: MediaSettingsClientProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"video" | "tour">("video");
  const [loading, setLoading] = useState(false);

  // Video settings state
  const [videoSettings, setVideoSettings] = useState({
    defaultProvider: initialVideoSettings?.defaultProvider || ("vimeo" as VideoProvider),
    vimeoEnabled: initialVideoSettings?.vimeoEnabled ?? false,
    vimeoAccessToken: initialVideoSettings?.vimeoAccessToken || "",
    youtubeEnabled: initialVideoSettings?.youtubeEnabled ?? false,
    youtubeRefreshToken: initialVideoSettings?.youtubeRefreshToken || "",
    bunnyEnabled: initialVideoSettings?.bunnyEnabled ?? false,
    bunnyApiKey: initialVideoSettings?.bunnyApiKey || "",
    bunnyLibraryId: initialVideoSettings?.bunnyLibraryId || "",
    muxEnabled: initialVideoSettings?.muxEnabled ?? false,
    muxAccessTokenId: initialVideoSettings?.muxAccessTokenId || "",
    muxSecretKey: initialVideoSettings?.muxSecretKey || "",
    cloudflareEnabled: initialVideoSettings?.cloudflareEnabled ?? false,
    cloudflareAccountId: initialVideoSettings?.cloudflareAccountId || "",
    cloudflareApiToken: initialVideoSettings?.cloudflareApiToken || "",
    wistiaEnabled: initialVideoSettings?.wistiaEnabled ?? false,
    wistiaApiToken: initialVideoSettings?.wistiaApiToken || "",
    // Playback defaults
    hideControls: initialVideoSettings?.hideControls ?? false,
    hideTitle: initialVideoSettings?.hideTitle ?? true,
    hideBranding: initialVideoSettings?.hideBranding ?? true,
    hideRelatedVideos: initialVideoSettings?.hideRelatedVideos ?? true,
    enableAutoplay: initialVideoSettings?.enableAutoplay ?? false,
    enableLoop: initialVideoSettings?.enableLoop ?? false,
    startMuted: initialVideoSettings?.startMuted ?? true,
    enableResponsiveEmbed: initialVideoSettings?.enableResponsiveEmbed ?? true,
    autoUploadEnabled: initialVideoSettings?.autoUploadEnabled ?? false,
  });

  // Tour settings state
  const [tourSettings, setTourSettings] = useState({
    defaultProvider: initialTourSettings?.defaultProvider || ("matterport" as TourProvider),
    matterportEnabled: initialTourSettings?.matterportEnabled ?? false,
    matterportSdkKey: initialTourSettings?.matterportSdkKey || "",
    matterportApiKey: initialTourSettings?.matterportApiKey || "",
    iguideEnabled: initialTourSettings?.iguideEnabled ?? false,
    iguideApiKey: initialTourSettings?.iguideApiKey || "",
    cupixEnabled: initialTourSettings?.cupixEnabled ?? false,
    cupixApiKey: initialTourSettings?.cupixApiKey || "",
    zillow3dEnabled: initialTourSettings?.zillow3dEnabled ?? false,
    // Display defaults
    showMinimap: initialTourSettings?.showMinimap ?? true,
    showFloorPlan: initialTourSettings?.showFloorPlan ?? true,
    showMeasurement: initialTourSettings?.showMeasurement ?? false,
    autoRotate: initialTourSettings?.autoRotate ?? false,
    hideNavigation: initialTourSettings?.hideNavigation ?? false,
    startInDollhouse: initialTourSettings?.startInDollhouse ?? false,
  });

  const handleSaveVideoSettings = async () => {
    setLoading(true);
    try {
      const result = await updateVideoSettings(videoSettings);
      if (result.success) {
        showToast("Video settings saved successfully", "success");
      } else {
        showToast(result.error || "Failed to save video settings", "error");
      }
    } catch {
      showToast("Failed to save video settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTourSettings = async () => {
    setLoading(true);
    try {
      const result = await updateTourSettings(tourSettings);
      if (result.success) {
        showToast("Tour settings saved successfully", "success");
      } else {
        showToast(result.error || "Failed to save tour settings", "error");
      }
    } catch {
      showToast("Failed to save tour settings", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 rounded-lg bg-[var(--background-secondary)] p-1">
        <button
          type="button"
          onClick={() => setActiveTab("video")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "video"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          <Play className="h-4 w-4" />
          Video Providers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tour")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "tour"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          <Box className="h-4 w-4" />
          3D Tour Providers
        </button>
      </div>

      {activeTab === "video" ? (
        <VideoSettingsPanel
          settings={videoSettings}
          onSettingsChange={setVideoSettings}
          onSave={handleSaveVideoSettings}
          loading={loading}
        />
      ) : (
        <TourSettingsPanel
          settings={tourSettings}
          onSettingsChange={setTourSettings}
          onSave={handleSaveTourSettings}
          loading={loading}
        />
      )}
    </div>
  );
}

// Video Settings Panel
interface VideoSettingsState {
  defaultProvider: VideoProvider;
  vimeoEnabled: boolean;
  vimeoAccessToken: string;
  youtubeEnabled: boolean;
  youtubeRefreshToken: string;
  bunnyEnabled: boolean;
  bunnyApiKey: string;
  bunnyLibraryId: string;
  muxEnabled: boolean;
  muxAccessTokenId: string;
  muxSecretKey: string;
  cloudflareEnabled: boolean;
  cloudflareAccountId: string;
  cloudflareApiToken: string;
  wistiaEnabled: boolean;
  wistiaApiToken: string;
  hideControls: boolean;
  hideTitle: boolean;
  hideBranding: boolean;
  hideRelatedVideos: boolean;
  enableAutoplay: boolean;
  enableLoop: boolean;
  startMuted: boolean;
  enableResponsiveEmbed: boolean;
  autoUploadEnabled: boolean;
}

interface VideoSettingsPanelProps {
  settings: VideoSettingsState;
  onSettingsChange: (settings: VideoSettingsState) => void;
  onSave: () => void;
  loading: boolean;
}

function VideoSettingsPanel({
  settings,
  onSettingsChange,
  onSave,
  loading,
}: VideoSettingsPanelProps) {
  const [expandedProvider, setExpandedProvider] = useState<VideoProvider | null>(null);

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Default Provider Selection */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <Settings2 className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Default Video Provider</h2>
            <p className="text-sm text-foreground-muted">
              Choose which provider to use for new video uploads
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEO_PROVIDERS.map((provider) => {
            const isSelected = settings.defaultProvider === provider.id;
            const isEnabled = settings[`${provider.id}Enabled` as keyof typeof settings];

            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => isEnabled && updateSetting("defaultProvider", provider.id)}
                disabled={!isEnabled}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : isEnabled
                      ? "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                      : "cursor-not-allowed border-[var(--card-border)] opacity-50"
                )}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white"
                  style={{ backgroundColor: provider.color }}
                >
                  {provider.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{provider.name}</p>
                  <p className="text-xs text-foreground-muted truncate">{provider.description}</p>
                </div>
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)]">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Configuration */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Provider Configuration</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Enable and configure your video hosting providers. API keys are stored securely.
        </p>

        <div className="space-y-3">
          {VIDEO_PROVIDERS.map((provider) => {
            const enabledKey = `${provider.id}Enabled` as keyof typeof settings;
            const isEnabled = settings[enabledKey] as boolean;
            const isExpanded = expandedProvider === provider.id;

            return (
              <div
                key={provider.id}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
              >
                <button
                  type="button"
                  onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                  className="flex w-full items-center gap-4 p-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
                    style={{ backgroundColor: provider.color }}
                  >
                    {provider.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-foreground">{provider.name}</p>
                    <p className="text-xs text-foreground-muted">{provider.description}</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => updateSetting(enabledKey, checked as never)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-foreground-muted transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--card-border)] p-4 space-y-4">
                    {provider.id === "vimeo" && (
                      <Input
                        label="Access Token"
                        type="password"
                        value={settings.vimeoAccessToken || ""}
                        onChange={(e) => updateSetting("vimeoAccessToken", e.target.value)}
                        placeholder="Enter your Vimeo access token"
                        helperText="Get this from Vimeo Developer settings"
                      />
                    )}
                    {provider.id === "youtube" && (
                      <Input
                        label="Refresh Token"
                        type="password"
                        value={settings.youtubeRefreshToken || ""}
                        onChange={(e) => updateSetting("youtubeRefreshToken", e.target.value)}
                        placeholder="YouTube OAuth refresh token"
                        helperText="Obtained through YouTube OAuth flow"
                      />
                    )}
                    {provider.id === "bunny" && (
                      <>
                        <Input
                          label="API Key"
                          type="password"
                          value={settings.bunnyApiKey || ""}
                          onChange={(e) => updateSetting("bunnyApiKey", e.target.value)}
                          placeholder="Enter your Bunny Stream API key"
                        />
                        <Input
                          label="Library ID"
                          value={settings.bunnyLibraryId || ""}
                          onChange={(e) => updateSetting("bunnyLibraryId", e.target.value)}
                          placeholder="Enter your video library ID"
                        />
                      </>
                    )}
                    {provider.id === "mux" && (
                      <>
                        <Input
                          label="Access Token ID"
                          value={settings.muxAccessTokenId || ""}
                          onChange={(e) => updateSetting("muxAccessTokenId", e.target.value)}
                          placeholder="Enter your Mux access token ID"
                        />
                        <Input
                          label="Secret Key"
                          type="password"
                          value={settings.muxSecretKey || ""}
                          onChange={(e) => updateSetting("muxSecretKey", e.target.value)}
                          placeholder="Enter your Mux secret key"
                        />
                      </>
                    )}
                    {provider.id === "cloudflare" && (
                      <>
                        <Input
                          label="Account ID"
                          value={settings.cloudflareAccountId || ""}
                          onChange={(e) => updateSetting("cloudflareAccountId", e.target.value)}
                          placeholder="Enter your Cloudflare account ID"
                        />
                        <Input
                          label="API Token"
                          type="password"
                          value={settings.cloudflareApiToken || ""}
                          onChange={(e) => updateSetting("cloudflareApiToken", e.target.value)}
                          placeholder="Enter your Cloudflare Stream API token"
                        />
                      </>
                    )}
                    {provider.id === "wistia" && (
                      <Input
                        label="API Token"
                        type="password"
                        value={settings.wistiaApiToken || ""}
                        onChange={(e) => updateSetting("wistiaApiToken", e.target.value)}
                        placeholder="Enter your Wistia API token"
                        helperText="Find this in Wistia Account Settings > API Access"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Playback Defaults */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Playback Defaults</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Configure default playback settings for embedded videos. These settings help ensure MLS
          compliance by hiding branding and related videos.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleSetting
            icon={<EyeOff className="h-5 w-5" />}
            label="Hide Controls"
            description="Hide player controls (play/pause, volume)"
            checked={settings.hideControls}
            onChange={(checked) => updateSetting("hideControls", checked)}
          />
          <ToggleSetting
            icon={<EyeOff className="h-5 w-5" />}
            label="Hide Title"
            description="Hide video title overlay"
            checked={settings.hideTitle}
            onChange={(checked) => updateSetting("hideTitle", checked)}
          />
          <ToggleSetting
            icon={<EyeOff className="h-5 w-5" />}
            label="Hide Branding"
            description="Hide provider branding (Vimeo, YouTube logos)"
            checked={settings.hideBranding}
            onChange={(checked) => updateSetting("hideBranding", checked)}
          />
          <ToggleSetting
            icon={<EyeOff className="h-5 w-5" />}
            label="Hide Related Videos"
            description="Don't show related videos at the end"
            checked={settings.hideRelatedVideos}
            onChange={(checked) => updateSetting("hideRelatedVideos", checked)}
          />
          <ToggleSetting
            icon={<Play className="h-5 w-5" />}
            label="Autoplay"
            description="Start playing when visible"
            checked={settings.enableAutoplay}
            onChange={(checked) => updateSetting("enableAutoplay", checked)}
          />
          <ToggleSetting
            icon={<Repeat className="h-5 w-5" />}
            label="Loop"
            description="Restart video when it ends"
            checked={settings.enableLoop}
            onChange={(checked) => updateSetting("enableLoop", checked)}
          />
          <ToggleSetting
            icon={<VolumeX className="h-5 w-5" />}
            label="Start Muted"
            description="Videos start without sound"
            checked={settings.startMuted}
            onChange={(checked) => updateSetting("startMuted", checked)}
          />
          <ToggleSetting
            icon={<Maximize2 className="h-5 w-5" />}
            label="Responsive Embed"
            description="Videos scale to fit container"
            checked={settings.enableResponsiveEmbed}
            onChange={(checked) => updateSetting("enableResponsiveEmbed", checked)}
          />
        </div>
      </div>

      {/* Auto Upload */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Auto Upload</h2>
            <p className="text-sm text-foreground-muted">
              Automatically upload videos to your default provider when added to galleries
            </p>
          </div>
          <Switch
            checked={settings.autoUploadEnabled}
            onCheckedChange={(checked) => updateSetting("autoUploadEnabled", checked)}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : "Save Video Settings"}
        </Button>
      </div>
    </div>
  );
}

// Tour Settings Panel
interface TourSettingsState {
  defaultProvider: TourProvider;
  matterportEnabled: boolean;
  matterportSdkKey: string;
  matterportApiKey: string;
  iguideEnabled: boolean;
  iguideApiKey: string;
  cupixEnabled: boolean;
  cupixApiKey: string;
  zillow3dEnabled: boolean;
  showMinimap: boolean;
  showFloorPlan: boolean;
  showMeasurement: boolean;
  autoRotate: boolean;
  hideNavigation: boolean;
  startInDollhouse: boolean;
}

interface TourSettingsPanelProps {
  settings: TourSettingsState;
  onSettingsChange: (settings: TourSettingsState) => void;
  onSave: () => void;
  loading: boolean;
}

function TourSettingsPanel({
  settings,
  onSettingsChange,
  onSave,
  loading,
}: TourSettingsPanelProps) {
  const [expandedProvider, setExpandedProvider] = useState<TourProvider | null>(null);

  const updateSetting = <K extends keyof TourSettingsState>(key: K, value: TourSettingsState[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Default Provider Selection */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <Settings2 className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Default Tour Provider</h2>
            <p className="text-sm text-foreground-muted">
              Choose which provider to use for new 3D tour embeds
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOUR_PROVIDERS.map((provider) => {
            const isSelected = settings.defaultProvider === provider.id;
            const enabledKey = `${provider.id.replace("_", "")}Enabled`;
            const isEnabled = provider.id === "ricoh" || provider.id === "kuula" || provider.id === "other"
              ? true
              : (settings[enabledKey] as boolean);

            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => isEnabled && updateSetting("defaultProvider", provider.id)}
                disabled={!isEnabled}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : isEnabled
                      ? "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                      : "cursor-not-allowed border-[var(--card-border)] opacity-50"
                )}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white"
                  style={{ backgroundColor: provider.color }}
                >
                  {provider.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{provider.name}</p>
                  <p className="text-xs text-foreground-muted truncate">{provider.description}</p>
                </div>
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)]">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Configuration */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Provider Configuration</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Enable and configure your 3D tour providers. API keys unlock additional features.
        </p>

        <div className="space-y-3">
          {TOUR_PROVIDERS.filter(p => !["ricoh", "kuula", "other"].includes(p.id)).map((provider) => {
            const enabledKey = `${provider.id.replace("_", "")}Enabled`;
            const isEnabled = settings[enabledKey] as boolean;
            const isExpanded = expandedProvider === provider.id;

            return (
              <div
                key={provider.id}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
              >
                <button
                  type="button"
                  onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                  className="flex w-full items-center gap-4 p-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
                    style={{ backgroundColor: provider.color }}
                  >
                    {provider.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-foreground">{provider.name}</p>
                    <p className="text-xs text-foreground-muted">{provider.description}</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => updateSetting(enabledKey, checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-foreground-muted transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--card-border)] p-4 space-y-4">
                    {provider.id === "matterport" && (
                      <>
                        <Input
                          label="SDK Key"
                          type="password"
                          value={(settings.matterportSdkKey as string) || ""}
                          onChange={(e) => updateSetting("matterportSdkKey", e.target.value)}
                          placeholder="Enter your Matterport SDK key"
                          helperText="Required for embedded showcase features"
                        />
                        <Input
                          label="API Key (Optional)"
                          type="password"
                          value={(settings.matterportApiKey as string) || ""}
                          onChange={(e) => updateSetting("matterportApiKey", e.target.value)}
                          placeholder="Enter your Matterport API key"
                          helperText="For advanced integrations"
                        />
                      </>
                    )}
                    {provider.id === "iguide" && (
                      <Input
                        label="API Key"
                        type="password"
                        value={(settings.iguideApiKey as string) || ""}
                        onChange={(e) => updateSetting("iguideApiKey", e.target.value)}
                        placeholder="Enter your iGuide API key"
                      />
                    )}
                    {provider.id === "cupix" && (
                      <Input
                        label="API Key"
                        type="password"
                        value={(settings.cupixApiKey as string) || ""}
                        onChange={(e) => updateSetting("cupixApiKey", e.target.value)}
                        placeholder="Enter your Cupix API key"
                      />
                    )}
                    {provider.id === "zillow_3d" && (
                      <p className="text-sm text-foreground-muted">
                        Zillow 3D Home tours don&apos;t require API configuration. Simply paste the
                        tour URL when adding a tour to a gallery.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Display Defaults */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Display Defaults</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Configure default display settings for embedded 3D tours.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleSetting
            icon={<Eye className="h-5 w-5" />}
            label="Show Minimap"
            description="Display navigation minimap overlay"
            checked={settings.showMinimap as boolean}
            onChange={(checked) => updateSetting("showMinimap", checked)}
          />
          <ToggleSetting
            icon={<Eye className="h-5 w-5" />}
            label="Show Floor Plan"
            description="Display floor plan selector"
            checked={settings.showFloorPlan as boolean}
            onChange={(checked) => updateSetting("showFloorPlan", checked)}
          />
          <ToggleSetting
            icon={<Eye className="h-5 w-5" />}
            label="Show Measurements"
            description="Enable measurement tool"
            checked={settings.showMeasurement as boolean}
            onChange={(checked) => updateSetting("showMeasurement", checked)}
          />
          <ToggleSetting
            icon={<Repeat className="h-5 w-5" />}
            label="Auto Rotate"
            description="Slowly rotate view when idle"
            checked={settings.autoRotate as boolean}
            onChange={(checked) => updateSetting("autoRotate", checked)}
          />
          <ToggleSetting
            icon={<EyeOff className="h-5 w-5" />}
            label="Hide Navigation"
            description="Hide navigation UI elements"
            checked={settings.hideNavigation as boolean}
            onChange={(checked) => updateSetting("hideNavigation", checked)}
          />
          <ToggleSetting
            icon={<Box className="h-5 w-5" />}
            label="Start in Dollhouse"
            description="Open tours in dollhouse view first"
            checked={settings.startInDollhouse as boolean}
            onChange={(checked) => updateSetting("startInDollhouse", checked)}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : "Save Tour Settings"}
        </Button>
      </div>
    </div>
  );
}

// Toggle Setting Component
interface ToggleSettingProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({ icon, label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-[var(--background)] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--background-tertiary)] text-foreground-muted">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
