import { DirectoryElement, useDirectoryStore } from '../../store/store';
import { clsx } from 'clsx';

import styles from './DirectoyItem.module.scss';
import { useShallow } from 'zustand/react/shallow';
import { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdditionalData {
  level: number;
}

export const DirectoryItem = (props: {
  data: (DirectoryElement & AdditionalData)[];
  style: CSSProperties;
  index: number;
}) => {
  const { data, index, style: virtualizationStyles } = props;

  const directory = data[index];
  const { open: isOpen, isLoading } = directory;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: directory.id,
    data: {
      parentId: directory.parentId,
    },
  });
  const style: CSSProperties = {
    ...virtualizationStyles,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const [fetchDirectoryItems, setDirectoryOpen] = useDirectoryStore(
    useShallow((state) => [state.fetchDirectoryItems, state.setDirectoryOpen] as const),
  );

  const toggleOpen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setDirectoryOpen(directory.id, false);

      return;
    }

    if (directory.hasChildren) {
      if (!directory.childrenIds) {
        fetchDirectoryItems(directory.id);

        return;
      }

      setDirectoryOpen(directory.id, true);
    }
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
    <div ref={setNodeRef} className={styles.directoryItem} style={style}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-static-element-interactions */}
      <div
        style={{
          minHeight: '50px',
          lineHeight: '50px',
          paddingLeft: `${directory.level * 20}px`,
        }}
        onClick={(e) => toggleOpen(e)}
      >
        {directory.hasChildren ? (
          renderArrow()
        ) : (
          <span style={{ marginRight: '3px' }}>----</span>
        )}
        <span {...attributes} {...listeners}>
          {directory.title}
        </span>
        {isLoading && <span>&nbsp;Loading...</span>}
      </div>
    </div>
  );
};
