"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface WidgetGridProps {
  widgetIds: string[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function WidgetGrid({
  widgetIds,
  onReorder,
  children,
  className,
}: WidgetGridProps) {
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require a minimum drag distance before starting
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgetIds.indexOf(active.id as string);
      const newIndex = widgetIds.indexOf(over.id as string);
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
        <div
          className={cn(
            "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            className
          )}
          role="list"
          aria-label="Dashboard widgets"
        >
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default WidgetGrid;
