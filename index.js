const fs = require('fs');
const path = require('path');
const url = require('url');

class WebpackAssetManifestPlugin {
  constructor(opts) {
    this.name = 'WebpackAssetManifestPlugin';
    this.options = Object.assign({
      filename: 'manifest.json',
      outputPath: null
    }, opts || {});
  }

  apply(compiler) {
    compiler.hooks.emit.tap(this.name, compilation => {
      const manifest = compilation.chunkGroups.reduce((manifest, group) => {
        if (group.name) {
          const groupFiles = group
            .getFiles()
            .map(file => url.resolve(compiler.options.output.publicPath, file));
          manifest[group.name] = {
            files: groupFiles,
            chunks: group.getChildren().reduce((chunks, chunk) => {
              const files = chunk.chunks.reduce((items, item) => {
                item.files.forEach(file => {
                  const item = url.resolve(
                    compiler.options.output.publicPath,
                    file
                  );
                  if (
                    chunks.indexOf(item) === -1 &&
                    groupFiles.indexOf(item) === -1
                  ) {
                    items.push(
                      url.resolve(compiler.options.output.publicPath, file)
                    );
                  }
                });
                return items;
              }, []);
              return chunks.concat(files);
            }, [])
          };
        }
        return manifest;
      }, {});
      if (Object.keys(manifest).length > 0) {
        const outputPath = this.options.outputPath || compiler.outputPath
        compiler.outputFileSystem.mkdirp(outputPath, () => {
          fs.writeFileSync(
            path.join(outputPath, 'manifest.json'),
            JSON.stringify(manifest)
          );
        });
      }
    });
  }
}

module.exports = WebpackAssetManifestPlugin;
