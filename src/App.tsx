import './App.css';
import { DirectoryItem } from './components/DirectoryItem/DirectoryItem';
import {
  DirectoryElement,
  DirectoryItemsMap,
  DirectoryStore,
  useDirectoryStore,
} from './store/store';
import { FixedSizeList } from 'react-window';
import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Toaster } from 'react-hot-toast';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ZoneIdentity } from './types.ts';

interface ChildItems extends DirectoryElement {
  level: number;
}

const getChildItems = (
  itemsMap: DirectoryItemsMap,
  ids: string[],
  data: ChildItems[] = [],
  level = 0,
): ChildItems[] => {
  ids.forEach((id) => {
    const item = itemsMap[id];

    data.push({
      ...item,
      level,
    });

    if (item.open && item.childrenIds) {
      getChildItems(itemsMap, item.childrenIds, data, level + 1);
    }
  });

  return data;
};

function itemKey(index: number, data: DirectoryElement[]) {
  const item = data[index];

  return item.id;
}

const isOverItemIsChildren = (
  itemsMap: DirectoryItemsMap,
  activeItemId: string,
  overItemParentId: string | undefined,
): boolean => {
  if (!overItemParentId) {
    return false;
  }

  const overItemParent = itemsMap[overItemParentId];

  if (overItemParent.id === activeItemId) {
    return true;
  }

  if (!overItemParent.parentId) {
    return false;
  }

  return isOverItemIsChildren(itemsMap, activeItemId, overItemParent.parentId);
};

const getOverItemIdInfo = (
  id: string,
): {
  itemId: string;
  zoneId: ZoneIdentity;
} => {
  const [zoneId, itemId] = id.split(':') as [ZoneIdentity, string];

  return {
    itemId,
    zoneId,
  };
};

function App() {
  const [rootIds, itemsMap, fetchDirectoryItems, moveDirectoryItem] = useDirectoryStore(
    useShallow(
      (state: DirectoryStore) =>
        [
          state.directory.rootIds,
          state.directory.itemsMap,
          state.fetchDirectoryItems,
          state.moveDirectoryItem,
        ] as const,
    ),
  );

  useEffect(() => {
    if (!rootIds.length) {
      fetchDirectoryItems();
    }
  }, [rootIds]);

  const itemData = useMemo(() => {
    return getChildItems(itemsMap, rootIds);
  }, [itemsMap, rootIds]);

  const itemDataIds = useMemo(() => itemData.map(({ id }) => id), [itemData]);

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over) {
      return;
    }
    const overId = e.over.id as string;

    const { itemId, zoneId } = getOverItemIdInfo(overId);

    const activeItemId = e.active.id as string;

    if (
      !itemId ||
      isOverItemIsChildren(itemsMap, activeItemId, e.over?.data.current?.parentId)
    ) {
      return;
    }

    moveDirectoryItem(activeItemId, itemId, zoneId, e.delta.y);
  };
  const onDragOver = (e: DragEndEvent) => {
    if (!e.over) {
      return;
    }
  };
  const onDragMove = (e: DragEndEvent) => {
    console.log('move', e);
  };

  return (
    <div>
      <Toaster />
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onDragOver={onDragOver}
      >
        <SortableContext items={itemDataIds} strategy={verticalListSortingStrategy}>
          <FixedSizeList
            itemData={itemData}
            itemKey={itemKey}
            height={500}
            itemCount={itemData.length}
            itemSize={50}
            width="100%"
          >
            {DirectoryItem}
          </FixedSizeList>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default App;
