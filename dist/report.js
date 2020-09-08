"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reporter = exports.generateMarkdown = void 0;

var _rest = _interopRequireDefault(require("@octokit/rest"));

var _graphql = _interopRequireDefault(require("@octokit/graphql"));

var _table = require("./utils/table");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var signature = "Powered by [coverage-diff-back](https://github.com/Leko/coverage-diff-back)";

var generateMarkdown = function generateMarkdown(_ref) {
  var prId = _ref.prId,
      branch = _ref.branch,
      signature = _ref.signature;
  return function (diffReport) {
    var table = (0, _table.generateTable)(diffReport.diff, {
      prId: prId,
      branch: branch
    });
    return "<!-- ".concat(signature, " -->\n\n## ").concat(diffReport.path, "\n").concat(table);
  };
};

exports.generateMarkdown = generateMarkdown;

var reporter = function reporter(_ref2) {
  var slug = _ref2.slug,
      prId = _ref2.prId,
      branch = _ref2.branch,
      token = _ref2.token;
  return /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* (diffReports) {
      var octokit = new _rest["default"]();
      octokit.authenticate({
        type: "token",
        token: token
      });

      var _slug$split = slug.split("/"),
          _slug$split2 = _slicedToArray(_slug$split, 2),
          owner = _slug$split2[0],
          repo = _slug$split2[1];

      var comment = diffReports.map(generateMarkdown({
        signature: signature,
        branch: branch,
        prId: prId
      })).join("\n\n");
      yield hideExistingComments({
        token: token,
        owner: owner,
        repo: repo,
        id: parseInt(prId, 10)
      });

      var _yield$octokit$issues = yield octokit.issues.createComment({
        owner: owner,
        repo: repo,
        number: parseInt(prId, 10),
        body: comment
      }),
          data = _yield$octokit$issues.data;

      return data.html_url;
    });

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }();
};

exports.reporter = reporter;

var hideExistingComments = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (_ref4) {
    var token = _ref4.token,
        owner = _ref4.owner,
        repo = _ref4.repo,
        id = _ref4.id;

    var _yield$graphql = yield (0, _graphql["default"])("\n      query comments($owner: String!, $repo: String!, $id: Int!) {\n        repository(owner: $owner, name: $repo) {\n          pullRequest(number: $id) {\n            comments(first: 100) {\n              nodes {\n                id\n                body\n                isMinimized\n              }\n            }\n          }\n        }\n      }\n    ", {
      owner: owner,
      repo: repo,
      id: id,
      headers: {
        Authorization: "token ".concat(token)
      }
    }),
        nodes = _yield$graphql.repository.pullRequest.comments.nodes;

    var _iterator = _createForOfIteratorHelper(nodes),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var node = _step.value;

        if (node.isMinimized || !node.body.includes(signature)) {
          continue;
        }

        yield (0, _graphql["default"])("\n        mutation hideComment($subjectId: ID!) {\n          minimizeComment(\n            input: { classifier: OUTDATED, subjectId: $subjectId }\n          ) {\n            clientMutationId\n          }\n        }\n      ", {
          subjectId: node.id,
          headers: {
            Authorization: "token ".concat(token),
            // https://developer.github.com/v4/mutation/minimizecomment/
            Accept: "application/vnd.github.queen-beryl-preview+json"
          }
        });
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });

  return function hideExistingComments(_x2) {
    return _ref5.apply(this, arguments);
  };
}();