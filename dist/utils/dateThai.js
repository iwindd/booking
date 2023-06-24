"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = exports.hasThaiNumerals = void 0;
const thaiNumerals = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
const regularNumerals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
function hasThaiNumerals(text) {
    const thaiNumeralsPattern = /[๐-๙]/;
    return thaiNumeralsPattern.test(text);
}
exports.hasThaiNumerals = hasThaiNumerals;
function convert(dateString) {
    return dateString.replace(new RegExp(thaiNumerals.join("|"), "g"), (match) => regularNumerals[thaiNumerals.indexOf(match)]);
}
exports.convert = convert;
