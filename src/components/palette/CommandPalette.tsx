import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useTerminalBus } from "../bus/TerminalBus";
import { useDialogKeys } from "../util/useDialogKeys";
import { useScrollLock } from "../util/useScrollLock";
import { getCVUrl, trackCvDownload } from "@/lib/cv";
import { searchPalette, type PaletteGroup, type PaletteItem } from "./search";
import { usePaletteSources } from "./usePaletteSources";
import { useShortcut } from "./useShortcut";

/**
 * Runs `fn` after React has committed the close.
 *
 * `useDialogKeys` returns focus to whatever opened the dialog when it unmounts,
 * and that focus call would fight anything we do in the same tick — the scroll
 * would be undone, or the terminal input would lose the focus its runner just
 * gave it. Effect cleanups run before the next frame, so one rAF is enough.
 */
const defer = (fn: () => void) => requestAnimationFrame(fn);

/**
 * The ⌘K palette.
 *
 * Mounted once, next to the modal host. The dialog itself is a separate
 * component so that none of its work — reading every project, job and command
 * out of the message catalogue — happens while the palette is closed, which is
 * ~all of the time.
 */
export const CommandPalette = () => {
  const { paletteOpen, openPalette, closePalette } = useTerminalBus();

  useShortcut(() => (paletteOpen ? closePalette() : openPalette()));

  return paletteOpen ? <PaletteDialog onClose={closePalette} /> : null;
};

const PaletteDialog = ({ onClose }: { onClose: () => void }) => {
  const t = useTranslations("palette");
  const nav = useTranslations("nav");
  const terminal = useTranslations("hero.terminal");
  const router = useRouter();
  const bus = useTerminalBus();
  const { sources, email } = usePaletteSources();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const listId = useId();

  const items = useMemo(() => searchPalette(query, sources), [query, sources]);

  useScrollLock(true);
  // Declared before the focus effect below on purpose: this one records the
  // element to hand focus back to, and it must run while that element is still
  // the active one.
  useDialogKeys({ open: true, onClose });

  useEffect(() => setMounted(true), []);

  // Two effects, not one: the input does not exist until `mounted` has flipped
  // and the portal has rendered, so focusing it in the mount effect focuses
  // nothing at all — the palette opens and swallows every keystroke.
  useEffect(() => {
    if (mounted) inputRef.current?.focus();
  }, [mounted]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // A new query is a new list; keeping the old index would leave the highlight
  // on an unrelated row.
  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selected, items]);

  const locale = router.locale || "en";

  const copyEmail = () => {
    // Not awaited: `writeText` rejects (or hangs) whenever the browser dislikes
    // the context — an unfocused document, a denied permission — and the row
    // must never be left stuck on "Copied" because of it.
    navigator.clipboard?.writeText(email).catch(() => {});
    setCopied(true);
    copyTimer.current = setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  const activate = (item: PaletteItem) => {
    const { intent } = item;

    switch (intent.type) {
      case "section":
        onClose();
        defer(() =>
          document.getElementById(intent.id)?.scrollIntoView({ block: "start" })
        );
        break;
      case "job":
        // `intent.key` is the same slug `ExperienceItem` sets as its row's id
        // (see `src/lib/slug.ts`); `#experience` is only a fallback for a key
        // that somehow does not match any row.
        onClose();
        defer(() =>
          (document.getElementById(intent.key) ?? document.getElementById("experience"))
            ?.scrollIntoView({ block: "start" })
        );
        break;
      case "project":
        onClose();
        bus.openProject(intent.key);
        break;
      case "terminal":
        onClose();
        defer(() => bus.run(intent.cmd));
        break;
      case "locale":
        // Same push as nav/LocaleMenu: `scroll: false` keeps Next from jumping
        // mid-page, the explicit scroll puts you at the top of the new language.
        router
          .push("/", "/", { locale: intent.code, scroll: false })
          .then(() => window.scrollTo(0, 0));
        onClose();
        break;
      case "action":
        if (intent.id === "cv") {
          window.open(getCVUrl(locale));
          trackCvDownload(locale);
          onClose();
        } else {
          copyEmail();
        }
        break;
    }
  };

  // No empty-list guard: `searchPalette` never returns an empty list. An empty
  // query is the starter menu, and any other query that matches nothing still
  // gets the "run it in the terminal" row appended.
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelected((i) => (i + 1) % items.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelected((i) => (i - 1 + items.length) % items.length);
        break;
      case "Home":
        event.preventDefault();
        setSelected(0);
        break;
      case "End":
        event.preventDefault();
        setSelected(items.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        activate(items[selected]);
        break;
      case "Tab":
        // The input is the only focusable thing in the panel (the rows are an
        // aria-activedescendant listbox), so Tab has nowhere to go. Escape is
        // the way out, and the footer strip says so.
        event.preventDefault();
        break;
    }
  };

  const optionId = (index: number) => `${listId}-option-${index}`;

  const hintFor = (item: PaletteItem, index: number) => {
    if (copied && item.intent.type === "action" && item.intent.id === "copyEmail") {
      return t("actions.copied");
    }
    if (item.hint) return item.hint;
    if (index !== selected) return "";
    // Terminal-command rows spell out what Enter does — every other group's
    // "↵" already reads as "select" (open a project, jump to a section...).
    return item.group === "commands" && !item.fallback ? "↵ run" : "↵";
  };

  const row = (item: PaletteItem, index: number) => (
    <div
      key={item.id}
      id={optionId(index)}
      role="option"
      aria-selected={index === selected}
      onMouseMove={() => setSelected(index)}
      onClick={() => activate(item)}
      className={`mx-2 flex cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2 text-sm ${
        index === selected ? "bg-accent/10 text-fg" : "text-fg-2"
      }`}
    >
      <span
        className={`truncate ${
          item.group === "commands" && !item.fallback ? "font-mono mono-1" : ""
        }`}
      >
        {item.fallback ? t("runInTerminal", { query: item.label }) : item.label}
      </span>
      <span className="mono-1 shrink-0 font-mono text-[11px] text-fg-3">
        {hintFor(item, index)}
      </span>
    </div>
  );

  // `searchPalette` returns its hits already grouped, with the terminal
  // fallback appended last — that one is rendered on its own so it cannot
  // print a second "Terminal" heading under the actions.
  const last = items[items.length - 1];
  const fallback = last?.fallback ? last : undefined;
  const grouped: { group: PaletteGroup; rows: [PaletteItem, number][] }[] = [];
  items.forEach((item, index) => {
    if (item.fallback) return;
    const current = grouped[grouped.length - 1];
    if (current && current.group === item.group) current.rows.push([item, index]);
    else grouped.push({ group: item.group, rows: [[item, index]] });
  });

  const dialog = (
    <div
      className="fixed inset-0 z-50 bg-canvas/60 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={nav("palette")}
        className="mx-auto mt-[12vh] w-[min(92vw,40rem)] overflow-hidden rounded-xl border border-hairline bg-surface-1 shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_30px_80px_-30px_rgb(0_0_0/0.6)]"
      >
        <div className="flex h-12 items-center gap-3 border-b border-hairline px-4">
          <span aria-hidden className="mono-1 font-mono text-accent">
            ❯
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-activedescendant={optionId(selected)}
            aria-autocomplete="list"
            aria-label={t("placeholder")}
            data-palette-input=""
            autoComplete="off"
            spellCheck={false}
            placeholder={terminal("searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            // 16px below md: anything smaller and iOS zooms the page on focus.
            className="w-full bg-transparent text-base text-fg outline-none placeholder:text-fg-3 md:text-sm"
          />
          <kbd className="mono-1 rounded border border-hairline px-1.5 font-mono text-[10px] text-fg-3">
            esc
          </kbd>
        </div>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={nav("palette")}
          className="max-h-[50vh] overflow-y-auto py-2"
        >
          {grouped.map(({ group, rows }) => (
            <div key={group} role="group" aria-labelledby={`${listId}-${group}`}>
              <div
                id={`${listId}-${group}`}
                className="mono-1 px-4 pb-1 pt-3 font-mono text-[11px] uppercase tracking-widest text-fg-3"
              >
                {t(`groups.${group}`)}
              </div>
              {rows.map(([item, index]) => row(item, index))}
            </div>
          ))}

          {fallback && row(fallback, items.length - 1)}
        </div>

        <div className="mono-1 flex h-8 items-center gap-4 border-t border-hairline px-4 font-mono text-[11px] text-fg-3">
          <span>↑↓ {t("footer.navigate")}</span>
          <span>↵ {t("footer.select")}</span>
          <span>esc {t("footer.close")}</span>
        </div>
      </div>
    </div>
  );

  const root = mounted ? document.getElementById("root") : null;
  return root ? createPortal(dialog, root) : null;
};
