import { useContext, useState, useCallback } from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';

import { UserMessagesContext, ALERT_TYPES } from '../../generic/user-messages';

import { postCourseEnrollment, postPayNow } from './data/api';
import messages from './messages';

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
  const intl = useIntl();
  const enrollmentFailedText = intl.formatMessage(messages.enrollmentFailed);
  const [loading, setLoading] = useState(false);
  const { addFlash } = useContext(UserMessagesContext);
  const payNowClickHandler = useCallback(() => {
    setLoading(true);
    sendTrackEvent('edx.bi.course.paynow.clicked', { courserun_key: courseId });
    postPayNow(courseId)
      .then(() => { global.location.reload(); })
      .catch((error) => {
        setLoading(false);
        const errorMsg = error?.response?.data?.error;
        addFlash({
          dismissible: true,
          flash: true,
          text: errorMsg || enrollmentFailedText,
          type: ALERT_TYPES.ERROR,
          topic: 'course',
        });
      });
  }, [courseId, addFlash, enrollmentFailedText]);

  return { payNowClickHandler, loading };
}

export default useEnrollClickHandler;
