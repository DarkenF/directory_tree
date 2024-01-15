import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {fetchDirectoryItemsApi} from "../api/directory";
import toast from "react-hot-toast";

export interface DirectoryElement {
  id: string;
  title: string;
  hasChildren: boolean;
  childrenIds?: string[];
  open?: boolean;
  errorMessage?: string;
	isLoading?: boolean;
}

export type DirectoryItemsMap = Record<string, DirectoryElement>;

export interface Directory {
  rootIds: string[];
  itemsMap: DirectoryItemsMap;
	errorMessage?: string;
	isLoading?: boolean;
}

export interface DirectoryStore {
  directory: Directory;
  setDirectoryItems: (items: DirectoryElement[], itemId?: string) => void;
  setDirectoryOpen: (itemId: string, open: boolean) => void;
  setDirectoryItemError: (error: string, itemId?: string) => void;
	setDirectoryItemIsLoading: (isLoading: boolean, itemId?: string) => void;
	fetchDirectoryItems: (directoryId?: string) => void;
}

export const useDirectoryStore = create<DirectoryStore>()(
  immer((set, get) => ({
    directory: {
      rootIds: [],
      itemsMap: {},
    },
    setDirectoryItems: (items: DirectoryElement[], itemId?: string) => {
      const rootIds = get().directory.rootIds;

      set((state) => {
	      const itemsIds = [];

	      items.forEach((item) => {
					state.directory.itemsMap[item.id] = item

		      itemsIds.push(item.id)
	      });

        if (!rootIds.length) {
          state.directory.rootIds.push(...itemsIds);
        }

        if (itemId) {
          state.directory.itemsMap[itemId].childrenIds = itemsIds;
        }
      });
    },
    setDirectoryItemError: (errorMessage: string, itemId?: string) => {
      set((state) => {
				if (!itemId) {
					state.directory.errorMessage = errorMessage

					return;
				}

        state.directory.itemsMap[itemId].errorMessage = errorMessage
      });
    },
    setDirectoryItemIsLoading: (isLoading: boolean, itemId?: string) => {
      set((state) => {
	      if (!itemId) {
		      state.directory.isLoading = isLoading

		      return;
	      }

        state.directory.itemsMap[itemId].isLoading = isLoading
      });
    },
	  fetchDirectoryItems: async (directoryId?: string) => {
		  const {setDirectoryItems, setDirectoryItemError, setDirectoryItemIsLoading, setDirectoryOpen} = get();

		  setDirectoryItemIsLoading(true, directoryId)
		  setDirectoryItemError('', directoryId);

		  try {
			  const items = await fetchDirectoryItemsApi(directoryId);

			  setDirectoryItems(items, directoryId);

				if (directoryId) {
					setDirectoryOpen(directoryId, true)
				}
		  } catch (e) {
			  toast.error('Ошибка загрузки')
			  setDirectoryItemError(`Ошибка загрузки`, directoryId);
		  }

		  setDirectoryItemIsLoading(false, directoryId)
	  },
    setDirectoryOpen: (itemId: string, open: boolean) => {
      set((state) => {
        state.directory.itemsMap[itemId].open = open
      });
    },
  })),
);
