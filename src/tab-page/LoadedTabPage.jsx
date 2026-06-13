import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { getConfig } from '@edx/frontend-platform';
import { useToggle } from '@openedx/paragon';

import { CourseTabsNavigation } from '../course-tabs';
import { useModel } from '../generic/model-store';
import { AlertList } from '../generic/user-messages';
import StreakModal from '../shared/streak-celebration';
import InstructorToolbar from '../instructor-toolbar';
import useEnrollmentAlert from '../alerts/enrollment-alert';
import useLogistrationAlert from '../alerts/logistration-alert';

import ProductTours from '../product-tours/ProductTours';

const LoadedTabPage = ({
  activeTabSlug,
  children,
  courseId,
  metadataModel,
  unitId,
}) => {
  const {
    celebrations,
    org,
    originalUserIsStaff,
    tabs,
    title,
    verifiedMode,
    hasCourseAuthorAccess,
  } = useModel('courseHomeMeta', courseId);

  // Logistration and enrollment alerts are only really used for the outline tab, but loaded here to put them above
  // breadcrumbs when they are visible.
  const logistrationAlert = useLogistrationAlert(courseId);
  const enrollmentAlert = useEnrollmentAlert(courseId);

  const activeTab = tabs.filter(tab => tab.slug === activeTabSlug)[0];

  // Inject course tabs into the header via React Portal.
  // A portal target <div> is created once inside the header container; React then manages
  // the tab list content (proper lifecycle, no innerHTML cloning, no duplicate IDs).
  const [headerTabsTarget, setHeaderTabsTarget] = useState(null);
  useEffect(() => {
    let slot = null;
    let tries = 0;

    const tryMount = () => {
      const existing = document.getElementById('rooman-header-tabs');
      if (existing) {
        setHeaderTabsTarget(existing);
        return true;
      }
      const headerEl = document.querySelector('header.learning-header .container-xl');
      if (!headerEl) {
        return false;
      }
      slot = document.createElement('div');
      slot.id = 'rooman-header-tabs';
      const lockup = headerEl.querySelector('.course-title-lockup');
      headerEl.insertBefore(slot, lockup ? lockup.nextSibling : null);
      setHeaderTabsTarget(slot);
      return true;
    };

    const interval = setInterval(() => {
      if (tryMount() || ++tries > 30) { clearInterval(interval); }
    }, 200);

    return () => {
      clearInterval(interval);
      if (slot) { slot.remove(); }
      setHeaderTabsTarget(null);
    };
  }, []);

  const streakLengthToCelebrate = celebrations && celebrations.streakLengthToCelebrate;
  const streakDiscountCouponEnabled = celebrations && celebrations.streakDiscountEnabled && verifiedMode;
  const [isStreakCelebrationOpen,, closeStreakCelebration] = useToggle(streakLengthToCelebrate);

  return (
    <>
      {headerTabsTarget && createPortal(
        <ul className="nav-underline-tabs" role="tablist" aria-label="Course navigation">
          {tabs.map(({ url, title: tabTitle, slug }) => (
            <li key={slug} className="nav-item flex-shrink-0">
              <a href={url} className={`nav-link${slug === activeTabSlug ? ' active' : ''}`}>
                {tabTitle}
              </a>
            </li>
          ))}
        </ul>,
        headerTabsTarget,
      )}
      <ProductTours
        activeTab={activeTabSlug}
        courseId={courseId}
        isStreakCelebrationOpen={isStreakCelebrationOpen}
        org={org}
      />
      <Helmet>
        <title>{`${activeTab ? `${activeTab.title} | ` : ''}${title} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      {originalUserIsStaff && (
        <InstructorToolbar
          courseId={courseId}
          unitId={unitId}
          tab={activeTabSlug}
          isStudioButtonVisible={hasCourseAuthorAccess}
        />
      )}
      <StreakModal
        courseId={courseId}
        metadataModel={metadataModel}
        streakLengthToCelebrate={streakLengthToCelebrate}
        isStreakCelebrationOpen={!!isStreakCelebrationOpen}
        closeStreakCelebration={closeStreakCelebration}
        streakDiscountCouponEnabled={streakDiscountCouponEnabled}
        verifiedMode={verifiedMode}
      />
      <main className="d-flex flex-column flex-grow-1">
        <AlertList
          topic="outline"
          className="mx-5 mt-3"
          customAlerts={{
            ...enrollmentAlert,
            ...logistrationAlert,
          }}
        />
        <CourseTabsNavigation tabs={tabs} className="mb-3" activeTabSlug={activeTabSlug} courseId={courseId} />
        <div id="main-content" className="container-xl">
          {children}
        </div>
      </main>
    </>
  );
};

LoadedTabPage.propTypes = {
  activeTabSlug: PropTypes.string.isRequired,
  children: PropTypes.node,
  courseId: PropTypes.string.isRequired,
  metadataModel: PropTypes.string,
  unitId: PropTypes.string,
};

LoadedTabPage.defaultProps = {
  children: null,
  metadataModel: 'courseHomeMeta',
  unitId: null,
};

export default LoadedTabPage;
