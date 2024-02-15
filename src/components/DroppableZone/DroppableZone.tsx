import React from 'react';
import { useDroppable } from '@dnd-kit/core';

import styles from './DroppableZone.module.scss';
import { clsx } from 'clsx';

interface Props {
  height: number;
  id: string;
  children?: React.ReactNode;
}

export function DroppableZone({ id, height, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

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
