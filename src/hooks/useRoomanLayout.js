import { useEffect } from 'react';

function syncHeaderTabs() {
  const original = document.querySelector('#courseTabsNavigation .nav-underline-tabs');
  const headerCont = document.querySelector('header.learning-header .container-xl');
  const headerEl = document.querySelector('header.learning-header');
  if (!original || !headerCont || !headerEl) return false;

  let slot = document.getElementById('rooman-header-tabs');
  if (!slot) {
    slot = document.createElement('div');
    slot.id = 'rooman-header-tabs';
    const lockup = headerCont.querySelector('.course-title-lockup');
    headerCont.insertBefore(slot, lockup ? lockup.nextSibling : null);
  }
  slot.innerHTML = original.outerHTML;

  const triggerVisible = !!document.querySelector('.outline-sidebar-heading-wrapper.collapsed');
  headerEl.classList.toggle('rooman-trigger-open', triggerVisible);
  return true;
}

const useRoomanLayout = () => {
  useEffect(() => {
    let tries = 0;
    const trySync = setInterval(() => {
      if (syncHeaderTabs() || ++tries > 30) clearInterval(trySync);
    }, 200);

    let observer = null;
    const attachObserver = () => {
      const main = document.getElementById('main-content');
      if (main) {
        observer = new MutationObserver(syncHeaderTabs);
        observer.observe(main, { childList: true, subtree: true });
      } else {
        setTimeout(attachObserver, 300);
      }
    };
    attachObserver();

    const handlePopState = () => setTimeout(syncHeaderTabs, 200);
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearInterval(trySync);
      if (observer) observer.disconnect();
      window.removeEventListener('popstate', handlePopState);
      document.getElementById('rooman-header-tabs')?.remove();
      document.querySelector('header.learning-header')?.classList.remove('rooman-trigger-open');
    };
  }, []);
};

export default useRoomanLayout;
