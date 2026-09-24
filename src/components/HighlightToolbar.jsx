import { X } from 'lucide-react';

const HIGHLIGHT_COLORS = [
  { id: 'yellow', color: 'rgba(250, 204, 21, 0.5)', label: 'Yellow' },
  { id: 'green', color: 'rgba(34, 197, 94, 0.45)', label: 'Green' },
  { id: 'blue', color: 'rgba(59, 130, 246, 0.45)', label: 'Blue' },
  { id: 'pink', color: 'rgba(236, 72, 153, 0.45)', label: 'Pink' },
];

function HighlightToolbar({ position, onHighlight, onRemove }) {
  return (
    <div
      className="highlight-toolbar"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {HIGHLIGHT_COLORS.map((c) => (
        <button
          key={c.id}
          className="highlight-color-btn"
          style={{ background: c.color }}
          onClick={() => onHighlight(c.id)}
          title={`Highlight ${c.label}`}
        />
      ))}
      <button
        className="highlight-remove-btn"
        onClick={onRemove}
        title="Remove highlight"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default HighlightToolbar;
