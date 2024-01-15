import './App.css';
import { DirectoryItem } from './components/DirectoryItem/DirectoryItem';
import {
  DirectoryElement,
  DirectoryItemsMap,
  DirectoryStore,
  useDirectoryStore,
} from './store/store';
import { FixedSizeList } from 'react-window';
import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Toaster } from 'react-hot-toast';

interface ChildItems extends DirectoryElement {
  level?: number;
}

const getChildItems = (
  itemsMap: DirectoryItemsMap,
  ids: string[],
  data: ChildItems[] = [],
  level = 0,
): DirectoryElement[] => {
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

function itemKey(index, data) {
  const item = data[index];

  return item.id;
}

function App() {
  const [rootIds, itemsMap, errorMessage, fetchDirectoryItems] = useDirectoryStore(
    useShallow(
      (state: DirectoryStore) =>
        [
          state.directory.rootIds,
          state.directory.itemsMap,
          state.directory.errorMessage,
          state.fetchDirectoryItems,
        ] as const,
    ),
  );

  useEffect(() => {
    if (!rootIds.length) {
	    fetchDirectoryItems()
    }
  }, [rootIds]);

  const itemData = useMemo(() => {
    return getChildItems(itemsMap, rootIds);
  }, [itemsMap, rootIds]);

  if (errorMessage) {
    return <h4>{errorMessage}</h4>;
  }

  return (
    <div>
	    <Toaster />
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
    </div>
  );
}

export default App;
