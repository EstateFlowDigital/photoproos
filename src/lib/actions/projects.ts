"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { revalidatePath } from "next/cache";
import type { TaskStatus, TaskPriority } from "@prisma/client";

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

  return boards;
}

/**
 * Get a single board with all columns and tasks
 */
export async function getBoard(boardId: string) {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create board",
    };
  }
}

/**
 * Update a board
 */
export async function updateBoard(
  boardId: string,
  data: { name?: string; description?: string; color?: string }
): Promise<{ success: boolean; error?: string }> {
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
    return { success: true };
  } catch (error) {
    console.error("Error updating board:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update board",
    };
  }
}

/**
 * Archive a board
 */
export async function archiveBoard(
  boardId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Don't allow archiving the default board
    const board = await prisma.taskBoard.findFirst({
      where: { id: boardId, organizationId },
    });

    if (board?.isDefault) {
      return { success: false, error: "Cannot archive the default board" };
    }

    await prisma.taskBoard.update({
      where: {
        id: boardId,
        organizationId,
      },
      data: { isArchived: true },
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error archiving board:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive board",
    };
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
      return { success: false, error: "Board not found" };
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create column",
    };
  }
}

/**
 * Update a column
 */
export async function updateColumn(
  columnId: string,
  data: { name?: string; color?: string; limit?: number | null }
): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: "Column not found" };
    }

    await prisma.taskColumn.update({
      where: { id: columnId },
      data,
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error updating column:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update column",
    };
  }
}

/**
 * Reorder columns
 */
export async function reorderColumns(
  boardId: string,
  columnIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify board ownership
    const board = await prisma.taskBoard.findFirst({
      where: { id: boardId, organizationId },
    });

    if (!board) {
      return { success: false, error: "Board not found" };
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
    return { success: true };
  } catch (error) {
    console.error("Error reordering columns:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder columns",
    };
  }
}

/**
 * Delete a column
 */
export async function deleteColumn(
  columnId: string
): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: "Column not found" };
    }

    if (column._count.tasks > 0) {
      return {
        success: false,
        error: "Cannot delete column with tasks. Move or delete tasks first.",
      };
    }

    await prisma.taskColumn.delete({
      where: { id: columnId },
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting column:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete column",
    };
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
      return { success: false, error: "Column not found" };
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
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
): Promise<{ success: boolean; error?: string }> {
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
        return { success: false, error: "Task not found" };
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
    return { success: true };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

/**
 * Move a task to a different column (and optionally reorder)
 */
export async function moveTask(
  taskId: string,
  targetColumnId: string,
  targetPosition: number
): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: "Task not found" };
    }

    if (!targetColumn) {
      return { success: false, error: "Target column not found" };
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
    return { success: true };
  } catch (error) {
    console.error("Error moving task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to move task",
    };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
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
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
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
      return { success: false, error: "Task not found" };
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add subtask",
    };
  }
}

/**
 * Toggle subtask completion
 */
export async function toggleSubtask(
  subtaskId: string
): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: "Subtask not found" };
    }

    await prisma.taskSubtask.update({
      where: { id: subtaskId },
      data: { isCompleted: !subtask.isCompleted },
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error toggling subtask:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle subtask",
    };
  }
}

/**
 * Delete a subtask
 */
export async function deleteSubtask(
  subtaskId: string
): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: "Subtask not found" };
    }

    await prisma.taskSubtask.delete({
      where: { id: subtaskId },
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete subtask",
    };
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
      return { success: false, error: "Task not found" };
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add comment",
    };
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: "Comment not found or not authorized" };
    }

    await prisma.taskComment.delete({
      where: { id: commentId },
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comment",
    };
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
      return { success: false, error: "Gallery not found" };
    }

    // Get or create default board
    const board = await getOrCreateDefaultBoard();
    const columnId = options?.columnId || board.columns[0]?.id;

    if (!columnId) {
      return { success: false, error: "No columns available" };
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
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
      return { success: false, error: "Booking not found" };
    }

    // Get or create default board
    const board = await getOrCreateDefaultBoard();
    const columnId = options?.columnId || board.columns[0]?.id;

    if (!columnId) {
      return { success: false, error: "No columns available" };
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
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
      return { success: false, error: "Client not found" };
    }

    // Get or create default board
    const board = await getOrCreateDefaultBoard();
    const columnId = options?.columnId || board.columns[0]?.id;

    if (!columnId) {
      return { success: false, error: "No columns available" };
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
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

    return {
      success: true,
      data: {
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
      },
    };
  } catch (error) {
    console.error("Error fetching task analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch analytics",
    };
  }
}
