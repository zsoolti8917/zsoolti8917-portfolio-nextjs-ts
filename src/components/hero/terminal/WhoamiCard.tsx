import { Fragment } from "react";
import type { Line } from "./model";
import { PILL, Seg, stagger } from "./atoms";
import { Monogram } from "./Monogram";

/**
 * The output of `whoami`, and the first thing anyone sees.
 *
 * It is rendered from ordinary command output — the same `Line[]` the parser
 * produces — so the shell is not decorated with a special case: type `whoami`
 * again and you get the card again. Because the block is pre-run on the server,
 * the name, role, current work, location, year and stack are all in the HTML
 * for a crawler that never runs JavaScript, exactly as the prose band used to be.
 */
export const WhoamiCard = ({
  lines,
  onRun,
  asHeading,
}: {
  lines: Line[];
  onRun: (cmd: string) => void;
  /** Only the first card in the scrollback owns the <h1>. A second one is a <p>. */
  asHeading: boolean;
}) => {
  const name = lines.find((l) => l.kind === "h1")?.segments[0]?.text ?? "";
  const headline = lines.find((l) => l.kind === "headline")?.segments[0]?.text ?? "";
  const rows = lines.filter((l) => l.kind === "kv" || l.kind === "actions");

  const Name = asHeading ? "h1" : "p";

  return (
    <div className="grid gap-x-5 sm:grid-cols-[auto_1fr]">
      <Monogram />

      <div>
        <Name
          data-line
          className="term-line font-mono mono-1 font-extrabold tracking-tight text-fg"
          style={{ ...stagger(0), fontSize: "clamp(1.75rem, 5vw, 3.25rem)", lineHeight: 1.05 }}
        >
          {name}
        </Name>
        <p
          data-line
          className="term-line mt-1 font-mono mono-1 text-[1.05rem] text-fg-2 md:text-xl"
          style={stagger(1)}
        >
          {headline}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[13px] md:text-sm sm:col-span-2">
        {rows.map((row, i) => {
          const hasRun = row.segments.some((s) => s.run);
          return (
            <Fragment key={row.label ?? i}>
              <dt data-line className="term-line min-w-[5ch] text-fg-3" style={stagger(i + 2)}>
                {row.label}
              </dt>
              <dd
                data-line
                className={`term-line text-fg ${
                  row.kind === "actions" ? "flex flex-wrap items-center gap-x-3 gap-y-2" : ""
                }`}
                style={stagger(i + 2)}
              >
                {row.kind === "actions" ? (
                  <ActionsRow row={row} onRun={onRun} />
                ) : (
                  row.segments.map((segment, j) => (
                    <Seg
                      key={j}
                      segment={segment}
                      onRun={onRun}
                      plainClassName={hasRun ? "text-fg-3" : undefined}
                    />
                  ))
                )}
              </dd>
            </Fragment>
          );
        })}
      </dl>
    </div>
  );
};

/** `● open to new roles   [contact]  [cv ↓]` — the only CTAs above the fold. */
const ActionsRow = ({ row, onRun }: { row: Line; onRun: (cmd: string) => void }) => {
  const actions = row.segments.filter((s) => s.run);
  const label = row.segments.filter((s) => !s.run);

  return (
    <>
      {label.map((segment, j) => (
        <span key={j}>
          <span aria-hidden className="text-success">
            ●
          </span>{" "}
          {segment.text}
        </span>
      ))}
      {/* The pills are one wrapping unit. Loose in the row, the narrower `cv ↓`
          dropped to a line of its own under the status text on a 390px screen,
          which read as an afterthought rather than a pair of actions. */}
      <span className="flex flex-nowrap items-center gap-1.5">
        {actions.map((segment, j) => (
          <button
            key={j}
            type="button"
            onClick={() => onRun(segment.run as string)}
            className={PILL}
          >
            {/* The brackets are what the plain-text output says; on screen the
                pill is the bracket. */}
            {segment.text.replace(/^\[(.*)\]$/, "$1")}
          </button>
        ))}
      </span>
    </>
  );
};
