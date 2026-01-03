"use client";

import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";

interface VideoSectionProps {
  config: Record<string, unknown>;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function VideoSection({ config, templateConfig }: VideoSectionProps) {
  const url = (config.url as string) || "";
  const autoplay = config.autoplay === true;
  const loop = config.loop === true;
  const muted = config.muted !== false;

  if (!url) {
    return null;
  }

  // Check if it's a YouTube or Vimeo URL
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isVimeo = url.includes("vimeo.com");

  // Extract video ID for embeds
  let embedUrl = url;

  if (isYouTube) {
    const videoId = url.includes("youtu.be")
      ? url.split("/").pop()
      : new URL(url).searchParams.get("v");
    if (videoId) {
      const params = new URLSearchParams({
        autoplay: autoplay ? "1" : "0",
        loop: loop ? "1" : "0",
        mute: muted ? "1" : "0",
      });
      embedUrl = `https://www.youtube.com/embed/${videoId}?${params}`;
    }
  } else if (isVimeo) {
    const videoId = url.split("/").pop();
    if (videoId) {
      const params = new URLSearchParams({
        autoplay: autoplay ? "1" : "0",
        loop: loop ? "1" : "0",
        muted: muted ? "1" : "0",
      });
      embedUrl = `https://player.vimeo.com/video/${videoId}?${params}`;
    }
  }

  return (
    <section
      className="py-8"
      style={{ backgroundColor: templateConfig.colors.background }}
    >
      <div className="mx-auto max-w-4xl px-6">
        {isYouTube || isVimeo ? (
          <div
            className="relative overflow-hidden"
            style={{
              paddingBottom: "56.25%", // 16:9 aspect ratio
              borderRadius: templateConfig.borderRadius,
            }}
          >
            <iframe
              src={embedUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            src={url}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls
            playsInline
            className="w-full"
            style={{ borderRadius: templateConfig.borderRadius }}
          />
        )}
      </div>
    </section>
  );
}
