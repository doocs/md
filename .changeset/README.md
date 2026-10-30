# Changesets

Changesets records user-facing changes that should be included in the next
`@doocs/md-cli` release.

Run `pnpm changeset`, select `@doocs/md-cli`, choose the semantic version bump,
and write a concise release-note summary. Commit the generated Markdown file
with the change.

After changes land on `main`, the release workflow keeps a release pull request
up to date. Merging that pull request publishes the package to npm and creates
the corresponding Git tag and GitHub release.
