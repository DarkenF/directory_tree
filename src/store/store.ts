import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { fetchDirectoryItemsApi } from '../api/directory';
import toast from 'react-hot-toast';
import { ZoneIdentity } from '../types.ts';

export interface DirectoryElement {
  id: string;
  title: string;
  parentId?: string;
  hasChildren: boolean;
  childrenIds?: string[];
  open?: boolean;
  isLoading?: boolean;
}

export type DirectoryItemsMap = Record<string, DirectoryElement>;

export interface Directory {
  rootIds: string[];
  itemsMap: DirectoryItemsMap;
  isLoading?: boolean;
}

export interface DirectoryStore {
  directory: Directory;
  setDirectoryItems: (itemId: string | undefined, items: DirectoryElement[]) => void;
  setDirectoryOpen: (itemId: string, open: boolean) => void;
  setDirectoryItemIsLoading: (itemId: string | undefined, isLoading: boolean) => void;
  fetchDirectoryItems: (directoryId?: string) => void;
  moveDirectoryItem: (
    activeItemId: string,
    overItemId: string,
    zoneId: ZoneIdentity,
    yDelta: number,
  ) => void;
}

export const useDirectoryStore = create<DirectoryStore>()(
  immer((set, get) => ({
    directory: {
      rootIds: [],
      itemsMap: {},
    },
    setDirectoryItems: (itemId: string | undefined, items: DirectoryElement[]) => {
      set((state) => {
        const rootIds = state.directory.rootIds;

        const itemsIds: string[] = [];

        items.forEach((item) => {
          state.directory.itemsMap[item.id] = item;

          itemsIds.push(item.id);
        });

        if (!rootIds.length) {
          state.directory.rootIds.push(...itemsIds);
        }

        if (itemId) {
          state.directory.itemsMap[itemId].childrenIds = itemsIds;
        }
      });
    },
    moveDirectoryItem: (
      activeItemId: string,
      overItemId: string,
      zoneId: ZoneIdentity,
      yDelta: number,
    ) => {
      set((state) => {
        const rootIds = get().directory.rootIds;
        const itemsMap = get().directory.itemsMap;
        const activeItemParentId = itemsMap[activeItemId].parentId;
        const overParentItemId = itemsMap[overItemId].parentId;

        if (activeItemId === overItemId) {
          return;
        }

        // Убираем из childrenIds activeItemId в родителе activeItem
        if (activeItemParentId) {
          const nextActiveParentChildrenIds = get().directory.itemsMap[
            activeItemParentId
          ].childrenIds?.filter((itemId) => itemId !== activeItemId);

          state.directory.itemsMap[activeItemParentId].childrenIds =
            nextActiveParentChildrenIds;
          state.directory.itemsMap[activeItemParentId].hasChildren =
            !!nextActiveParentChildrenIds?.length;
        }

        const deltaStartPosition = getOverPositionDelta(
          yDelta,
          zoneId,
          activeItemParentId === overParentItemId,
        );

        if (zoneId === ZoneIdentity.Center) {
          // Добавялем в childrenIds activeItemId в overItem
          const overItemChildrenIds =
            get().directory.itemsMap[overItemId].childrenIds || [];

          state.directory.itemsMap[overItemId].childrenIds = [
            ...overItemChildrenIds,
            activeItemId,
          ];
          state.directory.itemsMap[overItemId].hasChildren = true;

          if (!activeItemParentId) {
            state.directory.rootIds = rootIds.filter((item) => item !== activeItemId);
          }

          return;
        }

        if (overParentItemId) {
          // Добавялем в childrenIds activeItemId в родителе overItem
          const overParentChildrenIds =
            get().directory.itemsMap[overParentItemId].childrenIds;

          // Нет у activeItem поля parentId, вытаскиваем из rootIds (перенос из rootIds по дереву)
          if (!activeItemParentId) {
            state.directory.rootIds = rootIds.filter((item) => item !== activeItemId);
          }

          if (!overParentChildrenIds?.length) {
            state.directory.itemsMap[overParentItemId].childrenIds = [activeItemId];
            state.directory.itemsMap[overParentItemId].hasChildren = true;

            return;
          }

          const overItemPositionIndex = overParentChildrenIds.indexOf(overItemId);

          state.directory.itemsMap[overParentItemId].childrenIds?.splice(
            overItemPositionIndex + deltaStartPosition,
            0,
            activeItemId,
          );
          state.directory.itemsMap[activeItemId].parentId = overParentItemId;
        } else {
          // Для случая если item перемещается в rootIds
          const overRootIdsIndex = rootIds.indexOf(overItemId);
          const activeItemIndex = rootIds.indexOf(activeItemId);

          if (activeItemIndex !== -1) {
            state.directory.rootIds.splice(activeItemIndex, 1);
          }

          state.directory.rootIds.splice(
            overRootIdsIndex + deltaStartPosition,
            0,
            activeItemId,
          );
          state.directory.itemsMap[activeItemId].parentId = undefined;
        }
      });
    },
    setDirectoryItemIsLoading: (itemId: string | undefined, isLoading: boolean) => {
      set((state) => {
        if (!itemId) {
          state.directory.isLoading = isLoading;

          return;
        }

        state.directory.itemsMap[itemId].isLoading = isLoading;
      });
    },
    fetchDirectoryItems: async (directoryId?: string) => {
      const { setDirectoryItems, setDirectoryItemIsLoading, setDirectoryOpen } = get();

      setDirectoryItemIsLoading(directoryId, true);

      try {
        const items = await fetchDirectoryItemsApi(directoryId);

        setDirectoryItems(directoryId, items);

        if (directoryId) {
          setDirectoryOpen(directoryId, true);
        }
      } catch (e) {
        toast.error('Ошибка загрузки');
      }

      setDirectoryItemIsLoading(directoryId, false);
    },
    setDirectoryOpen: (itemId: string, open: boolean) => {
      set((state) => {
        state.directory.itemsMap[itemId].open = open;
      });
    },
  })),
);

function getOverPositionDelta(
  yDelta: number,
  zoneId: ZoneIdentity,
  isSameLevel: boolean,
) {
  const isMoveTop = yDelta < 0;

  if (zoneId === ZoneIdentity.Bottom) {
    if (isMoveTop) {
      return 1;
    }
    return isSameLevel ? 0 : 1;
  }

  if (zoneId === ZoneIdentity.Top) {
    if (isMoveTop) {
      return 0;
    }
    return isSameLevel ? -1 : 0;
  }

  return 0;
}
