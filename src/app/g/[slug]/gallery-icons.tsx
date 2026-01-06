/**
 * Gallery Icons
 * Re-exported from centralized icon library for backward compatibility
 * New code should import directly from @/components/ui/icons
 */

export {
  HeartIcon,
  DownloadIcon,
  LockIcon,
  PhotoIcon,
  CheckIcon,
  EyeIcon,
  LoadingSpinner,
  ArchiveIcon,
  ChatIcon,
  XIcon as CloseIcon,
  PrintIcon,
  PlayIcon,
  PauseIcon as GalleryPauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  LinkIcon,
  QRCodeIcon,
  FacebookIcon,
  TwitterXIcon as XIcon,
  PinterestIcon,
  EmailIcon,
  ZoomInIcon,
  ZoomOutIcon,
  SelectIcon,
  CompareIcon,
  ResetIcon,
  FeedbackIcon,
  ClockIcon,
  CameraIcon,
  ChevronDownIcon,
  StarIcon,
  MoreIcon,
} from "@/components/ui/icons";

export type { IconProps } from "@/components/ui/icons";

/**
 * QR Code SVG Generator Component
 * Uses external API to generate QR codes
 */
export function QRCodeSVG({
  url,
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#000000",
}: {
  url: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=${bgColor.replace("#", "")}&color=${fgColor.replace("#", "")}`;

  return (
    <img
      src={qrUrl}
      alt="QR Code"
      width={size}
      height={size}
      style={{ display: "block" }}
    />
  );
}
