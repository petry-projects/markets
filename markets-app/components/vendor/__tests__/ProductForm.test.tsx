import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ProductForm from '../ProductForm';

const mockOnSubmit = jest.fn();

function renderProductForm(props = {}) {
  render(<ProductForm mode="create" onSubmit={mockOnSubmit} {...props} />);
}

beforeEach(() => {
  mockOnSubmit.mockClear();
});

describe('ProductForm', () => {
  it('renders create mode heading', () => {
    renderProductForm();
    // "Add Product" appears in both heading and submit button
    expect(screen.getAllByText('Add Product').length).toBeGreaterThan(0);
  });

  it('renders edit mode heading', () => {
    renderProductForm({ mode: 'edit' });
    expect(screen.getByText('Edit Product')).toBeTruthy();
  });

  it('shows validation error for empty product name', async () => {
    renderProductForm();
    fireEvent.press(screen.getByLabelText('Add product'));
    await waitFor(() => {
      expect(screen.getByText('Product name is required')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    renderProductForm();
    fireEvent.changeText(screen.getByLabelText('Product name'), 'Tomatoes');
    fireEvent.changeText(screen.getByLabelText('Product category'), 'Produce');
    fireEvent.press(screen.getByLabelText('Add product'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Tomatoes',
          category: 'Produce',
        }),
      );
    });
  });

  it('populates initial data in edit mode', () => {
    renderProductForm({
      mode: 'edit',
      initialData: {
        name: 'Existing Product',
        category: 'Dairy',
      },
    });
    expect(screen.getByDisplayValue('Existing Product')).toBeTruthy();
    expect(screen.getByDisplayValue('Dairy')).toBeTruthy();
  });
});
