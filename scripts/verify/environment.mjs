/**
 * CI and local-browser detection for the verify gate.
 *
 * There is no runtime property that reliably distinguishes a CI runner from
 * a developer machine. The convention is an environment variable, plus the
 * vendor markers for CI products that do not set `CI=true`. Terminal detection
 * is deliberately not used: a local run piped through `tee` has no TTY, while
 * some runners allocate one, so TTY would classify both cases backwards.
 */

import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const CI_MARKERS = [
  `GITHUB_ACTIONS`,
  `GITLAB_CI`,
  `CIRCLECI`,
  `TRAVIS`,
  `BUILDKITE`,
  `TF_BUILD`,
  `JENKINS_URL`,
  `TEAMCITY_VERSION`,
  `CODEBUILD_BUILD_ID`,
  `NETLIFY`,
  `VERCEL`,
]

const FALSE_VALUES = new Set([``, `0`, `false`, `no`, `off`])

function isTruthyFlag(value) {
  if (value === undefined)
    return false
  return !FALSE_VALUES.has(String(value).trim().toLowerCase())
}

/**
 * Whether this process runs inside CI.
 *
 * `MD_WEB_CLI_CI` is an explicit override: a developer can opt into CI
 * semantics locally, and a CI job can opt out when debugging. Otherwise `CI`
 * wins, and the vendor markers cover products such as Jenkins and Azure
 * Pipelines that do not always set it.
 */
export function isCiEnvironment(env = process.env) {
  if (env.MD_WEB_CLI_CI !== undefined)
    return isTruthyFlag(env.MD_WEB_CLI_CI)
  if (env.CI !== undefined)
    return isTruthyFlag(env.CI)
  return CI_MARKERS.some(name => isTruthyFlag(env[name]))
}

/**
 * Candidate paths for a Chrome install that Playwright did not download.
 *
 * Ordered most-specific first. An absent `PROGRAMFILES` root contributes no
 * candidate rather than a relative path.
 */
export function systemChromeCandidates(env = process.env, platform = process.platform) {
  if (platform === `darwin`) {
    return [
      `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
      join(homedir(), `Applications/Google Chrome.app/Contents/MacOS/Google Chrome`),
    ]
  }
  if (platform === `win32`) {
    return [env.PROGRAMFILES, env[`PROGRAMFILES(X86)`], env.LOCALAPPDATA]
      .filter(Boolean)
      .map(root => join(root, `Google/Chrome/Application/chrome.exe`))
  }
  return [
    `/usr/bin/google-chrome`,
    `/usr/bin/google-chrome-stable`,
    `/usr/bin/chromium`,
    `/usr/bin/chromium-browser`,
    `/opt/google/chrome/chrome`,
    `/snap/bin/chromium`,
  ]
}

/**
 * First existing system Chrome, or null.
 *
 * The existence probe is injectable so the path table stays unit-testable
 * without depending on what this machine happens to have installed.
 */
export function findSystemChrome(options = {}) {
  const {
    env = process.env,
    platform = process.platform,
    exists = existsSync,
  } = options
  for (const candidate of systemChromeCandidates(env, platform)) {
    if (candidate && exists(candidate))
      return candidate
  }
  return null
}
