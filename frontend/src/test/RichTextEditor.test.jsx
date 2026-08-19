import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import RichTextEditor from '../components/RichTextEditor'




jest.mock('react-quill-new', () => {
  const React = require('react')
  return React.forwardRef(({ value, onChange, placeholder }, ref) => {
    const mockSetAttribute = jest.fn()

    React.useImperativeHandle(ref, () => ({
      getEditor: () => ({
        root: {
          setAttribute: mockSetAttribute,
        },
      }),
    }))

    return (
      <textarea
        data-testid="quill-editor"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  })
})

describe('RichTextEditor Component', () => {
  test('renders editor with given initial value and placeholder', () => {
    const handleChange = jest.fn()
    render(
      <RichTextEditor
        value="Test content"
        onChange={handleChange}
        ariaLabel="Note Content"
      />
    )

    const editor = screen.getByTestId('quill-editor')
    expect(editor.value).toBe('Test content')
    expect(editor.getAttribute('placeholder')).toBe(
      'Write note details or technical logs here...'
    )
  })

  test('triggers onChange callback when content changes', () => {
    const handleChange = jest.fn()
    render(<RichTextEditor value="" onChange={handleChange} />)

    const editor = screen.getByTestId('quill-editor')
    fireEvent.change(editor, { target: { value: 'New content entered' } })

    expect(handleChange).toHaveBeenCalledWith('New content entered')
  })
})