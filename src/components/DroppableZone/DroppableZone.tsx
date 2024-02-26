import React, { useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';

import styles from './DroppableZone.module.scss';
import { clsx } from 'clsx';

interface Props {
  height: number;
  id: string;
  children?: React.ReactNode;
  setOpen: () => void;
}

export function DroppableZone({ id, height, children, setOpen }: Props) {
  const timeout = useRef<null | number>(null);
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  useEffect(() => {
    if (isOver && !timeout.current) {
      timeout.current = setTimeout(() => {
        setOpen();
      }, 3000);
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
    };
  }, [isOver]);

  return (
    <div
      ref={setNodeRef}
      style={{
        height: `${height}%`,
      }}
      className={clsx(styles.Droppable, isOver && styles.over)}
    >
      {children}
    </div>
  );
}
