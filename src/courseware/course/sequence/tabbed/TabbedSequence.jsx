/**
 * TabbedSequence — replaces the default per-Unit linear page flow with a
 * single tabbed page when the units match the Rooman convention.
 *
 * Drop-in: pass it the same data the standard Sequence resolves
 * (units list with titles + an active unit id) plus a `renderUnit(unitId)`
 * function that produces the actual <Unit/> contents. The host Sequence
 * component should decide whether to mount this or the default linear flow
 * via `shouldUseTabs(units)`.
 */
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';

import { buildTabs } from './utils';

import './TabbedSequence.scss';

export default function TabbedSequence({
  units,
  activeUnitId,
  onUnitChange,
  renderUnit,
  sequenceTitle,
}) {
  const tabs = useMemo(() => buildTabs(units), [units]);

  const initialIdx = Math.max(
    0,
    tabs.findIndex(t => t.id === activeUnitId),
  );
  const [activeIdx, setActiveIdx] = useState(initialIdx);

  // Keep tab in sync if parent route changes the active unit (deep link, prev/next button)
  useEffect(() => {
    const idx = tabs.findIndex(t => t.id === activeUnitId);
    if (idx >= 0 && idx !== activeIdx) setActiveIdx(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUnitId]);

  const handleTabClick = (idx) => {
    setActiveIdx(idx);
    if (typeof onUnitChange === 'function') onUnitChange(tabs[idx].id);
  };

  const handleKeyDown = (e) => {
    // Left/Right arrow keys navigate tabs (a11y best practice)
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleTabClick((activeIdx + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleTabClick((activeIdx - 1 + tabs.length) % tabs.length);
    }
  };

  const active = tabs[activeIdx] || tabs[0];
  if (!active) return null;

  return (
    <div className="rooman-tabbed-sequence" data-sequence-title={sequenceTitle || ''}>
      {sequenceTitle ? (
        <header className="rts-header">
          <span className="rts-eyebrow">Session</span>
          <h2 className="rts-title">{sequenceTitle}</h2>
        </header>
      ) : null}

      <div
        role="tablist"
        aria-label="Lesson sections"
        className="rts-tabbar"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((t, i) => {
          const selected = i === activeIdx;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              tabIndex={selected ? 0 : -1}
              aria-selected={selected}
              aria-controls={`rts-panel-${t.id}`}
              id={`rts-tab-${t.id}`}
              className={classNames('rts-tab', { active: selected })}
              onClick={() => handleTabClick(i)}
              title={t.originalTitle}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`rts-panel-${active.id}`}
        aria-labelledby={`rts-tab-${active.id}`}
        className="rts-panel"
        key={active.id /* force remount on tab change so iframes refresh */}
      >
        {renderUnit(active.id, active)}
      </div>
    </div>
  );
}
