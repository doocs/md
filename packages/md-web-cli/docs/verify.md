# The `verify` gate

One command, one meaning:

```bash
pnpm wcli:verify
```

It builds both workspaces itself, captures a fresh Oracle from a real browser,
renders the same fixture through the CLI, and compares the two outputs **byte
for byte with zero tolerance**. Exit code 0 only on exact equality.

There is no tolerance, no allow-list, no known-gaps list, and no expiry
mechanism — by design. See [ADR-0003](../../../docs/adr/0003-single-verify-gate.md)
for why a threshold is worse than a failure.

## Invocation

```bash
pnpm wcli:verify                          # both fixtures
pnpm wcli:verify --fixture full           # product signal only
pnpm wcli:verify --fixture minimal        # infrastructure probe only
pnpm wcli:verify --config export.json     # gate on the config you publish with
pnpm wcli:verify --keep                   # keep the artifacts
pnpm wcli:verify --out-dir /tmp/verify    # keep them somewhere specific
pnpm wcli:verify --self-test              # reverse cases, no browser
```

`--config` accepts an unmodified Designer export (the JSON the web application's
import/export feature produces). It is projected down to render-affecting keys
and the **same projected file** is given to both sides, so a config-driven
difference cannot masquerade as an implementation difference.

- **Kept:** `theme`, `primaryColor`, `fontFamily`, `fontSize`, `isUseIndent`,
  `isUseJustify`, `legend`, `isCiteStatus`, `isCountStatus`, `isMacCodeBlock`,
  `isShowLineNumber`, `codeBlockTheme`, `cssContentConfig`.
- **Dropped:** article content (`posts`, `currentPostId`, `currentPostIndex`,
  `titleList`, `readingTime`) and pure-UI state (panel/dialog visibility, editor
  dark mode, toolbox visibility). An export can never make the gate compare an
  article instead of the fixture.
- **Absent by design:** the five style keys a Designer export cannot carry —
  `lineHeight`, `blockSpacing`, `linkColor`, `blockquoteBackground`,
  `headingStyles`. Each side falls back to its own site defaults, and a unit
  test asserts those defaults agree.
- **Code-block theme:** a CDN URL is passed through unchanged and normalised by
  the CLI to the same theme identity the browser uses. Only the ten vendored
  themes are renderable by the CLI; see [blind-spots.md](./blind-spots.md).

## Fixtures

| Fixture               | Meaning                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `fixtures/full.md`    | Product signal: headings, tables, code blocks, lists, blockquotes, images, links, rules                                               |
| `fixtures/minimal.md` | Infrastructure probe: heading, paragraph, inline code. A failure means the harness is broken; a success proves nothing about fidelity |

Both run by default so one command produces both signals. See
[fixtures/README.md](../fixtures/README.md).

## Reading a failure

```
[verify] FAIL full (product signal): outputs are not byte-identical (oracle 20161 bytes, CLI 17755 bytes, first difference at byte 75)
[verify] a difference here is a product fidelity difference
[verify] difference classes (6 hunks total):
  attribute:class             6 hunks   lines 3, 53, 74, 95, 113, 128
  style:color                 1 hunks   lines 3
  ...
[verify] complete unified diff:
...
[verify] total: 6 hunks across 8 class(es)
[verify] oracle: /tmp/md-verify-XXXX/full/oracle.html
[verify] cli:    /tmp/md-verify-XXXX/full/cli.html
[verify] diff:   /tmp/md-verify-XXXX/full/diff.txt
```

Classes are derived mechanically from what differs — `attribute:<name>`,
`style:<property>`, `text`, `element`, `structure` — so the summary says whether
the failure is a class-attribute difference or a real style drift. A hunk can
belong to more than one class.

Artifacts land in a fresh temporary directory whose path is printed: both
rendered outputs, the unified diff, and a summary report. They are removed at
exit unless `--keep` or `--out-dir` is given. `--out-dir` must be outside the
repository — the Oracle capability refuses to write repo paths, so no
regenerable artifact can be committed.

## Structural assertions

Independent of the byte comparison, the gate fails when the CLI output carries:

- a pending async placeholder — diagram (`data-md-diagram-state="loading"`),
  formula (`.katex-pending`), or unregistered code language
  (`data-language-pending`);
- a `<style>` block, a `class` attribute, or a block-level element without an
  inline style (`tr`/`tbody`/`thead`/`svg` are exempt: WeChat formats them
  structurally).

## Self-test

```bash
pnpm wcli:verify --self-test
```

Corrupts a known-good CLI render seven distinct ways — injected diagram,
formula, and language placeholders, stripped inline styles, a leaked class
attribute, an injected style block, and truncation — and asserts each mutant is
rejected. It launches no browser and builds only the CLI bundle, so it doubles
as the fast suite's proof that the gate can fail.

## Freshness guarantees

- The gate builds both workspaces inside the command. It never compares against
  a previously built bundle, so a changed rendering default cannot pass because
  nobody rebuilt.
- The Oracle is captured on every run into a temporary directory. Nothing that
  the gate compares against is stored between runs, so no baseline can go stale.

## Browser

Playwright Chromium is installed by the workflows. To use a browser that is
already on the machine instead of downloading one, point the executable at it:

```bash
MD_WEB_CLI_CHROMIUM="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  pnpm wcli:verify
```

Where Playwright looks for its browsers can be redirected with
`PLAYWRIGHT_BROWSERS_PATH`. The capture is deterministic and cross-platform:
two Chromium builds on two operating systems produce byte-identical Oracle HTML.

On a developer machine, a missing pinned browser does not block the run: the
gate falls back to an installed Google Chrome, prints which binary it used, and
notes that local and CI results may differ. CI never takes this fallback — a
missing pinned browser is an infrastructure failure there, because the runner
may also happen to have Chrome installed. Set `MD_WEB_CLI_CI=1` to require the
pinned browser locally, or `MD_WEB_CLI_CHROMIUM` to name a binary explicitly.
Detection uses `CI` plus the usual vendor markers, never terminal state; see
`scripts/verify/environment.mjs`.

## Status in CI

- **CI** runs the gate on every push and pull request as a **non-blocking**
  signal, with the browser cached on the Playwright version. A red gate is
  visible in the log and does not fail the job; an infrastructure failure around
  it (the browser download, for instance) still fails CI.
- **Publish** and **upstream sync** run the same command and are **blocking**: a
  red gate publishes nothing and holds the sync pull request.

The gate landed **red on purpose** — the two implementations differ today. The
transition from non-blocking to blocking is an explicit decision, recorded when
it happens. Do not restore a tolerance to make it green; work the differences
off one class at a time. See [ADR-0003](../../../docs/adr/0003-single-verify-gate.md).
