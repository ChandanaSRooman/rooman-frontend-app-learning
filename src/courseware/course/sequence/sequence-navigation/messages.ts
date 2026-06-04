import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  nextButton: {
    id: 'learn.sequence.navigation.next.button',
    defaultMessage: 'Next',
    description: 'Button to advance to the next section',
  },
  nextUpButton: {
    id: 'learn.sequence.navigation.next.up.button',
    defaultMessage: 'Next Up: {title}',
    description: 'Button to advance to the next section, with title',
  },
  previousButton: {
    id: 'learn.sequence.navigation.previous.button',
    defaultMessage: 'Previous',
    description: 'Button to return to the previous section',
  },
  finishCourseButton: {
    id: 'learn.sequence.navigation.finish.button',
    defaultMessage: 'Finish Course',
    description: 'Button shown at the last unit to navigate to the certificate page',
  },
});

export default messages;
