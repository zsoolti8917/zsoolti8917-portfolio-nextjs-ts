/**
 * A block-art "V", 7×7 cells of 6px with 2px gaps (54px square).
 *
 * Decorative, so `aria-hidden` — the name beside it is the real content — and
 * hidden below `sm`, where the 54px column would cost the headline a line.
 * Drawn in CSS rather than shipped as an SVG or an image: it is eight
 * background colours, it inherits the accent token, and it costs no request.
 */
const ROWS = [
  "1000001",
  "1000001",
  "1100011",
  "0110110",
  "0011100",
  "0001000",
  "0001000",
];

/**
 * The two ENDS of the glyph — the top of the left arm and the point at the
 * bottom — dropped a step in opacity so the stroke reads as lit rather than
 * flat. Not the grid's corners: the top-right cell is part of the right arm and
 * stays at full accent, and the bottom two corners are empty.
 */
const DIM = new Set(["0-0", "6-3"]);

export const Monogram = () => (
  <div
    aria-hidden
    className="hidden h-fit w-fit shrink-0 grid-cols-7 gap-[2px] sm:grid"
  >
    {ROWS.flatMap((row, y) =>
      row.split("").map((cell, x) => (
        <span
          key={`${y}-${x}`}
          className={`h-1.5 w-1.5 rounded-[1px] ${
            cell === "1" ? (DIM.has(`${y}-${x}`) ? "bg-accent/60" : "bg-accent") : ""
          }`}
        />
      ))
    )}
  </div>
);
