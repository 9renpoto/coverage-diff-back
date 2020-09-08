"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateTable = exports.diagnostic = exports.row = exports.isRow = exports.raw = exports.border = exports.padder = exports.alignCenter = exports.alignLeft = exports.orNA = exports.withSign = exports.mark = exports.sign = void 0;

var _os = require("os");

var sign = function sign(num) {
  var s = Math.sign(num);
  return isNaN(s) ? " " : ["", "+-", "+"][s + 1];
};

exports.sign = sign;

var mark = function mark(num) {
  if (num == null) {
    return " ";
  }

  return num > 0 ? "+" : num < 0 ? "-" : " ";
};

exports.mark = mark;

var withSign = function withSign(num) {
  return num != null ? sign(num) + num : null;
};

exports.withSign = withSign;

var orNA = function orNA(num) {
  return num != null ? "".concat(num) : "-";
};

exports.orNA = orNA;

var alignLeft = function alignLeft(text, width, _char) {
  return text + _char.repeat(Math.max(width - text.length, 0));
};

exports.alignLeft = alignLeft;

var alignCenter = function alignCenter(text, width, _char2) {
  var leftLen = Math.floor((width - text.length) / 2);
  var rightLen = Math.ceil((width - text.length) / 2);
  return "".concat(_char2.repeat(Math.max(leftLen, 0))).concat(text).concat(_char2.repeat(Math.max(rightLen, 0)));
};

exports.alignCenter = alignCenter;

var padder = function padder(text) {
  var layouter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : alignLeft;
  return function (width) {
    return layouter(text, width, " ");
  };
};

exports.padder = padder;

var border = function border(title) {
  var _char3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "=";

  return function (width) {
    return alignCenter(" ".concat(title, " "), width, _char3);
  };
};

exports.border = border;

var raw = function raw(renderer) {
  return {
    type: "raw",
    value: renderer
  };
};

exports.raw = raw;

var isRow = function isRow(el) {
  return el.type === "row";
};

exports.isRow = isRow;

var row = function row(values) {
  return {
    type: "row",
    values: values
  };
};

exports.row = row;

var diagnostic = function diagnostic(rows) {
  var cellContainers = rows.filter(isRow);

  if (cellContainers.length === 0) {
    return {
      maxWidths: [],
      width: -1
    };
  }

  var maxWidths = cellContainers.reduce(function (maxWidths, row) {
    return row.values.map(function (value, i) {
      return Math.max(value(0).length, maxWidths[i] || 0);
    });
  }, []);
  var width = maxWidths.reduce(function (sum, n) {
    return sum + n;
  }) + maxWidths.length - 1;
  return {
    maxWidths: maxWidths,
    width: width
  };
};

exports.diagnostic = diagnostic;

var generateTable = function generateTable(diff, _ref) {
  var prId = _ref.prId,
      branch = _ref.branch;
  var stats = diff.stats,
      t = diff.total,
      cL = diff.lines,
      cS = diff.statements,
      cF = diff.functions,
      cB = diff.branches;
  var statL = stats.lines,
      statF = stats.files;
  var rows = [row([padder(" "), padder(" "), padder(branch), padder("#".concat(prId)), padder("+/-")]), raw(border("Summary")), row([padder(mark(t.diff)), padder("Coverage"), padder(t.old != null ? "".concat(Math.round(t.old), "%") : "-"), padder("".concat(Math.round(t.now), "%")), padder(withSign(t.diff) != null ? "".concat(withSign(Math.round(t.diff)), "%") : "-")]), raw(border("Diagnostics")), row([padder(" "), padder("Files"), padder(orNA(statF.old)), padder(String(statF.now)), padder(orNA(withSign(statF.diff)))]), row([padder(" "), padder("Lines"), padder(orNA(statL.old)), padder(String(statL.now)), padder(orNA(withSign(statL.diff)))]), raw(border("Coverages")), row([padder(mark(cL.diff)), padder("Lines"), padder(cL.old != null ? "".concat(Math.round(cL.old), "%") : "-"), padder("".concat(Math.round(cL.now), "%")), padder(withSign(cL.diff) != null ? "".concat(withSign(Math.round(cL.diff)), "%") : "-")]), row([padder(mark(cS.diff)), padder("Statements"), padder(cS.old != null ? "".concat(Math.round(cS.old), "%") : "-"), padder("".concat(Math.round(cS.now), "%")), padder(withSign(cS.diff) != null ? "".concat(withSign(Math.round(cS.diff)), "%") : "-")]), row([padder(mark(cF.diff)), padder("Functions"), padder(cF.old != null ? "".concat(Math.round(cF.old), "%") : "-"), padder("".concat(Math.round(cF.now), "%")), padder(withSign(cF.diff) != null ? "".concat(withSign(Math.round(cF.diff)), "%") : "-")]), row([padder(mark(cB.diff)), padder("Branches"), padder(cB.old != null ? "".concat(Math.round(cB.old), "%") : "-"), padder("".concat(Math.round(cB.now), "%")), padder(withSign(cB.diff) != null ? "".concat(withSign(Math.round(cB.diff)), "%") : "-")])];

  var _diagnostic = diagnostic(rows),
      maxWidths = _diagnostic.maxWidths,
      width = _diagnostic.width;

  var tHead = "@@".concat(alignCenter("Coverage Diff", width - 4, " "), "@@");
  var tBody = rows.map(function (row) {
    switch (row.type) {
      case "raw":
        return row.value(width);

      case "row":
        return row.values.map(function (renderer, i) {
          return renderer(maxWidths[i]);
        }).join(" ");

      default:
        throw new Error("Unexpected type:" + JSON.stringify(row));
    }
  }).join(_os.EOL);
  return "```diff\n" + tHead + "\n" + tBody + "\n```";
};

exports.generateTable = generateTable;