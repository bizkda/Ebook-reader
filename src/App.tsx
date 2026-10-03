// src/App.tsx
import { ReaderView } from './views/Reader/ReaderView';
import { Library} from './views/Library/Library';
import { useLibraryViewModel } from './viewmodels/useLibraryViewModel';
import './App.css';


function App() {
  const library = useLibraryViewModel();

  if (library.activeBook) {
    return <ReaderView book={library.activeBook} onClose={library.closeBook} />;
  }

  return <Library library={library} />;
}

export default App;