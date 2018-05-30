# webpack-asset-manifest-plugin
Webpack plugin for generating an asset manifest with grouped entry chunks. The intent of this plugin was to generate a manifest that would be used to dynamically load bundled assets by their entry name and preload the dynamic chunks associated with them by using rel="preload" or rel="prefetch". This plugin hooks into the compilers emit event and parses all the chunks to determine all associated dependencies for an entry. The manifest will contain the entries, the entry's required files, and any chunks that maybe dynamically imported.

Using this plugin allows you to determine which assets are needed for a given entry dynamically.

[![npm](https://img.shields.io/npm/v/webpack-asset-manifest-plugin.svg)](https://www.npmjs.com/package/webpack-asset-manifest-plugin)
[![npm](https://img.shields.io/npm/l/webpack-asset-manifest-plugin.svg)](https://github.com/jakedahm/webpack-asset-manifest-plugin/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dt/webpack-asset-manifest-plugin.svg)](https://www.npmjs.com/package/webpack-asset-manifest-plugin)

## Installation

```sh
npm install --save-dev webpack-asset-manifest-plugin
```

## Example Webpack Configuration

```js
const WebpackAssetManifestPlugin = require('webpack-asset-manifest-plugin');

module.exports = {
  entry: {
    app: './app/Main.js',
    dashboard: './app/Dashboard.js',
    search: './app/Search.js'
  },
  plugins: [
    new WebpackAssetManifestPlugin(/* options */)
  ]
};
```

## Example Output (manifest.json)

```js
{
  "app": {
    "files": [
      "/dist/commons.js",
      "/dist/app.js"
    ],
    "chunks": [
      "/dist/0.js",
      "/dist/1.js"
    ]
  },
  "dashboard": {
    "files": [
      "/dist/commons.js",
      "/dist/dashboard.js"
    ],
    "chunks": [
      "/dist/1.js"
    ]
  },
  "search": {
    "files": [
      "/dist/search.js"
    ],
    "chunks": []
  }
}
```

## Example Server Usage with ExpressJS

### server.js

```js
const manifest = require('./manifest.json')

app.use('/dashboard', (req, res) => {
  res.render('dashboard', {
    assets: manifest['dashboard']
  });
});
```

### Dashboard View
The example uses ejs, but you can use any ExpressJS view renderer. The files array are the files required to load an entry. The chunks array contains the files that will be dynamically loaded, so for best performance we instruct the browser to prefetch or preload the assets.

```html
<!DOCTYPE html>
<html>
  <head>
    <% if (typeof assets.chunks !== 'undefined' && assets.chunks.length > 0) { %>
      <% for(var i=0; i < assets.chunks.length; i++) { %>
        <link rel="prefetch" href="<%= assets.chunks[i] %>" as="script" />
      <% } %>
    <% } %>
  </head>
  <body>
    <div id="root"></div>
    <% for(var i=0; i < assets.files.length; i++) { %>
      <script src="<%= assets.files[i] %>"></script>
    <% } %>
  </body>
</html>

```

## Options

- **filename**: Filename of the manifest JSON. Default `manifest.json`
- **outputPath**: Output path of the manifest JSON. Default webpack config `output.path`
