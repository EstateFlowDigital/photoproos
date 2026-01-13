"use client";

import * as React from "react";
import {
  Search,
  Globe,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Image,
  Link2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PageSeo {
  id: string;
  page: string;
  url: string;
  title: string;
  description: string;
  score: number;
  issues: string[];
  lastCrawled: string;
}

interface SeoSuggestion {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  description: string;
  page: string;
  impact: "high" | "medium" | "low";
}

const mockPages: PageSeo[] = [
  {
    id: "1",
    page: "Home",
    url: "/",
    title: "Professional Photography Services | Your Studio Name",
    description: "Award-winning photography studio offering wedding, portrait, and commercial photography services.",
    score: 92,
    issues: [],
    lastCrawled: "2025-01-12",
  },
  {
    id: "2",
    page: "Wedding Photography",
    url: "/services/wedding",
    title: "Wedding Photography | Capturing Your Special Day",
    description: "Beautiful wedding photography that tells your love story. Book your consultation today.",
    score: 88,
    issues: ["Title could be longer", "Missing structured data"],
    lastCrawled: "2025-01-12",
  },
  {
    id: "3",
    page: "Portfolio",
    url: "/portfolio",
    title: "Portfolio",
    description: "",
    score: 45,
    issues: ["Title too short", "Missing meta description", "Missing alt text on 12 images"],
    lastCrawled: "2025-01-12",
  },
  {
    id: "4",
    page: "About Us",
    url: "/about",
    title: "About Our Photography Studio | Meet The Team",
    description: "Learn about our award-winning team and our passion for capturing life's precious moments.",
    score: 95,
    issues: [],
    lastCrawled: "2025-01-12",
  },
  {
    id: "5",
    page: "Contact",
    url: "/contact",
    title: "Contact Us | Book Your Session Today",
    description: "Get in touch to schedule your photography session. Located in Downtown, serving the metro area.",
    score: 78,
    issues: ["Missing local business schema"],
    lastCrawled: "2025-01-12",
  },
];

const mockSuggestions: SeoSuggestion[] = [
  {
    id: "1",
    type: "error",
    title: "Missing meta description",
    description: "The Portfolio page is missing a meta description. Add a compelling 150-160 character description.",
    page: "Portfolio",
    impact: "high",
  },
  {
    id: "2",
    type: "error",
    title: "Images missing alt text",
    description: "12 images on the Portfolio page are missing alt text, which hurts accessibility and SEO.",
    page: "Portfolio",
    impact: "high",
  },
  {
    id: "3",
    type: "warning",
    title: "Title tag too short",
    description: "The Portfolio page title is only 9 characters. Aim for 50-60 characters for better visibility.",
    page: "Portfolio",
    impact: "medium",
  },
  {
    id: "4",
    type: "warning",
    title: "Add structured data",
    description: "Adding LocalBusiness schema to your Contact page would improve local search visibility.",
    page: "Contact",
    impact: "medium",
  },
  {
    id: "5",
    type: "info",
    title: "Consider adding FAQ schema",
    description: "Adding FAQ structured data to your service pages could improve search result appearance.",
    page: "Services",
    impact: "low",
  },
];

export function SeoClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"pages" | "suggestions">("pages");

  const filteredPages = mockPages.filter((page) =>
    page.page.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgScore = Math.round(mockPages.reduce((sum, p) => sum + p.score, 0) / mockPages.length);
  const pagesWithIssues = mockPages.filter((p) => p.issues.length > 0).length;
  const highImpactIssues = mockSuggestions.filter((s) => s.impact === "high").length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[var(--success)]";
    if (score >= 60) return "text-[var(--warning)]";
    return "text-[var(--error)]";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-[var(--success)]/10";
    if (score >= 60) return "bg-[var(--warning)]/10";
    return "bg-[var(--error)]/10";
  };

  const handleRunAudit = () => {
    toast({
      title: "Running SEO Audit",
      description: "Analyzing your pages...",
    });
  };

  const handleFixIssue = (suggestion: SeoSuggestion) => {
    toast({
      title: "Opening Editor",
      description: `Editing ${suggestion.page} page...`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getScoreBg(avgScore)}`}>
              <TrendingUp className={`h-5 w-5 ${getScoreColor(avgScore)}`} />
            </div>
            <div>
              <p className={`text-2xl font-semibold ${getScoreColor(avgScore)}`}>{avgScore}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Avg SEO Score</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <FileText className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockPages.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Pages Analyzed</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
              <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{pagesWithIssues}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Pages with Issues</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--error)]/10">
              <AlertTriangle className="h-5 w-5 text-[var(--error)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{highImpactIssues}</p>
              <p className="text-sm text-[var(--foreground-muted)]">High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1">
          <button
            onClick={() => setActiveTab("pages")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "pages"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Pages
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "suggestions"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Suggestions ({mockSuggestions.length})
          </button>
        </div>
        <div className="flex items-center gap-4">
          {activeTab === "pages" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          )}
          <button
            onClick={handleRunAudit}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Run Audit
          </button>
        </div>
      </div>

      {/* Pages Tab */}
      {activeTab === "pages" && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Page</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Meta Title</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[var(--foreground-muted)]">Score</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[var(--foreground-muted)]">Issues</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page) => (
                <tr key={page.id} className="border-b border-[var(--card-border)] hover:bg-[var(--background-secondary)]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{page.page}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{page.url}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[var(--foreground)] truncate max-w-xs" title={page.title}>
                      {page.title}
                    </p>
                    {page.description && (
                      <p className="text-xs text-[var(--foreground-muted)] truncate max-w-xs" title={page.description}>
                        {page.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${getScoreBg(page.score)} ${getScoreColor(page.score)}`}>
                      {page.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {page.issues.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-sm text-[var(--warning)]">
                        <AlertTriangle className="h-4 w-4" />
                        {page.issues.length}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-[var(--success)]">
                        <CheckCircle className="h-4 w-4" />
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded p-1 hover:bg-[var(--background-secondary)]">
                      <ExternalLink className="h-4 w-4 text-[var(--foreground-muted)]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === "suggestions" && (
        <div className="space-y-4">
          {mockSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`rounded-lg border bg-[var(--card)] p-4 ${
                suggestion.type === "error"
                  ? "border-[var(--error)]/30"
                  : suggestion.type === "warning"
                  ? "border-[var(--warning)]/30"
                  : "border-[var(--card-border)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 ${
                    suggestion.type === "error"
                      ? "bg-[var(--error)]/10 text-[var(--error)]"
                      : suggestion.type === "warning"
                      ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                      : "bg-[var(--info)]/10 text-[var(--info)]"
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[var(--foreground)]">{suggestion.title}</h4>
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        suggestion.impact === "high"
                          ? "bg-[var(--error)]/10 text-[var(--error)]"
                          : suggestion.impact === "medium"
                          ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                          : "bg-[var(--info)]/10 text-[var(--info)]"
                      }`}>
                        {suggestion.impact} impact
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">{suggestion.description}</p>
                    <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                      Affects: <span className="text-[var(--foreground)]">{suggestion.page}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleFixIssue(suggestion)}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
                >
                  Fix
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
