/* Renders a CV content object into (a) print HTML and (b) plain text.
 *
 * The HTML is deliberately boring: one column, DOM order == reading order,
 * real heading elements, no positioning tricks. See cv/README.md for why.
 */

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const SEP = " · ";

/* ------------------------------------------------------------------ HTML */

export function renderHtml(c) {
  const links = c.contact.links
    .map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`)
    .join(SEP);

  const skills = c.skillGroups
    .map(
      (g) =>
        `      <li><strong>${esc(g.label)}:</strong> ${esc(g.items.join(", "))}</li>`
    )
    .join("\n");

  const experience = c.experience
    .map(
      (j) => `    <article class="entry">
      <h3>${esc(j.title)}</h3>
      <p class="meta">${esc([j.org, j.location, j.dates].filter(Boolean).join(SEP))}</p>
      <ul class="bullets">
${j.bullets.map((b) => `        <li>${esc(b)}</li>`).join("\n")}
      </ul>
    </article>`
    )
    .join("\n");

  const projects = c.projects
    .map(
      (p) => `    <article class="entry">
      <h3>${esc(p.title)}</h3>
      <p class="meta">${esc(p.tech.join(", "))}</p>
      <p>${esc(p.line)}</p>
    </article>`
    )
    .join("\n");

  const education = c.education
    .map(
      (e) => `    <article class="entry">
      <h3>${esc(e.degree)}</h3>
      <p class="meta">${esc([e.org, e.dates].filter(Boolean).join(SEP))}</p>${
        e.note ? `\n      <p>${esc(e.note)}</p>` : ""
      }
    </article>`
    )
    .join("\n");

  const certifications = (c.certifications || [])
    .map(
      (x) =>
        `      <li><strong>${esc(x.name)}</strong>${esc(
          [x.issuer, x.date].filter(Boolean).length
            ? SEP + [x.issuer, x.date].filter(Boolean).join(SEP)
            : ""
        )}</li>`
    )
    .join("\n");

  const languages = c.languages
    .map((l) => `${esc(l.name)} (${esc(l.level)})`)
    .join(SEP);

  return `<!doctype html>
<html lang="${esc(c.lang)}">
<head>
  <meta charset="utf-8">
  <title>${esc(c.docTitle)}</title>
  <link rel="stylesheet" href="cv.css">
</head>
<body>

  <header class="cv-head">
    <h1 class="name">${esc(c.name)}</h1>
    <p class="role">${esc(c.role)}</p>
    <p class="contact"><a href="mailto:${esc(c.contact.email)}">${esc(
    c.contact.email
  )}</a>${SEP}<a href="tel:${esc(
    c.contact.phone.replace(/\s+/g, "")
  )}">${esc(c.contact.phone)}</a>${SEP}${esc(c.contact.location)}</p>
    <p class="contact">${links}</p>
  </header>

  <section class="sec">
    <h2>${esc(c.headings.summary)}</h2>
    <p class="summary">${esc(c.summary)}</p>
  </section>

  <section class="sec">
    <h2>${esc(c.headings.experience)}</h2>
${experience}
  </section>

  <section class="sec">
    <h2>${esc(c.headings.skills)}</h2>
    <ul class="skill-groups">
${skills}
    </ul>
  </section>

  <section class="sec">
    <h2>${esc(c.headings.projects)}</h2>
${projects}
  </section>

  <section class="sec">
    <h2>${esc(c.headings.education)}</h2>
${education}
  </section>

  <section class="sec">
    <h2>${esc(c.headings.certifications)}</h2>
    <ul class="cert-list">
${certifications}
    </ul>
  </section>

  <section class="sec">
    <h2>${esc(c.headings.languages)}</h2>
    <p>${languages}</p>
  </section>

</body>
</html>
`;
}

/* ------------------------------------------------------------------ text */

export function renderText(c) {
  const out = [];
  const rule = (s) => out.push("", s.toUpperCase(), "-".repeat(s.length));

  out.push(c.name, c.role, "");
  out.push([c.contact.email, c.contact.phone, c.contact.location].join(SEP));
  out.push(c.contact.links.map((l) => l.label).join(SEP));

  rule(c.headings.summary);
  out.push(c.summary);

  rule(c.headings.experience);
  for (const j of c.experience) {
    out.push("", j.title);
    out.push([j.org, j.location, j.dates].filter(Boolean).join(SEP));
    for (const b of j.bullets) out.push(`  - ${b}`);
  }

  rule(c.headings.skills);
  for (const g of c.skillGroups) out.push(`${g.label}: ${g.items.join(", ")}`);

  rule(c.headings.projects);
  for (const p of c.projects) {
    out.push("", p.title);
    out.push(p.tech.join(", "));
    out.push(p.line);
  }

  rule(c.headings.education);
  for (const e of c.education) {
    out.push("", e.degree);
    out.push([e.org, e.dates].filter(Boolean).join(SEP));
    if (e.note) out.push(e.note);
  }

  rule(c.headings.certifications);
  for (const x of c.certifications || []) {
    out.push([x.name, x.issuer, x.date].filter(Boolean).join(SEP));
  }

  rule(c.headings.languages);
  out.push(c.languages.map((l) => `${l.name} (${l.level})`).join(SEP));

  return out.join("\n") + "\n";
}
