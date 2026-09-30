// src/App.tsx
import { ReaderView } from './views/Reader/ReaderView';
import { LibraryView } from './views/Library/LibraryView';
import { useLibraryViewModel } from './viewmodels/useLibraryViewModel';
import './App.css';

function App() {
  const library = useLibraryViewModel();

  if (library.activeBook) {
    return <ReaderView book={library.activeBook} onClose={library.closeBook} />;
  }

  return <LibraryView library={library} />;
}

export default App;