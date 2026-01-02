import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 700,
    },
  ],
});

const SQUARE_SIZE = 1080; // Instagram square size

const styles = StyleSheet.create({
  page: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    backgroundColor: "#0a0a0a",
    fontFamily: "Inter",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 48,
  },
  badge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  price: {
    fontSize: 48,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 8,
  },
  address: {
    fontSize: 24,
    fontWeight: 600,
    color: "#ffffff",
    marginBottom: 4,
  },
  location: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
  },
  statText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: 600,
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  agentPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  agentInitial: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: 600,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 600,
    color: "#ffffff",
    marginBottom: 4,
  },
  agentCompany: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Just Listed variant
  justListedBadge: {
    backgroundColor: "#22c55e",
  },
  // Just Sold variant
  justSoldBadge: {
    backgroundColor: "#ef4444",
  },
  // Open House variant
  openHouseBadge: {
    backgroundColor: "#f97316",
  },
});

interface SocialSquareProps {
  property: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    price: number | null;
    beds: number | null;
    baths: number | null;
    sqft: number | null;
  };
  photo: string;
  agent: {
    name: string;
    company: string | null;
  };
  variant?: "listing" | "just_listed" | "just_sold" | "open_house";
  openHouseDate?: string;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getBadgeStyle(variant: string) {
  switch (variant) {
    case "just_listed":
      return styles.justListedBadge;
    case "just_sold":
      return styles.justSoldBadge;
    case "open_house":
      return styles.openHouseBadge;
    default:
      return {};
  }
}

function getBadgeText(variant: string, openHouseDate?: string) {
  switch (variant) {
    case "just_listed":
      return "Just Listed";
    case "just_sold":
      return "Just Sold";
    case "open_house":
      return openHouseDate ? `Open House ${openHouseDate}` : "Open House";
    default:
      return "For Sale";
  }
}

export function SocialSquare({
  property,
  photo,
  agent,
  variant = "listing",
  openHouseDate,
}: SocialSquareProps) {
  return (
    <Document>
      <Page size={[SQUARE_SIZE, SQUARE_SIZE]} style={styles.page}>
        {/* Background Image */}
        {photo && <Image src={photo} style={styles.backgroundImage} />}

        {/* Gradient Overlay */}
        <View style={styles.gradientBottom} />

        {/* Content */}
        <View style={styles.content}>
          {/* Badge */}
          <View style={[styles.badge, getBadgeStyle(variant)]}>
            <Text style={styles.badgeText}>
              {getBadgeText(variant, openHouseDate)}
            </Text>
          </View>

          {/* Price */}
          {property.price && (
            <Text style={styles.price}>{formatPrice(property.price)}</Text>
          )}

          {/* Address */}
          <Text style={styles.address}>{property.address}</Text>
          <Text style={styles.location}>
            {property.city}, {property.state} {property.zipCode}
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {property.beds && (
              <View style={styles.statItem}>
                <Text style={styles.statText}>{property.beds} Beds</Text>
              </View>
            )}
            {property.baths && (
              <View style={styles.statItem}>
                <Text style={styles.statText}>{property.baths} Baths</Text>
              </View>
            )}
            {property.sqft && (
              <View style={styles.statItem}>
                <Text style={styles.statText}>
                  {property.sqft.toLocaleString()} sq ft
                </Text>
              </View>
            )}
          </View>

          {/* Agent */}
          <View style={styles.agentRow}>
            <View style={styles.agentPhoto}>
              <Text style={styles.agentInitial}>
                {agent.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agent.name}</Text>
              {agent.company && (
                <Text style={styles.agentCompany}>{agent.company}</Text>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default SocialSquare;
