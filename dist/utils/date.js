"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDateAndTime = exports.formatTime = exports.isDateMinToday = exports.getYMDdate = void 0;
const getYMDdate = (date) => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
exports.getYMDdate = getYMDdate;
const isDateMinToday = (dateString) => {
    const today = new Date();
    const inputDate = new Date(dateString);
    // Set the time of both dates to 00:00:00 to compare the dates only
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate >= today;
};
exports.isDateMinToday = isDateMinToday;
const formatTime = (time) => {
    return (time).substring(0, (time).length - 3);
};
exports.formatTime = formatTime;
function mergeDateAndTime(date, time) {
    const [hours, minutes, seconds] = time.split(':');
    const mergedDate = new Date(date);
    mergedDate.setUTCHours(parseInt(hours, 10));
    mergedDate.setUTCMinutes(parseInt(minutes, 10));
    mergedDate.setUTCSeconds(parseInt(seconds, 10));
    return mergedDate;
}
exports.mergeDateAndTime = mergeDateAndTime;
