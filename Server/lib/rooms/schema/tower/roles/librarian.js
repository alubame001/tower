"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Librarian = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Librarian extends TroubleRole_1.RoleCard {
    skill(book) {
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        var real_answer;
        var wrong_answer;
        var exceptIds = [];
        exceptIds.push(_this.id);
        exceptIds.push('recluse');
        real_answer = _this.getReal(book, exceptIds, "outsider", "");
        if (real_answer == "")
            real_answer = "没有外来者";
        wrong_answer = _this.getWrong(book, [], "outsider", "");
        _this.handleStatu(book);
        _this.finalMessage(book, real_answer, wrong_answer);
    }
}
exports.Librarian = Librarian;
