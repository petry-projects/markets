import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProductForm from '../ProductForm';

const mockOnSubmit = jest.fn();

function renderForm(props = {}) {
  return render(
    <ProductForm mode="create" onSubmit={mockOnSubmit} {...props} />,
  );
}

beforeEach(() => {
  mockOnSubmit.mockClear();
});

describe('ProductForm', () => {
  it('renders create mode heading', () => {
    const { getAllByText } = renderForm();
    // "Add Product" appears in both heading and submit button
    expect(getAllByText('Add Product').length).toBeGreaterThan(0);
  });

  it('renders edit mode heading', () => {
    const { getByText } = renderForm({ mode: 'edit' });
    expect(getByText('Edit Product')).toBeTruthy();
  });

  it('shows validation error for empty product name', async () => {
    const { getByLabelText, getByText } = renderForm();
    const submitButton = getByLabelText('Add product');
    fireEvent.press(submitButton);
    await waitFor(() => {
      expect(getByText('Product name is required')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    const { getByLabelText } = renderForm();
    const nameInput = getByLabelText('Product name');
    fireEvent.changeText(nameInput, 'Tomatoes');

    const categoryInput = getByLabelText('Product category');
    fireEvent.changeText(categoryInput, 'Produce');

    const submitButton = getByLabelText('Add product');
    fireEvent.press(submitButton);

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
    const { getByDisplayValue } = renderForm({
      mode: 'edit',
      initialData: {
        name: 'Existing Product',
        category: 'Dairy',
      },
    });
    expect(getByDisplayValue('Existing Product')).toBeTruthy();
    expect(getByDisplayValue('Dairy')).toBeTruthy();
  });
});
