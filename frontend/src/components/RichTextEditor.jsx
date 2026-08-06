import { useEffect, useRef } from 'react'
import ReactQuill from 'react-quill-new'

const RichTextEditor = ({ value, onChange,  ariaLabel, id  }) => {

  const quillRef = useRef(null)

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor().root
      editor.setAttribute('aria-label', ariaLabel)
      editor.setAttribute('id', id)
    }
  }, [ariaLabel])



  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder="Write note details or technical logs here..."
    />
  )
}

export default RichTextEditor