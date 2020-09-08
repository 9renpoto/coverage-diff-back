"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchArtifacts = void 0;

var _querystring = _interopRequireDefault(require("querystring"));

var _glob = require("glob");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CIRCLECI_TOKEN = process.env.CIRCLECI_TOKEN;

var request = function request(endpoint) {
  var queryParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var query = _querystring["default"].stringify(_objectSpread(_objectSpread({}, queryParams), {}, {
    "circle-token": CIRCLECI_TOKEN
  }));

  return (0, _nodeFetch["default"])("".concat(endpoint, "?").concat(query)).then(function (res) {
    return res.json();
  });
};

var getLatestBuild = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (slug, branch, workflow) {
    var url = "https://circleci.com/api/v1.1/project/github/".concat(slug, "/tree/").concat(branch);
    var builds = yield request(url, {
      filter: "successful",
      limit: 100
    });
    var build = builds.find(function (b) {
      return b.workflows.workflow_name === workflow;
    });

    if (!build) {
      throw new Error("Build not found (repository=".concat(slug, ", branch=").concat(branch, ", workflow=").concat(workflow, ")"));
    }

    return build;
  });

  return function getLatestBuild(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var getArtifacts = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (slug, buildNum) {
    var url = "https://circleci.com/api/v1.1/project/github/".concat(slug, "/").concat(buildNum, "/artifacts");
    var response = yield request(url); // @ts-ignore Property 'message' does not exist on type 'CircleCIArtifact[]'

    if (response.message) {
      // @ts-ignore
      throw new Error(response.message);
    }

    return response;
  });

  return function getArtifacts(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

var fetchArtifacts = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (_ref3) {
    var slug = _ref3.slug,
        branch = _ref3.branch,
        globPattern = _ref3.globPattern,
        misc = _ref3.misc;

    if (!process.env.CIRCLECI_TOKEN) {
      throw new Error("Environment variable CIRCLECI_TOKEN must be required");
    }

    var build = yield getLatestBuild(slug, branch, misc.circleciWorkflow);
    var artifacts = yield getArtifacts(slug, build.build_num);

    var _Glob = new _glob.Glob(globPattern),
        minimatch = _Glob.minimatch;

    var coverageArtifactMeta = artifacts.filter(function (_ref5) {
      var path = _ref5.path;
      return minimatch.match(path);
    });

    var tokenQuery = _querystring["default"].stringify({
      "circle-token": process.env.CIRCLECI_TOKEN
    });

    return Promise.all(coverageArtifactMeta.map(function (_ref6) {
      var path = _ref6.path,
          url = _ref6.url;
      return (0, _nodeFetch["default"])("".concat(url, "?").concat(tokenQuery)).then(function (res) {
        return res.json();
      }).then(function (coverage) {
        return {
          path: "/".concat(path),
          coverage: coverage
        };
      });
    }));
  });

  return function fetchArtifacts(_x6) {
    return _ref4.apply(this, arguments);
  };
}();

exports.fetchArtifacts = fetchArtifacts;