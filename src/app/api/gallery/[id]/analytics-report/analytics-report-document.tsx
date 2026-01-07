import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #e5e7eb",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  logo: {
    width: 120,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    borderBottom: "1 solid #e5e7eb",
    paddingBottom: 6,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    padding: 8,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #e5e7eb",
  },
  tableCell: {
    fontSize: 9,
    color: "#4b5563",
  },
  col1: { width: "40%" },
  col2: { width: "15%" },
  col3: { width: "15%" },
  col4: { width: "15%" },
  col5: { width: "15%" },
  chartSection: {
    marginTop: 16,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 9,
    color: "#4b5563",
    width: 60,
  },
  barWrapper: {
    flex: 1,
    height: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginLeft: 8,
  },
  bar: {
    height: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  barValue: {
    fontSize: 8,
    color: "#4b5563",
    marginLeft: 8,
    width: 30,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  noData: {
    fontSize: 10,
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
});

interface PhotoEngagement {
  id: string;
  filename: string;
  downloads: number;
  favorites: number;
  rating: number | null;
  engagementScore: number;
}

interface DownloadsByDay {
  date: string;
  count: number;
}

interface DownloadsByFormat {
  [format: string]: number;
}

interface AnalyticsReportProps {
  galleryName: string;
  photographerName: string;
  logoUrl?: string;
  generatedAt: string;
  overview: {
    totalViews: number;
    totalDownloads: number;
    uniqueClients: number;
    avgEngagementRate: number;
    totalPhotos: number;
  };
  photoEngagement: PhotoEngagement[];
  downloadsByDay: DownloadsByDay[];
  downloadsByFormat: DownloadsByFormat;
}

export function AnalyticsReportDocument({
  galleryName,
  photographerName,
  logoUrl,
  generatedAt,
  overview,
  photoEngagement,
  downloadsByDay,
  downloadsByFormat,
}: AnalyticsReportProps) {
  // Get max values for charts
  const maxDailyDownloads = Math.max(...downloadsByDay.map((d) => d.count), 1);
  const maxFormatCount = Math.max(...Object.values(downloadsByFormat), 1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.title}>{galleryName}</Text>
          <Text style={styles.subtitle}>
            Analytics Report • {photographerName} • Generated {generatedAt}
          </Text>
        </View>

        {/* Overview Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{overview.totalViews.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Total Views</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{overview.totalDownloads.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Total Downloads</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{overview.uniqueClients}</Text>
              <Text style={styles.metricLabel}>Unique Clients</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{overview.avgEngagementRate}%</Text>
              <Text style={styles.metricLabel}>Engagement Rate</Text>
            </View>
          </View>
        </View>

        {/* Top Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Photos</Text>
          {photoEngagement.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.col1]}>Filename</Text>
                <Text style={[styles.tableHeaderText, styles.col2]}>Downloads</Text>
                <Text style={[styles.tableHeaderText, styles.col3]}>Favorites</Text>
                <Text style={[styles.tableHeaderText, styles.col4]}>Rating</Text>
                <Text style={[styles.tableHeaderText, styles.col5]}>Score</Text>
              </View>
              {photoEngagement.slice(0, 10).map((photo, index) => (
                <View key={photo.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col1]}>
                    {index + 1}. {photo.filename.length > 30 ? photo.filename.substring(0, 27) + "..." : photo.filename}
                  </Text>
                  <Text style={[styles.tableCell, styles.col2]}>{photo.downloads}</Text>
                  <Text style={[styles.tableCell, styles.col3]}>{photo.favorites}</Text>
                  <Text style={[styles.tableCell, styles.col4]}>
                    {photo.rating ? photo.rating.toFixed(1) : "—"}
                  </Text>
                  <Text style={[styles.tableCell, styles.col5]}>{photo.engagementScore}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>No photo engagement data available</Text>
          )}
        </View>

        {/* Downloads by Day Chart */}
        {downloadsByDay.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Downloads Over Time (Last 7 Days)</Text>
            <View style={styles.chartSection}>
              {downloadsByDay.slice(-7).map((day) => (
                <View key={day.date} style={styles.barContainer}>
                  <Text style={styles.barLabel}>{day.date.slice(-5)}</Text>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        { width: `${(day.count / maxDailyDownloads) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{day.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Downloads by Format */}
        {Object.keys(downloadsByFormat).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Downloads by Format</Text>
            <View style={styles.chartSection}>
              {Object.entries(downloadsByFormat).map(([format, count]) => (
                <View key={format} style={styles.barContainer}>
                  <Text style={styles.barLabel}>{format}</Text>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        { width: `${(count / maxFormatCount) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {overview.totalPhotos} photos in gallery
          </Text>
          <Text style={styles.footerText}>
            Generated by PhotoProOS
          </Text>
        </View>
      </Page>
    </Document>
  );
}
