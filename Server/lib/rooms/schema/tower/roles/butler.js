"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Butler = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Butler extends TroubleRole_1.RoleCard {
    skill(book) {
        console.warn("ravenkeeper use skill");
        var exceptIds = [this.id];
        var result = false;
        var real_answer;
        var wrong_answer;
        var answer;
        var real;
        let a;
        let b;
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        if (!_this) {
            console.error("no __this role");
            return;
        }
        //let statu = "";
        exceptIds = [];
        exceptIds.push(_this.id);
        if (_this.targets.length == 0) {
            a = book.getOneRandomRole(exceptIds, null, true, true);
            _this.voteOnly = a.seatId;
        }
        else {
            var t = _this.targets[0];
            a = book.roleManager.getRoleBySeatId(t); //manual 
            real_answer = _this.name + "白天只能跟投" + a.seat();
        }
        if ((_this.poisoned) || (_this.drunked)) {
            book.addMessage(_this.title() + "白天可以随意投票");
        }
        else {
            _this.voteOnly = null;
        }
    }
}
exports.Butler = Butler;
