import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | PhotoProOS",
  description: "Tips, guides, and insights for professional photographers. Learn how to grow your photography business.",
};

const featuredPost = {
  title: "How to Price Your Photography Services for Maximum Profit",
  excerpt: "Learn the strategies successful photographers use to price their services competitively while maintaining healthy profit margins.",
  category: "Business",
  date: "December 15, 2024",
  readTime: "8 min read",
  image: "/images/blog/pricing-guide.jpg",
  slug: "pricing-photography-services",
};

const posts = [
  {
    title: "5 Gallery Delivery Mistakes That Cost You Clients",
    excerpt: "Avoid these common pitfalls that can turn happy clients into lost opportunities.",
    category: "Client Experience",
    date: "December 10, 2024",
    readTime: "5 min read",
    slug: "gallery-delivery-mistakes",
  },
  {
    title: "The Ultimate Guide to Real Estate Photography",
    excerpt: "Everything you need to know to start and grow a successful real estate photography business.",
    category: "Real Estate",
    date: "December 5, 2024",
    readTime: "12 min read",
    slug: "real-estate-photography-guide",
  },
  {
    title: "Automating Your Photography Workflow: A Step-by-Step Guide",
    excerpt: "Save 10+ hours per week by automating repetitive tasks in your photography business.",
    category: "Productivity",
    date: "November 28, 2024",
    readTime: "7 min read",
    slug: "automating-photography-workflow",
  },
  {
    title: "How to Get More Referrals from Happy Clients",
    excerpt: "Turn satisfied clients into your best marketing channel with these proven strategies.",
    category: "Marketing",
    date: "November 20, 2024",
    readTime: "6 min read",
    slug: "getting-more-referrals",
  },
  {
    title: "Building a Photography Portfolio That Converts",
    excerpt: "Create a portfolio that showcases your best work and attracts your ideal clients.",
    category: "Marketing",
    date: "November 15, 2024",
    readTime: "9 min read",
    slug: "portfolio-that-converts",
  },
  {
    title: "Managing Client Expectations: A Photographer's Guide",
    excerpt: "Set clear expectations from the start to ensure smooth projects and happy clients.",
    category: "Client Experience",
    date: "November 8, 2024",
    readTime: "6 min read",
    slug: "managing-client-expectations",
  },
];

const categories = [
  { name: "All", count: 24 },
  { name: "Business", count: 8 },
  { name: "Marketing", count: 6 },
  { name: "Client Experience", count: 4 },
  { name: "Real Estate", count: 3 },
  { name: "Productivity", count: 3 },
];

export default function BlogPage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-16 lg:px-[124px] lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              PhotoProOS Blog
            </h1>
            <p className="text-lg text-foreground-secondary">
              Tips, guides, and insights to help you grow your photography business
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-[var(--card-border)] py-6">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category.name === "All"
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                }`}
              >
                {category.name}
                <span className="ml-2 opacity-60">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] transition-all hover:border-[var(--border-hover)]"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="aspect-[16/10] bg-[var(--background-tertiary)] lg:aspect-auto lg:h-full">
                <div className="flex h-full items-center justify-center text-foreground-muted">
                  <ImagePlaceholder />
                </div>
              </div>
              <div className="flex flex-col justify-center p-6 lg:p-10">
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                    Featured
                  </span>
                  <span className="rounded-full bg-[var(--background-tertiary)] px-3 py-1 text-xs font-medium text-foreground-secondary">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="mb-3 text-2xl font-bold text-foreground group-hover:text-[var(--primary)] lg:text-3xl">
                  {featuredPost.title}
                </h2>
                <p className="mb-6 text-foreground-secondary">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-foreground-muted">
                  <span>{featuredPost.date}</span>
                  <span>·</span>
                  <span>{featuredPost.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-xl font-semibold text-foreground">Latest Posts</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] transition-all hover:border-[var(--border-hover)]"
              >
                <div className="aspect-[16/10] rounded-t-xl bg-[var(--background-tertiary)]">
                  <div className="flex h-full items-center justify-center text-foreground-muted">
                    <ImagePlaceholder />
                  </div>
                </div>
                <div className="p-6">
                  <span className="mb-3 inline-block rounded-full bg-[var(--background-tertiary)] px-3 py-1 text-xs font-medium text-foreground-secondary">
                    {post.category}
                  </span>
                  <h3 className="mb-2 font-semibold text-foreground group-hover:text-[var(--primary)]">
                    {post.title}
                  </h3>
                  <p className="mb-4 text-sm text-foreground-secondary line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-foreground-muted">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
              Load more posts
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Subscribe to our newsletter
          </h2>
          <p className="mb-8 text-foreground-secondary">
            Get the latest tips and insights delivered to your inbox every week.
          </p>
          <form className="mx-auto flex max-w-md gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-xs text-foreground-muted">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </main>
  );
}

function ImagePlaceholder() {
  return (
    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
