import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Orders header', () => {
  render(<App />);
  const header = screen.getByText(/Order Lifecycle Dashboard/i);
  expect(header).toBeInTheDocument();
});
