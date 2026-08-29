/* JXA — extracts a PDF's text layer two different ways, writes JSON to a file.
 *
 *   osascript -l JavaScript cv/extract.js <in.pdf> <out.json>
 *
 * "stream"    — PDFKit's own string, i.e. content-stream order. This is what
 *               extractors that trust the PDF's internal ordering see.
 * "geometric" — characters re-sorted top-to-bottom then left-to-right. This is
 *               what many ATS / pdf-to-text pipelines do instead.
 *
 * If a layout is genuinely single-column the two agree. If it has side-by-side
 * text they diverge, and that divergence is the bug we are testing for.
 */
ObjC.import("Quartz");
ObjC.import("Foundation");

function run(argv) {
  var inPath = argv[0];
  var outPath = argv[1];

  var doc = $.PDFDocument.alloc.initWithURL(
    $.NSURL.fileURLWithPath($(inPath))
  );
  if (doc.isNil()) throw new Error("could not open " + inPath);

  var result = { pages: doc.pageCount, stream: "", geometric: "" };
  var streamParts = [];
  var geomParts = [];

  for (var pi = 0; pi < doc.pageCount; pi++) {
    var page = doc.pageAtIndex(pi);
    streamParts.push(ObjC.unwrap(page.string));

    var n = page.numberOfCharacters;
    var s = ObjC.unwrap(page.string);
    var chars = [];
    for (var i = 0; i < n; i++) {
      var b = page.characterBoundsAtIndex(i);
      // Use origin.y only. PDFKit reports wildly inconsistent glyph *heights*
      // for Chrome-generated PDFs (0.0-8.3pt for characters on the same line),
      // so any midpoint- or top-based clustering tears words apart. origin.y is
      // stable to within ~4pt across a line, well inside the line spacing.
      chars.push({ c: s[i], x: b.origin.x, y: b.origin.y });
    }

    chars.sort(function (a, b) {
      return b.y - a.y;
    });
    var LINE_TOL = 5.0;
    var lines = [];
    var cur = null;
    chars.forEach(function (ch) {
      if (!cur || Math.abs(cur.y - ch.y) > LINE_TOL) {
        cur = { y: ch.y, items: [] };
        lines.push(cur);
      }
      cur.items.push(ch);
    });

    lines.forEach(function (l) {
      l.items.sort(function (a, b) {
        return a.x - b.x;
      });
      var t = l.items
        .map(function (i) {
          return i.c;
        })
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      if (t) geomParts.push(t);
    });
  }

  result.stream = streamParts.join("\n");
  result.geometric = geomParts.join("\n");

  var json = $.NSString.alloc.initWithUTF8String(JSON.stringify(result));
  json.writeToFileAtomicallyEncodingError(
    $(outPath),
    true,
    $.NSUTF8StringEncoding,
    $()
  );
  return "ok";
}
