"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";

/**
 * Vertical drag-and-drop list. Dragging is only started from the grip handle
 * so the cards' own buttons and links keep working, and it supports touch.
 * `onReorder` fires continuously while dragging (for live UI); `onCommit`
 * fires once on drop with the final order, which is the moment to persist.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  onCommit,
  renderItem,
  className,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  onCommit: (items: T[]) => void;
  renderItem: (item: T) => ReactNode;
  className?: string;
}) {
  const latest = useRef(items);
  useEffect(() => {
    latest.current = items;
  }, [items]);

  return (
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className={className}>
      {items.map((item) => (
        <SortableRow key={item.id} item={item} onDrop={() => onCommit(latest.current)}>
          {renderItem(item)}
        </SortableRow>
      ))}
    </Reorder.Group>
  );
}

function SortableRow<T extends { id: string }>({
  item,
  onDrop,
  children,
}: {
  item: T;
  onDrop: () => void;
  children: ReactNode;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      whileDrag={{ scale: 1.01, zIndex: 20 }}
      className="relative flex items-stretch gap-2"
    >
      <button
        type="button"
        aria-label="Seret untuk mengubah urutan"
        title="Seret untuk mengubah urutan"
        onPointerDown={(e) => controls.start(e)}
        className="flex w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted/60 transition-colors hover:bg-surface hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </Reorder.Item>
  );
}
