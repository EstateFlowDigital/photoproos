import type { Appearance } from "@clerk/types";

/**
 * Clerk theme configuration matching the Dovetail/Lumos dark design system
 *
 * Color Reference (from globals.css):
 * --background: #0A0A0A (page background)
 * --card: #141414 (cards, elevated surfaces)
 * --background-secondary: #191919 (nested surfaces)
 * --background-elevated: #1E1E1E (buttons, inputs)
 * --background-hover: #313131 (hover states)
 * --card-border: rgba(255, 255, 255, 0.08) (ultra-subtle borders)
 * --border-hover: rgba(255, 255, 255, 0.24) (hover borders)
 * --foreground: #ffffff (primary text)
 * --foreground-secondary: #A7A7A7 (secondary text)
 * --foreground-muted: #7C7C7C (muted text)
 * --primary: #3b82f6 (blue accent)
 * --error: #ef4444 (red)
 * --success: #22c55e (green)
 */

export const clerkAppearance: Appearance = {
  // Base theme - dark mode
  baseTheme: undefined,

  // CSS variables for theming
  variables: {
    // Colors
    colorPrimary: "#3b82f6",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    colorWarning: "#f97316",
    colorBackground: "#141414",
    colorInputBackground: "#141414",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "#A7A7A7",
    colorTextOnPrimaryBackground: "#ffffff",
    colorNeutral: "#7C7C7C",
    colorShimmer: "#313131",

    // Typography
    fontFamily: "inherit",
    fontFamilyButtons: "inherit",
    fontSize: "14px",
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Border radius
    borderRadius: "0.75rem", // 12px - matches card radius

    // Spacing
    spacingUnit: "1rem",
  },

  // Element-level styling
  elements: {
    // =========================================================================
    // ROOT & LAYOUT
    // =========================================================================
    rootBox: "font-sans",
    card: "bg-[#141414] border border-[rgba(255,255,255,0.08)] shadow-none rounded-xl",
    cardBox: "shadow-none",

    // =========================================================================
    // HEADER
    // =========================================================================
    headerTitle: "text-white font-semibold",
    headerSubtitle: "text-[#A7A7A7]",

    // =========================================================================
    // FORMS
    // =========================================================================
    formFieldLabel: "text-[#A7A7A7] text-sm font-medium",
    formFieldLabelRow: "mb-1.5",
    formFieldInput: `
      bg-[#141414]
      border border-[rgba(255,255,255,0.08)]
      text-white
      placeholder:text-[#7C7C7C]
      focus:border-[#3b82f6]
      focus:ring-1
      focus:ring-[#3b82f6]
      focus:outline-none
      rounded-lg
      transition-colors
    `,
    formFieldInputShowPasswordButton: "text-[#7C7C7C] hover:text-white",
    formFieldAction: "text-[#3b82f6] hover:text-[#3b82f6]/80",
    formFieldErrorText: "text-[#ef4444] text-sm",
    formFieldSuccessText: "text-[#22c55e] text-sm",
    formFieldHintText: "text-[#7C7C7C] text-sm",
    formButtonPrimary: `
      bg-[#3b82f6]
      hover:bg-[#3b82f6]/90
      text-white
      font-medium
      rounded-lg
      shadow-none
      transition-colors
    `,
    formButtonReset: "text-[#3b82f6] hover:text-[#3b82f6]/80",
    formResendCodeLink: "text-[#3b82f6] hover:text-[#3b82f6]/80",

    // =========================================================================
    // BUTTONS
    // =========================================================================
    buttonPrimary: `
      bg-[#3b82f6]
      hover:bg-[#3b82f6]/90
      text-white
      font-medium
      rounded-lg
      shadow-none
      transition-colors
    `,
    buttonSecondary: `
      bg-transparent
      border border-[rgba(255,255,255,0.08)]
      text-white
      hover:bg-[#313131]
      font-medium
      rounded-lg
      shadow-none
      transition-colors
    `,
    buttonArrowIcon: "text-white",

    // =========================================================================
    // SOCIAL BUTTONS
    // =========================================================================
    socialButtonsBlockButton: `
      bg-[#1E1E1E]
      border border-[rgba(255,255,255,0.08)]
      text-white
      hover:bg-[#313131]
      hover:border-[rgba(255,255,255,0.24)]
      rounded-lg
      font-medium
      transition-colors
    `,
    socialButtonsBlockButtonText: "text-white font-medium",
    socialButtonsBlockButtonArrow: "text-[#7C7C7C]",
    socialButtonsProviderIcon: "brightness-0 invert",

    // =========================================================================
    // DIVIDERS
    // =========================================================================
    dividerLine: "bg-[rgba(255,255,255,0.08)]",
    dividerText: "text-[#7C7C7C] text-sm",
    dividerRow: "my-6",

    // =========================================================================
    // IDENTITY PREVIEW
    // =========================================================================
    identityPreview: "bg-[#191919] border border-[rgba(255,255,255,0.08)] rounded-lg",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-[#3b82f6] hover:text-[#3b82f6]/80",
    identityPreviewEditButtonIcon: "text-[#3b82f6]",

    // =========================================================================
    // FOOTER
    // =========================================================================
    footer: "bg-transparent",
    footerAction: "bg-transparent",
    footerActionText: "text-[#A7A7A7]",
    footerActionLink: "text-[#3b82f6] hover:text-[#3b82f6]/80 font-medium",
    footerPages: "hidden", // Hide "Secured by Clerk" branding
    footerPagesLink: "hidden",

    // =========================================================================
    // ALERTS
    // =========================================================================
    alert: "bg-[#191919] border border-[rgba(255,255,255,0.08)] rounded-lg",
    alertText: "text-white",
    alertTextDanger: "text-[#ef4444]",
    alertTextWarning: "text-[#f97316]",
    alertTextSuccess: "text-[#22c55e]",

    // =========================================================================
    // BADGES & TAGS
    // =========================================================================
    badge: "bg-[#3b82f6]/10 text-[#3b82f6] rounded-full font-medium",
    tagInputContainer: "bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-lg",
    tagPillContainer: "bg-[#3b82f6]/10 text-[#3b82f6] rounded-full",

    // =========================================================================
    // AVATARS
    // =========================================================================
    avatarBox: "rounded-full ring-2 ring-[rgba(255,255,255,0.08)]",
    avatarImage: "rounded-full",

    // =========================================================================
    // USER BUTTON
    // =========================================================================
    userButtonBox: "",
    userButtonTrigger: "rounded-full focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A]",
    userButtonAvatarBox: "rounded-full",
    userButtonAvatarImage: "rounded-full",
    userButtonPopoverCard: "bg-[#141414] border border-[rgba(255,255,255,0.08)] shadow-xl rounded-xl",
    userButtonPopoverMain: "p-0",
    userButtonPopoverActions: "p-2",
    userButtonPopoverActionButton: `
      text-white
      hover:bg-[#313131]
      rounded-lg
      transition-colors
      w-full
    `,
    userButtonPopoverActionButtonText: "text-white font-medium",
    userButtonPopoverActionButtonIcon: "text-[#7C7C7C]",
    userButtonPopoverActionButtonIconBox: "",
    userButtonPopoverFooter: "hidden",

    // =========================================================================
    // ORGANIZATION SWITCHER
    // =========================================================================
    organizationSwitcherTrigger: `
      bg-transparent
      hover:bg-[#313131]
      rounded-lg
      p-2
      transition-colors
      w-full
    `,
    organizationSwitcherTriggerIcon: "text-[#7C7C7C]",
    organizationSwitcherPopoverCard: "bg-[#141414] border border-[rgba(255,255,255,0.08)] shadow-xl rounded-xl",
    organizationSwitcherPopoverMain: "p-0",
    organizationSwitcherPopoverActions: "p-2 border-t border-[rgba(255,255,255,0.08)]",
    organizationSwitcherPopoverActionButton: `
      text-white
      hover:bg-[#313131]
      rounded-lg
      transition-colors
      w-full
    `,
    organizationSwitcherPopoverActionButtonText: "text-white font-medium",
    organizationSwitcherPopoverActionButtonIcon: "text-[#7C7C7C]",
    organizationSwitcherPopoverInvitationActions: "p-2 border-t border-[rgba(255,255,255,0.08)]",
    organizationSwitcherPopoverFooter: "hidden",
    organizationSwitcherPreview: "",
    organizationSwitcherPreviewButton: `
      hover:bg-[#313131]
      rounded-lg
      transition-colors
    `,
    organizationPreview: "p-2",
    organizationPreviewAvatarBox: "rounded-lg",
    organizationPreviewAvatarImage: "rounded-lg",
    organizationPreviewMainIdentifier: "text-white font-medium",
    organizationPreviewSecondaryIdentifier: "text-[#7C7C7C] text-xs",

    // =========================================================================
    // ORGANIZATION LIST
    // =========================================================================
    organizationListPreviewButton: `
      hover:bg-[#313131]
      rounded-lg
      transition-colors
      w-full
    `,
    organizationListPreviewItemActionButton: "text-[#3b82f6] hover:text-[#3b82f6]/80",
    organizationListCreateOrganizationActionButton: `
      text-[#3b82f6]
      hover:bg-[#3b82f6]/10
      rounded-lg
      transition-colors
    `,

    // =========================================================================
    // MODALS & PROFILE PAGES
    // =========================================================================
    modalBackdrop: "bg-black/60 backdrop-blur-sm",
    modalContent: "bg-[#141414] border border-[rgba(255,255,255,0.08)] shadow-2xl rounded-xl",
    modalCloseButton: "text-[#7C7C7C] hover:text-white hover:bg-[#313131] rounded-lg transition-colors",

    // Page layout for full-page modals
    pageScrollBox: "bg-[#0A0A0A]",
    page: "bg-[#0A0A0A]",

    // Navbar in profile pages
    navbar: "bg-[#141414] border-b border-[rgba(255,255,255,0.08)]",
    navbarButton: "text-[#A7A7A7] hover:text-white hover:bg-[#313131] rounded-lg transition-colors",
    navbarButtonIcon: "text-[#7C7C7C]",
    navbarMobileMenuButton: "text-white hover:bg-[#313131] rounded-lg",
    navbarMobileMenuRow: "border-b border-[rgba(255,255,255,0.08)]",

    // Profile page sections
    profileSection: "border-b border-[rgba(255,255,255,0.08)]",
    profileSectionTitle: "text-white font-semibold",
    profileSectionSubtitle: "text-[#A7A7A7]",
    profileSectionTitleText: "text-white font-semibold",
    profileSectionContent: "",
    profileSectionPrimaryButton: `
      bg-[#3b82f6]
      hover:bg-[#3b82f6]/90
      text-white
      font-medium
      rounded-lg
      transition-colors
    `,

    // Accordion for expandable sections
    accordionTriggerButton: "text-white hover:bg-[#313131] rounded-lg transition-colors",
    accordionContent: "bg-[#191919] rounded-lg",

    // =========================================================================
    // TABLES (for member lists, etc.)
    // =========================================================================
    table: "",
    tableHead: "border-b border-[rgba(255,255,255,0.08)]",
    tableHeadRow: "",
    tableHeadCell: "text-[#7C7C7C] font-medium text-sm",
    tableBody: "",
    tableBodyRow: "border-b border-[rgba(255,255,255,0.08)] hover:bg-[#191919] transition-colors",
    tableBodyCell: "text-white",

    // =========================================================================
    // PAGINATION
    // =========================================================================
    paginationButton: "text-[#A7A7A7] hover:text-white hover:bg-[#313131] rounded-lg transition-colors",
    paginationButtonIcon: "text-[#7C7C7C]",
    paginationRowText: "text-[#7C7C7C]",

    // =========================================================================
    // SELECT / DROPDOWN
    // =========================================================================
    selectButton: `
      bg-[#141414]
      border border-[rgba(255,255,255,0.08)]
      text-white
      hover:border-[rgba(255,255,255,0.24)]
      rounded-lg
      transition-colors
    `,
    selectButtonIcon: "text-[#7C7C7C]",
    selectOptionsContainer: "bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl",
    selectOption: "text-white hover:bg-[#313131] transition-colors",
    selectOptionIcon: "text-[#3b82f6]",

    // =========================================================================
    // PHONE INPUT
    // =========================================================================
    phoneInputBox: "bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-lg",

    // =========================================================================
    // VERIFICATION CODES
    // =========================================================================
    otpCodeField: "",
    otpCodeFieldInput: `
      bg-[#141414]
      border border-[rgba(255,255,255,0.08)]
      text-white
      focus:border-[#3b82f6]
      rounded-lg
      text-center
      font-mono
      text-lg
    `,

    // =========================================================================
    // FILE UPLOADS (avatars, etc.)
    // =========================================================================
    fileDropAreaBox: "border-2 border-dashed border-[rgba(255,255,255,0.08)] hover:border-[#3b82f6] rounded-lg transition-colors",
    fileDropAreaIconBox: "text-[#7C7C7C]",
    fileDropAreaIcon: "text-[#7C7C7C]",
    fileDropAreaHint: "text-[#7C7C7C]",
    fileDropAreaFooterHint: "text-[#7C7C7C]",
    fileDropAreaButtonPrimary: "text-[#3b82f6] font-medium",

    // =========================================================================
    // LOADING STATES
    // =========================================================================
    spinner: "text-[#3b82f6]",

    // =========================================================================
    // MENU ITEMS
    // =========================================================================
    menuButton: "text-white hover:bg-[#313131] rounded-lg transition-colors",
    menuList: "bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl",
    menuItem: "text-white hover:bg-[#313131] transition-colors",

    // =========================================================================
    // BREADCRUMBS (in profile pages)
    // =========================================================================
    breadcrumbs: "",
    breadcrumbsItem: "text-[#A7A7A7]",
    breadcrumbsItemDivider: "text-[#7C7C7C]",

    // =========================================================================
    // SCROLLBAR
    // =========================================================================
    scrollBox: "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#313131] [&::-webkit-scrollbar-thumb]:rounded-full",

    // =========================================================================
    // ACTIVE DEVICES LIST
    // =========================================================================
    activeDeviceListItem: "border-b border-[rgba(255,255,255,0.08)]",
    activeDeviceIcon: "text-[#7C7C7C]",
    activeDevice: "",

    // =========================================================================
    // MEMBER INVITE
    // =========================================================================
    invitationsSentIconBox: "text-[#22c55e]",
    membersPageInviteButton: `
      bg-[#3b82f6]
      hover:bg-[#3b82f6]/90
      text-white
      font-medium
      rounded-lg
      transition-colors
    `,
  },

  // Layout configuration
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
    termsPageUrl: "/legal/terms",
    privacyPageUrl: "/legal/privacy",
    helpPageUrl: "/help",
    logoPlacement: "inside",
    showOptionalFields: false,
    shimmer: true,
  },
};

/**
 * Simplified appearance for inline components (UserButton, OrganizationSwitcher)
 * Used when components are embedded in the sidebar/nav
 */
export const clerkInlineAppearance: Appearance = {
  elements: {
    // User Button
    userButtonBox: "",
    userButtonTrigger: "rounded-full",
    userButtonAvatarBox: "h-9 w-9",
    userButtonPopoverCard: "bg-[#141414] border border-[rgba(255,255,255,0.08)] shadow-xl rounded-xl",
    userButtonPopoverActionButton: "text-white hover:bg-[#313131] rounded-lg transition-colors",
    userButtonPopoverActionButtonText: "text-white",
    userButtonPopoverActionButtonIcon: "text-[#7C7C7C]",
    userButtonPopoverFooter: "hidden",

    // Organization Switcher
    organizationSwitcherTrigger: "w-full rounded-lg p-2 hover:bg-[#313131] transition-colors",
    organizationPreviewMainIdentifier: "text-white text-sm font-medium",
    organizationPreviewSecondaryIdentifier: "text-[#7C7C7C] text-xs",
    organizationSwitcherPopoverCard: "bg-[#141414] border border-[rgba(255,255,255,0.08)] shadow-xl rounded-xl",
    organizationSwitcherPopoverActionButton: "text-white hover:bg-[#313131] rounded-lg",
    organizationSwitcherPopoverFooter: "hidden",
  },
};
