import { useEffect, useRef, useState } from "react";

// 8 columns of curated color shades matching the exact design
const PALETTE_COLUMNS = [
  // 1. Yellow
  ["#fff9c4", "#fff59d", "#fff176", "#ffee58", "#ffeb3b", "#fbc02d"],
  // 2. Orange
  ["#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726", "#ff9800", "#f57c00"],
  // 3. Red / Coral
  ["#ffcdd2", "#ef9a9a", "#e57373", "#ef5350", "#f44336", "#e53935"],
  // 4. Pink / Magenta
  ["#f8bbd0", "#f48fb1", "#f06292", "#ec407a", "#e91e63", "#d81b60"],
  // 5. Purple / Violet
  ["#e1bee7", "#ce93d8", "#ba68c8", "#ab47bc", "#9c27b0", "#8e24aa"],
  // 6. Blue
  ["#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5"],
  // 7. Cyan / Sky
  ["#b2ebf2", "#80deea", "#4dd0e1", "#26c6da", "#00bcd4", "#00acc1"],
  // 8. Green
  ["#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a", "#4caf50", "#43a047"],
];

const GRAYSCALE_ROW = [
  "transparent", // None
  "#ffffff",     // White
  "#e5e7eb",     // Light gray
  "#9ca3af",     // Medium gray
  "#4b5563",     // Dark gray
  "#1f2937",     // Charcoal
  "#000000",     // Black
];

function hexToRgb(hex) {
  if (!hex || hex === "transparent") return { r: 255, g: 255, b: 255 };
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 59, g: 130, b: 246 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function RichColorPicker({ value = "#3b82f6", onChange }) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value ? value.replace("#", "") : "3b82f6");
  const [opacity, setOpacity] = useState(100);
  const [shade, setShade] = useState(50);
  const [format, setFormat] = useState("hex"); // "hex" | "rgb"

  const popoverRef = useRef(null);
  const nativeInputRef = useRef(null);

  useEffect(() => {
    if (value) {
      setHexInput(value.replace("#", ""));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  function handleColorSelect(colorHex) {
    if (colorHex === "transparent") {
      onChange("transparent");
      setHexInput("transparent");
      return;
    }
    onChange(colorHex);
    setHexInput(colorHex.replace("#", ""));
    setShade(50);
  }

  function handleHexInputChange(e) {
    const val = e.target.value.replace("#", "");
    setHexInput(val);
    if (/^[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(`#${val}`);
    }
  }

  function handleShadeChange(e) {
    const s = Number(e.target.value);
    setShade(s);
    const { r, g, b } = hexToRgb(value);
    // s: 0 -> white, 50 -> original, 100 -> black
    let newR, newG, newB;
    if (s < 50) {
      const factor = (50 - s) / 50;
      newR = r + (255 - r) * factor;
      newG = g + (255 - g) * factor;
      newB = b + (255 - b) * factor;
    } else {
      const factor = (s - 50) / 50;
      newR = r * (1 - factor);
      newG = g * (1 - factor);
      newB = b * (1 - factor);
    }
    const newHex = rgbToHex(newR, newG, newB);
    onChange(newHex);
    setHexInput(newHex.replace("#", ""));
  }

  function handleOpacityChange(e) {
    const op = Number(e.target.value);
    setOpacity(op);
  }

  function handleNativeColorChange(e) {
    const newHex = e.target.value;
    onChange(newHex);
    setHexInput(newHex.replace("#", ""));
  }

  const isTransparent = value === "transparent";

  return (
    <div className="cal-rich-color-picker-wrap" ref={popoverRef}>
      {/* Trigger Button showing current color swatch */}
      <button
        type="button"
        className={`cal-rich-color-trigger ${open ? "active" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <div
          className="cal-rich-color-trigger-swatch"
          style={{
            backgroundColor: isTransparent ? "#ffffff" : value,
            backgroundImage: isTransparent
              ? "linear-gradient(45deg, transparent 45%, #dc2626 45%, #dc2626 55%, transparent 55%)"
              : undefined,
          }}
        />
        <span className="cal-rich-color-trigger-label">
          {isTransparent ? "Transparent" : value?.toUpperCase() || "#3B82F6"}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Popover Dropdown Card */}
      {open && (
        <div className="cal-rich-color-popover" role="dialog" aria-label="Color Picker">
          {/* 1. Main Palette Grid */}
          <div className="cal-color-grid-container">
            <div className="cal-color-grid">
              {PALETTE_COLUMNS.map((col, colIdx) => (
                <div key={colIdx} className="cal-color-grid-col">
                  {col.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`cal-color-cell ${value?.toLowerCase() === c.toLowerCase() ? "selected" : ""}`}
                      style={{ backgroundColor: c }}
                      onClick={() => handleColorSelect(c)}
                      title={c}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom Row: None, Grayscale, Rainbow */}
            <div className="cal-color-bottom-row">
              {/* None / Transparent */}
              <button
                type="button"
                className={`cal-color-cell cal-color-cell--none ${isTransparent ? "selected" : ""}`}
                onClick={() => handleColorSelect("transparent")}
                title="Transparent"
              >
                <span className="cal-color-none-slash" />
              </button>

              {/* Grayscale Swatches */}
              {GRAYSCALE_ROW.slice(1).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`cal-color-cell ${value?.toLowerCase() === c.toLowerCase() ? "selected" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => handleColorSelect(c)}
                  title={c}
                />
              ))}

              {/* Rainbow Color Wheel Button */}
              <button
                type="button"
                className="cal-color-cell cal-color-cell--rainbow"
                onClick={() => nativeInputRef.current?.click()}
                title="Personnalisé..."
              />
              <input
                ref={nativeInputRef}
                type="color"
                value={isTransparent ? "#3b82f6" : value || "#3b82f6"}
                onChange={handleNativeColorChange}
                style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
              />
            </div>
          </div>

          {/* 2. Shade / Lightness Slider */}
          <div className="cal-color-slider-row">
            <input
              type="range"
              min="0"
              max="100"
              value={shade}
              onChange={handleShadeChange}
              className="cal-color-range cal-color-range--shade"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, ${isTransparent ? "#3b82f6" : value} 50%, #000000 100%)`,
              }}
            />
          </div>

          {/* 3. Opacity / Alpha Slider */}
          <div className="cal-color-slider-row">
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={handleOpacityChange}
              className="cal-color-range cal-color-range--opacity"
            />
          </div>

          {/* 4. Bottom Value Row (Preview box, Hex input, Opacity %, Format toggle) */}
          <div className="cal-color-values-row">
            <div
              className="cal-color-preview-box"
              style={{
                backgroundColor: isTransparent ? "transparent" : value,
                opacity: opacity / 100,
                backgroundImage: isTransparent
                  ? "linear-gradient(45deg, transparent 45%, #dc2626 45%, #dc2626 55%, transparent 55%)"
                  : undefined,
              }}
            />

            <div className="cal-color-hex-field">
              <input
                type="text"
                value={isTransparent ? "transparent" : hexInput}
                onChange={handleHexInputChange}
                maxLength={9}
                placeholder="f3f4f6"
              />
            </div>

            <div className="cal-color-opacity-field">
              <span>{opacity} %</span>
            </div>

            <div
              className="cal-color-format-field"
              onClick={() => setFormat((f) => (f === "hex" ? "rgb" : "hex"))}
            >
              <span>{format}</span>
              <div className="cal-color-format-arrows">
                <svg width="8" height="6" viewBox="0 0 8 6">
                  <path d="M4 0L8 6H0z" fill="currentColor" />
                </svg>
                <svg width="8" height="6" viewBox="0 0 8 6">
                  <path d="M4 6L0 0h8z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
