import type { Config } from "release-it";

export default {
  git: {
    commitMessage: "chore: release v${version}",
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
  },
} satisfies Config;
