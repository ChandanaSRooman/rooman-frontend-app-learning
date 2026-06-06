import { useContext, useState, useCallback } from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { UserMessagesContext, ALERT_TYPES } from '../../generic/user-messages';

import { postCourseEnrollment, postPayNow } from './data/api';

// Separated into its own file to avoid a circular dependency inside this directory

function useEnrollClickHandler(courseId, orgId, successText) {
  const [loading, setLoading] = useState(false);
  const { addFlash } = useContext(UserMessagesContext);
  const enrollClickHandler = useCallback(() => {
    setLoading(true);
    postCourseEnrollment(courseId).then(() => {
      addFlash({
        dismissible: true,
        flash: true,
        text: successText,
        type: ALERT_TYPES.SUCCESS,
        topic: 'course',
      });
      setLoading(false);
      sendTrackEvent('edx.bi.user.course-home.enrollment', {
        org_key: orgId,
        courserun_key: courseId,
      });
      global.location.reload();
    });
  }, [addFlash, courseId, orgId, successText]);

  return { enrollClickHandler, loading };
}

export function usePayNowClickHandler(courseId) {
  const [loading, setLoading] = useState(false);
  const { addFlash } = useContext(UserMessagesContext);
  const payNowClickHandler = useCallback(() => {
    setLoading(true);
    postPayNow(courseId)
      .then(() => { global.location.reload(); })
      .catch(() => {
        setLoading(false);
        addFlash({
          dismissible: true,
          flash: true,
          text: 'Enrollment failed. Please try again.',
          type: ALERT_TYPES.ERROR,
          topic: 'course',
        });
      });
  }, [courseId, addFlash]);

  return { payNowClickHandler, loading };
}

export default useEnrollClickHandler;
