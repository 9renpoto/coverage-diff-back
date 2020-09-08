#!/usr/bin/env node
"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _glob = require("glob");

var _yargs = _interopRequireDefault(require("yargs"));

var _envCi = _interopRequireDefault(require("env-ci"));

var _index = _interopRequireDefault(require("./artifacts/index"));

var _collect = require("./collect");

var _report = require("./report");

var _statusUpdater = require("./statusUpdater");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var options = _yargs["default"].scriptName("coverage-diff-back").usage("Usage: $0 [options]").option("coverage-glob", {
  type: "string",
  "default": "**/coverage/coverage-summary.json",
  description: "A glob pattern to specify path of coverage-summary.json"
}).option("from", {
  type: "string",
  "default": "master",
  description: "Compare branch"
}).option("status", {
  type: "boolean",
  description: "Update commit status"
}).option("circleci-workflow", {
  type: "string",
  description: "Name of CircleCI workflow"
}).example("$0 --no-status", "# Doesn't update commit status").example("$0 --from develop", "# Compare between develop and current pull request").epilogue("For more information, find our manual at https://github.com/Leko/coverage-diff-back").wrap(Math.min(90, _yargs["default"].terminalWidth())).argv;

var GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("Environment variable GITHUB_TOKEN must be required");
}

var _envCI = (0, _envCi["default"])(),
    service = _envCI.service,
    slug = _envCI.slug,
    pr = _envCI.pr,
    isPr = _envCI.isPr,
    commit = _envCI.commit,
    buildUrl = _envCI.buildUrl;

if (!isPr) {
  console.log("This build is not triggered by pull request. Nothing to do.");
  process.exit(0);
}

(0, _collect.collect)({
  cwd: process.cwd(),
  slug: slug,
  branch: options.from,
  globPattern: options.coverageGlob,
  artifactFetcher: (0, _index["default"])(service),
  globFetcher: function () {
    var _globFetcher = _asyncToGenerator(function* (pattern) {
      return (0, _glob.sync)(pattern, {
        ignore: "**/{node_modules,.git}/**"
      }).map(function (path) {
        return {
          path: path,
          coverage: JSON.parse(_fs["default"].readFileSync(path, "utf8"))
        };
      });
    });

    function globFetcher(_x) {
      return _globFetcher.apply(this, arguments);
    }

    return globFetcher;
  }(),
  circleciWorkflow: options["circleci-workflow"]
}).then(function (diffReports) {
  if (diffReports.length === 0) {
    throw new Error("Cannot found any coverage reports");
  }

  return diffReports;
}).then( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (diffReports) {
    var sendComment = (0, _report.reporter)({
      slug: slug,
      prId: pr,
      branch: options.from,
      token: GITHUB_TOKEN
    });
    var updateStatus = (0, _statusUpdater.statusUpdater)({
      slug: slug,
      sha: commit,
      buildUrl: buildUrl,
      token: GITHUB_TOKEN
    });
    var pendings = [sendComment(diffReports).then(function (url) {
      console.log("Comment created: ".concat(url));
    }), updateStatus(diffReports)];
    yield Promise.all(pendings);
  });

  return function (_x2) {
    return _ref.apply(this, arguments);
  };
}())["catch"](function (error) {
  console.error(error);
  process.exit(1);
});