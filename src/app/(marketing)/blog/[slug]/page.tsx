import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getRelatedPosts, getAllBlogPosts } from "@/lib/blog/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found | PhotoProOS Blog",
    };
  }

  return {
    title: `${post.title} | PhotoProOS Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug);

  return (
    <main className="relative min-h-screen bg-background" data-element="blog-post-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[400px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-12 lg:px-[124px] lg:py-16">
          <div className="mx-auto max-w-3xl">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-foreground-muted">
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
              <ChevronRightIcon className="h-4 w-4" />
              <span className="text-foreground-secondary">{post.category}</span>
            </nav>

            {/* Category */}
            <span className="mb-4 inline-block rounded-full bg-[var(--primary)]/10 px-3 py-1 text-sm font-medium text-[var(--primary)]">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-secondary">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{post.author.name}</p>
                  <p className="text-foreground-muted">{post.author.role}</p>
                </div>
              </div>
              <span className="hidden sm:inline">·</span>
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-12 lg:py-16">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-3xl">
            <div className="prose prose-invert prose-lg max-w-none">
              <BlogContent content={post.content} />
            </div>
          </div>
        </div>
      </article>

      {/* Author Box */}
      <section className="border-t border-[var(--card-border)] py-12">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 lg:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xl font-bold text-[var(--primary)]">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Written by</p>
                  <p className="text-lg font-semibold text-foreground">{post.author.name}</p>
                  <p className="text-foreground-secondary">{post.author.role} at PhotoProOS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
          <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Related Articles</h2>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--border-hover)]"
                >
                  <span className="mb-3 inline-block rounded-full bg-[var(--background-tertiary)] px-3 py-1 text-xs font-medium text-foreground-secondary">
                    {related.category}
                  </span>
                  <h3 className="mb-2 font-semibold text-foreground group-hover:text-[var(--primary)]">
                    {related.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary line-clamp-2">{related.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-[var(--card-border)] bg-[var(--card)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Ready to grow your photography business?
          </h2>
          <p className="mb-8 text-foreground-secondary">
            PhotoProOS helps you deliver stunning galleries, get paid faster, and manage clients effortlessly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              Start Free Trial
            </Link>
            <Link
              href="/features/galleries"
              className="rounded-lg border border-[var(--card-border)] px-6 py-3 font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              See Features
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// Simple markdown-like renderer for blog content
function BlogContent({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: "ul" | "ol" | "checklist" | null = null;
  let inCodeBlock = false;
  let codeContent: string[] = [];

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      if (listType === "checklist") {
        elements.push(
          <ul key={elements.length} className="my-4 space-y-2">
            {currentList.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-[var(--card-border)]">
                  <CheckIcon className="h-3 w-3 text-[var(--primary)]" />
                </span>
                <span dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
              </li>
            ))}
          </ul>
        );
      } else if (listType === "ol") {
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={elements.length}
            className="my-4 overflow-x-auto rounded-lg bg-[var(--background-tertiary)] p-4"
          >
            <code className="text-sm">{codeContent.join("\n")}</code>
          </pre>
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
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

    // Checklist item
    if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      if (listType !== "checklist") {
        flushList();
        listType = "checklist";
      }
      currentList.push(line.slice(6));
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

  return <>{elements}</>;
}

// Parse inline markdown (bold, italic, links, code)
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
      '<code class="rounded bg-[var(--background-tertiary)] px-1.5 py-0.5 text-sm">$1</code>'
    );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}
