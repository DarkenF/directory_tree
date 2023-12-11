import './App.css'
import {DirectoryItem} from "./components/DirectoryItem/DirectoryItem";
import {DirectoryElement} from "./store/store";
import {FixedSizeList} from "react-window";

const initialDirectories: DirectoryElement[] = [
	{
		id: '01',
		title: '1',
		hasChildren: true
	},
	{
		id: '02',
		title: '2',
		hasChildren: true
	},
]

function App() {

	function itemKey(index, data) {
		const item = data[index]

		return item.id;
	}

  return (
		<div>
			<FixedSizeList
				itemData={initialDirectories}
				itemKey={itemKey}
				height={500}
				itemCount={2}
				itemSize={28}
				width="100%"
			>
				{DirectoryItem}
			</FixedSizeList>
		</div>
  )
}

export default App
