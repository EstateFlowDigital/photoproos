/**
 * Centralized Icon Map for Settings Pages
 *
 * Single source of truth for all settings-related icon mappings.
 * Import this instead of defining icon maps in individual components.
 */

import type { FC } from "react";
import {
  UserIcon,
  PaletteIcon,
  CreditCardIcon,
  StripeIcon,
  BankIcon,
  UsersIcon,
  MapIcon,
  GiftIcon,
  MailIcon,
  MailOutlineIcon,
  MessageIcon,
  BellIcon,
  PlugIcon,
  CalendarIcon,
  DropboxIcon,
  SparklesIcon,
  CarIcon,
  CameraIcon,
  LayersIcon,
  CodeIcon,
  PackageIcon,
  ImageIcon,
  HelpCircleIcon,
  ZapIcon,
  StarIcon,
  RocketIcon,
  ClipboardIcon,
} from "@/components/ui/settings-icons";
import type { SettingsIconName } from "@/lib/constants/settings-navigation";

/**
 * Map of icon names to icon components
 */
export const SETTINGS_ICON_MAP: Record<
  SettingsIconName,
  FC<{ className?: string }>
> = {
  user: UserIcon,
  palette: PaletteIcon,
  creditCard: CreditCardIcon,
  stripe: StripeIcon,
  bank: BankIcon,
  users: UsersIcon,
  map: MapIcon,
  gift: GiftIcon,
  mail: MailIcon,
  mailOutline: MailOutlineIcon,
  message: MessageIcon,
  bell: BellIcon,
  plug: PlugIcon,
  calendar: CalendarIcon,
  dropbox: DropboxIcon,
  sparkles: SparklesIcon,
  car: CarIcon,
  camera: CameraIcon,
  layers: LayersIcon,
  code: CodeIcon,
  package: PackageIcon,
  image: ImageIcon,
  helpCircle: HelpCircleIcon,
  zap: ZapIcon,
  star: StarIcon,
  rocket: RocketIcon,
  clipboard: ClipboardIcon,
};

/**
 * Get an icon component by name
 */
export function getSettingsIcon(
  iconName: SettingsIconName
): FC<{ className?: string }> {
  return SETTINGS_ICON_MAP[iconName] ?? HelpCircleIcon;
}

/**
 * Check if an icon name is valid
 */
export function isValidSettingsIcon(name: string): name is SettingsIconName {
  return name in SETTINGS_ICON_MAP;
}
