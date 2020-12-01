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

## Versioning & Releasing

When a pull request is merged, the minor version (0.x) in the `package.json` will be incremented, and a tag and GitHub release will be created.

Include `[increment major]`, `[increment minor]`, `[increment patch]` or `[skip version]` in your merge commit message to change the default versioning behavior.

**Learn More**: [incremental-release GitHub Action](https://github.com/BrightspaceUI/actions/tree/master/incremental-release)
