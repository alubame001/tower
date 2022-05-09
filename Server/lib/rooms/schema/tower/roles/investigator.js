"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Investigator = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Investigator extends TroubleRole_1.RoleCard {
    skill(book) {
        //  console.warn("undertaker use skill")
        var exceptIds = [];
        //var result = false;   
        var real_answer;
        var wrong_answer;
        var answer;
        var real;
        let a;
        let b;
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        if (!_this) {
            console.error("no this role");
            return;
        }
        exceptIds.push(_this.id);
        //        exceptIds.push('recluse');
        real_answer = _this.getReal(book, exceptIds, "minion", "");
        wrong_answer = _this.getWrong(book, exceptIds, "townsfolk", "");
        _this.handleStatu(book);
        if (_this.lie == false) {
        }
        _this.finalMessage(book, real_answer, wrong_answer);
    }
}
exports.Investigator = Investigator;
