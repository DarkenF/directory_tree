import { useState } from 'react';
import {
  DirectoryElement,
  DirectoryItemsMap,
  useDirectoryStore,
} from '../../store/store';
import { clsx } from 'clsx';

import styles from './DirectoyItem.module.scss';
import { fetchDirectoryItemsApi } from '../../api/directory';
import { useShallow } from 'zustand/react/shallow';

interface AdditionalData {
  level: number;
}

export const DirectoryItem = (props: {
  data: (DirectoryElement & AdditionalData)[];
  style: string;
  index: number;
}) => {
  const { data, index, style } = props;

  const directory = data[index];
  const isOpen = directory.open;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [setDirectoryItems, setDirectoryOpen, setDirectoryItemError] = useDirectoryStore(
    useShallow(
      (state) =>
        [
          state.setDirectoryItems,
          state.setDirectoryOpen,
          state.setDirectoryItemError,
        ] as const,
    ),
  );

  const toggleOpen = async () => {
    if (isOpen) {
      setDirectoryItemError(directory.id, '');
    }

    if (directory.hasChildren && !isOpen && !directory.childrenIds) {
      setIsLoading(true);
      try {
        const items = await fetchDirectoryItemsApi(directory.id);

        setDirectoryItems(items, directory.id);
      } catch (e) {
        console.error(e);
        setDirectoryItemError(directory.id, `Ошибка загрузки`);
      }

      setIsLoading(false);
    }
    setDirectoryOpen(directory.id, !isOpen);
  };

  const renderArrow = () => {
    return (
      <span className={clsx(isOpen && styles.arrowOpen)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <polygon points="12 17.414 3.293 8.707 4.707 7.293 12 14.586 19.293 7.293 20.707 8.707 12 17.414" />
        </svg>
      </span>
    );
  };

  return (
    <div className={styles.directoryItem} style={style}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-static-element-interactions */}
      <div
        style={{
          minHeight: '28px',
          lineHeight: '28px',
          paddingLeft: `${directory.level * 20}px`,
        }}
        onClick={() => toggleOpen()}
      >
        {directory.hasChildren ? (
          renderArrow()
        ) : (
          <span style={{ marginRight: '3px' }}>----</span>
        )}
        {directory.title}
        {directory.errorMessage && <span>&nbsp;{directory.errorMessage}</span>}
        {isLoading && <span>&nbsp;Loading...</span>}
      </div>
    </div>
  );
};
