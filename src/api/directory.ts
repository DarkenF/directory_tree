import {DirectoryElement} from "../store/store";

let id = 0;
const getId = () => {
	id += 1;
	return String(id)
}

export const getDirectoryItemsByHashApi = async (hash: string): Promise<DirectoryElement[]> => {
	return new Promise<DirectoryElement[]>((resolve) => {
		setTimeout(() => {
			resolve(		[{
					id: getId(),
					name: hash + getId(),
					childrenId: getId()
				},
				{
					id: getId(),
					name: hash + getId(),
					childrenId: getId()
				},]);
		}, 2000);
	});
};