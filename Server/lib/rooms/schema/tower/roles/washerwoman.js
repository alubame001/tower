"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Washerwoman = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Washerwoman extends TroubleRole_1.RoleCard {
    skill(book) {
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        var exceptIds = [];
        var real_answer;
        var wrong_answer;
        exceptIds.push(_this.id);
        real_answer = _this.getReal(book, exceptIds, "townsfolk", "townsfolk");
        wrong_answer = _this.getWrong(book, exceptIds, "townsfolk", "");
        _this.handleStatu(book);
        _this.finalMessage(book, real_answer, wrong_answer);
    }
}
exports.Washerwoman = Washerwoman;
