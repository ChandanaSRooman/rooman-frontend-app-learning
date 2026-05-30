import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useIntl } from '@edx/frontend-platform/i18n';

import { BookmarkButton } from '@src/courseware/course/bookmark';
import messages from '@src/courseware/course/sequence/messages';

const UnitTitleSlot = ({
  unitId,
  unit,
  renderUnitNavigation,
}) => {
  const { formatMessage } = useIntl();
  const isProcessing = unit.bookmarkedUpdateState === 'loading';

  return (
    <PluginSlot
      id="org.openedx.frontend.learning.unit_title.v1"
      idAliases={['unit_title_slot']}
      pluginProps={{
        unitId,
        unit,
        isEnabledOutlineSidebar: true,
        renderUnitNavigation,
      }}
    >
      <div className="rooman-unit-title-row">
        {renderUnitNavigation(false)}
        <div className="mb-0 rooman-unit-title-text">
          <h3 className="h3">{unit.title}</h3>
        </div>
        <BookmarkButton
          unitId={unit.id}
          isBookmarked={unit.bookmarked}
          isProcessing={isProcessing}
        />
      </div>
      <p className="sr-only">{formatMessage(messages.headerPlaceholder)}</p>
    </PluginSlot>
  );
};

UnitTitleSlot.propTypes = {
  unitId: PropTypes.string.isRequired,
  unit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    bookmarked: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    bookmarkedUpdateState: PropTypes.string.isRequired,
  }).isRequired,
  renderUnitNavigation: PropTypes.func.isRequired,
};

export default UnitTitleSlot;
