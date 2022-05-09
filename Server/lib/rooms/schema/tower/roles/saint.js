"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Saint = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Saint extends TroubleRole_1.RoleCard {
    skill(book) {
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        var real_answer = "被处决了,发动亡者技能!!";
        _this.handleStatu(book);
        if (book.isExecuted(_this)) {
            book.addPrivateMessage(_this, real_answer, real_answer);
        }
    }
}
exports.Saint = Saint;
