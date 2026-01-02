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

// Register fonts (use system fonts for now)
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

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Inter",
  },
  heroSection: {
    height: "50%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  priceTag: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  priceText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: 700,
  },
  contentSection: {
    padding: 24,
    flex: 1,
  },
  address: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0a0a0a",
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: "#7c7c7c",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 11,
    color: "#454545",
  },
  description: {
    fontSize: 10,
    color: "#454545",
    lineHeight: 1.5,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  featureTag: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 9,
    color: "#454545",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    marginVertical: 16,
  },
  agentSection: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  agentPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
  },
  agentPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  agentInitial: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 600,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0a0a0a",
    marginBottom: 2,
  },
  agentCompany: {
    fontSize: 10,
    color: "#7c7c7c",
    marginBottom: 4,
  },
  agentContact: {
    fontSize: 10,
    color: "#3b82f6",
  },
  footer: {
    backgroundColor: "#0a0a0a",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerWebsite: {
    fontSize: 10,
    color: "#7c7c7c",
  },
  footerQR: {
    width: 48,
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  // Small photo grid below main image
  photoGrid: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 4,
    paddingTop: 4,
    backgroundColor: "#f5f5f5",
  },
  photoGridItem: {
    flex: 1,
    height: 60,
  },
  photoGridImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

interface FlyerPortraitProps {
  property: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    price: number | null;
    beds: number | null;
    baths: number | null;
    sqft: number | null;
    description: string | null;
    features: string[];
  };
  photos: string[];
  agent: {
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
  };
  websiteUrl?: string;
  branded?: boolean;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function FlyerPortrait({
  property,
  photos,
  agent,
  websiteUrl,
  branded = true,
}: FlyerPortraitProps) {
  const heroPhoto = photos[0] || "";
  const gridPhotos = photos.slice(1, 5);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Hero Image */}
        <View style={styles.heroSection}>
          {heroPhoto && (
            <Image src={heroPhoto} style={styles.heroImage} />
          )}
          {property.price && (
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{formatPrice(property.price)}</Text>
            </View>
          )}
        </View>

        {/* Photo Grid */}
        {gridPhotos.length > 0 && (
          <View style={styles.photoGrid}>
            {gridPhotos.map((photo, index) => (
              <View key={index} style={styles.photoGridItem}>
                <Image src={photo} style={styles.photoGridImage} />
              </View>
            ))}
          </View>
        )}

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.address}>{property.address}</Text>
          <Text style={styles.location}>
            {property.city}, {property.state} {property.zipCode}
          </Text>

          {/* Stats Row */}
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

          {/* Description */}
          {property.description && (
            <Text style={styles.description}>
              {property.description.slice(0, 500)}
            </Text>
          )}

          {/* Features */}
          {property.features.length > 0 && (
            <View style={styles.featuresGrid}>
              {property.features.slice(0, 6).map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Agent Section */}
          <View style={styles.agentSection}>
            <View style={styles.agentPhotoPlaceholder}>
              <Text style={styles.agentInitial}>
                {agent.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agent.name}</Text>
              {agent.company && (
                <Text style={styles.agentCompany}>{agent.company}</Text>
              )}
              <Text style={styles.agentContact}>
                {agent.phone || agent.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        {branded && (
          <View style={styles.footer}>
            <Text style={styles.footerWebsite}>
              {websiteUrl || "Powered by PhotoProOS"}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export default FlyerPortrait;
