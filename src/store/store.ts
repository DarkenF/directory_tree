import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

export interface DirectoryElement {
	id: string;
	name: string;
	childrenId?: string;
}


export interface Directory {
	[id: string]: DirectoryElement[];
}

interface DirectoryStore {
  directories: Directory;
	setDirectory: (id: string, items: DirectoryElement[]) => void;
}

export const useDirectoryStore = create<DirectoryStore>()(
  immer((set, get) => ({
    directories: {},
    setDirectory: (id: string, items: DirectoryElement[]) =>
      set((state) => {
				state.directories[id] = items
      }),
  })),
);
