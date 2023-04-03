# action-automerger

GitHub action to automatically merge the source branch into a target branch.

## Inputs

### `source`

**Required** Source branch for the merge

### `target`

**Required** Target branch for the merge

### `message`

**Optional** The commit message to use when merging.


## Example usage

```
name: Update cms/master

on:
  push:
    branches:
      - master

jobs:
  update-cms-master:
    name: Merge master into release after a PR is merged
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v2

      - name: merge
        uses: richard-scott/action-automerger@v1.0.3
        with:
          github_token: ${{ github.token }}
          source: 'master'
          target: 'release'
          message: "${{ github.event.commits[0].message }}"
