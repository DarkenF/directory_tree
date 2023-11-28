import './App.css'
import {DirectoryItem} from "./components/DirectoryItem/DirectoryItem";
import {DirectoryElement} from "./store/store";


function App() {
	const initialDirectories: DirectoryElement[] = [
		{
			id: '01',
			name: '1',
			childrenId: '1.1'
		},
		{
			id: '02',
			name: '2',
			childrenId: '2.1'
		},
	]

  return (
		<ul>
			{initialDirectories.map(item => {
				return (
					<DirectoryItem key={item.id} directory={item} />
				)
			})}
		</ul>
  )
}

export default App
