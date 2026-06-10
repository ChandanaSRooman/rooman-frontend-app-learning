/* eslint-disable import/prefer-default-export */
import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { AppContext } from '@edx/frontend-platform/react';

import { useAlert } from '../../generic/user-messages';
import { useModel } from '../../generic/model-store';
import { getCourseMode } from './data/api';

const EnrollmentAlert = React.lazy(() => import('./EnrollmentAlert'));

export function useEnrollmentAlert(courseId) {
  const { authenticatedUser } = useContext(AppContext);
  const course = useModel('courseHomeMeta', courseId);
  const outline = useModel('outline', courseId);
  const enrolledUser = course && course.isEnrolled !== undefined && course.isEnrolled;
  const privateOutline = outline && outline.courseBlocks && !outline.courseBlocks.courses;
  /**
   * This alert should render if
   *    1. the user is not enrolled,
   *    2. the user is authenticated, AND
   *    3. the course is private.
   */
  const isVisible = !enrolledUser && authenticatedUser !== null && privateOutline;

  const [isPaidCourse, setIsPaidCourse] = useState(false);
  useEffect(() => {
    if (isVisible) {
      getCourseMode(courseId)
        .then(data => setIsPaidCourse(!!data.is_paid_course))
        .catch(() => setIsPaidCourse(false));
    }
  }, [courseId, isVisible]);

  const payload = useMemo(() => ({
    canEnroll: outline && outline.enrollAlert ? outline.enrollAlert.canEnroll : false,
    isPaidCourse,
    courseId,
    extraText: outline && outline.enrollAlert ? outline.enrollAlert.extraText : '',
    isStaff: course && course.isStaff,
  }), [course, courseId, isPaidCourse, outline]);

  useAlert(isVisible, {
    code: 'clientEnrollmentAlert',
    payload,
    topic: 'outline',
  });

  return { clientEnrollmentAlert: EnrollmentAlert };
}
