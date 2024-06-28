module.exports = {
  branches: [
      "main"
  ],
  repositoryUrl: "git@github.com:researcho/editor.git",
  plugins: [
      [
          "@semantic-release/commit-analyzer",
          {
              releaseRules: [
                  {
                      type: "feat",
                      release: "minor",
                  },
                  {
                      type: "build",
                      release: "patch",
                  },
                  {
                      type: "ci",
                      release: "patch",
                  },
                  {
                      type: "chore",
                      release: "patch",
                  },
                  {
                      type: "docs",
                      release: "patch",
                  },
                  {
                      type: "refactor",
                      release: "patch",
                  },
                  {
                      type: "style",
                      release: "patch",
                  },
                  {
                      type: "test",
                      release: "patch",
                  },
              ],
          },
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "conventionalcommits",
          presetConfig: {
            types: [
              { type: "feat", section: "Features", hidden: false },
              { type: "fix", section: "Bug Fixes", hidden: false },
              { type: "docs", section: "Miscellaneous Chores", hidden: false },
              { type: "chore", section: "Miscellaneous Chores", hidden: false },
            ],
          },
          parserOpts: {
            noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"],
          },
        }
      ],
      "@semantic-release/changelog",
      "@semantic-release/github",
      ["@semantic-release/exec",
        {
          "verifyReleaseCmd": "echo ${nextRelease.version} > .VERSION"
        }
      ]
  ],
};
