import { LanguageDescription } from '@codemirror/language'

/**
 * Curated fence languages for the Markdown editor.
 * Avoids pulling in the full `@codemirror/language-data` graph (Angular, Vue, Liquid, …).
 * Grammars stay lazy via dynamic `import()`.
 */
export const codeLanguages: LanguageDescription[] = [
  LanguageDescription.of({
    name: `C`,
    extensions: [`c`, `h`],
    load: () => import(`@codemirror/lang-cpp`).then(m => m.cpp()),
  }),
  LanguageDescription.of({
    name: `C++`,
    alias: [`cpp`],
    extensions: [`cpp`, `cc`, `cxx`, `hpp`, `hh`],
    load: () => import(`@codemirror/lang-cpp`).then(m => m.cpp()),
  }),
  LanguageDescription.of({
    name: `CSS`,
    extensions: [`css`],
    load: () => import(`@codemirror/lang-css`).then(m => m.css()),
  }),
  LanguageDescription.of({
    name: `Go`,
    extensions: [`go`],
    load: () => import(`@codemirror/lang-go`).then(m => m.go()),
  }),
  LanguageDescription.of({
    name: `HTML`,
    alias: [`xhtml`],
    extensions: [`html`, `htm`],
    load: () => import(`@codemirror/lang-html`).then(m => m.html()),
  }),
  LanguageDescription.of({
    name: `Java`,
    extensions: [`java`],
    load: () => import(`@codemirror/lang-java`).then(m => m.java()),
  }),
  LanguageDescription.of({
    name: `JavaScript`,
    alias: [`js`, `javascript`, `nodejs`],
    extensions: [`js`, `mjs`, `cjs`],
    load: () => import(`@codemirror/lang-javascript`).then(m => m.javascript()),
  }),
  LanguageDescription.of({
    name: `JSON`,
    alias: [`json5`],
    extensions: [`json`],
    load: () => import(`@codemirror/lang-json`).then(m => m.json()),
  }),
  LanguageDescription.of({
    name: `JSX`,
    extensions: [`jsx`],
    load: () => import(`@codemirror/lang-javascript`).then(m => m.javascript({ jsx: true })),
  }),
  LanguageDescription.of({
    name: `Markdown`,
    alias: [`md`],
    extensions: [`md`, `markdown`],
    load: () => import(`@codemirror/lang-markdown`).then(m => m.markdown()),
  }),
  LanguageDescription.of({
    name: `PHP`,
    extensions: [`php`, `php3`, `php4`, `php5`, `php7`, `phtml`],
    load: () => import(`@codemirror/lang-php`).then(m => m.php()),
  }),
  LanguageDescription.of({
    name: `Python`,
    alias: [`py`],
    extensions: [`py`, `pyw`],
    load: () => import(`@codemirror/lang-python`).then(m => m.python()),
  }),
  LanguageDescription.of({
    name: `Rust`,
    alias: [`rs`],
    extensions: [`rs`],
    load: () => import(`@codemirror/lang-rust`).then(m => m.rust()),
  }),
  LanguageDescription.of({
    name: `SQL`,
    extensions: [`sql`],
    load: () => import(`@codemirror/lang-sql`).then(m => m.sql()),
  }),
  LanguageDescription.of({
    name: `TSX`,
    extensions: [`tsx`],
    load: () => import(`@codemirror/lang-javascript`).then(m => m.javascript({ jsx: true, typescript: true })),
  }),
  LanguageDescription.of({
    name: `TypeScript`,
    alias: [`ts`],
    extensions: [`ts`, `mts`, `cts`],
    load: () => import(`@codemirror/lang-javascript`).then(m => m.javascript({ typescript: true })),
  }),
  LanguageDescription.of({
    name: `XML`,
    alias: [`rss`, `wsdl`, `xsd`],
    extensions: [`xml`, `xsl`, `xsd`],
    load: () => import(`@codemirror/lang-xml`).then(m => m.xml()),
  }),
  LanguageDescription.of({
    name: `YAML`,
    alias: [`yml`],
    extensions: [`yaml`, `yml`],
    load: () => import(`@codemirror/lang-yaml`).then(m => m.yaml()),
  }),
]
