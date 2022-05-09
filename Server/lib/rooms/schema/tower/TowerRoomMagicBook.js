"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagicBook = exports.Option = void 0;
const schema_1 = require("@colyseus/schema");
const TroubleRole_1 = require("./TroubleRole");
const TowerRoomRoleManager_1 = require("./TowerRoomRoleManager");
const logger_1 = __importDefault(require("../../../helpers/logger"));
const SeatState_1 = require("../SeatState");
const NominateState_1 = require("../NominateState");
const TowerRoomActionState_1 = require("./TowerRoomActionState");
const MessageManager_1 = require("./MessageManager");
const TowerPreviewManager_1 = require("./TowerPreviewManager");
const game = require('./json/game.json');
class Option extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.townsfolk = 0;
        this.outsider = 0;
        this.minion = 0;
        this.demon = 0;
    }
    getTotal() {
        var result = 0;
        result = this.townsfolk + this.outsider + this.minion + this.demon;
        return result;
    }
    getList() {
        var result = this.townsfolk + "," + this.outsider + "," + this.minion + "," + this.demon;
        return result;
    }
}
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Option.prototype, "townsfolk", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Option.prototype, "outsider", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Option.prototype, "minion", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Option.prototype, "demon", void 0);
exports.Option = Option;
class MagicBook extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.adminId = "";
        this.report = "";
        this.eid = "";
        this.seatManager = new SeatState_1.SeatManager();
        this.nominateManager = new NominateState_1.NominateManager();
        this.roleManager = new TowerRoomRoleManager_1.RoleManager();
        this.previewManager = new TowerPreviewManager_1.PreviewManager();
        this.actionManager = new TowerRoomActionState_1.ActionManager();
        this.victims = new schema_1.MapSchema();
        this.option = new Option();
        this.lucky = 90;
        this.playerCount = 0;
        this.aliveCount = 0;
        this.maxRound = 30;
        this.round = 0;
        this.date = '';
        this.testing = "";
        this.actinOver = false;
        this.voteOver = false;
        this.useSkillRoleId = "";
        //  @type(["string"]) roleList: string[] =   new ArraySchema<string>();
        // @type(["string"]) message: string[] =   new ArraySchema<string>();
        this.messageManager = new MessageManager_1.MessageManager();
    }
    setAdmin(adminId) {
        this.adminId = adminId;
    }
    getLuck() {
        return " (检定值:" + this.lucky + ")";
    }
    /**
     * 依照恶魔和爪的调整外来者和市民的人数
     */
    getGood() {
        let arr = Array.from(this.roleManager.roles.values());
        let res = arr.filter((item, index, array) => {
            return ((item.team == "outsider") || (item.team == "townsfolk"));
        });
        let res2 = res.filter((item, index, array) => {
            return ((item.alive) && (item.used == true));
        });
        return res2;
    }
    getEvil() {
        let arr = Array.from(this.roleManager.roles.values());
        let res = arr.filter((item, index, array) => {
            return ((item.team == "demon") || (item.team == "minion"));
        });
        let res2 = res.filter((item, index, array) => {
            return ((item.alive) && (item.used == true));
        });
        return res2;
    }
    getDemon() {
        let arr = Array.from(this.roleManager.roles.values());
        let res = arr.filter((item, index, array) => {
            return ((item.team == "demon") && (item.alive == true));
        });
        let res2 = res.filter((item, index, array) => {
            return ((item.alive) && (item.used == true));
        });
        return res2;
    }
    /**
     *
     * @param exceptId string
     */
    getOneRandomRole(exceptIds, team, alive, used) {
        return this.roleManager.getOneRandomRole(exceptIds, team, alive, used);
    }
    getOneRandomRoleInTeamm(exceptIds, team) {
        return this.roleManager.getOneRandomRoleInTeamm(exceptIds, team);
    }
    getRandomSeatId(exceptIds) {
        return this.roleManager.getRandomSeatId(exceptIds);
    }
    dice(lucky) {
        var result = false;
        var ran = Math.floor((Math.random() * 100) + 0);
        if (ran > lucky)
            result = true;
        else
            result = false;
        return result;
    }
    dropDice(isHard) {
        var result = false;
        var ran = Math.floor((Math.random() * 100) + 0);
        if (isHard) {
            if (ran > this.lucky)
                result = true;
            else
                result = false;
        }
        else {
            if (ran < this.lucky)
                result = true;
            else
                result = false;
        }
        return result;
    }
    yesOrNo(isHard) {
        return this.dropDice(isHard);
    }
    checkActionOver() {
        if (this.actionManager.actions.size > 0) {
            this.actinOver = false;
            return;
        }
        this.actinOver = true;
    }
    nextRound() {
        this.round++;
        this.nominateManager.nextRound(this.round);
    }
    reportDate() {
        var d = this.getDate();
        this.addMessage(d);
        return d;
    }
    isDay() {
        var result = false;
        var a = this.round % 2;
        //  console.log("isday",a,":",this.round)
        if (a == 0) {
            result = true;
        }
        else {
            result = false;
        }
        return result;
    }
    getDate() {
        var result = '';
        var a = this.round % 2;
        var b;
        var dt;
        if (a == 0) {
            dt = "日";
            b = Math.floor(this.round / 2);
        }
        else {
            dt = "夜";
            b = Math.floor(this.round / 2) + 1;
        }
        result = "第" + b + dt;
        if (this.round == 0)
            return "等待中";
        return result;
    }
    addVictime(nominate) {
        this.victims.set(nominate.id, nominate);
    }
    countAlive() {
        var result = 0;
        this.roleManager.roles.forEach((role) => {
            if ((role.alive) && (role.used == true) && (role.team != "traveler"))
                result++;
        });
        return result;
    }
    /*
        releaseBuff(){
            // console.log("releasePoision")
             this.roleManager.roles.forEach((role:RoleCard) => {
    
                role.buffs.forEach((buff:HandCard) => {
                    buff.buffPeriod --
                    if (buff.buffPeriod<=0) {
                        console.log(role.id+" buff gone :" +buff.id)
                        role.buffs.delete(buff.id);
                    }
                })
    
             })
         }
      */
    checkGameOver() {
        var result = false;
        var evil = this.getEvil();
        var good = this.getGood();
        var demon = this.getDemon();
        if (this.checkSaint()) {
            var role = this.getRoleById("saint");
            var msg = role.name + "被处决了";
            this.addMessage(msg);
            return true;
        }
        if (demon.length == 0) {
            var msg = "恶魔全死了";
            this.addMessage(msg);
            return true;
        }
        if ((evil.length >= good.length) && (good.length == 1)) {
            var msg = "好人没了";
            this.addMessage(msg);
            return true;
        }
        return result;
    }
    checkSaint() {
        var result = false;
        var role = this.getRoleById("saint");
        if (!role)
            return false;
        //this.addMessage("检查圣人是否死亡")
        this.victims.forEach((nominate) => {
            if (nominate.name == role.name) {
                if (nominate.executed == true) {
                    result = true;
                }
            }
        });
        return result;
    }
    /*
    checkMayor():boolean{
       var result = false;
       var role:RoleCard = this.getRoleById("mayor")
       if (!role) return false;
       if (!role.isMayor)
      // this.addMessage("检查"+role.name+"是否死亡")
       this.victims.forEach((nominate:Nominate) => {
           if (nominate.name==role.name){
              
                   result = true;
               
           }
       })
       return result
    }
    */
    nextRole(idx) {
        var result = new TroubleRole_1.RoleCard();
        let arr = Array.from(this.roleManager.roles.values());
        let res = arr.filter((item, index, array) => {
            return ((item.alive == true) && (item.used == true) && (item.idx > idx));
        });
        let a = Array.of(0);
        a.pop();
        res.forEach((role) => {
            var i = Number.parseInt(role.seatId);
            a.push(i);
        });
        a.sort();
        a.sort(function (x, y) {
            return x - y;
        });
        // console.log("getNextRole",a)
        let nextSeatIdx = 0;
        if (a.length > 0) {
            nextSeatIdx = a[0];
        }
        this.roleManager.roles.forEach((role) => {
            if (role.used) {
                if (role.idx == nextSeatIdx) {
                    result = role;
                }
            }
        });
        return result;
    }
    previousRole(idx) {
        var result = new TroubleRole_1.RoleCard();
        let arr = Array.from(this.roleManager.roles.values());
        let res = arr.filter((item, index, array) => {
            return ((item.alive == true) && (item.used == true) && (item.idx < idx));
        });
        let a = Array.of(0);
        a.pop();
        res.forEach((role) => {
            var i = Number.parseInt(role.seatId);
            a.push(i);
        });
        a.sort();
        a.sort(function (x, y) {
            return y - x;
        });
        //  console.log("previousRole",a)
        let nextSeatIdx = this.playerCount;
        if (a.length > 0) {
            nextSeatIdx = a[0];
        }
        this.roleManager.roles.forEach((role) => {
            if (role.used) {
                if (role.idx == nextSeatIdx) {
                    result = role;
                }
            }
        });
        // console.log("getPreviousRole",result.id,":" ,result.seatId)
        return result;
    }
    initMessage() {
        // this.addMessage(this.report);
        /*
         let arr = Array.from(this.roleManager.roles.values())
         var res=arr.filter((item,index,array)=>{
             return  (item.team =="demon") &&(item.used ==true)
         })
         var demon = res[0];
         this.addMessage(demon.title());
         
 
 
         res=arr.filter((item,index,array)=>{
             if (item.team=="minion"){
                 this.addMessage(item.title());
             }
         })
         */
    }
    getRole(seatId) {
        var result;
        this.roleManager.roles.forEach((role) => {
            if (role.seatId == seatId)
                if (role.used)
                    result = role;
        });
        return result;
    }
    getRoleById(id) {
        var result;
        this.roleManager.roles.forEach((role) => {
            if (role.id == id)
                if (role.used)
                    result = role;
        });
        return result;
    }
    //remove
    /*
    reset(){
        this.roleManager.roles.forEach((role:RoleCard) => {
            role.lie = false;
            role.voteOnly = null;
        })
        this.voteOver = false;
        this.actinOver = false;
    }
    */
    addMessage(msg) {
        logger_1.default.silly(msg);
        this.messageManager.addMessage("admin", msg);
    }
    addPrivateMessage(role, privateMessage, adminMessage) {
        // var seat:Seat = this.seatManager.getSeatBySessionId(role.sessionId);
        if (adminMessage)
            this.messageManager.addMessage("admin", adminMessage);
        if (privateMessage) {
            role.messages.push(privateMessage);
            // if (seat)
            // this.messageManager.addMessage(seat.id,privateMessage);
        }
        logger_1.default.silly(adminMessage);
    }
    isExecuted(role) {
        var result = false;
        var victim = this.victims.get(role.id);
        if (victim) {
            if (victim.method == "executed")
                return true;
        }
        return result;
    }
    isMurdered(role) {
        var result = false;
        var victim = this.victims.get(role.id);
        if (victim) {
            if (victim.method == "murdered")
                return true;
        }
        return result;
    }
    getAlive() {
        var result = 0;
        let arr = Array.from(this.seatManager.seats.values());
        let res = arr.filter((item, index, array) => {
            return (item.alive == true);
        });
        result = res.length;
        return result;
    }
    executePlayer(target, starter) {
        if (!target)
            return;
        if (!starter)
            return;
        let nominate = new NominateState_1.Nominate().assign({
            id: target.id,
            name: target.name,
            targetSeatId: target.seatId,
            starterSeatId: starter.seatId,
            round: this.round,
            closed: true,
            method: "executed",
            executed: true
        });
        this.execute(nominate);
    }
    execute(nominate) {
        if (!nominate)
            return;
        var seatId = nominate.targetSeatId;
        console.log("execute :" + seatId);
        nominate.executed = true;
        nominate.closed = true;
        this.seatManager.execute(seatId);
        this.roleManager.execute(seatId);
        this.nominateManager.execute(seatId);
        this.addVictime(nominate);
    }
    reportAllWish() {
        //var idx = 1;
        var result = "";
        for (var i = 1; i <= this.playerCount; i++) {
            var _role;
            this.roleManager.wishRoles.forEach((wishRole) => {
                if (wishRole.idx == i) {
                    _role = wishRole;
                }
            });
            if (i == 1)
                result = "希望身份:" + _role.title();
            else
                result = result + " " + _role.title();
        }
        console.log("result", result);
        this.addMessage(result);
    }
    /*

    */
    /**
     * 得知所有位置
     */
    reportAllPlace() {
        //var idx = 1;
        var result = "";
        for (var i = 1; i <= this.playerCount; i++) {
            var _role;
            this.roleManager.roles.forEach((role) => {
                if (role.used) {
                    if (role.idx == i) {
                        _role = role;
                    }
                }
            });
            if (_role) {
                if (_role.used) {
                    if (i == 1)
                        result = "派发身份:" + _role.title();
                    else
                        result = result + " " + _role.title();
                }
            }
        }
        // logger.silly(result)
        this.report = result;
        this.addMessage(result);
    }
    setLuck() {
        var evil = this.getEvil().length;
        var good = this.getGood().length;
        this.lucky = Math.ceil(good / (evil * 3) * 100) + 1;
        // this.addMessage("检定值:"+this.lucky)
    }
    makeNewBoss() {
        var oldBoss;
        var alives = this.countAlive();
        var role = this.roleManager.roles.get("scarletwoman");
        if (!role)
            return;
        if (role.used) {
            if (!role.alive)
                return;
            if (alives < 5)
                return;
            //this.addMessage("原来的大哥移除能力:" +oldBoss.name);
            // oldBoss.abilityId = null;
            oldBoss.enableSkill = false;
            this.roleManager.roles.set(oldBoss.id, oldBoss);
            this.addMessage("开始产生新大哥" + role.name + " : " + alives);
            var demon = this.roleManager.getRoleInTeam([""], "demon");
            // this.addMessage(role.title()+"变成新恶魔:"+demon.name);   
            role.enableSkill = true;
            role.abilityId = demon.id;
            role.team = "demon";
            role.otherNight = demon.otherNight;
            role.name = demon.name;
            // role.message.push("你成为新恶魔:"+role.name)
            this.roleManager.roles.set(role.id, role);
            this.addPrivateMessage(role, "你成为新恶魔:" + role.name, role.title + "成为新恶魔:" + role.name);
        }
        else {
            this.addMessage("没有小弟可以变身");
        }
        var i = this.getDemon().length;
        //this.addMessage("新大哥:"+ i);
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], MagicBook.prototype, "adminId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], MagicBook.prototype, "report", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], MagicBook.prototype, "eid", void 0);
__decorate([
    schema_1.type(SeatState_1.SeatManager),
    __metadata("design:type", SeatState_1.SeatManager)
], MagicBook.prototype, "seatManager", void 0);
__decorate([
    schema_1.type(NominateState_1.NominateManager),
    __metadata("design:type", NominateState_1.NominateManager)
], MagicBook.prototype, "nominateManager", void 0);
__decorate([
    schema_1.type(TowerRoomRoleManager_1.RoleManager),
    __metadata("design:type", TowerRoomRoleManager_1.RoleManager)
], MagicBook.prototype, "roleManager", void 0);
__decorate([
    schema_1.type(TowerPreviewManager_1.PreviewManager),
    __metadata("design:type", TowerPreviewManager_1.PreviewManager)
], MagicBook.prototype, "previewManager", void 0);
__decorate([
    schema_1.type(TowerRoomActionState_1.ActionManager),
    __metadata("design:type", TowerRoomActionState_1.ActionManager)
], MagicBook.prototype, "actionManager", void 0);
__decorate([
    schema_1.type({ map: NominateState_1.Nominate }),
    __metadata("design:type", Object)
], MagicBook.prototype, "victims", void 0);
__decorate([
    schema_1.type(Option),
    __metadata("design:type", Option)
], MagicBook.prototype, "option", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], MagicBook.prototype, "lucky", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], MagicBook.prototype, "playerCount", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], MagicBook.prototype, "aliveCount", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], MagicBook.prototype, "maxRound", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], MagicBook.prototype, "round", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], MagicBook.prototype, "date", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], MagicBook.prototype, "testing", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], MagicBook.prototype, "actinOver", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], MagicBook.prototype, "voteOver", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], MagicBook.prototype, "useSkillRoleId", void 0);
__decorate([
    schema_1.type(MessageManager_1.MessageManager),
    __metadata("design:type", MessageManager_1.MessageManager)
], MagicBook.prototype, "messageManager", void 0);
exports.MagicBook = MagicBook;
