const { withDangerousMod, withPlugins } = require("@expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");
const fs = require("fs");
const path = require("path");

const withCustomPodfile = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, "Podfile");
      const contents = await readFileAsync(file);
      await saveFileAsync(file, addPodSource(contents));
      return config;
    },
  ]);
};

async function readFileAsync(path) {
  return fs.promises.readFile(path, "utf8");
}

async function saveFileAsync(path, content) {
  return fs.promises.writeFile(path, content, "utf8");
}

function addPodSource(src) {
  const newSrc = `
  use_frameworks! :linkage => :static

  pod 'FirebaseCore', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true
  `;

  return mergeContents({
    tag: "custom-rive-podfile-modification",
    src,
    newSrc,
    anchor:
      /use_frameworks! :linkage => ENV\['USE_FRAMEWORKS'\].to_sym if ENV\['USE_FRAMEWORKS'\]/i,
    offset: 1,
    comment: "#",
  }).contents;
}

module.exports = withCustomPodfile;
