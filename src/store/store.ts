import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

export interface DirectoryElement {
	id: string;
	title: string;
	hasChildren: boolean;
	childrenIds?: string[];
	open?: boolean;
}

export type DirectoryItemsMap = Record<string, DirectoryElement>

export interface Directory {
	rootIds: string[];
	itemsMap: DirectoryItemsMap
}

export interface DirectoryStore {
  directory: Directory;
	setDirectoryData: (ids: string[], itemsMap: DirectoryItemsMap) => void;
	setChildrenIds: (itemId: string, ids: string[]) => void;
	setDirectoryOpen: (itemId: string, open: boolean) => void;
}

export const useDirectoryStore = create<DirectoryStore>()(
  immer((set, get) => ({
    directory: {
			rootIds: [],
	    itemsMap: {},
    },
    setDirectoryData: (ids: string[], itemsMap: DirectoryItemsMap) => {
	    const directoryItemsMap = get().directory.itemsMap
	    const rootIds = get().directory.rootIds

	    set((state) => {
		    state.directory.itemsMap = {
					...directoryItemsMap, ...itemsMap
		    }
		    state.directory.rootIds = [...rootIds, ...ids]
	    });
    },
	  setChildrenIds: (itemId: string, ids: string[]) => {
		  const directoryItemsMap = get().directory.itemsMap

		  set((state) => {
			  state.directory.itemsMap[itemId] = {
					...directoryItemsMap[itemId],
				  childrenIds: ids
			  }
		  });
	  },
	  setDirectoryOpen: (itemId: string, open: boolean) => {
		  const directoryItemsMap = get().directory.itemsMap

		  set((state) => {
			  state.directory.itemsMap[itemId] = {
					...directoryItemsMap[itemId],
				  open,
			  }
		  });
	  }
  })),
);
