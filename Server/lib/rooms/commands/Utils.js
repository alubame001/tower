"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomString = exports.arandom = exports.dice = exports.randomChineseName = void 0;
const NAMES = [
    '断笔画墨',
    '默然相爱',
    '旅人不扰',
    '多余温情',
    '云中谁忆',
    '残雪冰心',
    '末世岛屿',
    '桑榆非晚',
    '扉匣与桔',
    '木槿暖夏',
    '空城旧梦',
];
/**
 * 返回随机的中文名
 *
 * @export
 * @returns {string}
 */
function randomChineseName() {
    return NAMES[~~(NAMES.length * Math.random())];
}
exports.randomChineseName = randomChineseName;
function dice(lucky) {
    var result = false;
    var ran = Math.floor((Math.random() * 100) + 0);
    if (ran > lucky)
        result = true;
    else
        result = false;
    return result;
}
exports.dice = dice;
function arandom(a, b) {
    return (Math.random() > 0.5) ? 1 : -1;
    ;
}
exports.arandom = arandom;
function randomString(e) {
    e = e || 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678", a = t.length, n = "";
    for (var i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n;
}
exports.randomString = randomString;
