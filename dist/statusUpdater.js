"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.statusUpdater = void 0;

var _rest = _interopRequireDefault(require("@octokit/rest"));

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

var isGood = function isGood(_ref) {
  var diff = _ref.diff;
  return diff.total.diff >= 0;
};

var summarise = function summarise(diffReport) {
  var _diffReport$diff$tota = diffReport.diff.total,
      now = _diffReport$diff$tota.now,
      diff = _diffReport$diff$tota.diff;
  return "".concat(Math.round(now), "% (").concat((0, _table.withSign)(Math.round(diff)), "%)");
};

var statusUpdater = function statusUpdater(_ref2) {
  var slug = _ref2.slug,
      sha = _ref2.sha,
      buildUrl = _ref2.buildUrl,
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

      var _iterator = _createForOfIteratorHelper(diffReports),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var diffReport = _step.value;
          yield octokit.repos.createStatus({
            owner: owner,
            repo: repo,
            sha: sha,
            state: isGood(diffReport) ? "success" : "failure",
            target_url: buildUrl,
            description: summarise(diffReport),
            context: "coverage-diff-back: ".concat(diffReport.path)
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    });

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }();
};

exports.statusUpdater = statusUpdater;