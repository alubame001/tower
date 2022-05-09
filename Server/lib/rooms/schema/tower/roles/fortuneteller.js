"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fortuneteller = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Fortuneteller extends TroubleRole_1.RoleCard {
    skill(book) {
        console.warn("fortuneteller use skill");
        var exceptIds = [];
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
        if (_this.targets.length == 0) {
            exceptIds.push(_this.id);
            a = book.getOneRandomRole(exceptIds, "", true, true);
            exceptIds.push(a.id);
            b = book.getOneRandomRole(exceptIds, "", true, true);
            var changeRole = b.changeRoleSkill(book);
            b = changeRole;
            if (a.marked) {
                book.addMessage(a.title() + "被" + _this.name + "标记为恶魔");
            }
            if (b.marked) {
                book.addMessage(b.title() + "被" + _this.name + "标记为恶魔");
            }
        }
        else {
            if (_this.targets.length == 1) {
                var t = _this.targets[0];
                a = book.roleManager.getRoleBySeatId(t); //manual      
                exceptIds = [a.id];
                b = book.getOneRandomRole(exceptIds, 'townsfolk', true, true);
            }
            else {
                var t = _this.targets[0];
                a = book.roleManager.getRoleBySeatId(t); //manual      
                var t1 = _this.targets[1];
                b = book.roleManager.getRoleBySeatId(t1); //manual                   
            }
        }
        /*
        
        */
        if ((a.team == "demon") || (a.marked))
            result = true;
        if ((b.team == "demon") || (b.marked))
            result = true;
        if (result) {
            wrong_answer = this.sortAnswer(a, b, false, "不是恶魔");
            real_answer = this.sortAnswer(a, b, true, "其中有恶魔");
        }
        else {
            wrong_answer = this.sortAnswer(a, b, true, "其中有恶魔");
            real_answer = this.sortAnswer(a, b, false, "不是恶魔");
        }
        _this.handleStatu(book);
        _this.finalMessage(book, real_answer, wrong_answer);
    }
    sortAnswer(a, b, or, isWhat) {
        var result = "";
        var centerword = "和";
        if (or)
            centerword = "或";
        if (Number(a.seatId) < Number(b.seatId))
            result = a.seatId + centerword + b.seatId + isWhat;
        else
            result = b.seatId + centerword + a.seatId + isWhat;
        return result;
    }
}
exports.Fortuneteller = Fortuneteller;
