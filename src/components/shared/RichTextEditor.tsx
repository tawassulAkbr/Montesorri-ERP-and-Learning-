import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: number;
}

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value, onChange, readOnly = false, placeholder = 'Write something...', minHeight = 150,
}) => {
  if (readOnly) {
    return (
      <div
        className="ql-container ql-snow border-0"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}
      >
        <div
          className="ql-editor"
          style={{ padding: 0, minHeight: 'auto' }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    );
  }

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      modules={{ toolbar: TOOLBAR }}
      style={{ minHeight }}
    />
  );
};
