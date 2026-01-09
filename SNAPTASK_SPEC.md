# SnapTask - Complete Build Specification

A two-part productivity system for capturing tasks from screenshots. This spec is designed to be copy-pasted into Claude Code for a complete build.

**App Name:** SnapTask
**Tagline:** "Snap it. Track it. Done."

**Build Order:** Web App first, then Mac App.

---

# BRANDING & ASSETS

## App Identity

| Element | Value |
|---------|-------|
| Name | SnapTask |
| Tagline | "Snap it. Track it. Done." |
| Domain suggestions | snaptask.app, getsnaptask.com, snaptask.io |

## Color Palette

```css
/* Primary Brand Colors */
--snaptask-primary: #3b82f6;      /* Blue - primary actions */
--snaptask-primary-dark: #2563eb; /* Blue - hover states */
--snaptask-accent: #8b5cf6;       /* Purple - highlights */

/* Semantic Colors */
--snaptask-success: #22c55e;
--snaptask-warning: #f97316;
--snaptask-error: #ef4444;

/* Dark Theme (Primary) */
--snaptask-bg: #0A0A0A;
--snaptask-card: #141414;
--snaptask-border: rgba(255, 255, 255, 0.08);
--snaptask-text: #ffffff;
--snaptask-text-muted: #6b6b6b;
```

## Logo Concepts

**Icon:** Camera viewfinder with a checkmark inside
- Represents: screenshot capture + task completion
- Works at small sizes (menu bar, favicon)
- Recognizable silhouette

**Text Logo:** "SnapTask" in Inter or SF Pro
- Weight: Semibold
- "Snap" in primary blue, "Task" in white/dark

## Mac App Icon (1024x1024)

Create `AppIcon.swift` or use asset catalog:
- Background: Rounded square with gradient (dark blue to purple)
- Foreground: White camera viewfinder icon with small checkmark
- Style: macOS Big Sur style with depth/shadow

## Favicon & Web Icons

```
/public/
├── favicon.ico          (32x32)
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png (180x180)
├── icon-192.png         (PWA)
├── icon-512.png         (PWA)
└── og-image.png         (1200x630 for social sharing)
```

## Copy & Messaging

**Hero headline:** "Capture tasks in a snap"
**Subheadline:** "Screenshot anything, turn it into a task, and track your progress—all from your menu bar."

**Feature bullets:**
- ⌘⇧T to capture any screen region
- Instant task creation with screenshot attached
- Kanban board to track progress
- Time tracking built in
- Recurring tasks & templates

---

# PART 1: WEB APPLICATION

Build a simple task manager web app using Next.js 15, PostgreSQL, and Tailwind CSS. Deploy to Railway.

## Step 1: Project Setup

Run these commands to create the project:

```bash
npx create-next-app@latest snaptask-web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd snaptask-web
npm install prisma @prisma/client
npm install -D prisma
npx prisma init
```

## Step 2: Environment Variables

Create `.env` file:

```env
# Database (Railway will provide this)
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Auth - simple password for single user
APP_PASSWORD="your-secure-password-here"

# API Key - Mac app will use this to authenticate
API_SECRET_KEY="generate-a-random-32-char-string"

# Optional: For storing screenshots
# R2_ACCESS_KEY_ID=""
# R2_SECRET_ACCESS_KEY=""
# R2_BUCKET_NAME=""
# R2_ENDPOINT=""
```

## Step 3: Database Schema

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Clients for organizing tasks
model Client {
  id        String   @id @default(cuid())
  name      String
  color     String?  // Hex color for visual identification
  createdAt DateTime @default(now())
  tasks     Task[]
  templates TaskTemplate[]

  @@index([name])
}

// Task stages for Kanban-style progression
model Stage {
  id        String   @id @default(cuid())
  name      String   // "Backlog", "To Do", "In Progress", "Review", "Done"
  order     Int      @default(0)
  color     String?  // Hex color for the stage
  createdAt DateTime @default(now())
  tasks     Task[]

  @@index([order])
}

model Task {
  id            String    @id @default(cuid())
  title         String
  description   String?   @db.Text
  screenshotUrl String?   @db.Text // base64 or URL

  // Relationships
  clientId      String?
  client        Client?   @relation(fields: [clientId], references: [id])
  stageId       String?
  stage         Stage?    @relation(fields: [stageId], references: [id])
  templateId    String?   // Created from this template
  template      TaskTemplate? @relation(fields: [templateId], references: [id])

  // Priority and timing
  priority      Priority  @default(medium)
  dueDate       DateTime?
  reminderSent  Boolean   @default(false) // Track if deadline reminder was sent

  // Recurring task settings
  isRecurring       Boolean   @default(false)
  recurringPattern  RecurringPattern?
  recurringInterval Int?      // e.g., every 2 weeks = interval of 2
  recurringDays     String?   // JSON array of days for weekly: ["mon","wed","fri"]
  nextRecurrence    DateTime? // When to create the next instance
  parentTaskId      String?   // Reference to original recurring task
  parentTask        Task?     @relation("RecurringTasks", fields: [parentTaskId], references: [id])
  childTasks        Task[]    @relation("RecurringTasks")

  // Time tracking
  estimatedMinutes  Int?      // Estimated time to complete
  timeEntries       TimeEntry[]

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  completedAt   DateTime?

  @@index([clientId])
  @@index([stageId])
  @@index([dueDate])
  @@index([createdAt])
  @@index([parentTaskId])
  @@index([nextRecurrence])
}

// Task templates for quick task creation
model TaskTemplate {
  id              String    @id @default(cuid())
  name            String
  title           String    // Default title
  description     String?   @db.Text
  defaultClientId String?
  defaultClient   Client?   @relation(fields: [defaultClientId], references: [id])
  defaultPriority Priority  @default(medium)
  estimatedMinutes Int?

  // For recurring templates
  isRecurring       Boolean   @default(false)
  recurringPattern  RecurringPattern?
  recurringInterval Int?
  recurringDays     String?

  // Checklist items (JSON array)
  checklistItems    String?   @db.Text // JSON: ["Item 1", "Item 2"]

  tasks           Task[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([name])
}

// Time tracking entries
model TimeEntry {
  id          String    @id @default(cuid())
  taskId      String
  task        Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)

  startedAt   DateTime
  endedAt     DateTime?
  durationMs  Int?      // Calculated duration in milliseconds
  notes       String?   // Optional notes about what was done

  createdAt   DateTime  @default(now())

  @@index([taskId])
  @@index([startedAt])
}

enum Priority {
  low
  medium
  high
  urgent
}

enum RecurringPattern {
  daily
  weekly
  biweekly
  monthly
  custom
}
```

Run migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

Create `prisma/seed.ts` to add default stages:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default stages for Kanban board
  const stages = [
    { name: "Backlog", order: 0, color: "#6b7280" },
    { name: "To Do", order: 1, color: "#3b82f6" },
    { name: "In Progress", order: 2, color: "#f97316" },
    { name: "Review", order: 3, color: "#8b5cf6" },
    { name: "Done", order: 4, color: "#22c55e" },
  ];

  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { id: stage.name.toLowerCase().replace(" ", "-") },
      update: {},
      create: {
        id: stage.name.toLowerCase().replace(" ", "-"),
        ...stage,
      },
    });
  }

  console.log("Seeded default stages");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

## Step 4: Prisma Client

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Step 5: Auth Helper

Create `src/lib/auth.ts`:

```typescript
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE = "st_auth";
const APP_PASSWORD = process.env.APP_PASSWORD!;
const API_SECRET_KEY = process.env.API_SECRET_KEY!;

export async function verifyPassword(password: string): Promise<boolean> {
  return password === APP_PASSWORD;
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === "authenticated";
}

export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export function verifyApiKey(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  return token === API_SECRET_KEY;
}
```

## Step 6: Global Styles

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0A0A0A;
  --card: #141414;
  --card-hover: #1a1a1a;
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.16);
  --text: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #6b6b6b;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --success: #22c55e;
  --warning: #f97316;
  --error: #ef4444;
}

body {
  background: var(--background);
  color: var(--text);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: var(--background);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}
```

## Step 7: Layout

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnapTask",
  description: "Capture tasks instantly from screenshots",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

## Step 8: Login Page

Create `src/app/login/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { isAuthenticated, verifyPassword, setAuthCookie } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  async function login(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;

    if (await verifyPassword(password)) {
      await setAuthCookie();
      redirect("/");
    }

    redirect("/login?error=1");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-2">SnapTask</h1>
          <p className="text-[var(--text-muted)] text-center text-sm mb-8">
            Enter your password to continue
          </p>

          <form action={login}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              autoFocus
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <button
              type="submit"
              className="w-full mt-4 px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-lg transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

## Step 9: API Routes

Create `src/app/api/tasks/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { TaskStatus, Priority } from "@prisma/client";

// GET /api/tasks - List tasks
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") as TaskStatus | null;
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where = status ? { status } : {};

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({ tasks, total });
}

// POST /api/tasks - Create task (from web UI)
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, priority, dueDate } = body;

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority as Priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      context: "Manual",
    },
  });

  return NextResponse.json({ success: true, task });
}
```

Create `src/app/api/tasks/capture/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyApiKey } from "@/lib/auth";
import { Priority } from "@prisma/client";

// POST /api/tasks/capture - Receive tasks from Mac app
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!verifyApiKey(authHeader)) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, screenshot, clientName, dueDate, priority } = body;

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  // Find or create client if provided
  let clientId: string | undefined;
  if (clientName) {
    const client = await prisma.client.upsert({
      where: { id: clientName.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: clientName.toLowerCase().replace(/\s+/g, "-"),
        name: clientName,
      },
    });
    clientId = client.id;
  }

  // Get default "Backlog" stage for new tasks
  const backlogStage = await prisma.stage.findFirst({
    where: { name: "Backlog" },
  });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      screenshotUrl: screenshot,
      clientId,
      stageId: backlogStage?.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: (priority as Priority) || "medium",
    },
  });

  return NextResponse.json({
    success: true,
    task: {
      id: task.id,
      title: task.title,
      createdAt: task.createdAt,
    },
  });
}
```

Create `src/app/api/clients/route.ts` for client management:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated, verifyApiKey } from "@/lib/auth";

// GET /api/clients - List all clients
export async function GET(request: NextRequest) {
  // Allow both web auth and API key auth
  const authHeader = request.headers.get("authorization");
  if (!(await isAuthenticated()) && !verifyApiKey(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { tasks: true } },
    },
  });

  return NextResponse.json({ clients });
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, color } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      name,
      color,
    },
  });

  return NextResponse.json({ success: true, client });
}
```

Create `src/app/api/stages/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated, verifyApiKey } from "@/lib/auth";

// GET /api/stages - List all stages
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!(await isAuthenticated()) && !verifyApiKey(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stages = await prisma.stage.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { tasks: true } },
    },
  });

  return NextResponse.json({ stages });
}
```

Create `src/app/api/tasks/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { TaskStatus, Priority } from "@prisma/client";

// PATCH /api/tasks/[id] - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, description, status, priority, dueDate } = body;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) {
    updateData.status = status as TaskStatus;
    if (status === "completed") {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }
  }
  if (priority !== undefined) updateData.priority = priority as Priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, task });
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

## Step 10: Dashboard Page

Replace `src/app/page.tsx` with:

```tsx
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskList } from "@/components/task-list";
import { AddTaskButton } from "@/components/add-task-button";
import { LogoutButton } from "@/components/logout-button";
import { TaskStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function Dashboard({ searchParams }: PageProps) {
  await requireAuth();

  const params = await searchParams;
  const statusFilter = params.status as TaskStatus | undefined;

  const where = statusFilter ? { status: statusFilter } : {};

  const [tasks, counts] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const countMap = {
    all: counts.reduce((acc, c) => acc + c._count, 0),
    pending: counts.find((c) => c.status === "pending")?._count || 0,
    in_progress: counts.find((c) => c.status === "in_progress")?._count || 0,
    completed: counts.find((c) => c.status === "completed")?._count || 0,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">SnapTask</h1>
          <div className="flex items-center gap-3">
            <AddTaskButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 flex-wrap">
          <FilterTab href="/" label="All" count={countMap.all} active={!statusFilter} />
          <FilterTab href="/?status=pending" label="Pending" count={countMap.pending} active={statusFilter === "pending"} />
          <FilterTab href="/?status=in_progress" label="In Progress" count={countMap.in_progress} active={statusFilter === "in_progress"} />
          <FilterTab href="/?status=completed" label="Completed" count={countMap.completed} active={statusFilter === "completed"} />
        </div>
      </div>

      {/* Task List */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        <TaskList tasks={tasks} />
      </main>
    </div>
  );
}

function FilterTab({ href, label, count, active }: { href: string; label: string; count: number; active: boolean }) {
  return (
    <a
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--primary)] text-white"
          : "bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]"
      }`}
    >
      {label} <span className="opacity-60">({count})</span>
    </a>
  );
}
```

## Step 11: Components

Create `src/components/task-list.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Task, TaskStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-muted)]">No tasks yet</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Capture your first task with Cmd+Shift+T
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    const newStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";

    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    router.refresh();
    setIsLoading(false);
  };

  const deleteTask = async () => {
    if (!confirm("Delete this task?")) return;
    setIsLoading(true);

    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    router.refresh();
  };

  const contextIcon: Record<string, string> = {
    Email: "📧",
    Slack: "💬",
    Browser: "🌐",
    Manual: "✏️",
  };

  return (
    <div
      className={`bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 transition-all hover:border-[var(--border-hover)] cursor-pointer ${
        task.status === "completed" ? "opacity-60" : ""
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={toggleComplete}
          disabled={isLoading}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            task.status === "completed"
              ? "bg-[var(--success)] border-[var(--success)]"
              : "border-[var(--border-hover)] hover:border-[var(--primary)]"
          }`}
        >
          {task.status === "completed" && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}>
              {task.title}
            </span>
            {task.context && (
              <span className="text-sm" title={task.context}>
                {contextIcon[task.context] || "📋"}
              </span>
            )}
            {task.priority === "high" || task.priority === "urgent" ? (
              <span className="text-xs px-1.5 py-0.5 bg-[var(--error)]/20 text-[var(--error)] rounded">
                {task.priority}
              </span>
            ) : null}
          </div>

          <div className="text-xs text-[var(--text-muted)] mt-1">
            {formatDate(task.createdAt)}
            {task.completedAt && ` · Completed ${formatDate(task.completedAt)}`}
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              {task.description && (
                <p className="text-sm text-[var(--text-secondary)] mb-3">{task.description}</p>
              )}
              <button
                onClick={deleteTask}
                disabled={isLoading}
                className="text-xs text-[var(--error)] hover:underline"
              >
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return d.toLocaleDateString();
}
```

Create `src/components/add-task-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddTaskButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });

    setTitle("");
    setIsOpen(false);
    setIsLoading(false);
    router.refresh();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
      >
        + Add Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        autoFocus
        className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
      />
      <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="px-2 py-1.5 text-[var(--text-muted)] hover:text-[var(--text)] text-sm"
      >
        Cancel
      </button>
    </form>
  );
}
```

Create `src/components/logout-button.tsx`:

```tsx
import { logout } from "@/lib/auth";
import { redirect } from "next/navigation";

export function LogoutButton() {
  async function handleLogout() {
    "use server";
    await logout();
    redirect("/login");
  }

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        Logout
      </button>
    </form>
  );
}
```

## Step 12: Kanban Board Component

Create `src/components/kanban-board.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Task, Stage, Client } from "@prisma/client";
import { useRouter } from "next/navigation";

type TaskWithRelations = Task & {
  client: Client | null;
  stage: Stage | null;
};

interface KanbanBoardProps {
  tasks: TaskWithRelations[];
  stages: Stage[];
  clients: Client[];
}

export function KanbanBoard({ tasks, stages, clients }: KanbanBoardProps) {
  const router = useRouter();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<string | null>(null);

  const filteredTasks = clientFilter
    ? tasks.filter((t) => t.clientId === clientFilter)
    : tasks;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    await fetch(`/api/tasks/${draggedTaskId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageId }),
    });

    setDraggedTaskId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Client Filter */}
      {clients.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setClientFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !clientFilter
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]"
            }`}
          >
            All Clients
          </button>
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => setClientFilter(client.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                clientFilter === client.id
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]"
              }`}
            >
              {client.name}
            </button>
          ))}
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageTasks = filteredTasks.filter((t) => t.stageId === stage.id);

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color || "#6b7280" }}
                />
                <h3 className="font-medium text-[var(--text)]">{stage.name}</h3>
                <span className="text-sm text-[var(--text-muted)]">
                  ({stageTasks.length})
                </span>
              </div>

              {/* Column Content */}
              <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 min-h-[400px]">
                <div className="space-y-2">
                  {stageTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  task,
  onDragStart,
}: {
  task: TaskWithRelations;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[var(--border-hover)] transition-all ${
        isOverdue ? "border-l-4 border-l-[var(--error)]" : ""
      }`}
    >
      {/* Task Title */}
      <p className="font-medium text-sm text-[var(--text)]">{task.title}</p>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {task.client && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
            {task.client.name}
          </span>
        )}
        {task.dueDate && (
          <span
            className={`text-xs ${
              isOverdue ? "text-[var(--error)]" : "text-[var(--text-muted)]"
            }`}
          >
            {formatDueDate(new Date(task.dueDate))}
          </span>
        )}
        {task.priority === "high" || task.priority === "urgent" ? (
          <span className="text-xs px-1.5 py-0.5 bg-[var(--error)]/20 text-[var(--error)] rounded">
            {task.priority}
          </span>
        ) : null}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          {task.description && (
            <p className="text-xs text-[var(--text-secondary)] mb-2">
              {task.description}
            </p>
          )}
          {task.screenshotUrl && (
            <img
              src={
                task.screenshotUrl.startsWith("data:")
                  ? task.screenshotUrl
                  : `data:image/jpeg;base64,${task.screenshotUrl}`
              }
              alt="Screenshot"
              className="w-full rounded-md"
            />
          )}
        </div>
      )}
    </div>
  );
}

function formatDueDate(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 7) return `Due in ${days}d`;

  return date.toLocaleDateString();
}
```

Create `src/app/api/tasks/[id]/stage/route.ts` for stage updates:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// PATCH /api/tasks/[id]/stage - Update task stage (for Kanban drag-drop)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { stageId } = await request.json();

  // Check if moving to "Done" stage
  const stage = await prisma.stage.findUnique({ where: { id: stageId } });

  const task = await prisma.task.update({
    where: { id },
    data: {
      stageId,
      completedAt: stage?.name === "Done" ? new Date() : null,
    },
  });

  return NextResponse.json({ success: true, task });
}
```

Update `src/app/page.tsx` to use Kanban board:

```tsx
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KanbanBoard } from "@/components/kanban-board";
import { AddTaskButton } from "@/components/add-task-button";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAuth();

  const [tasks, stages, clients] = await Promise.all([
    prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        stage: true,
      },
    }),
    prisma.stage.findMany({
      orderBy: { order: "asc" },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">SnapTask</h1>
          <div className="flex items-center gap-3">
            <AddTaskButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <KanbanBoard tasks={tasks} stages={stages} clients={clients} />
      </main>
    </div>
  );
}
```

## Step 13: Deadline Notification System

Create `src/lib/notifications.ts`:

```typescript
// Check for tasks with upcoming or overdue deadlines
export async function checkDeadlines() {
  const { prisma } = await import("@/lib/db");

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find tasks due within 24 hours that haven't been reminded
  const upcomingTasks = await prisma.task.findMany({
    where: {
      dueDate: {
        lte: tomorrow,
        gte: now,
      },
      reminderSent: false,
      completedAt: null,
    },
    include: { client: true },
  });

  // Find overdue tasks
  const overdueTasks = await prisma.task.findMany({
    where: {
      dueDate: { lt: now },
      completedAt: null,
    },
    include: { client: true },
  });

  return {
    upcoming: upcomingTasks,
    overdue: overdueTasks,
    total: upcomingTasks.length + overdueTasks.length,
  };
}

// Mark tasks as reminded
export async function markAsReminded(taskIds: string[]) {
  const { prisma } = await import("@/lib/db");

  await prisma.task.updateMany({
    where: { id: { in: taskIds } },
    data: { reminderSent: true },
  });
}
```

Create `src/app/api/cron/deadlines/route.ts` for cron-based reminders:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { checkDeadlines, markAsReminded } from "@/lib/notifications";

// This route can be called by a cron service (e.g., Railway cron, Vercel cron)
// GET /api/cron/deadlines?secret=YOUR_CRON_SECRET
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  // Verify cron secret
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deadlines = await checkDeadlines();

  // Mark upcoming tasks as reminded
  if (deadlines.upcoming.length > 0) {
    await markAsReminded(deadlines.upcoming.map((t) => t.id));
  }

  // Log for now - you can integrate email/push notifications here
  console.log(`Deadline check: ${deadlines.upcoming.length} upcoming, ${deadlines.overdue.length} overdue`);

  return NextResponse.json({
    checked: new Date().toISOString(),
    upcomingCount: deadlines.upcoming.length,
    overdueCount: deadlines.overdue.length,
    upcoming: deadlines.upcoming.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      client: t.client?.name,
    })),
    overdue: deadlines.overdue.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      client: t.client?.name,
    })),
  });
}
```

Create `src/components/deadline-alerts.tsx` for in-app notifications:

```tsx
"use client";

import { useEffect, useState } from "react";

interface DeadlineTask {
  id: string;
  title: string;
  dueDate: string;
  client?: string;
}

interface DeadlineAlertProps {
  upcoming: DeadlineTask[];
  overdue: DeadlineTask[];
}

export function DeadlineAlerts({ upcoming, overdue }: DeadlineAlertProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (upcoming.length === 0 && overdue.length === 0) return null;

  const visibleOverdue = overdue.filter((t) => !dismissed.has(t.id));
  const visibleUpcoming = upcoming.filter((t) => !dismissed.has(t.id));

  if (visibleOverdue.length === 0 && visibleUpcoming.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {/* Overdue Alerts */}
      {visibleOverdue.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-[var(--error)]">⚠️</span>
            <div>
              <p className="font-medium text-[var(--text)]">
                Overdue: {task.title}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Was due {formatTimeAgo(new Date(task.dueDate))}
                {task.client && ` · ${task.client}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(task.id))}
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Upcoming Alerts */}
      {visibleUpcoming.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-lg px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-[var(--warning)]">🕐</span>
            <div>
              <p className="font-medium text-[var(--text)]">
                Due Soon: {task.title}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Due {formatDueTime(new Date(task.dueDate))}
                {task.client && ` · ${task.client}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(task.id))}
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function formatDueTime(date: Date): string {
  const diff = date.getTime() - Date.now();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "in less than an hour";
  if (hours < 24) return `in ${hours} hour${hours > 1 ? "s" : ""}`;
  return "tomorrow";
}
```

Add to dashboard `src/app/page.tsx` (updated version with deadline alerts):

```tsx
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KanbanBoard } from "@/components/kanban-board";
import { DeadlineAlerts } from "@/components/deadline-alerts";
import { AddTaskButton } from "@/components/add-task-button";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAuth();

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [tasks, stages, clients, upcomingTasks, overdueTasks] = await Promise.all([
    prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, stage: true },
    }),
    prisma.stage.findMany({ orderBy: { order: "asc" } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    // Upcoming (due within 24 hours)
    prisma.task.findMany({
      where: {
        dueDate: { lte: tomorrow, gte: now },
        completedAt: null,
      },
      include: { client: true },
    }),
    // Overdue
    prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        completedAt: null,
      },
      include: { client: true },
    }),
  ]);

  const upcomingAlerts = upcomingTasks.map((t) => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate!.toISOString(),
    client: t.client?.name,
  }));

  const overdueAlerts = overdueTasks.map((t) => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate!.toISOString(),
    client: t.client?.name,
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">SnapTask</h1>
          <div className="flex items-center gap-3">
            <AddTaskButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Deadline Alerts */}
        <DeadlineAlerts upcoming={upcomingAlerts} overdue={overdueAlerts} />

        {/* Kanban Board */}
        <KanbanBoard tasks={tasks} stages={stages} clients={clients} />
      </main>
    </div>
  );
}
```

Add `CRON_SECRET` to `.env`:

```env
# Cron job authentication
CRON_SECRET="generate-another-random-string"
```

Set up Railway cron job:
1. In Railway dashboard, go to your service
2. Add a cron job that calls: `https://yourapp.railway.app/api/cron/deadlines?secret=YOUR_CRON_SECRET`
3. Set schedule to run every hour: `0 * * * *`

## Step 14: Task Templates

Create `src/app/api/templates/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated, verifyApiKey } from "@/lib/auth";

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!(await isAuthenticated()) && !verifyApiKey(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.taskTemplate.findMany({
    orderBy: { name: "asc" },
    include: { defaultClient: true },
  });

  return NextResponse.json({ templates });
}

// POST /api/templates - Create template
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    title,
    description,
    defaultClientId,
    defaultPriority,
    estimatedMinutes,
    isRecurring,
    recurringPattern,
    recurringInterval,
    recurringDays,
    checklistItems,
  } = body;

  if (!name || !title) {
    return NextResponse.json({ error: "Name and title required" }, { status: 400 });
  }

  const template = await prisma.taskTemplate.create({
    data: {
      name,
      title,
      description,
      defaultClientId,
      defaultPriority: defaultPriority || "medium",
      estimatedMinutes,
      isRecurring: isRecurring || false,
      recurringPattern,
      recurringInterval,
      recurringDays: recurringDays ? JSON.stringify(recurringDays) : null,
      checklistItems: checklistItems ? JSON.stringify(checklistItems) : null,
    },
  });

  return NextResponse.json({ success: true, template });
}
```

Create `src/app/api/templates/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// GET /api/templates/[id] - Get single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const template = await prisma.taskTemplate.findUnique({
    where: { id },
    include: { defaultClient: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ template });
}

// PATCH /api/templates/[id] - Update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const template = await prisma.taskTemplate.update({
    where: { id },
    data: {
      ...body,
      recurringDays: body.recurringDays ? JSON.stringify(body.recurringDays) : undefined,
      checklistItems: body.checklistItems ? JSON.stringify(body.checklistItems) : undefined,
    },
  });

  return NextResponse.json({ success: true, template });
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.taskTemplate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

Create `src/app/api/templates/[id]/create-task/route.ts` for creating tasks from templates:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated, verifyApiKey } from "@/lib/auth";

// POST /api/templates/[id]/create-task - Create task from template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("authorization");
  if (!(await isAuthenticated()) && !verifyApiKey(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, description, clientId, dueDate, screenshot } = body;

  const template = await prisma.taskTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Get default stage
  const backlogStage = await prisma.stage.findFirst({
    where: { name: "Backlog" },
  });

  // Calculate next recurrence if recurring
  let nextRecurrence: Date | null = null;
  if (template.isRecurring && template.recurringPattern) {
    nextRecurrence = calculateNextRecurrence(
      new Date(),
      template.recurringPattern,
      template.recurringInterval || 1,
      template.recurringDays
    );
  }

  const task = await prisma.task.create({
    data: {
      title: title || template.title,
      description: description || template.description,
      clientId: clientId || template.defaultClientId,
      stageId: backlogStage?.id,
      templateId: template.id,
      priority: template.defaultPriority,
      estimatedMinutes: template.estimatedMinutes,
      dueDate: dueDate ? new Date(dueDate) : null,
      screenshotUrl: screenshot,
      isRecurring: template.isRecurring,
      recurringPattern: template.recurringPattern,
      recurringInterval: template.recurringInterval,
      recurringDays: template.recurringDays,
      nextRecurrence,
    },
  });

  return NextResponse.json({ success: true, task });
}

function calculateNextRecurrence(
  from: Date,
  pattern: string,
  interval: number,
  daysJson: string | null
): Date {
  const next = new Date(from);

  switch (pattern) {
    case "daily":
      next.setDate(next.getDate() + interval);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7 * interval);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + interval);
      break;
    case "custom":
      if (daysJson) {
        const days = JSON.parse(daysJson) as string[];
        const dayMap: Record<string, number> = {
          sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
        };
        const targetDays = days.map(d => dayMap[d.toLowerCase()]).sort((a, b) => a - b);
        const currentDay = next.getDay();
        const nextDay = targetDays.find(d => d > currentDay) ?? targetDays[0];
        const daysToAdd = nextDay > currentDay
          ? nextDay - currentDay
          : 7 - currentDay + nextDay;
        next.setDate(next.getDate() + daysToAdd);
      }
      break;
  }

  return next;
}
```

## Step 15: Time Tracking

Create `src/app/api/tasks/[id]/time/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// GET /api/tasks/[id]/time - Get time entries for task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const entries = await prisma.timeEntry.findMany({
    where: { taskId: id },
    orderBy: { startedAt: "desc" },
  });

  // Calculate total time
  const totalMs = entries.reduce((sum, e) => sum + (e.durationMs || 0), 0);

  return NextResponse.json({
    entries,
    totalMs,
    totalMinutes: Math.round(totalMs / 60000),
    totalFormatted: formatDuration(totalMs),
  });
}

// POST /api/tasks/[id]/time - Start timer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check for existing running timer on this task
  const runningEntry = await prisma.timeEntry.findFirst({
    where: { taskId: id, endedAt: null },
  });

  if (runningEntry) {
    return NextResponse.json(
      { error: "Timer already running", entry: runningEntry },
      { status: 400 }
    );
  }

  const entry = await prisma.timeEntry.create({
    data: {
      taskId: id,
      startedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, entry });
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
```

Create `src/app/api/tasks/[id]/time/stop/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// POST /api/tasks/[id]/time/stop - Stop timer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { notes } = await request.json();

  // Find running timer
  const runningEntry = await prisma.timeEntry.findFirst({
    where: { taskId: id, endedAt: null },
  });

  if (!runningEntry) {
    return NextResponse.json({ error: "No running timer" }, { status: 400 });
  }

  const endedAt = new Date();
  const durationMs = endedAt.getTime() - runningEntry.startedAt.getTime();

  const entry = await prisma.timeEntry.update({
    where: { id: runningEntry.id },
    data: {
      endedAt,
      durationMs,
      notes,
    },
  });

  return NextResponse.json({ success: true, entry });
}
```

Create `src/app/api/time/active/route.ts` to check for any active timers:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// GET /api/time/active - Get active timer
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeEntry = await prisma.timeEntry.findFirst({
    where: { endedAt: null },
    include: { task: true },
    orderBy: { startedAt: "desc" },
  });

  if (!activeEntry) {
    return NextResponse.json({ active: false });
  }

  const elapsed = Date.now() - activeEntry.startedAt.getTime();

  return NextResponse.json({
    active: true,
    entry: activeEntry,
    elapsedMs: elapsed,
  });
}
```

## Step 16: Recurring Tasks Processing

Create `src/app/api/cron/recurring/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/cron/recurring?secret=YOUR_CRON_SECRET
// Process recurring tasks and create new instances
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find recurring tasks that need new instances created
  const recurringTasks = await prisma.task.findMany({
    where: {
      isRecurring: true,
      nextRecurrence: { lte: now },
      completedAt: { not: null }, // Original task was completed
      parentTaskId: null, // Only process original recurring tasks
    },
  });

  const created: string[] = [];

  for (const task of recurringTasks) {
    // Create new task instance
    const backlogStage = await prisma.stage.findFirst({
      where: { name: "Backlog" },
    });

    // Calculate due date based on recurrence
    const dueDate = task.nextRecurrence
      ? new Date(task.nextRecurrence)
      : null;

    // Calculate next recurrence
    const nextRecurrence = task.recurringPattern
      ? calculateNextRecurrence(
          now,
          task.recurringPattern,
          task.recurringInterval || 1,
          task.recurringDays
        )
      : null;

    await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        clientId: task.clientId,
        stageId: backlogStage?.id,
        templateId: task.templateId,
        priority: task.priority,
        estimatedMinutes: task.estimatedMinutes,
        dueDate,
        isRecurring: false, // Child tasks aren't recurring themselves
        parentTaskId: task.id,
      },
    });

    // Update parent task's next recurrence
    await prisma.task.update({
      where: { id: task.id },
      data: {
        nextRecurrence,
        completedAt: null, // Reset so it can be completed again
      },
    });

    created.push(task.title);
  }

  return NextResponse.json({
    processed: recurringTasks.length,
    created,
    timestamp: now.toISOString(),
  });
}

function calculateNextRecurrence(
  from: Date,
  pattern: string,
  interval: number,
  daysJson: string | null
): Date {
  const next = new Date(from);

  switch (pattern) {
    case "daily":
      next.setDate(next.getDate() + interval);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7 * interval);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + interval);
      break;
    case "custom":
      if (daysJson) {
        const days = JSON.parse(daysJson) as string[];
        const dayMap: Record<string, number> = {
          sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
        };
        const targetDays = days.map(d => dayMap[d.toLowerCase()]).sort((a, b) => a - b);
        const currentDay = next.getDay();
        const nextDay = targetDays.find(d => d > currentDay) ?? targetDays[0];
        const daysToAdd = nextDay > currentDay
          ? nextDay - currentDay
          : 7 - currentDay + nextDay;
        next.setDate(next.getDate() + daysToAdd);
      }
      break;
  }

  return next;
}
```

## Step 17: Time Tracking UI Component

Create `src/components/time-tracker.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface TimeTrackerProps {
  taskId: string;
  estimatedMinutes?: number | null;
}

export function TimeTracker({ taskId, estimatedMinutes }: TimeTrackerProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Fetch current state
  const fetchTimeData = useCallback(async () => {
    const [activeRes, timeRes] = await Promise.all([
      fetch("/api/time/active"),
      fetch(`/api/tasks/${taskId}/time`),
    ]);

    const activeData = await activeRes.json();
    const timeData = await timeRes.json();

    setTotalMs(timeData.totalMs || 0);

    if (activeData.active && activeData.entry.taskId === taskId) {
      setIsRunning(true);
      setStartTime(new Date(activeData.entry.startedAt));
      setElapsedMs(activeData.elapsedMs);
    } else {
      setIsRunning(false);
      setStartTime(null);
      setElapsedMs(0);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTimeData();
  }, [fetchTimeData]);

  // Timer tick
  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const startTimer = async () => {
    const res = await fetch(`/api/tasks/${taskId}/time`, { method: "POST" });
    if (res.ok) {
      setIsRunning(true);
      setStartTime(new Date());
      setElapsedMs(0);
    }
  };

  const stopTimer = async () => {
    const res = await fetch(`/api/tasks/${taskId}/time/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      setIsRunning(false);
      setTotalMs((prev) => prev + elapsedMs);
      setElapsedMs(0);
      setStartTime(null);
      router.refresh();
    }
  };

  const currentTotal = totalMs + elapsedMs;
  const estimatedMs = (estimatedMinutes || 0) * 60000;
  const progress = estimatedMs > 0 ? Math.min((currentTotal / estimatedMs) * 100, 100) : 0;
  const isOverEstimate = estimatedMs > 0 && currentTotal > estimatedMs;

  return (
    <div className="space-y-2">
      {/* Timer Display */}
      <div className="flex items-center gap-3">
        <button
          onClick={isRunning ? stopTimer : startTimer}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isRunning
              ? "bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)]/30"
              : "bg-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/30"
          }`}
        >
          {isRunning ? (
            <>
              <StopIcon className="w-4 h-4" />
              Stop
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              Start
            </>
          )}
        </button>

        <div className="text-sm font-mono text-[var(--text)]">
          {formatDuration(currentTotal)}
          {estimatedMinutes && (
            <span className="text-[var(--text-muted)]">
              {" "}
              / {estimatedMinutes}m
            </span>
          )}
        </div>

        {isRunning && (
          <span className="flex items-center gap-1 text-xs text-[var(--success)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            Recording
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {estimatedMinutes && (
        <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOverEstimate ? "bg-[var(--warning)]" : "bg-[var(--primary)]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}
```

## Step 18: Templates Management Page

Create `src/app/templates/page.tsx`:

```tsx
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TemplateList } from "@/components/template-list";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  await requireAuth();

  const templates = await prisma.taskTemplate.findMany({
    orderBy: { name: "asc" },
    include: {
      defaultClient: true,
      _count: { select: { tasks: true } },
    },
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text)]">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">Templates</h1>
          </div>
          <Link
            href="/templates/new"
            className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Template
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <TemplateList templates={templates} />
      </main>
    </div>
  );
}
```

Create `src/components/template-list.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  title: string;
  description: string | null;
  defaultPriority: string;
  estimatedMinutes: number | null;
  isRecurring: boolean;
  recurringPattern: string | null;
  defaultClient: { name: string } | null;
  _count: { tasks: number };
}

export function TemplateList({ templates }: { templates: Template[] }) {
  const router = useRouter();

  if (templates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-muted)]">No templates yet</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Create templates for tasks you do regularly
        </p>
      </div>
    );
  }

  const createFromTemplate = async (templateId: string) => {
    const res = await fetch(`/api/templates/${templateId}/create-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--border-hover)] transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-[var(--text)]">{template.name}</h3>
            {template.isRecurring && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                🔄 {template.recurringPattern}
              </span>
            )}
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {template.title}
          </p>

          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)] mb-4">
            {template.defaultClient && (
              <span>📁 {template.defaultClient.name}</span>
            )}
            {template.estimatedMinutes && (
              <span>⏱️ {template.estimatedMinutes}m</span>
            )}
            <span>📋 {template._count.tasks} tasks</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => createFromTemplate(template.id)}
              className="flex-1 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create Task
            </button>
            <Link
              href={`/templates/${template.id}`}
              className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm rounded-lg transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
```

Create `src/app/templates/new/page.tsx`:

```tsx
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TemplateForm } from "@/components/template-form";
import Link from "next/link";

export default async function NewTemplatePage() {
  await requireAuth();

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/templates" className="text-[var(--text-muted)] hover:text-[var(--text)]">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">New Template</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <TemplateForm clients={clients} />
      </main>
    </div>
  );
}
```

Create `src/components/template-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
}

interface TemplateFormProps {
  clients: Client[];
  initialData?: {
    id: string;
    name: string;
    title: string;
    description: string | null;
    defaultClientId: string | null;
    defaultPriority: string;
    estimatedMinutes: number | null;
    isRecurring: boolean;
    recurringPattern: string | null;
    recurringInterval: number | null;
    checklistItems: string | null;
  };
}

export function TemplateForm({ clients, initialData }: TemplateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [clientId, setClientId] = useState(initialData?.defaultClientId || "");
  const [priority, setPriority] = useState(initialData?.defaultPriority || "medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initialData?.estimatedMinutes?.toString() || ""
  );
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [recurringPattern, setRecurringPattern] = useState(
    initialData?.recurringPattern || "weekly"
  );
  const [recurringInterval, setRecurringInterval] = useState(
    initialData?.recurringInterval?.toString() || "1"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const url = initialData
      ? `/api/templates/${initialData.id}`
      : "/api/templates";

    const method = initialData ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        title,
        description: description || null,
        defaultClientId: clientId || null,
        defaultPriority: priority,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : null,
        recurringInterval: isRecurring ? parseInt(recurringInterval) : null,
      }),
    });

    if (res.ok) {
      router.push("/templates");
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-4">
        <h2 className="font-medium text-[var(--text)]">Basic Info</h2>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Template Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Weekly Review"
            required
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Default Task Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Complete weekly review"
            required
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional description..."
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Default Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="">None</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Estimated Time (minutes)
          </label>
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            placeholder="e.g., 30"
            min="1"
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      {/* Recurring Settings */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-[var(--text)]">Recurring</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--text-secondary)]">Enable recurring</span>
          </label>
        </div>

        {isRecurring && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Pattern
              </label>
              <select
                value={recurringPattern}
                onChange={(e) => setRecurringPattern(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Every X {recurringPattern === "daily" ? "days" : recurringPattern === "monthly" ? "months" : "weeks"}
              </label>
              <input
                type="number"
                value={recurringInterval}
                onChange={(e) => setRecurringInterval(e.target.value)}
                min="1"
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading || !name || !title}
          className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? "Saving..." : initialData ? "Update Template" : "Create Template"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

## Step 19: Update Kanban Card with Time Tracking

Update `src/components/kanban-board.tsx` to include time tracking in expanded cards:

Add this import at the top:
```tsx
import { TimeTracker } from "./time-tracker";
```

Update the expanded content section in `KanbanCard`:
```tsx
{/* Expanded Content */}
{isExpanded && (
  <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
    {/* Time Tracker */}
    <TimeTracker taskId={task.id} estimatedMinutes={task.estimatedMinutes} />

    {task.description && (
      <p className="text-xs text-[var(--text-secondary)]">
        {task.description}
      </p>
    )}
    {task.screenshotUrl && (
      <img
        src={
          task.screenshotUrl.startsWith("data:")
            ? task.screenshotUrl
            : `data:image/jpeg;base64,${task.screenshotUrl}`
        }
        alt="Screenshot"
        className="w-full rounded-md"
      />
    )}

    {/* Recurring indicator */}
    {task.isRecurring && (
      <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
        🔄 Recurring {task.recurringPattern}
      </div>
    )}
  </div>
)}
```

## Step 20: Update Dashboard Navigation

Update the dashboard header in `src/app/page.tsx` to include link to templates:

```tsx
<header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
  <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
    <h1 className="text-xl font-bold">SnapTask</h1>
    <div className="flex items-center gap-3">
      <Link
        href="/templates"
        className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm rounded-lg transition-colors"
      >
        Templates
      </Link>
      <AddTaskButton />
      <LogoutButton />
    </div>
  </div>
</header>
```

Add cron job for recurring tasks:
```
# In Railway cron settings, add another job:
https://yourapp.railway.app/api/cron/recurring?secret=YOUR_CRON_SECRET
# Schedule: 0 0 * * * (daily at midnight)
```

## Step 21: Deploy to Railway

1. Push code to GitHub
2. Go to railway.app and create new project
3. Add PostgreSQL database
4. Add environment variables:
   - `DATABASE_URL` (Railway provides automatically)
   - `APP_PASSWORD`
   - `API_SECRET_KEY`
5. Deploy

Railway will automatically detect Next.js and deploy.

---

# PART 2: macOS MENU BAR APPLICATION

Build a native macOS menu bar app using Swift and SwiftUI.

## Step 1: Create Xcode Project

1. Open Xcode
2. File > New > Project
3. Select "App" under macOS
4. Product Name: "SnapTask"
5. Interface: SwiftUI
6. Language: Swift
7. Uncheck "Include Tests"

## Step 2: Configure as Menu Bar App

Edit `Info.plist` - Add these keys:

```xml
<key>LSUIElement</key>
<true/>
```

This hides the app from the Dock (menu bar only).

## Step 3: Add Required Permissions

Edit `SnapTask.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <false/>
</dict>
</plist>
```

For development, disable sandbox. For distribution, you'd need:
- Screen Recording permission
- Accessibility permission (for global hotkey)

Edit `Info.plist` - Add privacy descriptions:

```xml
<key>NSScreenCaptureUsageDescription</key>
<string>SnapTask needs screen recording permission to capture screenshots for task creation.</string>
```

## Step 4: App Entry Point

Replace `SnapTaskApp.swift`:

```swift
import SwiftUI
import Carbon.HIToolbox

@main
struct SnapTaskApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        Settings {
            SettingsView()
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem!
    var popover: NSPopover!
    var hotKeyRef: EventHotKeyRef?

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMenuBar()
        registerGlobalHotKey()
    }

    func setupMenuBar() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

        if let button = statusItem.button {
            button.image = NSImage(systemSymbolName: "camera.viewfinder", accessibilityDescription: "SnapTask")
            button.action = #selector(togglePopover)
        }

        popover = NSPopover()
        popover.contentSize = NSSize(width: 300, height: 400)
        popover.behavior = .transient
        popover.contentViewController = NSHostingController(rootView: MenuBarView())
    }

    @objc func togglePopover() {
        if let button = statusItem.button {
            if popover.isShown {
                popover.performClose(nil)
            } else {
                popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
            }
        }
    }

    func registerGlobalHotKey() {
        // Cmd + Shift + T
        var hotKeyID = EventHotKeyID()
        hotKeyID.signature = OSType("SNAP".fourCharCode)
        hotKeyID.id = 1

        var eventType = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))

        InstallEventHandler(GetApplicationEventTarget(), { (_, event, _) -> OSStatus in
            NotificationCenter.default.post(name: .captureHotKeyPressed, object: nil)
            return noErr
        }, 1, &eventType, nil, nil)

        // T key = 0x11, Cmd = cmdKey, Shift = shiftKey
        RegisterEventHotKey(0x11, UInt32(cmdKey | shiftKey), hotKeyID, GetApplicationEventTarget(), 0, &hotKeyRef)
    }
}

extension String {
    var fourCharCode: FourCharCode {
        var result: FourCharCode = 0
        for char in self.utf8 {
            result = result << 8 + FourCharCode(char)
        }
        return result
    }
}

extension Notification.Name {
    static let captureHotKeyPressed = Notification.Name("captureHotKeyPressed")
}
```

## Step 5: Settings Storage

Create `Settings.swift`:

```swift
import Foundation
import Security

class AppSettings: ObservableObject {
    static let shared = AppSettings()

    @Published var apiEndpoint: String {
        didSet { UserDefaults.standard.set(apiEndpoint, forKey: "apiEndpoint") }
    }

    init() {
        self.apiEndpoint = UserDefaults.standard.string(forKey: "apiEndpoint") ?? ""
    }

    // Store API key securely in Keychain
    var apiKey: String {
        get { KeychainHelper.get(key: "apiKey") ?? "" }
        set { KeychainHelper.set(key: "apiKey", value: newValue) }
    }
}

class KeychainHelper {
    static func set(key: String, value: String) {
        let data = value.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    static func get(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]
        var result: AnyObject?
        SecItemCopyMatching(query as CFDictionary, &result)
        guard let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }
}
```

## Step 6: Screen Capture

Create `CaptureManager.swift`:

```swift
import AppKit

class CaptureManager: ObservableObject {
    static let shared = CaptureManager()

    @Published var capturedImage: NSImage?
    @Published var isCapturing = false

    func startCapture() {
        isCapturing = true

        // Use screencapture command for region selection
        let task = Process()
        task.launchPath = "/usr/sbin/screencapture"

        let tempPath = NSTemporaryDirectory() + "snaptask_\(UUID().uuidString).png"
        task.arguments = ["-i", "-s", tempPath] // Interactive, selection mode

        task.terminationHandler = { [weak self] process in
            DispatchQueue.main.async {
                self?.isCapturing = false

                if FileManager.default.fileExists(atPath: tempPath) {
                    if let image = NSImage(contentsOfFile: tempPath) {
                        self?.capturedImage = image
                        // Immediately show dialog - no AI processing
                        NotificationCenter.default.post(
                            name: .screenshotCaptured,
                            object: nil,
                            userInfo: ["image": image]
                        )
                    }
                    try? FileManager.default.removeItem(atPath: tempPath)
                }
            }
        }

        task.launch()
    }
}

extension Notification.Name {
    static let screenshotCaptured = Notification.Name("screenshotCaptured")
}
```

## Step 7: API Client

Create `APIClient.swift`:

```swift
import Foundation
import AppKit

class APIClient {
    static let shared = APIClient()

    private let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    func sendTask(title: String, description: String?, clientName: String?, dueDate: Date?, screenshot: NSImage, completion: @escaping (Bool) -> Void) {
        let settings = AppSettings.shared

        guard !settings.apiEndpoint.isEmpty, !settings.apiKey.isEmpty else {
            print("API not configured")
            completion(false)
            return
        }

        let endpoint = settings.apiEndpoint.hasSuffix("/") ? settings.apiEndpoint : settings.apiEndpoint + "/"
        guard let url = URL(string: endpoint + "api/tasks/capture") else {
            completion(false)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(settings.apiKey)", forHTTPHeaderField: "Authorization")

        var body: [String: Any] = ["title": title]
        if let description = description { body["description"] = description }
        if let clientName = clientName { body["clientName"] = clientName }
        if let dueDate = dueDate { body["dueDate"] = dateFormatter.string(from: dueDate) }

        // Always include screenshot
        if let tiffData = screenshot.tiffRepresentation,
           let bitmap = NSBitmapImageRep(data: tiffData),
           let jpegData = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.7]) {
            body["screenshot"] = jpegData.base64EncodedString()
        }

        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let httpResponse = response as? HTTPURLResponse {
                DispatchQueue.main.async {
                    completion(httpResponse.statusCode == 200)
                }
            } else {
                DispatchQueue.main.async {
                    completion(false)
                }
            }
        }.resume()
    }
}
```

## Step 8: Menu Bar View

Create `MenuBarView.swift`:

```swift
import SwiftUI

struct MenuBarView: View {
    @StateObject private var captureManager = CaptureManager.shared
    @State private var recentTasks: [String] = []
    @State private var showingTaskDialog = false
    @State private var pendingImage: NSImage?

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                Text("SnapTask")
                    .font(.headline)
                Spacer()
            }
            .padding()
            .background(Color(nsColor: .windowBackgroundColor))

            Divider()

            // Capture button
            Button(action: {
                CaptureManager.shared.startCapture()
            }) {
                HStack {
                    Image(systemName: "camera.viewfinder")
                    Text("Capture Task")
                    Spacer()
                    Text("⌘⇧T")
                        .foregroundColor(.secondary)
                        .font(.caption)
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
            }
            .buttonStyle(.plain)
            .background(Color.clear)

            if !recentTasks.isEmpty {
                Divider()

                Text("Recent")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.horizontal)
                    .padding(.top, 8)

                ForEach(recentTasks.prefix(5), id: \.self) { task in
                    HStack {
                        Text("•")
                            .foregroundColor(.secondary)
                        Text(task)
                            .lineLimit(1)
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 4)
                    .font(.caption)
                }
            }

            Divider()

            // Settings
            Button(action: {
                NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
            }) {
                HStack {
                    Text("Settings...")
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
            }
            .buttonStyle(.plain)

            // Quit
            Button(action: {
                NSApplication.shared.terminate(nil)
            }) {
                HStack {
                    Text("Quit")
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
            }
            .buttonStyle(.plain)
        }
        .frame(width: 280)
        .onReceive(NotificationCenter.default.publisher(for: .captureHotKeyPressed)) { _ in
            CaptureManager.shared.startCapture()
        }
        .onReceive(NotificationCenter.default.publisher(for: .screenshotCaptured)) { notification in
            if let image = notification.userInfo?["image"] as? NSImage {
                pendingImage = image
                showingTaskDialog = true
            }
        }
        .sheet(isPresented: $showingTaskDialog) {
            TaskEntryView(
                image: pendingImage!,
                onSave: { taskData in
                    sendTask(data: taskData, image: pendingImage!)
                    showingTaskDialog = false
                },
                onCancel: {
                    showingTaskDialog = false
                }
            )
        }
    }

    private func sendTask(data: TaskData, image: NSImage) {
        APIClient.shared.sendTask(
            title: data.title,
            description: data.description,
            clientName: data.clientName,
            dueDate: data.dueDate,
            screenshot: image
        ) { success in
            if success {
                recentTasks.insert(data.title, at: 0)
                if recentTasks.count > 10 {
                    recentTasks.removeLast()
                }
            }
        }
    }
}

// Task data to send to API
struct TaskData {
    let title: String
    let description: String?
    let clientName: String?
    let dueDate: Date?
}

// Dialog that appears immediately after screenshot capture
struct TaskEntryView: View {
    let image: NSImage
    let onSave: (TaskData) -> Void
    let onCancel: () -> Void

    @State private var title: String = ""
    @State private var description: String = ""
    @State private var clientName: String = ""
    @State private var hasDueDate: Bool = false
    @State private var dueDate: Date = Calendar.current.date(byAdding: .day, value: 1, to: Date())!
    @FocusState private var titleFocused: Bool

    var body: some View {
        VStack(spacing: 16) {
            // Header
            Text("New Task")
                .font(.headline)

            // Screenshot preview
            Image(nsImage: image)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(maxHeight: 120)
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.secondary.opacity(0.3), lineWidth: 1)
                )

            // Task title (required)
            VStack(alignment: .leading, spacing: 4) {
                Text("Title")
                    .font(.caption)
                    .foregroundColor(.secondary)
                TextField("What needs to be done?", text: $title)
                    .textFieldStyle(.roundedBorder)
                    .focused($titleFocused)
            }

            // Description (optional)
            VStack(alignment: .leading, spacing: 4) {
                Text("Description")
                    .font(.caption)
                    .foregroundColor(.secondary)
                TextField("Additional details (optional)", text: $description)
                    .textFieldStyle(.roundedBorder)
            }

            // Client (optional)
            VStack(alignment: .leading, spacing: 4) {
                Text("Client")
                    .font(.caption)
                    .foregroundColor(.secondary)
                TextField("Client name (optional)", text: $clientName)
                    .textFieldStyle(.roundedBorder)
            }

            // Due Date (optional)
            VStack(alignment: .leading, spacing: 4) {
                Toggle("Set due date", isOn: $hasDueDate)
                    .font(.caption)

                if hasDueDate {
                    DatePicker("Due", selection: $dueDate, displayedComponents: [.date])
                        .datePickerStyle(.compact)
                }
            }

            // Buttons
            HStack {
                Button("Cancel") {
                    onCancel()
                }
                .keyboardShortcut(.escape)

                Spacer()

                Button("Save Task") {
                    let data = TaskData(
                        title: title,
                        description: description.isEmpty ? nil : description,
                        clientName: clientName.isEmpty ? nil : clientName,
                        dueDate: hasDueDate ? dueDate : nil
                    )
                    onSave(data)
                }
                .keyboardShortcut(.return)
                .buttonStyle(.borderedProminent)
                .disabled(title.isEmpty)
            }
        }
        .padding()
        .frame(width: 400)
        .onAppear {
            titleFocused = true
        }
    }
}
```

## Step 9: Settings View

Create `SettingsView.swift`:

```swift
import SwiftUI

struct SettingsView: View {
    @StateObject private var settings = AppSettings.shared
    @State private var apiKey: String = ""

    var body: some View {
        Form {
            Section("API Configuration") {
                TextField("API Endpoint", text: $settings.apiEndpoint)
                    .textFieldStyle(.roundedBorder)
                    .help("Your web app URL (e.g., https://yourapp.railway.app)")

                SecureField("API Secret Key", text: $apiKey)
                    .textFieldStyle(.roundedBorder)
                    .onChange(of: apiKey) { _, newValue in
                        settings.apiKey = newValue
                    }
                    .onAppear {
                        apiKey = settings.apiKey
                    }
            }

            Section("Keyboard Shortcut") {
                Text("⌘ + ⇧ + T")
                    .font(.system(.body, design: .monospaced))
                    .foregroundColor(.secondary)
                Text("Global shortcut to capture a task")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .formStyle(.grouped)
        .frame(width: 400, height: 250)
    }
}
```

## Step 10: Template Support in Mac App

Add template fetching and selection to `APIClient.swift`:

```swift
// Add to APIClient class
struct TaskTemplate: Codable, Identifiable {
    let id: String
    let name: String
    let title: String
    let description: String?
    let defaultPriority: String
    let estimatedMinutes: Int?
    let isRecurring: Bool
    let recurringPattern: String?
}

func fetchTemplates(completion: @escaping ([TaskTemplate]) -> Void) {
    let settings = AppSettings.shared

    guard !settings.apiEndpoint.isEmpty, !settings.apiKey.isEmpty else {
        completion([])
        return
    }

    let endpoint = settings.apiEndpoint.hasSuffix("/") ? settings.apiEndpoint : settings.apiEndpoint + "/"
    guard let url = URL(string: endpoint + "api/templates") else {
        completion([])
        return
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(settings.apiKey)", forHTTPHeaderField: "Authorization")

    URLSession.shared.dataTask(with: request) { data, response, error in
        guard let data = data,
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let templatesData = json["templates"] as? [[String: Any]] else {
            DispatchQueue.main.async { completion([]) }
            return
        }

        let templates = templatesData.compactMap { dict -> TaskTemplate? in
            guard let id = dict["id"] as? String,
                  let name = dict["name"] as? String,
                  let title = dict["title"] as? String else { return nil }
            return TaskTemplate(
                id: id,
                name: name,
                title: title,
                description: dict["description"] as? String,
                defaultPriority: dict["defaultPriority"] as? String ?? "medium",
                estimatedMinutes: dict["estimatedMinutes"] as? Int,
                isRecurring: dict["isRecurring"] as? Bool ?? false,
                recurringPattern: dict["recurringPattern"] as? String
            )
        }

        DispatchQueue.main.async { completion(templates) }
    }.resume()
}

func createTaskFromTemplate(templateId: String, screenshot: NSImage, completion: @escaping (Bool) -> Void) {
    let settings = AppSettings.shared

    guard !settings.apiEndpoint.isEmpty, !settings.apiKey.isEmpty else {
        completion(false)
        return
    }

    let endpoint = settings.apiEndpoint.hasSuffix("/") ? settings.apiEndpoint : settings.apiEndpoint + "/"
    guard let url = URL(string: endpoint + "api/templates/\(templateId)/create-task") else {
        completion(false)
        return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("Bearer \(settings.apiKey)", forHTTPHeaderField: "Authorization")

    var body: [String: Any] = [:]

    // Include screenshot
    if let tiffData = screenshot.tiffRepresentation,
       let bitmap = NSBitmapImageRep(data: tiffData),
       let jpegData = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.7]) {
        body["screenshot"] = jpegData.base64EncodedString()
    }

    request.httpBody = try? JSONSerialization.data(withJSONObject: body)

    URLSession.shared.dataTask(with: request) { _, response, _ in
        if let httpResponse = response as? HTTPURLResponse {
            DispatchQueue.main.async { completion(httpResponse.statusCode == 200) }
        } else {
            DispatchQueue.main.async { completion(false) }
        }
    }.resume()
}
```

Update `MenuBarView.swift` to include template quick-access:

```swift
// Add template state to MenuBarView
@State private var templates: [TaskTemplate] = []

// Add to body, after "Capture Task" button:
if !templates.isEmpty {
    Divider()

    Text("Quick Templates")
        .font(.caption)
        .foregroundColor(.secondary)
        .padding(.horizontal)
        .padding(.top, 8)

    ForEach(templates.prefix(5)) { template in
        Button(action: {
            CaptureManager.shared.startCapture()
            // Store selected template for use after capture
            selectedTemplateId = template.id
        }) {
            HStack {
                Text("📋")
                Text(template.name)
                    .lineLimit(1)
                Spacer()
                if template.isRecurring {
                    Text("🔄")
                        .font(.caption2)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 4)
        }
        .buttonStyle(.plain)
    }
}

// Add onAppear to load templates
.onAppear {
    APIClient.shared.fetchTemplates { fetched in
        templates = fetched
    }
}
```

Update `TaskEntryView` to support pre-filling from template:

```swift
// Add optional template parameter
let selectedTemplate: TaskTemplate?

// In body, initialize state from template:
.onAppear {
    titleFocused = true
    if let template = selectedTemplate {
        title = template.title
        description = template.description ?? ""
    }
}
```

## Step 11: Build and Run

1. In Xcode, select your Mac as the run destination
2. Product > Run (Cmd+R)
3. Grant Screen Recording permission when prompted
4. Look for the camera icon in your menu bar

## Step 12: Configure

1. Click the menu bar icon
2. Go to Settings
3. Enter your web app URL (e.g., `https://snaptask-web.railway.app`)
4. Enter your API Secret Key (same as `API_SECRET_KEY` in your web app)
5. Press Cmd+Shift+T to capture your first task!

---

# TROUBLESHOOTING

## Web App Issues

| Problem | Solution |
|---------|----------|
| "Unauthorized" on login | Check `APP_PASSWORD` env var |
| Mac app gets 401 | Check `API_SECRET_KEY` matches |
| Database connection fails | Verify `DATABASE_URL` format |

## Mac App Issues

| Problem | Solution |
|---------|----------|
| Hotkey doesn't work | Grant Accessibility permission in System Settings |
| Screenshot fails | Grant Screen Recording permission |
| App not in menu bar | Check `LSUIElement` in Info.plist |

---

# COST ESTIMATE

| Service | Monthly Cost |
|---------|--------------|
| Railway (Next.js + PostgreSQL) | ~$5-10 |
| **Total** | **~$5-10/month** |

No AI costs - task titles are entered manually by the user.

---

# FUTURE ENHANCEMENTS

- [ ] Offline queue (capture without internet, sync later)
- [ ] Priority selection in Mac app dialog
- [ ] Multiple workspaces/projects
- [ ] Weekly email digest of tasks and deadlines
- [ ] Native macOS notifications for reminders
- [ ] Push notifications via web browser
- [ ] Export tasks to CSV/PDF
- [ ] Team collaboration features
- [ ] Calendar integrations (Google Calendar, Apple Calendar)
- [ ] Mobile companion app (iOS/Android)
