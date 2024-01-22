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

  console.log(itemsMap);

  const onDragEnd = (e: DragEndEvent) => {
    const overItemId = e.over?.id as string | undefined;
    const activeItemId = e.active.id as string;

    if (!overItemId) {
      return;
    }

    moveDirectoryItem(activeItemId, overItemId);
  };

  return (
    <div>
      <Toaster />
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={itemDataIds} strategy={verticalListSortingStrategy}>
          <FixedSizeList
            itemData={itemData}
            itemKey={itemKey}
            height={500}
            itemCount={itemData.length}
            itemSize={28}
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
