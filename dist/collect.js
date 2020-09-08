"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.collect = exports.toRelative = exports.addPrefix = void 0;

var _path = require("path");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var getCoverageDiff = function getCoverageDiff(oldCoverage, nowCoverage) {
  return {
    stats: {
      files: {
        // -1 means "total"
        old: oldCoverage ? Object.keys(oldCoverage).length - 1 : null,
        now: Object.keys(nowCoverage).length - 1,
        diff: oldCoverage ? Object.keys(nowCoverage).length - Object.keys(oldCoverage).length : Object.keys(nowCoverage).length
      },
      lines: {
        old: oldCoverage ? oldCoverage.total.lines.total : null,
        now: nowCoverage.total.lines.total,
        diff: oldCoverage ? nowCoverage.total.lines.total - oldCoverage.total.lines.total : nowCoverage.total.lines.total
      }
    },
    total: {
      old: oldCoverage ? oldCoverage.total.lines.pct : null,
      now: nowCoverage.total.lines.pct,
      diff: oldCoverage ? nowCoverage.total.lines.pct - oldCoverage.total.lines.pct : nowCoverage.total.lines.pct
    },
    lines: {
      old: oldCoverage ? oldCoverage.total.lines.pct : null,
      now: nowCoverage.total.lines.pct,
      diff: oldCoverage ? nowCoverage.total.lines.pct - oldCoverage.total.lines.pct : nowCoverage.total.lines.pct
    },
    statements: {
      old: oldCoverage ? oldCoverage.total.statements.pct : null,
      now: nowCoverage.total.statements.pct,
      diff: oldCoverage ? nowCoverage.total.statements.pct - oldCoverage.total.statements.pct : nowCoverage.total.statements.pct
    },
    functions: {
      old: oldCoverage ? oldCoverage.total.functions.pct : null,
      now: nowCoverage.total.functions.pct,
      diff: oldCoverage ? nowCoverage.total.functions.pct - oldCoverage.total.functions.pct : nowCoverage.total.functions.pct
    },
    branches: {
      old: oldCoverage ? oldCoverage.total.branches.pct : null,
      now: nowCoverage.total.branches.pct,
      diff: oldCoverage ? nowCoverage.total.branches.pct - oldCoverage.total.branches.pct : nowCoverage.total.branches.pct
    }
  };
};

var addPrefix = function addPrefix(prefix) {
  return function (_ref) {
    var path = _ref.path,
        other = _objectWithoutProperties(_ref, ["path"]);

    return _objectSpread({
      path: prefix + path
    }, other);
  };
};

exports.addPrefix = addPrefix;

var toRelative = function toRelative(cwd) {
  return function (_ref2) {
    var path = _ref2.path,
        other = _objectWithoutProperties(_ref2, ["path"]);

    return _objectSpread({
      path: (0, _path.relative)(cwd, path)
    }, other);
  };
};

exports.toRelative = toRelative;

var collect = function collect(_ref3) {
  var slug = _ref3.slug,
      cwd = _ref3.cwd,
      branch = _ref3.branch,
      globPattern = _ref3.globPattern,
      circleciWorkflow = _ref3.circleciWorkflow,
      artifactFetcher = _ref3.artifactFetcher,
      globFetcher = _ref3.globFetcher;
  return Promise.all([artifactFetcher({
    slug: slug,
    branch: branch,
    globPattern: globPattern,
    misc: {
      circleciWorkflow: circleciWorkflow
    }
  }), globFetcher(globPattern)]).then(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
        remoteReports = _ref5[0],
        localReports = _ref5[1];

    return [remoteReports.map(addPrefix("/")).map(toRelative(cwd)), localReports.map(toRelative(cwd))];
  }).then(function (_ref6) {
    var _ref7 = _slicedToArray(_ref6, 2),
        remoteReports = _ref7[0],
        localReports = _ref7[1];

    return localReports.map(function (localReport) {
      var remoteReport = remoteReports.find(function (_ref8) {
        var path = _ref8.path;
        return localReport.path === path;
      });
      return [localReport, remoteReport || null];
    });
  }).then(function (coveragePairs) {
    return coveragePairs.map(function (_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
          localReport = _ref10[0],
          remoteReport = _ref10[1];

      var diff = getCoverageDiff(remoteReport ? remoteReport.coverage : null, localReport.coverage);
      return {
        path: localReport.path,
        diff: diff
      };
    });
  });
};

exports.collect = collect;