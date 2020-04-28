# d2l-consistent-evaluation

[![Build status](https://travis-ci.com/BrightspaceHypermediaComponents/consistent-evaluation.svg?branch=master)](https://travis-ci.com/BrightspaceHypermediaComponents/consistent-evaluation)

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

## Versioning, Releasing & Deploying

All version changes should obey [semantic versioning](https://semver.org/) rules.

Include either `[increment major]`, `[increment minor]` or `[increment patch]` in your merge commit message to automatically increment the `package.json` version and create a tag.
 
