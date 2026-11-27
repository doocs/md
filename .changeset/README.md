# Changesets

Changesets records user-facing changes that should be included in the next
`@doocs/md-cli` or `@doocs/dsh-md` release.

Run `pnpm changeset`, select the package, choose the semantic version bump,
and write a concise release-note summary. Commit the generated Markdown file
with the change. `@doocs/dsh-md` is built into `apps/dsh/dist` before publish.

After changes land on `main`, the release workflow keeps a release pull request
up to date. Merging that pull request publishes the package to npm and creates
the corresponding Git tag and GitHub release.
