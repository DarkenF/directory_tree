import './App.css'
import {DirectoryItem} from "./components/DirectoryItem/DirectoryItem";
import {DirectoryElement} from "./store/store";


function App() {
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

  return (
		<div>
			{initialDirectories.map(item => {
				return (
					<DirectoryItem key={item.id} directory={item} />
				)
			})}
		</div>
  )
}

export default App
