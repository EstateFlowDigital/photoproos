import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getHelpArticle,
  getRelatedArticles,
  getAllHelpArticles,
  getHelpCategory,
  getArticlesByCategory,
} from "@/lib/help/articles";

interface PageProps {
  params: Promise<{ category: string; article: string }>;
}

export async function generateStaticParams() {
  const articles = getAllHelpArticles();
  return articles.map((article) => ({
    category: article.categorySlug,
    article: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, article } = await params;
  const helpArticle = getHelpArticle(category, article);

  if (!helpArticle) {
    return {
      title: "Article Not Found | PhotoProOS Help",
    };
  }

  return {
    title: `${helpArticle.title} | PhotoProOS Help`,
    description: helpArticle.description,
  };
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { category, article } = await params;
  const helpArticle = getHelpArticle(category, article);
  const categoryInfo = getHelpCategory(category);

  if (!helpArticle || !categoryInfo) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article);
  const categoryArticles = getArticlesByCategory(category).filter((a) => a.slug !== article);

  return (
    <main className="relative min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-[var(--card-border)]">
        <div className="mx-auto max-w-[1512px] px-6 py-8 lg:px-[124px]">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-foreground-muted">
            <Link href="/help" className="hover:text-foreground">
              Help Center
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link href={`/help#${category}`} className="hover:text-foreground">
              {categoryInfo.title}
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-foreground-secondary">{helpArticle.title}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {helpArticle.title}
          </h1>
          <p className="mt-2 text-lg text-foreground-secondary">{helpArticle.description}</p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-[1512px] px-6 py-12 lg:px-[124px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <article className="min-w-0">
            <div className="prose prose-invert prose-lg max-w-none">
              <HelpContent content={helpArticle.content} />
            </div>

            {/* Feedback */}
            <div className="mt-12 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <p className="mb-4 text-center font-medium text-foreground">
                Was this article helpful?
              </p>
              <div className="flex justify-center gap-4">
                <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm text-foreground-secondary transition-colors hover:border-green-500 hover:text-green-500">
                  <ThumbsUpIcon className="h-4 w-4" />
                  Yes
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm text-foreground-secondary transition-colors hover:border-red-500 hover:text-red-500">
                  <ThumbsDownIcon className="h-4 w-4" />
                  No
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-4 font-semibold text-foreground">Related Articles</h3>
                <ul className="space-y-3">
                  {relatedArticles.map((related) => (
                    <li key={related.slug}>
                      <Link
                        href={`/help/${related.categorySlug}/${related.slug}`}
                        className="group flex items-start gap-2 text-sm text-foreground-secondary hover:text-[var(--primary)]"
                      >
                        <ChevronRightIcon className="mt-0.5 h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                        <span>{related.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* More in Category */}
            {categoryArticles.length > 0 && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-4 font-semibold text-foreground">More in {categoryInfo.title}</h3>
                <ul className="space-y-3">
                  {categoryArticles.slice(0, 5).map((catArticle) => (
                    <li key={catArticle.slug}>
                      <Link
                        href={`/help/${catArticle.categorySlug}/${catArticle.slug}`}
                        className="group flex items-start gap-2 text-sm text-foreground-secondary hover:text-[var(--primary)]"
                      >
                        <ChevronRightIcon className="mt-0.5 h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                        <span>{catArticle.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Need Help */}
            <div className="rounded-xl border border-[var(--card-border)] bg-gradient-to-b from-[var(--primary)]/5 to-transparent p-6">
              <h3 className="mb-2 font-semibold text-foreground">Still need help?</h3>
              <p className="mb-4 text-sm text-foreground-secondary">
                Our support team is here for you.
              </p>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <MailIcon className="h-4 w-4" />
                Contact Support
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// Simple markdown-like renderer for help content
function HelpContent({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      if (listType === "ol") {
        elements.push(
          <ol key={elements.length} className="my-4 list-decimal space-y-2 pl-6">
            {currentList.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={elements.length} className="my-4 list-disc space-y-2 pl-6">
            {currentList.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ul>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headers = tableRows[0];
      const body = tableRows.slice(2); // Skip header and separator
      elements.push(
        <div key={elements.length} className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {headers.map((cell, i) => (
                  <th
                    key={i}
                    className="border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-left font-semibold text-foreground"
                  >
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border border-[var(--card-border)] px-4 py-2 text-foreground-secondary"
                      dangerouslySetInnerHTML={{ __html: parseInline(cell.trim()) }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table row
    if (line.startsWith("|")) {
      flushList();
      inTable = true;
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (!line.includes("---")) {
        tableRows.push(cells);
      } else {
        tableRows.push([]); // Separator placeholder
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty line
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={elements.length}
          className="mb-4 mt-10 text-2xl font-bold text-foreground"
          dangerouslySetInnerHTML={{ __html: parseInline(line.slice(3)) }}
        />
      );
      continue;
    }

    // Heading 3
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={elements.length}
          className="mb-3 mt-8 text-xl font-semibold text-foreground"
          dangerouslySetInnerHTML={{ __html: parseInline(line.slice(4)) }}
        />
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trim())) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      currentList.push(line.replace(/^\d+\.\s/, "").trim());
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      currentList.push(line.slice(2));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={elements.length}
        className="my-4 leading-relaxed text-foreground-secondary"
        dangerouslySetInnerHTML={{ __html: parseInline(line) }}
      />
    );
  }

  flushList();
  flushTable();

  return <>{elements}</>;
}

// Parse inline markdown
function parseInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-[var(--primary)] hover:underline">$1</a>'
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-[var(--background-tertiary)] px-1.5 py-0.5 text-sm font-mono">$1</code>'
    )
    // Checkmark
    .replace(/✓/g, '<span class="text-green-500">✓</span>')
    .replace(/✗/g, '<span class="text-foreground-muted">✗</span>');
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ThumbsUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0 1 14 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 0 1-1.341 5.974 1.748 1.748 0 0 1-1.644 1.029H9.75A2.75 2.75 0 0 1 7 13.5v-3.505c0-.363.072-.716.214-1.048l2.065-4.828A1.5 1.5 0 0 1 11 3Z" />
    </svg>
  );
}

function ThumbsDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M18.75 11.75a1.25 1.25 0 0 1-2.5 0v-7.5a1.25 1.25 0 0 1 2.5 0v7.5ZM9 17v1.3c0 .268-.14.526-.395.607A2 2 0 0 1 6 17c0-.995.182-1.948.514-2.826.204-.54-.166-1.174-.744-1.174h-2.52c-1.242 0-2.26-1.01-2.146-2.247a23.864 23.864 0 0 1 1.341-5.974A1.748 1.748 0 0 1 4.089 3.75H10.5A2.75 2.75 0 0 1 13.25 6.5v3.505c0 .363-.072.716-.214 1.048l-2.065 4.828A1.5 1.5 0 0 1 9 17Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}
