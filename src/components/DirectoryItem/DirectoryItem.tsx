import {useState} from "react";
import {DirectoryElement, DirectoryItemsMap, useDirectoryStore} from "../../store/store";
import {clsx} from "clsx";

import styles from './DirectoyItem.module.scss'
import {fetchDirectoryItemsApi} from "../../api/directory";
import {useShallow} from "zustand/react/shallow";

interface AdditionalData {
	level: number
}

export const DirectoryItem = (props: { data: (DirectoryElement & AdditionalData)[], index: number }) => {
	const {data, index} = props;

	const directory = data[index]
	const isOpen = directory.open
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [setDirectoryData, setChildrenIds, setDirectoryOpen] = useDirectoryStore(useShallow((state) => [state.setDirectoryData, state.setChildrenIds, state.setDirectoryOpen] as const));

	const toggleOpen = async (id: string) => {
		if (directory.hasChildren && !isOpen) {
			setIsLoading(true)
			const data = await fetchDirectoryItemsApi(id)
			const itemsMap = data.reduce((acc, item) => {
				acc[item.id] = item

				return acc
			}, {} as DirectoryItemsMap)

			setDirectoryData([], itemsMap)

			const ids = Object.keys(itemsMap)
			setChildrenIds(directory.id, ids)

			setIsLoading(false)
		}
		setDirectoryOpen(directory.id, !isOpen);
	};

	const renderArrow = () => {
		return <span className={clsx(isOpen && styles.arrowOpen)}>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <polygon points="12 17.414 3.293 8.707 4.707 7.293 12 14.586 19.293 7.293 20.707 8.707 12 17.414"/>
			</svg>
		</span>;
	}

	return (
		<div className={styles.directoryItem}>
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-static-element-interactions */}
			<div
				style={{
					minHeight: '28px',
					lineHeight: '28px',
					paddingLeft: `${directory.level * 20}px`
				}}
				onClick={() => toggleOpen(directory.id)}
			>
				{directory.hasChildren ? renderArrow() : <span style={{marginRight: '3px'}}>----</span>}
				{directory.title}
			</div>
			{isLoading && (<div>Loading...</div>)}
		</div>
	)
}