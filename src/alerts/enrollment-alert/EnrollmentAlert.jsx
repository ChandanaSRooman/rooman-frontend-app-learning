import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Alert, Button } from '@openedx/paragon';
import { Info, WarningFilled } from '@openedx/paragon/icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useModel } from '../../generic/model-store';

import messages from './messages';
import useEnrollClickHandler, { usePayNowClickHandler } from './clickHook';

const EnrollmentAlert = ({ payload }) => {
  const intl = useIntl();
  const {
    canEnroll,
    isPaidCourse,
    courseId,
    extraText,
    isStaff,
  } = payload;

  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const { enrollClickHandler, loading: enrollLoading } = useEnrollClickHandler(
    courseId,
    org,
    intl.formatMessage(messages.success),
  );
  const { payNowClickHandler, loading: payLoading } = usePayNowClickHandler(courseId);

  const loading = enrollLoading || payLoading;

  let text = intl.formatMessage(messages.alert);
  let type = 'warning';
  let icon = WarningFilled;
  if (isStaff) {
    text = intl.formatMessage(messages.staffAlert);
    type = 'info';
    icon = Info;
  } else if (extraText) {
    text = `${text} ${extraText}`;
  }

  // Paid course: canEnroll is false because no-id-professional can't be self-enrolled.
  // Only show "Pay Now" when there is no extra restriction text — extraText being
  // set means the course enrollment period ended / not yet open / etc. (not a
  // payment gate), and clicking Pay Now would just return "Not a paid course".
  const payNowButton = !isStaff && isPaidCourse && !extraText && (
    <Button
      disabled={loading}
      variant="brand"
      className="ml-2"
      size="sm"
      onClick={payNowClickHandler}
    >
      {intl.formatMessage(messages.payNowEnroll)}
      {payLoading && <FontAwesomeIcon icon={faSpinner} spin className="ml-1" />}
    </Button>
  );

  const enrollButton = canEnroll && (
    <Button disabled={loading} variant="link" className="p-0 border-0 align-top mx-1" size="sm" style={{ textDecoration: 'underline' }} onClick={enrollClickHandler}>
      {intl.formatMessage(messages.enrollNowSentence)}
      {enrollLoading && <FontAwesomeIcon icon={faSpinner} spin className="ml-1" />}
    </Button>
  );

  return (
    <Alert variant={type} icon={icon}>
      <div className="d-flex align-items-center flex-wrap" style={{ gap: '0.5rem' }}>
        <span>{text}</span>
        {enrollButton}
        {payNowButton}
      </div>
    </Alert>
  );
};

EnrollmentAlert.propTypes = {
  payload: PropTypes.shape({
    canEnroll: PropTypes.bool,
    isPaidCourse: PropTypes.bool,
    courseId: PropTypes.string,
    extraText: PropTypes.string,
    isStaff: PropTypes.bool,
  }).isRequired,
};

export default EnrollmentAlert;
