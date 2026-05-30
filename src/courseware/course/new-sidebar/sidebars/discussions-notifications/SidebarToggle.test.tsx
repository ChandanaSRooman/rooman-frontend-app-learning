/* eslint-disable react/jsx-no-constructed-context-values */
/**
 * Focused unit test for the new sidebar open/close behaviour.
 * Renders the trigger and panel directly inside a stateful context,
 * avoiding the full Course/Sequence render complexity.
 */
import React, { useState } from 'react';

import {
  render, screen, act, fireEvent, waitFor, initializeMockApp, initializeTestStore,
} from '../../../../../setupTest';

import SidebarContext from '../../SidebarContext';
import type { SidebarContextData, SidebarId } from '../../SidebarContext';
import SidebarTriggers from '../../SidebarTriggers';
import DiscussionsNotificationsSidebar from './DiscussionsNotificationsSidebar';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');
jest.mock('@edx/frontend-platform/logging');

const Wrapper = ({ courseId }: { courseId: string }) => {
  const [currentSidebar, setCurrentSidebar] = useState<SidebarId | null>(null);

  const contextValue: SidebarContextData = {
    toggleSidebar: (sidebarId?: SidebarId | null) => setCurrentSidebar(
      (prev) => (prev === sidebarId ? null : (sidebarId ?? null)),
    ),
    currentSidebar,
    isDiscussionbarAvailable: true,
    isNotificationbarAvailable: true,
    notificationStatus: 'active',
    setNotificationStatus: () => {},
    upgradeNotificationCurrentState: 'accessDateView',
    setUpgradeNotificationCurrentState: () => {},
    shouldDisplaySidebarOpen: false,
    shouldDisplayFullScreen: false,
    courseId,
    unitId: 'test-unit-id',
    hideDiscussionbar: false,
    hideNotificationbar: false,
    onNotificationSeen: () => {},
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <SidebarTriggers />
      <DiscussionsNotificationsSidebar />
    </SidebarContext.Provider>
  );
};

describe('DiscussionsNotificationsSidebar toggle', () => {
  let store;
  let courseId: string;

  beforeEach(async () => {
    store = await initializeTestStore();
    courseId = store.getState().courseware.courseId;
  });

  it('opens sidebar on trigger click and hides on second click', async () => {
    render(<Wrapper courseId={courseId} />, { store });

    const btn = await screen.findByRole('button', { name: /Show sidebar tray/i });

    // Panel always in DOM, starts hidden
    expect(screen.getByTestId('sidebar-DISCUSSIONS_NOTIFICATIONS')).toHaveClass('d-none');

    // Open
    await act(async () => { fireEvent.click(btn); });
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-DISCUSSIONS_NOTIFICATIONS')).not.toHaveClass('d-none');
    });

    // Close
    await act(async () => { fireEvent.click(btn); });
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-DISCUSSIONS_NOTIFICATIONS')).toHaveClass('d-none');
    });
  });
});
