import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

// Mock fetch globally
const globalFetch = global.fetch = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    // Clear mock before each test
    globalFetch.mockClear();
  });

  it('renders the search form', () => {
    render(<App />);
    expect(screen.getByText('Comment Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search comments (more than 3 characters)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('should not search when input is less than 4 characters', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Search comments (more than 3 characters)');
    
    fireEvent.change(input, { target: { value: 'abc' } });
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('should search when input is 4 or more characters', async () => {
    const mockComments = [
      { id: 1, name: 'Test Name', email: 'test@email.com', body: 'Test comment body' }
    ];
    
    globalFetch.mockResolvedValueOnce({
      json: async () => mockComments
    });

    render(<App />);
    const input = screen.getByPlaceholderText('Search comments (more than 3 characters)');
    
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/comments?q=test'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Test Name')).toBeInTheDocument();
      expect(screen.getByText('test@email.com')).toBeInTheDocument();
      expect(screen.getByText('Test comment body')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching', async () => {
    // Mock fetch to delay response
    globalFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ json: () => Promise.resolve([]) }), 100)
      )
    );

    render(<App />);
    const input = screen.getByPlaceholderText('Search comments (more than 3 characters)');
    
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('should show no results message when search returns empty', async () => {
    globalFetch.mockResolvedValueOnce({
      json: async () => []
    });

    render(<App />);
    const input = screen.getByPlaceholderText('Search comments (more than 3 characters)');
    
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });
}); 