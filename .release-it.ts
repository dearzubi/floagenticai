import type { Config } from "release-it";

export default {
  git: {
    commitMessage: "chore: release v${version}",
    tagName: "v${version}",
    commit: true,
    tag: true,
    push: true,
    requireBranch: "main",
    requireUpstream: true,
    requireCommits: true,
  },
  github: {
    release: true,
    tokenRef: "RELEASE_IT_GITHUB_TOKEN",
    skipChecks: true,
    autoGenerate: true,
  },
  npm: {
    publish: false,
  },
  plugins: {
    "@release-it/conventional-changelog": {
      preset: {
        name: "conventionalcommits",
      },
      infile: "CHANGELOG.md",
    },
    "release-it-pnpm": {
      publishCommand: "echo 'Skipping publish step'",
    },
  },
} satisfies Config;
