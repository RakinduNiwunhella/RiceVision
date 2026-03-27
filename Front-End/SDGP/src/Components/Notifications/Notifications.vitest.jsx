import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Notifications from './Notifications';
import * as api from '../../api/api';

// Mock API module
vi.mock('../../api/api', () => ({
  fetchNotifications: vi.fn(),
  fetchNotificationUnreadCount: vi.fn(),
  markNotificationRead: vi.fn(),
}));

describe('Notifications Component', () => {
  const mockNotifications = [
    { id: 1, title: 'Test Alert', message: 'Something happened', is_read: false, created_at: new Date().toISOString() },
    { id: 2, title: 'Read Alert', message: 'Already seen', is_read: true, created_at: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "No notifications" when empty', async () => {
    api.fetchNotifications.mockResolvedValue([]);
    api.fetchNotificationUnreadCount.mockResolvedValue({ unread_count: 0 });

    render(<Notifications />);

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  it('renders a list of notifications', async () => {
    api.fetchNotifications.mockResolvedValue(mockNotifications);
    api.fetchNotificationUnreadCount.mockResolvedValue({ unread_count: 1 });

    render(<Notifications />);

    await waitFor(() => {
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
      expect(screen.getByText('Read Alert')).toBeInTheDocument();
    });
  });

  it('marks a notification as read when clicked', async () => {
    api.fetchNotifications.mockResolvedValue(mockNotifications);
    api.fetchNotificationUnreadCount.mockResolvedValue({ unread_count: 1 });
    api.markNotificationRead.mockResolvedValue({ unread_count: 0 });

    render(<Notifications />);

    await waitFor(() => {
      const unreadItem = screen.getByText('Test Alert');
      fireEvent.click(unreadItem);
    });

    expect(api.markNotificationRead).toHaveBeenCalledWith(1);
  });
});
