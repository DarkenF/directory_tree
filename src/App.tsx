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
import { fetchDirectoryItemsApi } from './api/directory';

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
  const [error, setError] = useState<string>('');
  const [rootIds, itemsMap, setDirectoryData] = useDirectoryStore(
    useShallow(
      (state: DirectoryStore) =>
        [
          state.directory.rootIds,
          state.directory.itemsMap,
          state.setDirectoryItems,
        ] as const,
    ),
  );

  useEffect(() => {
    if (!rootIds.length) {
      (async () => {
        try {
          const data = await fetchDirectoryItemsApi();

          setDirectoryData(data);
        } catch (e) {
          console.error(e);
          setError('Произошла ошибка, повторите позже');
        }
      })();
    }
  }, [rootIds]);

  const itemData = useMemo(() => {
    return getChildItems(itemsMap, rootIds);
  }, [itemsMap, rootIds]);

  if (error) {
    return <h4>{error}</h4>;
  }

  return (
    <div>
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
