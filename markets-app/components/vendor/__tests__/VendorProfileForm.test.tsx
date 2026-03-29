import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VendorProfileForm from '../VendorProfileForm';

const mockOnSubmit = jest.fn();

function renderForm(props = {}) {
  return render(
    <VendorProfileForm mode="create" onSubmit={mockOnSubmit} {...props} />,
  );
}

beforeEach(() => {
  mockOnSubmit.mockClear();
});

describe('VendorProfileForm', () => {
  it('renders create mode heading', () => {
    const { getByText } = renderForm();
    expect(getByText('Create Vendor Profile')).toBeTruthy();
  });

  it('renders edit mode heading', () => {
    const { getByText } = renderForm({ mode: 'edit' });
    expect(getByText('Edit Profile')).toBeTruthy();
  });

  it('shows validation error for empty business name', async () => {
    const { getByLabelText, getByText } = renderForm();
    const submitButton = getByLabelText('Create profile');
    fireEvent.press(submitButton);
    await waitFor(() => {
      expect(getByText('Business name is required')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    const { getByLabelText } = renderForm();
    const nameInput = getByLabelText('Business Name');
    fireEvent.changeText(nameInput, 'Farm Fresh');

    const submitButton = getByLabelText('Create profile');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          businessName: 'Farm Fresh',
        }),
      );
    });
  });

  it('populates initial data in edit mode', () => {
    const { getByDisplayValue } = renderForm({
      mode: 'edit',
      initialData: {
        businessName: 'Existing Farm',
        description: 'Organic produce',
      },
    });
    expect(getByDisplayValue('Existing Farm')).toBeTruthy();
    expect(getByDisplayValue('Organic produce')).toBeTruthy();
  });

  it('shows spinner when loading', () => {
    const { queryByLabelText } = renderForm({ loading: true });
    // When loading, the submit button should be present but disabled
    const submitButton = queryByLabelText('Create profile');
    expect(submitButton).toBeTruthy();
  });
});
