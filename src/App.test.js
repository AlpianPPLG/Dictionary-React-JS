import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
describe('App', () => {
  test('renders the app title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Web Kamus Bahasa Inggris/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('toggles dark mode correctly', () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(document.body).not.toHaveClass('dark-mode');
    fireEvent.click(toggleButton);
    expect(document.body).toHaveClass('dark-mode');
    fireEvent.click(toggleButton);
    expect(document.body).not.toHaveClass('dark-mode');
  });

  test('displays alert when search input is empty', () => {
    render(<App />);
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    const alertElement = screen.getByText(/Mohon isi kata yang ingin dicari Atau Isi Dengan Benar/i);
    expect(alertElement).toBeInTheDocument();
  });

  test('fetches and displays word data correctly', async () => {
    const mockData = {
      word: 'test',
      phonetics: [{ audio: 'test.mp3' }],
      meanings: [
        {
          partOfSpeech: 'noun',
          definitions: [
            {
              definition: 'a procedure intended to establish the quality, performance, or reliability of something',
              example: 'a test of the product's ability to withstand heat'
            }
          ]
        }
      ]
    };

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockData)
    });

    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Cari Disini/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    const wordElement = await screen.findByText(/test/i);
    const partOfSpeechElement = await screen.findByText(/noun/i);
    const definitionElement = await screen.findByText(/a procedure intended to establish the quality, performance, or reliability of something/i);
    const exampleElement = await screen.findByText(/a test of the product's ability to withstand heat/i);

    expect(wordElement).toBeInTheDocument();
    expect(partOfSpeechElement).toBeInTheDocument();
    expect(definitionElement).toBeInTheDocument();
    expect(exampleElement).toBeInTheDocument();

    global.fetch.mockRestore();
  });
});
