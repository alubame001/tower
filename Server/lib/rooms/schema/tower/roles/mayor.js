"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mayor = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Mayor extends TroubleRole_1.RoleCard {
    skill(book) {
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        if (book.isDay())
            return;
        if (_this.alive == true)
            return;
        if (!_this.isMayor)
            return;
        console.log(_this.title() + "使用亡语技能");
        if ((_this.poisoned) || (_this.drunked)) {
            book.addMessage(_this.title() + "处於异常状态无法发动技能");
            return;
        }
        if (book.dropDice(false)) {
            book.addMessage(_this.title() + "在夜晚被杀了,检定通过,发动技能" + book.getLuck());
            var role = book.getOneRandomRole([_this.id], "", true, true);
            if (!role)
                return;
            role.alive = false;
            _this.alive = true;
            _this.isMayor = false;
            _this.claimAlive();
            role.claimDeath();
            //book.roleManager.roles.set(_this.id,_this);
            //book.roleManager.roles.set(role.id,role);
            book.addMessage(_this.title() + "在夜晚被杀了,发动技能复活." + role.title() + "死了" + book.getLuck());
        }
        else {
            book.addMessage(_this.title() + "在夜晚被杀了,检定失败,不发动技能");
        }
    }
}
exports.Mayor = Mayor;
