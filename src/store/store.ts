import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface DirectoryElement {
  id: string;
  title: string;
  hasChildren: boolean;
  childrenIds?: string[];
  open?: boolean;
  errorMessage?: string;
}

export type DirectoryItemsMap = Record<string, DirectoryElement>;

export interface Directory {
  rootIds: string[];
  itemsMap: DirectoryItemsMap;
}

export interface DirectoryStore {
  directory: Directory;
  setDirectoryItems: (items: DirectoryElement[], itemId?: string) => void;
  setDirectoryOpen: (itemId: string, open: boolean) => void;
  setDirectoryItemError: (itemId: string, error: string) => void;
}

export const useDirectoryStore = create<DirectoryStore>()(
  immer((set, get) => ({
    directory: {
      rootIds: [],
      itemsMap: {},
    },
    setDirectoryItems: (items: DirectoryElement[], itemId?: string) => {
      const directoryItemsMap = get().directory.itemsMap;
      const rootIds = get().directory.rootIds;

      const itemsMap = items.reduce((acc, item) => {
        acc[item.id] = item;

        return acc;
      }, {} as DirectoryItemsMap);

      set((state) => {
        state.directory.itemsMap = {
          ...directoryItemsMap,
          ...itemsMap,
        };

        const ids = Object.keys(itemsMap);

        if (!rootIds.length) {
          state.directory.rootIds.push(...ids);
        }

        if (itemId) {
          state.directory.itemsMap[itemId] = {
            ...directoryItemsMap[itemId],
            childrenIds: ids,
          };
        }
      });
    },
    setDirectoryItemError: (itemId: string, errorMessage: string) => {
      const directoryItemsMap = get().directory.itemsMap;

      set((state) => {
        state.directory.itemsMap[itemId] = {
          ...directoryItemsMap[itemId],
          errorMessage: errorMessage,
        };
      });
    },
    setDirectoryOpen: (itemId: string, open: boolean) => {
      const directoryItemsMap = get().directory.itemsMap;

      set((state) => {
        state.directory.itemsMap[itemId] = {
          ...directoryItemsMap[itemId],
          open,
        };
      });
    },
  })),
);
