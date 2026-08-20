import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import api from '../services/api';



jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));



jest.mock('../services/api', () => ({
  get: jest.fn(),
  delete: jest.fn(),
}));



jest.mock('../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../components/JsonExportImport', () => () => <div data-testid="json-export-import">JsonExportImport</div>);

const renderComponent = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

describe('Dashboard Component Tests', () => {
  const mockNotes = [
    { _id: '1', title: 'First Note', content: 'Test Content 1', createdAt: '2026-01-01' },
    { _id: '2', title: 'Second Note', content: 'Test Content 2', createdAt: '2026-01-01' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'fake-jwt-token');
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    
 
    jest.spyOn(console, 'error').mockImplementation(() => {});

    api.get.mockResolvedValue({ data: mockNotes });
    api.delete.mockResolvedValue({ data: { message: 'Note deleted' } });
  });

  test('1. Renders Dashboard and loads notes', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });
  });

  test('2. Handles API fetch error gracefully', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error'));
    renderComponent();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/notes');
    });
  });

  test('3. Filters notes based on search query', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
    fireEvent.change(searchInput, { target: { value: 'Second' } });

    expect(screen.getByText('Second Note')).toBeInTheDocument();
    expect(screen.queryByText('First Note')).not.toBeInTheDocument();
  });

  test('4. Changes sort filter selection', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/sort notes/i);
    fireEvent.change(sortSelect, { target: { value: 'a-z' } });

    expect(sortSelect.value).toBe('a-z');
  });

  test('5. Resets search and filters when Reset button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
    fireEvent.change(searchInput, { target: { value: 'Second' } });

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(searchInput.value).toBe('');
    expect(screen.getByText('First Note')).toBeInTheDocument();
  });

  test('6. Deletes note with confirmation modal and API call', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const deleteButtons = await screen.findAllByTitle('Delete Note');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/notes/1');
    });
  });
});