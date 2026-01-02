import {
  Users,
  Images,
  CreditCard,
  Tag,
  Building2,
  Palette,
} from "lucide-react";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  completed: boolean;
  icon: React.ReactNode;
}

/**
 * Helper function to create default checklist items based on organization data
 * This is kept separate from the client component so it can be called from server components
 */
export function getChecklistItems(data: {
  hasClients: boolean;
  hasServices: boolean;
  hasGalleries: boolean;
  hasPaymentMethod: boolean;
  hasBranding: boolean;
  hasProperties: boolean;
  isRealEstate: boolean;
}): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: "clients",
      label: "Add your first client",
      description: "Start building your client database",
      href: "/clients/new",
      completed: data.hasClients,
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "services",
      label: "Create a service package",
      description: "Define your photography packages and pricing",
      href: "/services/new",
      completed: data.hasServices,
      icon: <Tag className="h-4 w-4" />,
    },
    {
      id: "galleries",
      label: "Create your first gallery",
      description: "Upload photos and deliver to clients",
      href: "/galleries/new",
      completed: data.hasGalleries,
      icon: <Images className="h-4 w-4" />,
    },
    {
      id: "branding",
      label: "Customize your branding",
      description: "Add your logo and brand colors",
      href: "/settings/branding",
      completed: data.hasBranding,
      icon: <Palette className="h-4 w-4" />,
    },
    {
      id: "payments",
      label: "Set up payments",
      description: "Connect Stripe to accept payments",
      href: "/settings/payments",
      completed: data.hasPaymentMethod,
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  // Add property-specific item for real estate
  if (data.isRealEstate) {
    items.splice(3, 0, {
      id: "properties",
      label: "Create a property website",
      description: "Build your first property listing page",
      href: "/properties/new",
      completed: data.hasProperties,
      icon: <Building2 className="h-4 w-4" />,
    });
  }

  return items;
}
