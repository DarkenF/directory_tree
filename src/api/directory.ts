import {DirectoryElement} from "../store/store";

let id = 0;
const getId = () => {
	id += 1;
	return String(id)
}

export const fetchDirectoryItemsByParentIdApi = async (parentId: string): Promise<DirectoryElement[]> => {
	return new Promise<DirectoryElement[]>((resolve) => {
		setTimeout(() => {
			resolve(		[{
					id: getId(),
				title: parentId + getId(),
				hasChildren: Math.random() < 0.8,
				},
				{
					id: getId(),
					title: parentId + getId(),
					hasChildren: Math.random() < 0.8,
				},]);
		}, 2000);
	});
};