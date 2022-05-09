"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Imp = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Imp extends TroubleRole_1.RoleCard {
    skill(book) {
        // var tester ="";
        var result = false;
        var answer = "";
        var player_answer = "";
        var real;
        let a;
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        if (!_this) {
            console.error("no _this role");
            return;
        }
        if (_this.targets.length == 0) {
            var exceptIds = [];
            exceptIds.push(this.id);
            if (book.playerCount >= 7) {
                var evil = book.getEvil();
                evil.forEach((role) => { exceptIds.push(role.id); });
            }
            a = book.getOneRandomRole(exceptIds, null, true, true);
            if (!a)
                a = book.getOneRandomRole([], null, true, true);
            answer = "对" + a.title() + "随机发动技能";
            player_answer = "对" + a.seat() + "随机发动技能";
        }
        else {
            var t = _this.targets[0];
            if (!t)
                return;
            a = book.roleManager.getRoleBySeatId(t);
            //console.log("a",a.name) 
            if (!a)
                return;
            answer = "对" + a.title() + "发动技能";
            player_answer = "对" + a.seat() + "发动技能";
        }
        if ((_this.poisoned) || (_this.drunked)) {
            if (_this.drunked)
                _this.statu = "<酒醉>";
            if (_this.poisoned)
                _this.statu = "<中毒>";
        }
        else {
            _this.statu = "";
            var buff = book.roleManager.buffs.get(_this.abilityId);
            if (buff && a) {
                a.buffs.set(buff.id, buff);
            }
            else
                console.error("criticl error no abilityId");
        }
        book.addPrivateMessage(_this, player_answer, answer);
        // _this.finalMessage(book,answer,answer)
    }
}
exports.Imp = Imp;
