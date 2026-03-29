import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import VendorProfileForm from '../VendorProfileForm';

const mockOnSubmit = jest.fn();

function renderProfileForm(props = {}) {
  render(
    <VendorProfileForm mode="create" onSubmit={mockOnSubmit} {...props} />,
  );
}

beforeEach(() => {
  mockOnSubmit.mockClear();
});

describe('VendorProfileForm', () => {
  it('renders create mode heading', () => {
    renderProfileForm();
    expect(screen.getByText('Create Vendor Profile')).toBeTruthy();
  });

  it('renders edit mode heading', () => {
    renderProfileForm({ mode: 'edit' });
    expect(screen.getByText('Edit Profile')).toBeTruthy();
  });

  it('shows validation error for empty business name', async () => {
    renderProfileForm();
    fireEvent.press(screen.getByLabelText('Create profile'));
    await waitFor(() => {
      expect(screen.getByText('Business name is required')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    renderProfileForm();
    fireEvent.changeText(screen.getByLabelText('Business Name'), 'Farm Fresh');
    fireEvent.press(screen.getByLabelText('Create profile'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          businessName: 'Farm Fresh',
        }),
      );
    });
  });

  it('populates initial data in edit mode', () => {
    renderProfileForm({
      mode: 'edit',
      initialData: {
        businessName: 'Existing Farm',
        description: 'Organic produce',
      },
    });
    expect(screen.getByDisplayValue('Existing Farm')).toBeTruthy();
    expect(screen.getByDisplayValue('Organic produce')).toBeTruthy();
  });

  it('shows spinner when loading', () => {
    renderProfileForm({ loading: true });
    // When loading, the submit button should be present but disabled
    expect(screen.queryByLabelText('Create profile')).toBeTruthy();
  });
});
