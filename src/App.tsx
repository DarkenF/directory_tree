import './App.css'
import {DirectoryItem} from "./components/DirectoryItem/DirectoryItem";
import {DirectoryElement, DirectoryItemsMap, DirectoryStore, useDirectoryStore} from "./store/store";
import {FixedSizeList} from "react-window";
import {useEffect, useMemo} from "react";
import {useShallow} from "zustand/react/shallow";
import {fetchDirectoryItemsApi} from "./api/directory";

const getChildItems = (itemsMap: DirectoryItemsMap, ids: string[], level= 0): DirectoryElement[] => {
	const data = [];

	ids.forEach((id) => {
		const item = itemsMap[id]

		data.push({
			...item,
			level
		})

		if (item.open && item.childrenIds) {
			const childItems = getChildItems(itemsMap, item.childrenIds, level + 1)

			data.push(...childItems)
		}
	})

	return data
}

function App() {
	const [rootIds, itemsMap, setDirectoryData] = useDirectoryStore(useShallow((state: DirectoryStore) => [state.directory.rootIds, state.directory.itemsMap, state.setDirectoryData] as const));

	function itemKey(index, data) {
		const item = data[index]

		return item.id;
	}

	useEffect(() => {
		if (!rootIds.length) {
			(async () => {
				const data = await fetchDirectoryItemsApi()
				const result = data.reduce((acc, item) => {
					acc.rootIds = [...acc.rootIds, item.id];
					acc.itemsMap = {
						...acc.itemsMap,
						[item.id]: item
					}

					return acc
				}, {
					rootIds: [],
					itemsMap: {}
				} as {rootIds: string[], itemsMap: DirectoryItemsMap})

				setDirectoryData(result.rootIds, result.itemsMap)
			})()
		}
	}, [rootIds])

	const itemData = useMemo(() => {
		return getChildItems(itemsMap, rootIds)
	}, [itemsMap, rootIds])

	return (
		<div>
			<FixedSizeList
				itemData={itemData}
				itemKey={itemKey}
				height={500}
				itemCount={itemData.length}
				itemSize={28}
				width="100%"
			>
				{DirectoryItem}
			</FixedSizeList>
		</div>
	)
}

export default App
