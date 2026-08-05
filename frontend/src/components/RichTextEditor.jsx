import ReactQuill from 'react-quill-new'

const RichTextEditor = ({ value, onChange }) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder="Write note details or technical logs here..."
    />
  )
}

export default RichTextEditor