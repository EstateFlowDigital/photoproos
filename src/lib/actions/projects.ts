"use server";

import { ok, fail, success, type VoidActionResult } from "@/lib/types/action-result";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { revalidatePath } from "next/cache";
import type { TaskStatus, TaskPriority } from "@prisma/client";
import { perfStart, perfEnd } from "@/lib/utils/perf-logger";
import { createNotification } from "@/lib/actions/notifications";

const COLUMN_STATUS_MAP: Record<string, TaskStatus> = {
  "To Do": "todo",
  "In Progress": "in_progress",
  "In Review": "in_review",
  "Done": "completed",
  "Blocked": "blocked",
};

function getStatusForColumn(columnName: string, fallback: TaskStatus) {
  return COLUMN_STATUS_MAP[columnName] || fallback;
}

// ============================================================================
// BOARD ACTIONS
// ============================================================================

/**
 * Get all boards for the organization
 */
export async function getBoards() {
  const perfStartTime = perfStart("projects:getBoards");
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const boards = await prisma.taskBoard.findMany({
    where: {
      organizationId,
      isArchived: false,
    },
    include: {
      columns: {
        orderBy: { position: "asc" },
      },
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: [
      { isDefault: "desc" },
      { name: "asc" },
    ],
  });

  perfEnd("projects:getBoards", perfStartTime);
  return boards;
}

/**
 * Get a single board with all columns and tasks
 */
export async function getBoard(boardId: string) {
  const perfStartTime = perfStart("projects:getBoard");
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const board = await prisma.taskBoard.findFirst({
    where: {
      id: boardId,
      organizationId,
    },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: {
              assignee: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
              client: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
              booking: {
                select: {
                  id: true,
                  title: true,
                  startTime: true,
                },
              },
              subtasks: {
                orderBy: { position: "asc" },
              },
              _count: {
                select: {
                  comments: true,
                  subtasks: true,
                },
              },
            },
          },
        },
      },
    },
  });

  perfEnd("projects:getBoard", perfStartTime);
  return board;
}

/**
 * Get or create the default board
 */
export async function getOrCreateDefaultBoard() {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  // Check if default board exists
  let board = await prisma.taskBoard.findFirst({
    where: {
      organizationId,
      isDefault: true,
    },
    include: {
      columns: {
        orderBy: { position: "asc" },
      },
    },
  });

  // Create default board if not exists
  if (!board) {
    board = await prisma.taskBoard.create({
      data: {
        organizationId,
        name: "Main Board",
        description: "Your main project board",
        isDefault: true,
        columns: {
          create: [
            { name: "To Do", position: 0, color: "#6b7280" },
            { name: "In Progress", position: 1, color: "#3b82f6" },
            { name: "In Review", position: 2, color: "#8b5cf6" },
            { name: "Done", position: 3, color: "#22c55e" },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { position: "asc" },
        },
      },
    });
  }

  return board;
}

/**
 * Create a new board
 */
export async function createBoard(data: {
  name: string;
  description?: string;
  color?: string;
  columns?: { name: string; color?: string }[];
}): Promise<{ success: boolean; boardId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const board = await prisma.taskBoard.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        color: data.color,
        columns: data.columns
          ? {
              create: data.columns.map((col, i) => ({
                name: col.name,
                color: col.color,
                position: i,
              })),
            }
          : {
              create: [
                { name: "To Do", position: 0, color: "#6b7280" },
                { name: "In Progress", position: 1, color: "#3b82f6" },
                { name: "Done", position: 2, color: "#22c55e" },
              ],
            },
      },
    });

    revalidatePath("/projects");
    return { success: true, boardId: board.id };
  } catch (error) {
    console.error("Error creating board:", error);
    return fail(error instanceof Error ? error.message : "Failed to create board",);
  }
}

/**
 * Update a board
 */
export async function updateBoard(
  boardId: string,
  data: { name?: string; description?: string; color?: string }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.taskBoard.update({
      where: {
        id: boardId,
        organizationId,
      },
      data,
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error updating board:", error);
    return fail(error instanceof Error ? error.message : "Failed to update board",);
  }
}

/**
 * Archive a board
 */
export async function archiveBoard(
  boardId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Don't allow archiving the default board
    const board = await prisma.taskBoard.findFirst({
      where: { id: boardId, organizationId },
    });

    if (board?.isDefault) {
      return fail("Cannot archive the default board");
    }

    await prisma.taskBoard.update({
      where: {
        id: boardId,
        organizationId,
      },
      data: { isArchived: true },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error archiving board:", error);
    return fail(error instanceof Error ? error.message : "Failed to archive board",);
  }
}

// ============================================================================
// COLUMN ACTIONS
// ============================================================================

/**
 * Create a new column
 */
export async function createColumn(
  boardId: string,
  data: { name: string; color?: string }
): Promise<{ success: boolean; columnId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify board ownership
    const board = await prisma.taskBoard.findFirst({
      where: { id: boardId, organizationId },
      include: { columns: { select: { position: true } } },
    });

    if (!board) {
      return fail("Board not found");
    }

    const maxPosition = Math.max(...board.columns.map((c) => c.position), -1);

    const column = await prisma.taskColumn.create({
      data: {
        boardId,
        name: data.name,
        color: data.color,
        position: maxPosition + 1,
      },
    });

    revalidatePath("/projects");
    return { success: true, columnId: column.id };
  } catch (error) {
    console.error("Error creating column:", error);
    return fail(error instanceof Error ? error.message : "Failed to create column",);
  }
}

/**
 * Update a column
 */
export async function updateColumn(
  columnId: string,
  data: { name?: string; color?: string; limit?: number | null }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify column belongs to org
    const column = await prisma.taskColumn.findFirst({
      where: {
        id: columnId,
        board: { organizationId },
      },
    });

    if (!column) {
      return fail("Column not found");
    }

    await prisma.taskColumn.update({
      where: { id: columnId },
      data,
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error updating column:", error);
    return fail(error instanceof Error ? error.message : "Failed to update column",);
  }
}

/**
 * Reorder columns
 */
export async function reorderColumns(
  boardId: string,
  columnIds: string[]
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify board ownership
    const board = await prisma.taskBoard.findFirst({
      where: { id: boardId, organizationId },
    });

    if (!board) {
      return fail("Board not found");
    }

    // Update all column positions in transaction
    await prisma.$transaction(
      columnIds.map((id, index) =>
        prisma.taskColumn.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error reordering columns:", error);
    return fail(error instanceof Error ? error.message : "Failed to reorder columns",);
  }
}

/**
 * Delete a column
 */
export async function deleteColumn(
  columnId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify column belongs to org and get task count
    const column = await prisma.taskColumn.findFirst({
      where: {
        id: columnId,
        board: { organizationId },
      },
      include: { _count: { select: { tasks: true } } },
    });

    if (!column) {
      return fail("Column not found");
    }

    if (column._count.tasks > 0) {
      return fail("Cannot delete column with tasks. Move or delete tasks first.",);
    }

    await prisma.taskColumn.delete({
      where: { id: columnId },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error deleting column:", error);
    return fail(error instanceof Error ? error.message : "Failed to delete column",);
  }
}

// ============================================================================
// TASK ACTIONS
// ============================================================================

/**
 * Get all tasks (optionally filtered)
 */
export async function getTasks(filters?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  clientId?: string;
  projectId?: string;
  bookingId?: string;
  dueBefore?: Date;
  dueAfter?: Date;
}) {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const where: Record<string, unknown> = {
    organizationId,
  };

  if (filters?.status) where.status = filters.status;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters?.clientId) where.clientId = filters.clientId;
  if (filters?.projectId) where.projectId = filters.projectId;
  if (filters?.bookingId) where.bookingId = filters.bookingId;
  if (filters?.dueBefore || filters?.dueAfter) {
    where.dueDate = {
      ...(filters.dueBefore && { lte: filters.dueBefore }),
      ...(filters.dueAfter && { gte: filters.dueAfter }),
    };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      column: true,
      board: { select: { id: true, name: true } },
      assignee: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      client: {
        select: { id: true, fullName: true, email: true },
      },
      _count: {
        select: { subtasks: true, comments: true },
      },
    },
    orderBy: [{ dueDate: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
  });

  return tasks;
}

/**
 * Get a single task with full details
 */
export async function getTask(taskId: string) {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId,
    },
    include: {
      column: true,
      board: { select: { id: true, name: true } },
      assignee: {
        select: { id: true, fullName: true, avatarUrl: true, email: true },
      },
      client: {
        select: { id: true, fullName: true, email: true, company: true },
      },
      project: {
        select: { id: true, name: true, status: true },
      },
      booking: {
        select: { id: true, title: true, startTime: true, endTime: true },
      },
      invoice: {
        select: { id: true, invoiceNumber: true, status: true, totalCents: true },
      },
      propertyWebsite: {
        select: { id: true, address: true, city: true, state: true },
      },
      subtasks: {
        orderBy: { position: "asc" },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      },
    },
  });

  return task;
}

/**
 * Create a new task
 */
export async function createTask(data: {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  assigneeId?: string;
  clientId?: string;
  projectId?: string;
  bookingId?: string;
  invoiceId?: string;
  propertyWebsiteId?: string;
  tags?: string[];
  estimatedMinutes?: number;
}): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify board and column
    const column = await prisma.taskColumn.findFirst({
      where: {
        id: data.columnId,
        boardId: data.boardId,
        board: { organizationId },
      },
      include: { tasks: { select: { position: true } } },
    });

    if (!column) {
      return fail("Column not found");
    }

    const maxPosition = Math.max(...column.tasks.map((t) => t.position), -1);
    const status = getStatusForColumn(column.name, "todo");

    const task = await prisma.task.create({
      data: {
        organizationId,
        boardId: data.boardId,
        columnId: data.columnId,
        title: data.title,
        description: data.description,
        priority: data.priority || "medium",
        status,
        position: maxPosition + 1,
        dueDate: data.dueDate,
        startDate: data.startDate,
        assigneeId: data.assigneeId,
        clientId: data.clientId,
        projectId: data.projectId,
        bookingId: data.bookingId,
        invoiceId: data.invoiceId,
        propertyWebsiteId: data.propertyWebsiteId,
        tags: data.tags || [],
        estimatedMinutes: data.estimatedMinutes,
      },
    });

    revalidatePath("/projects");
    return { success: true, taskId: task.id };
  } catch (error) {
    console.error("Error creating task:", error);
    return fail(error instanceof Error ? error.message : "Failed to create task",);
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
    startDate?: Date | null;
    completedAt?: Date | null;
    assigneeId?: string | null;
    clientId?: string | null;
    projectId?: string | null;
    bookingId?: string | null;
    invoiceId?: string | null;
    propertyWebsiteId?: string | null;
    tags?: string[];
    estimatedMinutes?: number | null;
    actualMinutes?: number | null;
  }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    let completedAt = data.completedAt;
    if (data.status) {
      const existing = await prisma.task.findFirst({
        where: { id: taskId, organizationId },
        select: { status: true, completedAt: true },
      });

      if (!existing) {
        return fail("Task not found");
      }

      if (data.status === "completed") {
        completedAt = completedAt || existing.completedAt || new Date();
      } else if (existing.completedAt && data.completedAt === undefined) {
        completedAt = null;
      }
    }

    await prisma.task.update({
      where: {
        id: taskId,
        organizationId,
      },
      data: {
        ...data,
        completedAt,
      },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error updating task:", error);
    return fail(error instanceof Error ? error.message : "Failed to update task",);
  }
}

/**
 * Move a task to a different column (and optionally reorder)
 */
export async function moveTask(
  taskId: string,
  targetColumnId: string,
  targetPosition: number
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify task and target column
    const [task, targetColumn] = await Promise.all([
      prisma.task.findFirst({
        where: { id: taskId, organizationId },
      }),
      prisma.taskColumn.findFirst({
        where: {
          id: targetColumnId,
          board: { organizationId },
        },
      }),
    ]);

    if (!task) {
      return fail("Task not found");
    }

    if (!targetColumn) {
      return fail("Target column not found");
    }

    const sourceColumnId = task.columnId;
    const isSameColumn = sourceColumnId === targetColumnId;
    const newStatus = getStatusForColumn(targetColumn.name, task.status);
    const completedAt = newStatus === "completed" && task.status !== "completed"
      ? new Date()
      : newStatus !== "completed"
        ? null
        : task.completedAt;

    // Normalize target position for current column length
    const targetTasks = await prisma.task.findMany({
      where: {
        columnId: targetColumnId,
        id: { not: taskId },
      },
      orderBy: { position: "asc" },
    });
    const normalizedTargetPosition = Math.max(
      0,
      Math.min(targetPosition, targetTasks.length)
    );

    const targetOrder = [
      ...targetTasks.slice(0, normalizedTargetPosition),
      { id: taskId },
      ...targetTasks.slice(normalizedTargetPosition),
    ];

    const updates = [
      prisma.task.update({
        where: { id: taskId },
        data: {
          columnId: targetColumnId,
          position: normalizedTargetPosition,
          status: newStatus,
          completedAt,
        },
      }),
      ...targetOrder
        .filter((t) => t.id !== taskId)
        .map((t, i) =>
          prisma.task.update({
            where: { id: t.id },
            data: { position: i },
          })
        ),
    ];

    if (!isSameColumn && sourceColumnId) {
      const sourceTasks = await prisma.task.findMany({
        where: {
          columnId: sourceColumnId,
          id: { not: taskId },
        },
        orderBy: { position: "asc" },
      });

      updates.push(
        ...sourceTasks.map((t, i) =>
          prisma.task.update({
            where: { id: t.id },
            data: { position: i },
          })
        )
      );
    }

    await prisma.$transaction(updates);

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error moving task:", error);
    return fail(error instanceof Error ? error.message : "Failed to move task",);
  }
}

/**
 * Delete a task
 */
export async function deleteTask(
  taskId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.task.delete({
      where: {
        id: taskId,
        organizationId,
      },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error deleting task:", error);
    return fail(error instanceof Error ? error.message : "Failed to delete task",);
  }
}

// ============================================================================
// SUBTASK ACTIONS
// ============================================================================

/**
 * Add a subtask
 */
export async function addSubtask(
  taskId: string,
  title: string
): Promise<{ success: boolean; subtaskId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId },
      include: { subtasks: { select: { position: true } } },
    });

    if (!task) {
      return fail("Task not found");
    }

    const maxPosition = Math.max(...task.subtasks.map((s) => s.position), -1);

    const subtask = await prisma.taskSubtask.create({
      data: {
        taskId,
        title,
        position: maxPosition + 1,
      },
    });

    revalidatePath("/projects");
    return { success: true, subtaskId: subtask.id };
  } catch (error) {
    console.error("Error adding subtask:", error);
    return fail(error instanceof Error ? error.message : "Failed to add subtask",);
  }
}

/**
 * Toggle subtask completion
 */
export async function toggleSubtask(
  subtaskId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify subtask ownership
    const subtask = await prisma.taskSubtask.findFirst({
      where: {
        id: subtaskId,
        task: { organizationId },
      },
    });

    if (!subtask) {
      return fail("Subtask not found");
    }

    await prisma.taskSubtask.update({
      where: { id: subtaskId },
      data: { isCompleted: !subtask.isCompleted },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error toggling subtask:", error);
    return fail(error instanceof Error ? error.message : "Failed to toggle subtask",);
  }
}

/**
 * Delete a subtask
 */
export async function deleteSubtask(
  subtaskId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify subtask ownership
    const subtask = await prisma.taskSubtask.findFirst({
      where: {
        id: subtaskId,
        task: { organizationId },
      },
    });

    if (!subtask) {
      return fail("Subtask not found");
    }

    await prisma.taskSubtask.delete({
      where: { id: subtaskId },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return fail(error instanceof Error ? error.message : "Failed to delete subtask",);
  }
}

// ============================================================================
// COMMENT ACTIONS
// ============================================================================

/**
 * Add a comment to a task
 */
export async function addComment(
  taskId: string,
  content: string
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  try {
    const { clerkUserId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });

    if (!task) {
      return fail("Task not found");
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return fail("User not found");
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        authorId: user.id,
        content,
      },
    });

    revalidatePath("/projects");
    return { success: true, commentId: comment.id };
  } catch (error) {
    console.error("Error adding comment:", error);
    return fail(error instanceof Error ? error.message : "Failed to add comment",);
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(
  commentId: string
): Promise<VoidActionResult> {
  try {
    const { clerkUserId } = await requireAuth();

    // Verify comment ownership (only author can delete)
    const comment = await prisma.taskComment.findFirst({
      where: {
        id: commentId,
        author: { clerkUserId },
      },
    });

    if (!comment) {
      return fail("Comment not found or not authorized");
    }

    await prisma.taskComment.delete({
      where: { id: commentId },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error deleting comment:", error);
    return fail(error instanceof Error ? error.message : "Failed to delete comment",);
  }
}

// ============================================================================
// QUICK CREATE FROM ENTITIES
// ============================================================================

/**
 * Create a task from a gallery (Project)
 */
export async function createTaskFromGallery(
  galleryId: string,
  options?: { title?: string; columnId?: string }
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get gallery info
    const gallery = await prisma.project.findFirst({
      where: { id: galleryId, organizationId },
      include: { client: true },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    // Get or create default board
    const board = await getOrCreateDefaultBoard();
    const columnId = options?.columnId || board.columns[0]?.id;

    if (!columnId) {
      return fail("No columns available");
    }

    const result = await createTask({
      boardId: board.id,
      columnId,
      title: options?.title || `Gallery: ${gallery.name}`,
      description: gallery.description || undefined,
      projectId: gallery.id,
      clientId: gallery.clientId || undefined,
    });

    return result;
  } catch (error) {
    console.error("Error creating task from gallery:", error);
    return fail(error instanceof Error ? error.message : "Failed to create task",);
  }
}

/**
 * Create a task from a booking
 */
export async function createTaskFromBooking(
  bookingId: string,
  options?: { title?: string; columnId?: string }
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get booking info
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, organizationId },
      include: { client: true },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    // Get or create default board
    const board = await getOrCreateDefaultBoard();
    const columnId = options?.columnId || board.columns[0]?.id;

    if (!columnId) {
      return fail("No columns available");
    }

    const result = await createTask({
      boardId: board.id,
      columnId,
      title: options?.title || `Booking: ${booking.title}`,
      description: booking.description || undefined,
      bookingId: booking.id,
      clientId: booking.clientId || undefined,
      dueDate: booking.startTime,
    });

    return result;
  } catch (error) {
    console.error("Error creating task from booking:", error);
    return fail(error instanceof Error ? error.message : "Failed to create task",);
  }
}

/**
 * Create a task from a client
 */
export async function createTaskFromClient(
  clientId: string,
  options?: { title?: string; columnId?: string }
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get client info
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
    });

    if (!client) {
      return fail("Client not found");
    }

    // Get or create default board
    const board = await getOrCreateDefaultBoard();
    const columnId = options?.columnId || board.columns[0]?.id;

    if (!columnId) {
      return fail("No columns available");
    }

    const result = await createTask({
      boardId: board.id,
      columnId,
      title: options?.title || `Follow up: ${client.fullName || client.email}`,
      clientId: client.id,
    });

    return result;
  } catch (error) {
    console.error("Error creating task from client:", error);
    return fail(error instanceof Error ? error.message : "Failed to create task",);
  }
}

// ============================================================================
// ANALYTICS ACTIONS
// ============================================================================

export interface TaskAnalytics {
  summary: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
    tasksDueToday: number;
    tasksDueThisWeek: number;
    avgCompletionTimeMinutes: number | null;
  };
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  byPriority: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  byAssignee: Array<{
    assigneeId: string | null;
    assigneeName: string;
    assigneeAvatar: string | null;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
  byColumn: Array<{
    columnId: string;
    columnName: string;
    columnColor: string | null;
    count: number;
    percentage: number;
  }>;
  completionTrend: Array<{
    date: string;
    dateLabel: string;
    completed: number;
    created: number;
  }>;
  timeTracking: {
    totalEstimatedMinutes: number;
    totalActualMinutes: number;
    tasksWithTimeTracking: number;
    averageAccuracy: number | null;
  };
}

/**
 * Get task analytics for the organization
 */
export async function getTaskAnalytics(): Promise<{
  success: boolean;
  data?: TaskAnalytics;
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
    const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all tasks with relations
    const tasks = await prisma.task.findMany({
      where: { organizationId },
      include: {
        assignee: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        column: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    // Get columns for the organization
    const columns = await prisma.taskColumn.findMany({
      where: {
        board: { organizationId },
      },
      select: { id: true, name: true, color: true },
    });

    // Calculate summary stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "completed"
    ).length;
    const tasksDueToday = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= endOfToday
    ).length;
    const tasksDueThisWeek = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= endOfWeek
    ).length;

    // Calculate average completion time
    const completedTasksWithTime = tasks.filter(
      (t) => t.status === "completed" && t.completedAt && t.createdAt
    );
    const avgCompletionTimeMinutes =
      completedTasksWithTime.length > 0
        ? Math.round(
            completedTasksWithTime.reduce((sum, t) => {
              const diff = new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime();
              return sum + diff / (1000 * 60);
            }, 0) / completedTasksWithTime.length
          )
        : null;

    // Group by status
    const statusCounts: Record<string, number> = {};
    tasks.forEach((t) => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });
    const byStatus = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Group by priority
    const priorityCounts: Record<string, number> = {};
    tasks.forEach((t) => {
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    });
    const byPriority = Object.entries(priorityCounts)
      .map(([priority, count]) => ({
        priority,
        count,
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
      }))
      .sort((a, b) => {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (order[a.priority as keyof typeof order] || 4) - (order[b.priority as keyof typeof order] || 4);
      });

    // Group by assignee
    const assigneeMap = new Map<
      string,
      { totalTasks: number; completedTasks: number; name: string; avatar: string | null }
    >();
    tasks.forEach((t) => {
      const key = t.assigneeId || "unassigned";
      const current = assigneeMap.get(key) || {
        totalTasks: 0,
        completedTasks: 0,
        name: t.assignee?.fullName || "Unassigned",
        avatar: t.assignee?.avatarUrl || null,
      };
      current.totalTasks++;
      if (t.status === "completed") current.completedTasks++;
      assigneeMap.set(key, current);
    });
    const byAssignee = Array.from(assigneeMap.entries())
      .map(([assigneeId, data]) => ({
        assigneeId: assigneeId === "unassigned" ? null : assigneeId,
        assigneeName: data.name,
        assigneeAvatar: data.avatar,
        totalTasks: data.totalTasks,
        completedTasks: data.completedTasks,
        completionRate:
          data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0,
      }))
      .sort((a, b) => b.totalTasks - a.totalTasks);

    // Group by column
    const columnCounts: Record<string, number> = {};
    tasks.forEach((t) => {
      columnCounts[t.columnId] = (columnCounts[t.columnId] || 0) + 1;
    });
    const byColumn = columns
      .map((col) => ({
        columnId: col.id,
        columnName: col.name,
        columnColor: col.color,
        count: columnCounts[col.id] || 0,
        percentage: totalTasks > 0 ? Math.round(((columnCounts[col.id] || 0) / totalTasks) * 100) : 0,
      }))
      .filter((c) => c.count > 0 || columns.length <= 5);

    // Completion trend (last 30 days)
    const completionTrend: Array<{
      date: string;
      dateLabel: string;
      completed: number;
      created: number;
    }> = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const completed = tasks.filter(
        (t) =>
          t.completedAt &&
          new Date(t.completedAt) >= date &&
          new Date(t.completedAt) < nextDate
      ).length;

      const created = tasks.filter(
        (t) =>
          new Date(t.createdAt) >= date && new Date(t.createdAt) < nextDate
      ).length;

      completionTrend.push({
        date: dateStr,
        dateLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date),
        completed,
        created,
      });
    }

    // Time tracking stats
    const tasksWithTimeTracking = tasks.filter(
      (t) => t.estimatedMinutes || t.actualMinutes
    );
    const totalEstimatedMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    const totalActualMinutes = tasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);

    const tasksWithBothTimes = tasks.filter((t) => t.estimatedMinutes && t.actualMinutes);
    const averageAccuracy =
      tasksWithBothTimes.length > 0
        ? Math.round(
            (tasksWithBothTimes.reduce((sum, t) => {
              const accuracy = Math.min(t.estimatedMinutes!, t.actualMinutes!) /
                Math.max(t.estimatedMinutes!, t.actualMinutes!);
              return sum + accuracy;
            }, 0) / tasksWithBothTimes.length) * 100
          )
        : null;

    return success({
      summary: {
        totalTasks,
        completedTasks,
        completionRate,
        overdueTasks,
        tasksDueToday,
        tasksDueThisWeek,
        avgCompletionTimeMinutes,
      },
      byStatus,
      byPriority,
      byAssignee,
      byColumn,
      completionTrend,
      timeTracking: {
        totalEstimatedMinutes,
        totalActualMinutes,
        tasksWithTimeTracking: tasksWithTimeTracking.length,
        averageAccuracy,
      },
    });
  } catch (error) {
    console.error("Error fetching task analytics:", error);
    return fail(error instanceof Error ? error.message : "Failed to fetch analytics",);
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk move tasks to a column
 */
export async function bulkMoveTasks(
  taskIds: string[],
  columnId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify all tasks belong to the organization
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        organizationId,
      },
      select: { id: true },
    });

    if (tasks.length !== taskIds.length) {
      return fail("Some tasks not found or unauthorized");
    }

    // Get the target column
    const column = await prisma.taskColumn.findFirst({
      where: {
        id: columnId,
        board: { organizationId },
      },
    });

    if (!column) {
      return fail("Column not found");
    }

    // Get max position in target column
    const maxPosition = await prisma.task.aggregate({
      where: { columnId },
      _max: { position: true },
    });

    let position = (maxPosition._max.position || 0) + 1;

    // Update all tasks
    await prisma.$transaction(
      taskIds.map((taskId) =>
        prisma.task.update({
          where: { id: taskId },
          data: {
            columnId,
            position: position++,
            status: getStatusForColumn(column.name, "todo"),
          },
        })
      )
    );

    revalidatePath("/projects");
    return { success: true, count: taskIds.length };
  } catch (error) {
    console.error("Error bulk moving tasks:", error);
    return fail(error instanceof Error ? error.message : "Failed to move tasks",);
  }
}

/**
 * Bulk update task priority
 */
export async function bulkUpdatePriority(
  taskIds: string[],
  priority: TaskPriority
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const result = await prisma.task.updateMany({
      where: {
        id: { in: taskIds },
        organizationId,
      },
      data: { priority },
    });

    revalidatePath("/projects");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error bulk updating priority:", error);
    return fail(error instanceof Error ? error.message : "Failed to update priority",);
  }
}

/**
 * Bulk assign tasks to a team member
 */
export async function bulkAssignTasks(
  taskIds: string[],
  assigneeId: string | null
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // If assigning to someone, verify they exist
    if (assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: assigneeId },
      });
      if (!user) {
        return fail("Assignee not found");
      }
    }

    const result = await prisma.task.updateMany({
      where: {
        id: { in: taskIds },
        organizationId,
      },
      data: { assigneeId },
    });

    revalidatePath("/projects");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error bulk assigning tasks:", error);
    return fail(error instanceof Error ? error.message : "Failed to assign tasks",);
  }
}

/**
 * Bulk delete tasks
 */
export async function bulkDeleteTasks(
  taskIds: string[]
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const result = await prisma.task.deleteMany({
      where: {
        id: { in: taskIds },
        organizationId,
      },
    });

    revalidatePath("/projects");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error bulk deleting tasks:", error);
    return fail(error instanceof Error ? error.message : "Failed to delete tasks",);
  }
}

// ============================================================================
// TASK TEMPLATE ACTIONS
// ============================================================================

interface SubtaskTemplate {
  title: string;
  position: number;
}

/**
 * Get all task templates for the organization
 */
export async function getTaskTemplates() {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const templates = await prisma.taskTemplate.findMany({
    where: {
      OR: [
        { organizationId },
        { isGlobal: true },
      ],
    },
    orderBy: [
      { category: "asc" },
      { name: "asc" },
    ],
  });

  return templates;
}

/**
 * Create a task template
 */
export async function createTaskTemplate(data: {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  taskTitle: string;
  taskDescription?: string;
  priority?: TaskPriority;
  tags?: string[];
  estimatedMinutes?: number;
  subtasks?: SubtaskTemplate[];
}): Promise<{ success: boolean; templateId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const template = await prisma.taskTemplate.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        category: data.category,
        icon: data.icon,
        taskTitle: data.taskTitle,
        taskDescription: data.taskDescription,
        priority: data.priority || "medium",
        tags: data.tags || [],
        estimatedMinutes: data.estimatedMinutes,
        subtasks: (data.subtasks || []) as unknown as object,
      },
    });

    return { success: true, templateId: template.id };
  } catch (error) {
    console.error("Error creating task template:", error);
    return fail(error instanceof Error ? error.message : "Failed to create template",);
  }
}

/**
 * Save an existing task as a template
 */
export async function saveTaskAsTemplate(
  taskId: string,
  templateData: {
    name: string;
    description?: string;
    category?: string;
    icon?: string;
  }
): Promise<{ success: boolean; templateId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get the task with subtasks
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId,
      },
      include: {
        subtasks: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!task) {
      return fail("Task not found");
    }

    // Create template from task
    const template = await prisma.taskTemplate.create({
      data: {
        organizationId,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        icon: templateData.icon,
        taskTitle: task.title,
        taskDescription: task.description,
        priority: task.priority,
        tags: task.tags,
        estimatedMinutes: task.estimatedMinutes,
        subtasks: task.subtasks.map((s, i) => ({
          title: s.title,
          position: i,
        })) as unknown as object,
      },
    });

    return { success: true, templateId: template.id };
  } catch (error) {
    console.error("Error saving task as template:", error);
    return fail(error instanceof Error ? error.message : "Failed to save template",);
  }
}

/**
 * Create a task from a template
 */
export async function createTaskFromTemplate(
  templateId: string,
  data: {
    boardId: string;
    columnId: string;
    titleOverride?: string;
    dueDate?: Date;
    assigneeId?: string;
  }
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get the template
    const template = await prisma.taskTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { organizationId },
          { isGlobal: true },
        ],
      },
    });

    if (!template) {
      return fail("Template not found");
    }

    // Verify column exists
    const column = await prisma.taskColumn.findFirst({
      where: {
        id: data.columnId,
        boardId: data.boardId,
      },
    });

    if (!column) {
      return fail("Column not found");
    }

    // Get the highest position in the column
    const lastTask = await prisma.task.findFirst({
      where: { columnId: data.columnId },
      orderBy: { position: "desc" },
    });
    const position = (lastTask?.position ?? -1) + 1;

    // Create the task
    const task = await prisma.task.create({
      data: {
        organizationId,
        boardId: data.boardId,
        columnId: data.columnId,
        title: data.titleOverride || template.taskTitle,
        description: template.taskDescription,
        priority: template.priority,
        tags: template.tags,
        estimatedMinutes: template.estimatedMinutes,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,
        position,
        status: getStatusForColumn(column.name, "todo"),
      },
    });

    // Create subtasks from template
    const subtasks = (template.subtasks as unknown as SubtaskTemplate[]) || [];
    if (subtasks.length > 0) {
      await prisma.taskSubtask.createMany({
        data: subtasks.map((s, i) => ({
          taskId: task.id,
          title: s.title,
          position: i,
        })),
      });
    }

    revalidatePath("/projects");
    return { success: true, taskId: task.id };
  } catch (error) {
    console.error("Error creating task from template:", error);
    return fail(error instanceof Error ? error.message : "Failed to create task",);
  }
}

/**
 * Update a task template
 */
export async function updateTaskTemplate(
  templateId: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    icon?: string;
    taskTitle?: string;
    taskDescription?: string | null;
    priority?: TaskPriority;
    tags?: string[];
    estimatedMinutes?: number | null;
    subtasks?: SubtaskTemplate[];
  }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.taskTemplate.update({
      where: {
        id: templateId,
        organizationId,
        isGlobal: false, // Can't edit global templates
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.taskTitle && { taskTitle: data.taskTitle }),
        ...(data.taskDescription !== undefined && { taskDescription: data.taskDescription }),
        ...(data.priority && { priority: data.priority }),
        ...(data.tags && { tags: data.tags }),
        ...(data.estimatedMinutes !== undefined && { estimatedMinutes: data.estimatedMinutes }),
        ...(data.subtasks && { subtasks: data.subtasks as unknown as object }),
      },
    });

    return ok();
  } catch (error) {
    console.error("Error updating task template:", error);
    return fail(error instanceof Error ? error.message : "Failed to update template",);
  }
}

/**
 * Delete a task template
 */
export async function deleteTaskTemplate(
  templateId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.taskTemplate.delete({
      where: {
        id: templateId,
        organizationId,
        isGlobal: false, // Can't delete global templates
      },
    });

    return ok();
  } catch (error) {
    console.error("Error deleting task template:", error);
    return fail(error instanceof Error ? error.message : "Failed to delete template",);
  }
}

// ============================================================================
// AUTOMATION RULES
// ============================================================================

export type AutomationTriggerType =
  | "task_created"
  | "task_moved"
  | "subtasks_complete"
  | "due_date_reached"
  | "priority_changed"
  | "assignee_changed";

export type AutomationActionType =
  | "move_to_column"
  | "assign_to_user"
  | "set_priority"
  | "add_tag"
  | "remove_tag"
  | "send_notification";

export interface AutomationTrigger {
  type: AutomationTriggerType;
  columnId?: string; // For task_moved trigger (from/to column)
  priority?: TaskPriority; // For priority_changed trigger
}

export interface AutomationAction {
  type: AutomationActionType;
  columnId?: string; // For move_to_column
  userId?: string; // For assign_to_user
  priority?: TaskPriority; // For set_priority
  tag?: string; // For add_tag/remove_tag
  message?: string; // For send_notification
}

/**
 * Get all automation rules for a board
 */
export async function getAutomations(boardId: string) {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const automations = await prisma.taskAutomation.findMany({
    where: {
      boardId,
      organizationId,
    },
    orderBy: { createdAt: "desc" },
  });

  return automations;
}

/**
 * Create an automation rule
 */
export async function createAutomation(data: {
  boardId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
}): Promise<{ success: boolean; automation?: { id: string }; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify board belongs to organization
    const board = await prisma.taskBoard.findFirst({
      where: { id: data.boardId, organizationId },
    });

    if (!board) {
      return fail("Board not found");
    }

    const automation = await prisma.taskAutomation.create({
      data: {
        organizationId,
        boardId: data.boardId,
        name: data.name,
        description: data.description,
        trigger: data.trigger as object,
        actions: data.actions as object[],
      },
    });

    revalidatePath("/projects");
    return { success: true, automation: { id: automation.id } };
  } catch (error) {
    console.error("Error creating automation:", error);
    return fail(error instanceof Error ? error.message : "Failed to create automation",);
  }
}

/**
 * Update an automation rule
 */
export async function updateAutomation(
  automationId: string,
  data: {
    name?: string;
    description?: string;
    trigger?: AutomationTrigger;
    actions?: AutomationAction[];
    isActive?: boolean;
  }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.taskAutomation.update({
      where: {
        id: automationId,
        organizationId,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.trigger && { trigger: data.trigger as object }),
        ...(data.actions && { actions: data.actions as object[] }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error updating automation:", error);
    return fail(error instanceof Error ? error.message : "Failed to update automation",);
  }
}

/**
 * Delete an automation rule
 */
export async function deleteAutomation(
  automationId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.taskAutomation.delete({
      where: {
        id: automationId,
        organizationId,
      },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error deleting automation:", error);
    return fail(error instanceof Error ? error.message : "Failed to delete automation",);
  }
}

/**
 * Execute automations for a task event
 * Called internally when tasks are created, moved, etc.
 */
export async function executeAutomations(
  boardId: string,
  taskId: string,
  triggerType: AutomationTriggerType,
  context?: {
    fromColumnId?: string;
    toColumnId?: string;
    newPriority?: TaskPriority;
  }
): Promise<void> {
  try {
    const organizationId = await requireOrganizationId();

    // Get active automations for this board
    const automations = await prisma.taskAutomation.findMany({
      where: {
        boardId,
        organizationId,
        isActive: true,
      },
    });

    for (const automation of automations) {
      const trigger = automation.trigger as unknown as AutomationTrigger;

      // Check if trigger matches
      if (trigger.type !== triggerType) continue;

      // Additional trigger conditions
      if (triggerType === "task_moved" && trigger.columnId) {
        if (trigger.columnId !== context?.toColumnId) continue;
      }

      if (triggerType === "priority_changed" && trigger.priority) {
        if (trigger.priority !== context?.newPriority) continue;
      }

      // Execute actions
      const actions = automation.actions as unknown as AutomationAction[];
      for (const action of actions) {
        await executeAction(taskId, action, organizationId);
      }
    }
  } catch (error) {
    console.error("Error executing automations:", error);
  }
}

async function executeAction(
  taskId: string,
  action: AutomationAction,
  organizationId: string
): Promise<void> {
  switch (action.type) {
    case "move_to_column":
      if (action.columnId) {
        await prisma.task.update({
          where: { id: taskId, organizationId },
          data: { columnId: action.columnId },
        });
      }
      break;

    case "assign_to_user":
      await prisma.task.update({
        where: { id: taskId, organizationId },
        data: { assigneeId: action.userId || null },
      });
      break;

    case "set_priority":
      if (action.priority) {
        await prisma.task.update({
          where: { id: taskId, organizationId },
          data: { priority: action.priority },
        });
      }
      break;

    case "add_tag":
      if (action.tag) {
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          select: { tags: true },
        });
        if (task && !task.tags.includes(action.tag)) {
          await prisma.task.update({
            where: { id: taskId, organizationId },
            data: { tags: [...task.tags, action.tag] },
          });
        }
      }
      break;

    case "remove_tag":
      if (action.tag) {
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          select: { tags: true },
        });
        if (task) {
          await prisma.task.update({
            where: { id: taskId, organizationId },
            data: { tags: task.tags.filter((t) => t !== action.tag) },
          });
        }
      }
      break;

    case "send_notification":
      if (action.message) {
        // Get task details for notification
        const taskForNotif = await prisma.task.findUnique({
          where: { id: taskId },
          select: { title: true, column: { select: { board: { select: { id: true, name: true } } } } },
        });

        await createNotification({
          organizationId,
          type: "task_automation",
          title: "Task Automation",
          message: action.message.replace("{task}", taskForNotif?.title || "Task"),
          linkUrl: taskForNotif?.column?.board?.id
            ? `/projects?board=${taskForNotif.column.board.id}`
            : "/projects",
        });
      }
      break;
  }
}

// ============================================================================
// RECURRING TASKS
// ============================================================================

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "custom";

/**
 * Get all recurring tasks for a board
 */
export async function getRecurringTasks(boardId: string) {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const recurringTasks = await prisma.recurringTask.findMany({
    where: {
      boardId,
      organizationId,
    },
    include: {
      column: {
        select: { id: true, name: true },
      },
      assignee: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return recurringTasks;
}

/**
 * Create a recurring task
 */
export async function createRecurringTask(data: {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
  estimatedMinutes?: number;
  assigneeId?: string;
  frequency: RecurringFrequency;
  interval?: number;
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  dayOfMonth?: number; // 1-31
  time?: string; // HH:MM format
}): Promise<{ success: boolean; recurringTask?: { id: string }; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify board belongs to organization
    const board = await prisma.taskBoard.findFirst({
      where: { id: data.boardId, organizationId },
    });

    if (!board) {
      return fail("Board not found");
    }

    // Calculate next run date
    const nextRunAt = calculateNextRunDate(
      data.frequency,
      data.interval || 1,
      data.daysOfWeek || [],
      data.dayOfMonth,
      data.time || "09:00"
    );

    const recurringTask = await prisma.recurringTask.create({
      data: {
        organizationId,
        boardId: data.boardId,
        columnId: data.columnId,
        title: data.title,
        description: data.description,
        priority: data.priority || "medium",
        tags: data.tags || [],
        estimatedMinutes: data.estimatedMinutes,
        assigneeId: data.assigneeId,
        frequency: data.frequency,
        interval: data.interval || 1,
        daysOfWeek: data.daysOfWeek || [],
        dayOfMonth: data.dayOfMonth,
        time: data.time || "09:00",
        nextRunAt,
      },
    });

    revalidatePath("/projects");
    return { success: true, recurringTask: { id: recurringTask.id } };
  } catch (error) {
    console.error("Error creating recurring task:", error);
    return fail(error instanceof Error ? error.message : "Failed to create recurring task",);
  }
}

/**
 * Update a recurring task
 */
export async function updateRecurringTask(
  recurringTaskId: string,
  data: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    tags?: string[];
    estimatedMinutes?: number;
    assigneeId?: string | null;
    columnId?: string;
    frequency?: RecurringFrequency;
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    time?: string;
    isActive?: boolean;
  }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // If schedule changed, recalculate next run
    let nextRunAt: Date | undefined;
    if (data.frequency || data.interval || data.daysOfWeek || data.dayOfMonth || data.time) {
      const existing = await prisma.recurringTask.findUnique({
        where: { id: recurringTaskId },
      });
      if (existing) {
        nextRunAt = calculateNextRunDate(
          data.frequency || existing.frequency as RecurringFrequency,
          data.interval ?? existing.interval,
          data.daysOfWeek ?? existing.daysOfWeek,
          data.dayOfMonth ?? existing.dayOfMonth ?? undefined,
          data.time ?? existing.time
        );
      }
    }

    await prisma.recurringTask.update({
      where: {
        id: recurringTaskId,
        organizationId,
      },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority && { priority: data.priority }),
        ...(data.tags && { tags: data.tags }),
        ...(data.estimatedMinutes !== undefined && { estimatedMinutes: data.estimatedMinutes }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
        ...(data.columnId && { columnId: data.columnId }),
        ...(data.frequency && { frequency: data.frequency }),
        ...(data.interval !== undefined && { interval: data.interval }),
        ...(data.daysOfWeek && { daysOfWeek: data.daysOfWeek }),
        ...(data.dayOfMonth !== undefined && { dayOfMonth: data.dayOfMonth }),
        ...(data.time && { time: data.time }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(nextRunAt && { nextRunAt }),
      },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error updating recurring task:", error);
    return fail(error instanceof Error ? error.message : "Failed to update recurring task",);
  }
}

/**
 * Delete a recurring task
 */
export async function deleteRecurringTask(
  recurringTaskId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.recurringTask.delete({
      where: {
        id: recurringTaskId,
        organizationId,
      },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error deleting recurring task:", error);
    return fail(error instanceof Error ? error.message : "Failed to delete recurring task",);
  }
}

/**
 * Process due recurring tasks and create actual tasks
 * Should be called by a cron job
 */
export async function processRecurringTasks(): Promise<{
  success: boolean;
  tasksCreated: number;
  error?: string;
}> {
  try {
    const now = new Date();

    // Find all recurring tasks that are due
    const dueRecurringTasks = await prisma.recurringTask.findMany({
      where: {
        isActive: true,
        nextRunAt: { lte: now },
      },
    });

    let tasksCreated = 0;

    for (const recurringTask of dueRecurringTasks) {
      // Get the highest position in the column
      const lastTask = await prisma.task.findFirst({
        where: { columnId: recurringTask.columnId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      // Get the column to determine status
      const column = await prisma.taskColumn.findUnique({
        where: { id: recurringTask.columnId },
        select: { name: true },
      });

      // Create the task
      await prisma.task.create({
        data: {
          organizationId: recurringTask.organizationId,
          boardId: recurringTask.boardId,
          columnId: recurringTask.columnId,
          title: recurringTask.title,
          description: recurringTask.description,
          priority: recurringTask.priority,
          tags: recurringTask.tags,
          estimatedMinutes: recurringTask.estimatedMinutes,
          assigneeId: recurringTask.assigneeId,
          status: getStatusForColumn(column?.name || "", "todo"),
          position: (lastTask?.position || 0) + 1,
        },
      });

      // Update the recurring task's next run date
      const nextRunAt = calculateNextRunDate(
        recurringTask.frequency as RecurringFrequency,
        recurringTask.interval,
        recurringTask.daysOfWeek,
        recurringTask.dayOfMonth ?? undefined,
        recurringTask.time
      );

      await prisma.recurringTask.update({
        where: { id: recurringTask.id },
        data: {
          lastRunAt: now,
          nextRunAt,
        },
      });

      tasksCreated++;
    }

    return { success: true, tasksCreated };
  } catch (error) {
    console.error("Error processing recurring tasks:", error);
    return {
      success: false,
      tasksCreated: 0,
      error: error instanceof Error ? error.message : "Failed to process recurring tasks",
    };
  }
}

function calculateNextRunDate(
  frequency: RecurringFrequency,
  interval: number,
  daysOfWeek: number[],
  dayOfMonth: number | undefined,
  time: string
): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const next = new Date(now);

  // Set time
  next.setHours(hours, minutes, 0, 0);

  // If time has passed today, start from tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  switch (frequency) {
    case "daily":
      // Already set for tomorrow if needed
      break;

    case "weekly":
      if (daysOfWeek.length > 0) {
        // Find the next day that matches
        let found = false;
        for (let i = 0; i < 7 && !found; i++) {
          const checkDay = (next.getDay() + i) % 7;
          if (daysOfWeek.includes(checkDay)) {
            if (i > 0) {
              next.setDate(next.getDate() + i);
            }
            found = true;
          }
        }
      } else {
        // Default: same day next week
        next.setDate(next.getDate() + 7 * interval);
      }
      break;

    case "monthly":
      if (dayOfMonth) {
        next.setDate(dayOfMonth);
        if (next <= now) {
          next.setMonth(next.getMonth() + interval);
        }
      } else {
        next.setMonth(next.getMonth() + interval);
      }
      break;

    case "custom":
      // Custom interval in days
      next.setDate(next.getDate() + interval);
      break;
  }

  return next;
}

// ============================================================================
// TIME TRACKING
// ============================================================================

/**
 * Get time entries for a task
 */
export async function getTaskTimeEntries(taskId: string) {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  // Verify task belongs to organization
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
  });

  if (!task) {
    return [];
  }

  const entries = await prisma.taskTimeEntry.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return entries;
}

/**
 * Start time tracking for a task
 */
export async function startTimeTracking(
  taskId: string
): Promise<{ success: boolean; entryId?: string; error?: string }> {
  try {
    const user = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify task belongs to organization
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });

    if (!task) {
      return fail("Task not found");
    }

    // Check if there's already an active timer for this user
    const activeEntry = await prisma.taskTimeEntry.findFirst({
      where: {
        userId: user.userId,
        endedAt: null,
      },
    });

    if (activeEntry) {
      // Stop the existing timer first
      const elapsed = Math.round(
        (Date.now() - activeEntry.startedAt.getTime()) / 60000
      );
      await prisma.taskTimeEntry.update({
        where: { id: activeEntry.id },
        data: {
          endedAt: new Date(),
          minutes: elapsed,
        },
      });

      // Update the task's actual minutes
      await prisma.task.update({
        where: { id: activeEntry.taskId },
        data: {
          actualMinutes: { increment: elapsed },
        },
      });
    }

    // Create new time entry
    const entry = await prisma.taskTimeEntry.create({
      data: {
        taskId,
        userId: user.userId,
        startedAt: new Date(),
      },
    });

    revalidatePath("/projects");
    return { success: true, entryId: entry.id };
  } catch (error) {
    console.error("Error starting time tracking:", error);
    return fail(error instanceof Error ? error.message : "Failed to start timer",);
  }
}

/**
 * Stop time tracking
 */
export async function stopTimeTracking(
  entryId: string
): Promise<{ success: boolean; minutes?: number; error?: string }> {
  try {
    const user = await requireAuth();

    const entry = await prisma.taskTimeEntry.findFirst({
      where: {
        id: entryId,
        userId: user.userId,
        endedAt: null,
      },
    });

    if (!entry) {
      return fail("Active timer not found");
    }

    const elapsed = Math.round(
      (Date.now() - entry.startedAt.getTime()) / 60000
    );

    // Update the time entry
    await prisma.taskTimeEntry.update({
      where: { id: entryId },
      data: {
        endedAt: new Date(),
        minutes: elapsed,
      },
    });

    // Update the task's actual minutes
    await prisma.task.update({
      where: { id: entry.taskId },
      data: {
        actualMinutes: { increment: elapsed },
      },
    });

    revalidatePath("/projects");
    return { success: true, minutes: elapsed };
  } catch (error) {
    console.error("Error stopping time tracking:", error);
    return fail(error instanceof Error ? error.message : "Failed to stop timer",);
  }
}

/**
 * Add manual time entry
 */
export async function addManualTimeEntry(data: {
  taskId: string;
  minutes: number;
  description?: string;
  date?: Date;
}): Promise<{ success: boolean; entryId?: string; error?: string }> {
  try {
    const user = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify task belongs to organization
    const task = await prisma.task.findFirst({
      where: { id: data.taskId, organizationId },
    });

    if (!task) {
      return fail("Task not found");
    }

    const startedAt = data.date || new Date();
    const endedAt = new Date(startedAt.getTime() + data.minutes * 60000);

    // Create time entry
    const entry = await prisma.taskTimeEntry.create({
      data: {
        taskId: data.taskId,
        userId: user.userId,
        startedAt,
        endedAt,
        minutes: data.minutes,
        description: data.description,
      },
    });

    // Update the task's actual minutes
    await prisma.task.update({
      where: { id: data.taskId },
      data: {
        actualMinutes: { increment: data.minutes },
      },
    });

    revalidatePath("/projects");
    return { success: true, entryId: entry.id };
  } catch (error) {
    console.error("Error adding manual time entry:", error);
    return fail(error instanceof Error ? error.message : "Failed to add time entry",);
  }
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(
  entryId: string
): Promise<VoidActionResult> {
  try {
    const user = await requireAuth();

    const entry = await prisma.taskTimeEntry.findFirst({
      where: {
        id: entryId,
        userId: user.userId,
      },
    });

    if (!entry) {
      return fail("Time entry not found");
    }

    // If entry had minutes recorded, decrement from task
    if (entry.minutes) {
      await prisma.task.update({
        where: { id: entry.taskId },
        data: {
          actualMinutes: { decrement: entry.minutes },
        },
      });
    }

    await prisma.taskTimeEntry.delete({
      where: { id: entryId },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error deleting time entry:", error);
    return fail(error instanceof Error ? error.message : "Failed to delete time entry",);
  }
}

/**
 * Get active timer for current user
 */
export async function getActiveTimer(): Promise<{
  entryId: string;
  taskId: string;
  taskTitle: string;
  startedAt: Date;
} | null> {
  try {
    const user = await requireAuth();

    const activeEntry = await prisma.taskTimeEntry.findFirst({
      where: {
        userId: user.userId,
        endedAt: null,
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
    });

    if (!activeEntry) return null;

    return {
      entryId: activeEntry.id,
      taskId: activeEntry.task.id,
      taskTitle: activeEntry.task.title,
      startedAt: activeEntry.startedAt,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// TASK DEPENDENCIES
// ============================================================================

/**
 * Add a dependency (this task is blocked by another task)
 */
export async function addTaskDependency(
  taskId: string,
  blockedByTaskId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify both tasks belong to organization
    const [task, blockedByTask] = await Promise.all([
      prisma.task.findFirst({ where: { id: taskId, organizationId } }),
      prisma.task.findFirst({ where: { id: blockedByTaskId, organizationId } }),
    ]);

    if (!task || !blockedByTask) {
      return fail("Task not found");
    }

    // Prevent circular dependencies
    const wouldCreateCycle = await checkForCyclicDependency(
      blockedByTaskId,
      taskId,
      organizationId
    );
    if (wouldCreateCycle) {
      return fail("This would create a circular dependency");
    }

    // Add the dependency
    await prisma.task.update({
      where: { id: taskId },
      data: {
        blockedByTasks: {
          connect: { id: blockedByTaskId },
        },
      },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error adding task dependency:", error);
    return fail(error instanceof Error ? error.message : "Failed to add dependency",);
  }
}

/**
 * Remove a dependency
 */
export async function removeTaskDependency(
  taskId: string,
  blockedByTaskId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify task belongs to organization
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });

    if (!task) {
      return fail("Task not found");
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        blockedByTasks: {
          disconnect: { id: blockedByTaskId },
        },
      },
    });

    revalidatePath("/projects");
    return ok();
  } catch (error) {
    console.error("Error removing task dependency:", error);
    return fail(error instanceof Error ? error.message : "Failed to remove dependency",);
  }
}

/**
 * Get task dependencies
 */
export async function getTaskDependencies(taskId: string): Promise<{
  blockedBy: Array<{ id: string; title: string; status: TaskStatus }>;
  blocks: Array<{ id: string; title: string; status: TaskStatus }>;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId },
      include: {
        blockedByTasks: {
          select: { id: true, title: true, status: true },
        },
        blocksTasks: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    if (!task) {
      return { blockedBy: [], blocks: [] };
    }

    return {
      blockedBy: task.blockedByTasks,
      blocks: task.blocksTasks,
    };
  } catch {
    return { blockedBy: [], blocks: [] };
  }
}

/**
 * Check for cyclic dependencies using DFS
 */
async function checkForCyclicDependency(
  startTaskId: string,
  targetTaskId: string,
  organizationId: string
): Promise<boolean> {
  const visited = new Set<string>();
  const queue = [startTaskId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (currentId === targetTaskId) {
      return true; // Found a cycle
    }

    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    // Get tasks that this task blocks
    const task = await prisma.task.findFirst({
      where: { id: currentId, organizationId },
      include: {
        blockedByTasks: {
          select: { id: true },
        },
      },
    });

    if (task) {
      for (const blockedBy of task.blockedByTasks) {
        if (!visited.has(blockedBy.id)) {
          queue.push(blockedBy.id);
        }
      }
    }
  }

  return false;
}
