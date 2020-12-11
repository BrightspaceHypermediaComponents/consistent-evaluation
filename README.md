# d2l-consistent-evaluation

A consistent evaluation page for all tools

## Usage

```html
<script type="module">
    import '@brightspace-hypermedia-components/consistent-evaluation/consistent-evaluation.js';
</script>
<d2l-consistent-evaluation>My element</d2l-consistent-evaluation>
```

## Developing, Testing and Contributing

After cloning the repo, run `npm install` to install dependencies.

### Running the demos

To start an [es-dev-server](https://open-wc.org/developing/es-dev-server.html) that hosts the demo page and tests:

```shell
npm start
```

### Testing

To lint:

```shell
npm run lint
```

To run local unit tests:

```shell
npm run test:local
```

To run both linting and unit tests:

```shell
npm test
```

### Visual Diff Testing

This repo uses the [@brightspace-ui/visual-diff utility](https://github.com/BrightspaceUI/visual-diff/) to compare current snapshots against a set of golden snapshots stored in source control.

The golden snapshots in source control must be updated by Github Actions.  If your PR's code changes result in visual differences, a PR with the new goldens will be automatically opened for you against your branch.

If you'd like to run the tests locally to help troubleshoot or develop new tests, you can use these commands:

```shell
# Install dependencies locally
npm i mocha -g
npm i @brightspace-ui/visual-diff puppeteer --no-save
# run visual-diff tests
mocha './test/**/*.visual-diff.js' -t 10000
# subset of visual-diff tests:
mocha './test/**/*.visual-diff.js' -t 10000 -g some-pattern
# update visual-diff goldens
mocha './test/**/*.visual-diff.js' -t 10000 --golden
```

## Versioning & Releasing

When a pull request is merged, the minor version (0.x) in the `package.json` will be incremented, and a tag and GitHub release will be created.

Include `[increment major]`, `[increment minor]`, `[increment patch]` or `[skip version]` in your merge commit message to change the default versioning behavior.

**Learn More**: [incremental-release GitHub Action](https://github.com/BrightspaceUI/actions/tree/master/incremental-release)
