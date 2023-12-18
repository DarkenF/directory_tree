import {DirectoryElement} from "../store/store";

let id = 0;
const getId = () => {
	id += 1;
	return String(id)
}

function randomIntFromInterval(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

const generateItems = (parentId: string) => {
	const data = [];
	const count = 4

	for (let i = 0; i < count; i++) {
		const id = `${parentId ? parentId + '_' : ''}${i}`
		data.push({
			id,
			title: id,
			hasChildren: Math.random() < 0.8,
		})
	}

	return data
}

export const fetchDirectoryItemsApi = async (parentId = ''): Promise<DirectoryElement[]> => {
	return new Promise<DirectoryElement[]>((resolve) => {
		setTimeout(() => {
			resolve(generateItems(parentId));
		}, 2000);
	});
};