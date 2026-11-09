export default function SegmentedControl({ label, value, options, onChange, className = "", variant = "default" }) {
  function handleKeyDown(event, index) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % options.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + options.length) % options.length;
    else return;
    event.preventDefault();
    onChange(options[nextIndex].value);
    event.currentTarget.parentElement.querySelectorAll('[role="radio"]')[nextIndex]?.focus();
  }

  return (
    <div className={`tt-segmented ${variant === "primary" ? "is-primary" : ""} ${className}`.trim()} role="radiogroup" aria-label={label}>
      {options.map((option, index) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          key={option.value}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
