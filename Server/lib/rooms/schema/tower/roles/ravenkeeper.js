"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ravenkeeper = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Ravenkeeper extends TroubleRole_1.RoleCard {
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
        var actions = book.actionManager.actions;
        if (book.isDay())
            return;
        if (_this.alive)
            return;
        console.log(_this.title() + "使用亡语技能");
        var action = actions.get(_this.id);
        if (action) {
            // var target = action.target;
            if (action.done)
                return;
            if (true) {
                var role = book.getRole(action.targets[0]);
                a = book.getOneRandomRole(exceptIds, '', true, true);
                exceptIds.push(a.id);
                b = book.getOneRandomRole(exceptIds, '', true, true);
                wrong_answer = a.seatId + "号是" + b.name;
                real_answer = role.seatId + "号是" + role.name;
                _this.handleStatu(book);
                _this.finalMessage(book, _this.statu, real_answer, wrong_answer);
                action.done = true;
                action.msg = real_answer;
                actions.set(action.id, action);
            }
        }
        else {
            book.addMessage(_this.title() + "在夜晚被杀了,发动亡语技能!");
            book.actionManager.addAction(_this.id, _this.seatId, book.round);
        }
    }
}
exports.Ravenkeeper = Ravenkeeper;
