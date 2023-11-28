import {useState} from "react";
import {getDirectoryItemsByHashApi} from "../../api/directory";
import {DirectoryElement, useDirectoryStore} from "../../store/store";
import {useShallow} from "zustand/react/shallow";



export const DirectoryItem = ({directory}: {directory:DirectoryElement}) => {
	const [open, setOpen] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [directories, setDirectory] = useDirectoryStore(useShallow((state) => [state.directories, state.setDirectory] as const));
	const children = directories[directory.id] || [];

	const toggleOpen = async (id: string) => {
		if (directory.childrenId && !children.length && !open) {
			setIsLoading(true)
			const data = await getDirectoryItemsByHashApi(id)

			setDirectory(id, data)
			setIsLoading(false)
		}

		setOpen(!open);
	};

	return (
		<li>
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
			<p onClick={() => toggleOpen(directory.id)}>{directory.name}</p>
			{isLoading && (<p>Loading...</p>)}
			{open && children ? (
				<ul>
					{children.map((child) => (
						<DirectoryItem key={child.id} directory={child}/>
					))}
				</ul>
			) : null}
		</li>
	)
}