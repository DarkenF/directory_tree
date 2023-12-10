import {useState} from "react";
import {fetchDirectoryItemsByParentIdApi} from "../../api/directory";
import {DirectoryElement, useDirectoryStore} from "../../store/store";
import {useShallow} from "zustand/react/shallow";
import {clsx} from "clsx";

import styles from './DirectoyItem.module.scss'

export const DirectoryItem = ({directory}: {directory:DirectoryElement}) => {
	const [open, setOpen] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [directories, setDirectory] = useDirectoryStore(useShallow((state) => [state.directories, state.setDirectory] as const));
	const children = directories[directory.id] || [];

	const toggleOpen = async (id: string) => {
		if (directory.hasChildren && !children.length && !open) {
			setIsLoading(true)
			const data = await fetchDirectoryItemsByParentIdApi(id)

			console.log(data)

			setDirectory(id, data)
			setIsLoading(false)
		}
		setOpen(!open);

	};

	const renderArrow = () => {
		return <span className={clsx(open && styles.arrowOpen)}>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <polygon points="12 17.414 3.293 8.707 4.707 7.293 12 14.586 19.293 7.293 20.707 8.707 12 17.414"/>
			</svg>
		</span>;
	}

	return (
		<div className={styles.directoryItem}>
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-static-element-interactions */}
			<div onClick={() => toggleOpen(directory.id)}>
				{directory.hasChildren ? renderArrow() : null}
				{directory.title}
			</div>
			{isLoading && (<div>Loading...</div>)}
			{open && children ? (
				<div>
					{children.map((child) => (
						<DirectoryItem key={child.id} directory={child}/>
					))}
				</div>
			) : null}
		</div>
	)
}