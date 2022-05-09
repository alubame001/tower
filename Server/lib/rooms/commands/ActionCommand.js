"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skill = exports.AsyncDawnSkill = exports.AsyncSequenceSkill = exports.ImpSkill = exports.UseSkillByRoleId = exports.UseSkill = exports.SetNightOrder = exports.Reset = exports.test = void 0;
// @ts-nocheck
const command_1 = require("@colyseus/command");
const TowerRoomPlayerState_1 = require("../schema/tower/TowerRoomPlayerState");
const washerwoman_1 = require("../schema/tower/roles/washerwoman");
const chef_1 = require("../schema/tower/roles/chef");
const investigator_1 = require("../schema/tower/roles/investigator");
const librarian_1 = require("../schema/tower/roles/librarian");
const monk_1 = require("../schema/tower/roles/monk");
const fortuneteller_1 = require("../schema/tower/roles/fortuneteller");
const undertaker_1 = require("../schema/tower/roles/undertaker");
const ravenkeeper_1 = require("../schema/tower/roles/ravenkeeper");
const empath_1 = require("../schema/tower/roles/empath");
const virgin_1 = require("../schema/tower/roles/virgin");
const slayer_1 = require("../schema/tower/roles/slayer");
const soldier_1 = require("../schema/tower/roles/soldier");
const mayor_1 = require("../schema/tower/roles/mayor");
const butler_1 = require("../schema/tower/roles/butler");
const drunk_1 = require("../schema/tower/roles/drunk");
const recluse_1 = require("../schema/tower/roles/recluse");
const saint_1 = require("../schema/tower/roles/saint");
const scarletwoman_1 = require("../schema/tower/roles/scarletwoman");
const baron_1 = require("../schema/tower/roles/baron");
const spy_1 = require("../schema/tower/roles/spy");
const poisoner_1 = require("../schema/tower/roles/poisoner");
const imp_1 = require("../schema/tower/roles/imp");
//import { ReconnectRoom } from "../TowerRoom";
// @ts-ignore
class test extends command_1.Command {
    // @ts-ignore
    execute({ robots }) {
        console.log("robots:", robots);
        for (var i = 0; i < robots; i++) {
            let player = new TowerRoomPlayerState_1.Player().assign({
                id: "robot" + String(i + 1),
                name: "robot" + String(i + 1),
                admin: false,
                robot: true
            });
            // @ts-ignore
            this.state.players.set(player.id, player);
            // @ts-ignore  
            this.state.players.get(player.id).connected = true;
        }
    }
}
exports.test = test;
// @ts-ignore
class Reset extends command_1.Command {
    execute({}) {
        // @ts-ignore
        this.state.magicBook.roleManager.roles.forEach((role) => {
            role.lie = false;
            role.voteOnly = null;
        });
        // @ts-ignore
        this.state.magicBook.voteOver = false;
        // @ts-ignore
        this.state.magicBook.actinOver = false;
    }
}
exports.Reset = Reset;
// @ts-ignore
class SetNightOrder extends command_1.Command {
    execute({}) {
        return __awaiter(this, void 0, void 0, function* () {
            let book = this.state.magicBook;
            let roleManager = book.roleManager;
            roleManager.orders = [];
            let arr = Array.from(book.roleManager.roles.values());
            if (book.round == 1) {
                let res = arr.filter((item, index, array) => {
                    return ((item.firstNight > 0) && (item.alive) && (item.used));
                });
                for (var i = 0; i < 1000; i++) {
                    res.forEach(role => {
                        if (role.firstNight == i)
                            //    book.roleManager.order.set(role.id,role);
                            roleManager.orders.push(role.id);
                    });
                }
            }
            else {
                let res = arr.filter((item, index, array) => {
                    return ((item.otherNight > 0) && (item.alive) && (item.used));
                });
                for (var i = 0; i < 1000; i++) {
                    res.forEach(role => {
                        if (role.otherNight == i)
                            //  book.roleManager.order.set(role.id,role);
                            roleManager.orders.push(role.id);
                    });
                }
            }
        });
    }
}
exports.SetNightOrder = SetNightOrder;
class UseSkill extends command_1.Command {
    execute({}) {
        return __awaiter(this, void 0, void 0, function* () {
            // var roleId = 'imp';
            //  return [new UseSkillByRoleId().setPayload({roleId})]    
            let book = this.state.magicBook;
            book.roleManager.order.forEach((roleCard) => {
                book.useSkillRoleId = roleCard.id;
                var demon = roleCard.buffs.get('imp');
                var monk = roleCard.buffs.get('monk');
                if (demon) {
                    if (!monk) {
                        if (roleCard.triggerAfterDeath) {
                            book.addMessage(roleCard.title() + "发动亡语技能");
                            roleCard.claimDeath();
                        }
                        else {
                            roleCard.claimDeath();
                            book.addMessage(roleCard.title() + "即将死亡，无法使用技能");
                            return;
                        }
                    }
                }
                /*
                if (!roleCard.alive){
                    if (roleCard.dead) {
                        book.addMessage(roleCard.title()+"已死亡，无法使用技能。")
                    }
                    return ;
                };
                */
                let ability;
                console.log("role.abilityId:", roleCard.abilityId);
                // if (roleCard.abilityId=="imp")
                switch (roleCard.abilityId) {
                    case 'washerwoman':
                        ability = new washerwoman_1.Washerwoman();
                        break;
                    case 'librarian':
                        ability = new librarian_1.Librarian();
                        break;
                    case 'investigator':
                        ability = new investigator_1.Investigator();
                        break;
                    case 'chef':
                        ability = new chef_1.Chef();
                        break;
                    case 'empath':
                        ability = new empath_1.Empath();
                        break;
                    case 'fortuneteller':
                        ability = new fortuneteller_1.Fortuneteller();
                        break;
                    case 'undertaker':
                        ability = new undertaker_1.Undertaker();
                        break;
                    case 'monk':
                        ability = new monk_1.Monk();
                        break;
                    case 'ravenkeeper':
                        ability = new ravenkeeper_1.Ravenkeeper();
                        break;
                    case 'virgin':
                        ability = new virgin_1.Virgin();
                        break;
                    case 'slayer':
                        ability = new slayer_1.Slayer();
                        break;
                    case 'soldier':
                        ability = new soldier_1.Soldier();
                        break;
                    case 'mayor':
                        ability = new mayor_1.Mayor();
                        break;
                    case 'butler':
                        ability = new butler_1.Butler();
                        break;
                    case 'drunk':
                        ability = new drunk_1.Drunk();
                        break;
                    case 'recluse':
                        ability = new recluse_1.Recluse();
                        break;
                    case 'saint':
                        ability = new saint_1.Saint();
                        break;
                    case 'poisoner':
                        ability = new poisoner_1.Poisoner();
                        break;
                    case 'spy':
                        ability = new spy_1.Spy();
                        break;
                    case 'scarletwoman':
                        ability = new scarletwoman_1.Scarletwoman();
                        break;
                    case 'baron':
                        ability = new baron_1.Baron();
                        break;
                    case 'imp':
                        ability = new imp_1.Imp();
                        break;
                }
                if (ability)
                    ability.skill(book);
            });
        });
    }
}
exports.UseSkill = UseSkill;
class UseSkillByRoleId extends command_1.Command {
    execute({ roleId }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("roleId:", roleId);
            let book = this.state.magicBook;
            book.useSkillRoleId = roleId;
            return [new ImpSkill().setPayload({ roleId })];
        });
    }
}
exports.UseSkillByRoleId = UseSkillByRoleId;
class ImpSkill extends command_1.Command {
    execute({ abilityId }) {
        console.log("imp skill!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        let book = this.state.magicBook;
        var result = false;
        var answer = "";
        var player_answer = "";
        var real;
        let a;
        var role = book.roleManager.roles.get(abilityId);
        if (!role) {
            console.error("no role role");
            return;
        }
        if (role.targets.length == 0) {
            var exceptIds = [];
            exceptIds.push(role.id);
            if (book.playerCount >= 7) {
                var evil = book.getEvil();
                evil.forEach((role) => { exceptIds.push(role.id); });
            }
            a = book.getOneRandomRole(exceptIds, null, true, true);
            if (!a)
                return;
            answer = role.title() + "对" + a.title() + "随机发动技能";
            player_answer = "对" + a.seat() + "随机发动技能";
        }
        else {
            var t = role.targets[0];
            if (!t)
                return;
            a = book.roleManager.getRoleBySeatId(t);
            //console.log("a",a.name) 
            if (!a)
                return;
            answer = role.title() + "对" + a.title() + "发动技能";
            player_answer = "对" + a.seat() + "发动技能";
        }
        if ((role.poisoned) || (role.drunked)) {
            if (role.drunked)
                role.statu = "<酒醉>";
            if (role.poisoned)
                role.statu = "<中毒>";
        }
        else {
            role.statu = "";
            var buff = book.roleManager.buffs.get(role.abilityId);
            if (buff && a) {
                a.buffs.set(buff.id, buff);
            }
            else
                console.error("criticl error no abilityId");
        }
        book.addPrivateMessage(role, player_answer, answer);
    }
}
exports.ImpSkill = ImpSkill;
/*
export class CheckBuff extends Command<TowerRoomState, {
    roleCard:RoledCard
}> {
    execute({roleCard}) {
        let book = this.state.magicBook;

       // console.log("CheckBuff:",roleCard.name)
         
        var immune = false;
        var shield = false;
        var result = false;
        var demon = roleCard.buffs.get('imp');
        var monk  = roleCard.buffs.get('monk');
        
        if (demon){
    
            if(roleCard.id=="soldier"){
                if ((roleCard.poisoned)||(roleCard.drunked)){
                    book.addMessage(roleCard.title()+ "无法使用被动技能")
                } else {
                    book.addMessage(roleCard.title()+ "发动了被动技能")
                    immune = true;
                }
    
            }
          
            if(monk){
                book.addMessage("僧侣保护了"+roleCard.title()+"<平安夜>")
                shield = true;
                return;
            }
    
    
            if (shield||immune){
    
            }else {
                let nominate = new Nominate().assign({
                    id: roleCard.id,
                    name :roleCard.name,
                    targetSeatId :roleCard.seatId,
                    starterSeatId :demon.seatId,
                    round :book.round,
                    closed :true,
                    method:"buff",
                    executed :false
                  });
                book.addVictime(nominate);
                roleCard.alive = false;
                roleCard.dead = true;
                //var real =roleCard.title()+"被恶魔谋杀了";
                roleCard.deadRound = book.round;
                roleCard.claimDeath(book);
             
                
            }
    
    
    
    
    
        
        }
        if (roleCard.buffs.has('imp')) roleCard.buffs.delete('imp')
        if (roleCard.buffs.has('monk')) roleCard.buffs.delete('monk')








    }

}

*/
/*
export class AsyncSequence extends Command {
    execute() {
      return [new Wait().setPayload(1), new Wait().setPayload(2), new Wait().setPayload(3)];
    }
  }
  
  export class Wait extends Command<any, number> {
    async execute(number) {
        console.log("number ",number)
      await this.delay(number*100);
    }
  }
*/
class AsyncSequenceSkill extends command_1.Command {
    execute() {
        var result = [];
        var item = new Skill().setPayload("spy");
        result.push(item);
        result.pop();
        let book = this.state.magicBook;
        for (var i = 0; i < book.roleManager.orders.length; i++) {
            var roleId = book.roleManager.orders[i];
            var item = new Skill().setPayload(roleId);
            result.push(item);
        }
        return result;
        //  return [new Skill().setPayload("imp"), new Skill().setPayload("spy")];
    }
}
exports.AsyncSequenceSkill = AsyncSequenceSkill;
class AsyncDawnSkill extends command_1.Command {
    execute() {
        var result = [];
        var item = new Skill().setPayload("spy");
        result.push(item);
        result.pop();
        let book = this.state.magicBook;
        let arr = Array.from(book.actionManager.actions.keys());
        for (var i = 0; i < arr.length; i++) {
            var roleId = arr[i];
            var item = new Skill().setPayload(roleId);
            result.push(item);
        }
        return result;
        //  return [new Skill().setPayload("imp"), new Skill().setPayload("spy")];
    }
}
exports.AsyncDawnSkill = AsyncDawnSkill;
class Skill extends command_1.Command {
    execute(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            //   console.log("roleId ",roleId)
            yield this.delay(10);
            let book = this.state.magicBook;
            var roleCard = this.state.magicBook.roleManager.roles.get(roleId);
            if (!roleCard)
                return;
            var demon = roleCard.buffs.get('imp');
            var monk = roleCard.buffs.get('monk');
            if (demon) {
                if (!monk) {
                    if (roleCard.triggerAfterDeath) {
                        book.addMessage(roleCard.title() + "发动亡语技能");
                        roleCard.claimDeath();
                    }
                    else {
                        roleCard.claimDeath();
                        book.addMessage(roleCard.title() + "即将死亡，无法使用技能");
                        return;
                    }
                }
            }
            book.useSkillRoleId = roleCard.id;
            let ability;
            switch (roleCard.abilityId) {
                case 'washerwoman':
                    ability = new washerwoman_1.Washerwoman();
                    break;
                case 'librarian':
                    ability = new librarian_1.Librarian();
                    break;
                case 'investigator':
                    ability = new investigator_1.Investigator();
                    break;
                case 'chef':
                    ability = new chef_1.Chef();
                    break;
                case 'empath':
                    ability = new empath_1.Empath();
                    break;
                case 'fortuneteller':
                    ability = new fortuneteller_1.Fortuneteller();
                    break;
                case 'undertaker':
                    ability = new undertaker_1.Undertaker();
                    break;
                case 'monk':
                    ability = new monk_1.Monk();
                    break;
                case 'ravenkeeper':
                    ability = new ravenkeeper_1.Ravenkeeper();
                    break;
                case 'virgin':
                    ability = new virgin_1.Virgin();
                    break;
                case 'slayer':
                    ability = new slayer_1.Slayer();
                    break;
                case 'soldier':
                    ability = new soldier_1.Soldier();
                    break;
                case 'mayor':
                    ability = new mayor_1.Mayor();
                    break;
                case 'butler':
                    ability = new butler_1.Butler();
                    break;
                case 'drunk':
                    ability = new drunk_1.Drunk();
                    break;
                case 'recluse':
                    ability = new recluse_1.Recluse();
                    break;
                case 'saint':
                    ability = new saint_1.Saint();
                    break;
                case 'poisoner':
                    ability = new poisoner_1.Poisoner();
                    break;
                case 'spy':
                    ability = new spy_1.Spy();
                    break;
                case 'scarletwoman':
                    ability = new scarletwoman_1.Scarletwoman();
                    break;
                case 'baron':
                    ability = new baron_1.Baron();
                    break;
                case 'imp':
                    ability = new imp_1.Imp();
                    break;
            }
            if (ability)
                ability.skill(book);
        });
    }
}
exports.Skill = Skill;
