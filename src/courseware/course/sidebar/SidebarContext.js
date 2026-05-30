import React from 'react';

const SidebarContext = React.createContext({
  toggleSidebar: () => {},
  currentSidebar: null,
  isOpenSidebar: false,
  initialSidebar: null,
  closeRightPanel: () => {},
  shouldDisplayFullScreen: false,
});

export default SidebarContext;
