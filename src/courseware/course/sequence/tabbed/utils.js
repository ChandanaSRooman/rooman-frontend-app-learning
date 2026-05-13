/**
 * Smart-tabs detection for Rooman-authored courses.
 *
 * The Syllabus Agent (`olx.py`) emits Units with conventional title prefixes:
 *   - "Notes — {session title}"
 *   - "Overview — {session title}"        (fallback when notes weren't generated)
 *   - "Lab — {lab title}"
 *   - "Quiz — {session title}"
 *   - "Reflection — {session title}"
 *   - "Final exam — Multiple choice" / "Final exam — Short answer"
 *
 * If a Sequential's units match the convention we render them as TABS of one
 * page. Otherwise we fall through to the default linear-page renderer so any
 * hand-authored Studio courses keep their existing behaviour.
 *
 * NOTE: keep the prefix list in sync with the Syllabus Agent's `olx.py`. The
 * em-dash character is U+2014 (—), not a hyphen.
 */

// Order matters: longest/most specific prefixes first.
export const TAB_PREFIXES = [
  { prefix: 'Final exam — ', label: 'Exam' },
  { prefix: 'Notes — ',      label: 'Content' },
  { prefix: 'Overview — ',   label: 'Overview' },
  { prefix: 'Lab — ',        label: 'Lab' },
  { prefix: 'Quiz — ',       label: 'Practice' },
  { prefix: 'Reflection — ', label: 'Reflection' },
];

const MIN_MATCHES_TO_TAB = 2;

export function matchTabPrefix(title) {
  if (!title) return null;
  return TAB_PREFIXES.find(({ prefix }) => title.startsWith(prefix)) || null;
}

export function tabLabelFor(title) {
  const m = matchTabPrefix(title);
  return m ? m.label : title;
}

/**
 * Decide whether a sequential should render as tabs.
 * Returns true when at least MIN_MATCHES_TO_TAB units match the convention.
 *
 * @param {Array<{title: string}>} units
 */
export function shouldUseTabs(units) {
  if (!Array.isArray(units) || units.length < MIN_MATCHES_TO_TAB) return false;
  const matched = units.filter(u => matchTabPrefix(u.title || u.displayName));
  return matched.length >= MIN_MATCHES_TO_TAB;
}

/**
 * Build the tab metadata array used by <TabbedSequence/>.
 *
 * @param {Array<{id, title}>} units
 * @returns {Array<{id, label, originalTitle, isMatched}>}
 */
export function buildTabs(units) {
  return units.map(u => {
    const title = u.title || u.displayName || '';
    const m = matchTabPrefix(title);
    return {
      id: u.id,
      label: m ? m.label : title,
      originalTitle: title,
      isMatched: !!m,
    };
  });
}
