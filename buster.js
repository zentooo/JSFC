var config = module.exports;

config["JSFC tests"] = {
    env: "browser",
    rootPath: "./",
    sources: [
        "src/jsfc.js",
    ],
    tests: [
        "test/*_test.js",
        "test/keywords/*_test.js"
    ],
    extensions: [require("buster-html-doc")]
};
