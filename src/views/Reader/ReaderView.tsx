// src/views/Reader/ReaderView.tsx
import { useReaderViewModel } from '../../viewmodels/useReaderViewModel';
import { Book } from '../../services/BookService';

interface ReaderViewProps {
  book: Book;
  onClose: () => void;
}

export function ReaderView({ book, onClose }: ReaderViewProps) {
  const { attachContainer, loading, isPdf, setZoom } = useReaderViewModel(book);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onClose}>← Back</button>
        {isPdf && (
          <>
            <button onClick={() => setZoom(1.0)}>100%</button>
            <button onClick={() => setZoom(1.5)}>150%</button>
            <button onClick={() => setZoom(2.0)}>200%</button>
          </>
        )}
      </div>
      {loading && <div>Loading…</div>}
      <div ref={attachContainer} style={{ flex: 1, overflow: 'hidden' }} />
    </div>
  );
}