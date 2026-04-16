/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  defaultDropAnimation,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Slot } from '@radix-ui/react-slot';

interface KanbanContextProps<T> {
  columns: Record<string, T[]>;
  setColumns: (columns: Record<string, T[]>) => void;
  getItemId: (item: T) => string;
  columnIds: string[];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  findContainer: (id: UniqueIdentifier) => string | undefined;
  isColumn: (id: UniqueIdentifier) => boolean;
}

const KanbanContext = React.createContext<KanbanContextProps<any>>({
  columns: {},
  setColumns: () => {},
  getItemId: () => '',
  columnIds: [],
  activeId: null,
  setActiveId: () => {},
  findContainer: () => undefined,
  isColumn: () => false,
});

const ColumnContext = React.createContext<{
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  isDragging?: boolean;
  disabled?: boolean;
}>({
  attributes: {} as DraggableAttributes,
  listeners: undefined,
  isDragging: false,
  disabled: false,
});

const ItemContext = React.createContext<{
  listeners: DraggableSyntheticListeners | undefined;
  isDragging?: boolean;
  disabled?: boolean;
}>({
  listeners: undefined,
  isDragging: false,
  disabled: false,
});

const dropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: '0.4' },
    },
  }),
};

export interface KanbanMoveEvent {
  event: DragEndEvent;
  activeContainer: string;
  activeIndex: number;
  overContainer: string;
  overIndex: number;
}

export interface KanbanRootProps<T> {
  value: Record<string, T[]>;
  onValueChange: (value: Record<string, T[]>) => void;
  getItemValue: (item: T) => string;
  children: React.ReactNode;
  className?: string;
  onMove?: (event: KanbanMoveEvent) => void;
}

// Stable sensor descriptors defined at module level so references never change.
const STABLE_SENSORS = [
  { sensor: PointerSensor, options: { activationConstraint: { distance: 8 } } },
  { sensor: KeyboardSensor, options: { coordinateGetter: sortableKeyboardCoordinates } },
] as const;

function Kanban<T>({ value, onValueChange, getItemValue, children, className, onMove }: KanbanRootProps<T>) {
  const columns = value;
  const setColumns = onValueChange;
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

  // Use the stable module-level descriptors so DndContext never sees new sensor references.
  const sensors = useSensors(...(STABLE_SENSORS as any));

  // Keep a ref to the latest columns so callbacks can read current data without
  // listing `columns` as a dependency (which would make them unstable).
  const columnsRef = React.useRef(columns);
  columnsRef.current = columns;

  // Keep a ref to the latest onMove for the same reason.
  const onMoveRef = React.useRef(onMove);
  onMoveRef.current = onMove;

  // Stable columnIds: only produce a new array reference when the actual key set changes.
  // Without this, every setColumns call (even moving an item) recreates columnIds, which
  // cascades to new isColumn → findContainer → handleDragOver/End → DndContext re-render.
  const columnIdsRef = React.useRef<string[]>([]);
  const columnIds = React.useMemo(() => {
    const next = Object.keys(columns);
    if (
      next.length === columnIdsRef.current.length &&
      next.every((id, i) => id === columnIdsRef.current[i])
    ) {
      return columnIdsRef.current;
    }
    columnIdsRef.current = next;
    return next;
  }, [columns]);

  const isColumn = React.useCallback((id: UniqueIdentifier) => columnIds.includes(id as string), [columnIds]);

  // No `columns` in deps — reads from ref so this stays stable across column changes.
  const findContainer = React.useCallback(
    (id: UniqueIdentifier) => {
      if (isColumn(id)) return id as string;
      const cols = columnsRef.current;
      return Object.keys(cols).find((key) => cols[key].some((item) => getItemValue(item) === id));
    },
    [columnIds, getItemValue, isColumn],
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  // No `columns` or `onMove` in deps — both read from refs. Handler is now stable.
  const handleDragOver = React.useCallback(
    (event: DragOverEvent) => {
      if (onMoveRef.current) return;
      const { active, over } = event;
      if (!over) return;
      if (isColumn(active.id)) return;

      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over.id);
      if (!activeContainer || !overContainer || activeContainer === overContainer) return;

      const cols = columnsRef.current;
      const activeItems = [...cols[activeContainer]];
      const overItems = [...cols[overContainer]];
      const activeIndex = activeItems.findIndex((item: T) => getItemValue(item) === active.id);
      let overIndex = overItems.findIndex((item: T) => getItemValue(item) === over.id);
      if (isColumn(over.id)) overIndex = overItems.length;

      const [movedItem] = activeItems.splice(activeIndex, 1);
      overItems.splice(overIndex, 0, movedItem);

      setColumns({ ...cols, [activeContainer]: activeItems, [overContainer]: overItems });
    },
    [findContainer, getItemValue, isColumn, setColumns],
  );

  // No `columns` or `onMove` in deps — both read from refs. Handler is now stable.
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const cols = columnsRef.current;
      const currentOnMove = onMoveRef.current;

      if (currentOnMove && !isColumn(active.id)) {
        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over.id);
        if (activeContainer && overContainer) {
          const activeIndex = cols[activeContainer].findIndex((item: T) => getItemValue(item) === active.id);
          const overIndex = isColumn(over.id)
            ? cols[overContainer].length
            : cols[overContainer].findIndex((item: T) => getItemValue(item) === over.id);
          currentOnMove({ event, activeContainer, activeIndex, overContainer, overIndex });
        }
        return;
      }

      if (isColumn(active.id) && isColumn(over.id)) {
        const activeIndex = columnIds.indexOf(active.id as string);
        const overIndex = columnIds.indexOf(over.id as string);
        if (activeIndex !== overIndex) {
          const newOrder = arrayMove(Object.keys(cols), activeIndex, overIndex);
          const newColumns: Record<string, T[]> = {};
          newOrder.forEach((key) => { newColumns[key] = cols[key]; });
          setColumns(newColumns);
        }
        return;
      }

      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over.id);
      if (activeContainer && overContainer && activeContainer === overContainer) {
        const activeIndex = cols[activeContainer].findIndex((item: T) => getItemValue(item) === active.id);
        const overIndex = cols[activeContainer].findIndex((item: T) => getItemValue(item) === over.id);
        if (activeIndex !== overIndex) {
          setColumns({ ...cols, [activeContainer]: arrayMove(cols[activeContainer], activeIndex, overIndex) });
        }
      }
    },
    [columnIds, findContainer, getItemValue, isColumn, setColumns],
  );

  const contextValue = React.useMemo(
    () => ({ columns, setColumns, getItemId: getItemValue, columnIds, activeId, setActiveId, findContainer, isColumn }),
    [columns, setColumns, getItemValue, columnIds, activeId, findContainer, isColumn],
  );

  return (
    <KanbanContext.Provider value={contextValue}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div data-slot="kanban" data-dragging={activeId !== null} className={cn(className)}>
          {children}
        </div>
      </DndContext>
    </KanbanContext.Provider>
  );
}

export interface KanbanBoardProps {
  className?: string;
  children: React.ReactNode;
}

function KanbanBoard({ children, className }: KanbanBoardProps) {
  const { columnIds } = React.useContext(KanbanContext);
  return (
    <SortableContext items={columnIds} strategy={rectSortingStrategy}>
      <div data-slot="kanban-board" className={cn(className)}>
        {children}
      </div>
    </SortableContext>
  );
}

export interface KanbanColumnProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function KanbanColumn({ value, className, children, disabled }: KanbanColumnProps) {
  const { setNodeRef, transform, transition, attributes, listeners, isDragging: isSortableDragging } = useSortable({ id: value, disabled });
  const { activeId, isColumn } = React.useContext(KanbanContext);
  const isColumnDragging = activeId ? isColumn(activeId) : false;

  const style = { transition, transform: CSS.Translate.toString(transform) } as React.CSSProperties;

  return (
    <ColumnContext.Provider value={{ attributes, listeners, isDragging: isColumnDragging, disabled }}>
      <div
        data-slot="kanban-column"
        data-value={value}
        data-dragging={isSortableDragging}
        data-disabled={disabled}
        ref={setNodeRef}
        style={style}
        className={cn('group/kanban-column flex flex-col', isSortableDragging && 'opacity-50', disabled && 'opacity-50', className)}
      >
        {children}
      </div>
    </ColumnContext.Provider>
  );
}

export interface KanbanColumnHandleProps {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  cursor?: boolean;
}

function KanbanColumnHandle({ asChild, className, children, cursor = true }: KanbanColumnHandleProps) {
  const { attributes, listeners, isDragging, disabled } = React.useContext(ColumnContext);
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-slot="kanban-column-handle"
      data-dragging={isDragging}
      data-disabled={disabled}
      {...attributes}
      {...listeners}
      className={cn('opacity-0 transition-opacity group-hover/kanban-column:opacity-100', cursor && (isDragging ? '!cursor-grabbing' : '!cursor-grab'), className)}
    >
      {children}
    </Comp>
  );
}

export interface KanbanItemProps {
  value: string;
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function KanbanItem({ value, asChild = false, className, children, disabled }: KanbanItemProps) {
  const { setNodeRef, transform, transition, attributes, listeners, isDragging: isSortableDragging } = useSortable({ id: value, disabled });
  const { activeId, isColumn } = React.useContext(KanbanContext);
  const isItemDragging = activeId ? !isColumn(activeId) : false;

  const style = { transition, transform: CSS.Translate.toString(transform) } as React.CSSProperties;
  const Comp = asChild ? Slot : 'div';

  return (
    <ItemContext.Provider value={{ listeners, isDragging: isItemDragging, disabled }}>
      <Comp
        data-slot="kanban-item"
        data-value={value}
        data-dragging={isSortableDragging}
        data-disabled={disabled}
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(isSortableDragging && 'opacity-40', disabled && 'opacity-50', className)}
      >
        {children}
      </Comp>
    </ItemContext.Provider>
  );
}

export interface KanbanItemHandleProps {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  cursor?: boolean;
}

function KanbanItemHandle({ asChild, className, children, cursor = true }: KanbanItemHandleProps) {
  const { listeners, isDragging, disabled } = React.useContext(ItemContext);
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-slot="kanban-item-handle"
      data-dragging={isDragging}
      data-disabled={disabled}
      {...listeners}
      className={cn(cursor && (isDragging ? '!cursor-grabbing' : '!cursor-grab'), className)}
    >
      {children}
    </Comp>
  );
}

export interface KanbanColumnContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

function KanbanColumnContent({ value, className, children }: KanbanColumnContentProps) {
  const { columns, getItemId } = React.useContext(KanbanContext);
  // Depend on `columns[value]` (the specific column's array), not the whole `columns` map.
  // Spread/replace in handleDragOver preserves references for untouched columns, so
  // unchanged columns won't recompute itemIds and won't disturb their SortableContext.
  const colItems = columns[value] ?? ([] as any[]);
  const itemIds = React.useMemo(() => colItems.map(getItemId), [colItems, getItemId]);
  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      <div data-slot="kanban-column-content" className={cn('flex flex-col gap-2', className)}>
        {children}
      </div>
    </SortableContext>
  );
}

export interface KanbanOverlayProps {
  className?: string;
  children?: React.ReactNode | ((params: { value: UniqueIdentifier; variant: 'column' | 'item' }) => React.ReactNode);
}

function KanbanOverlay({ children, className }: KanbanOverlayProps) {
  const { activeId, isColumn } = React.useContext(KanbanContext);
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    if (activeId) {
      const element = document.querySelector(`[data-slot="kanban-${isColumn(activeId) ? 'column' : 'item'}"][data-value="${activeId}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    } else {
      setDimensions(null);
    }
  }, [activeId, isColumn]);

  const style = { width: dimensions?.width, height: dimensions?.height } as React.CSSProperties;

  const content = React.useMemo(() => {
    if (!activeId) return null;
    if (typeof children === 'function') return children({ value: activeId, variant: isColumn(activeId) ? 'column' : 'item' });
    return children;
  }, [activeId, children, isColumn]);

  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>
      <div data-slot="kanban-overlay" data-dragging={true} style={style} className={cn('pointer-events-none', className, activeId ? '!cursor-grabbing' : '')}>
        {content}
      </div>
    </DragOverlay>
  );
}

// Memo-wrap so DndContext doesn't re-render when an ancestor (e.g. Dashboard)
// re-renders for unrelated state (selectedJobId, centerMargin, phase, etc.).
// DndContext is wrapped in React.memo internally but it still gets new `children`
// objects on every parent render; wrapping Kanban itself stops that cascade.
const KanbanMemo = React.memo(Kanban) as typeof Kanban;

export { KanbanMemo as Kanban, KanbanBoard, KanbanColumn, KanbanColumnHandle, KanbanItem, KanbanItemHandle, KanbanColumnContent, KanbanOverlay };
