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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleCard = exports.Icon = void 0;
const schema_1 = require("@colyseus/schema");
const NominateState_1 = require("../NominateState");
const TowerRoomHandCardState_1 = require("./TowerRoomHandCardState");
class Icon extends schema_1.Schema {
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Icon.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Icon.prototype, "seatId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Icon.prototype, "iconSeatId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Icon.prototype, "roleId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Icon.prototype, "team", void 0);
exports.Icon = Icon;
class RoleCard extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.locked = false;
        this.alive = true;
        this.lie = false;
        this.used = false;
        this.witch = false;
        this.sergant = false;
        this.citizen = false;
        this.picked = false;
        this.drunked = false;
        this.poisoned = false;
        this.dead = false;
        this.marked = false; //used for fortuneteller
        this.diablePreview = false; //用於标示，是否可预选
        this.triggerAfterDeath = false;
        this.enableSkill = true; // for dead boss
        this.wish = false; //用於角色是否因为玩家希望所产生
        this.isMayor = false; //市长
        this.isVirgin = false; // for virgin
        this.robot = false; //
        this.possibility = new schema_1.ArraySchema('', '', '');
        this.messages = new schema_1.ArraySchema();
        this.targets = new schema_1.ArraySchema();
        this.target = 0;
        this.buffs = new schema_1.MapSchema();
        this.seatId = "";
    }
    title() {
        var statu = "";
        var seatId = this.seatId;
        if (this.realSeatId)
            seatId = this.seatId;
        if (this.drunked)
            statu = "<酒鬼>";
        return "(" + seatId + ")" + this.name + statu;
    }
    seat() {
        var seatId = this.seatId;
        if (this.realSeatId)
            seatId = this.seatId;
        return seatId + "号";
    }
    status() {
        var statu = "";
        if (this.drunked)
            statu = "<酒鬼>";
        if (this.poisoned)
            statu = statu + "<中毒>";
        return statu;
    }
    handleStatu(book) {
        var result = false;
        this.lie = false;
        this.statu = "";
        if ((this.poisoned) || (this.drunked)) {
            if (this.drunked)
                this.statu = "<酒醉>";
            if (this.poisoned)
                this.statu = this.statu + "<中毒>";
            if (this.poisoned)
                book.addMessage(this.title() + "被毒了，无法使用技能。讯息一定错误");
            result = true;
            this.lie = result;
            if (this.drunked) {
                if (book.dropDice(true)) {
                    this.lie = false;
                    book.addMessage(this.title() + "酒醉了，无法使用技能。检定通过，讯息正确");
                }
                else {
                    this.lie = true;
                    book.addMessage(this.title() + "酒醉了，无法使用技能。讯息大概率错误");
                }
            }
        }
        return result;
    }
    isTownsfolk() {
        var result = false;
        if (this.team == "townsfolk") {
            result = true;
        }
        return result;
    }
    isEvil() {
        var result = false;
        if ((this.team == "demon") || (this.team == "minion")) {
            result = true;
        }
        return result;
    }
    isGood() {
        var result = false;
        if ((this.team == "outsider") || (this.team == "townsfolk")) {
            result = true;
        }
        return result;
    }
    //skill(book:MagicBook){}
    /*
        
        @filter(function(
            this: RoleCard, // the instance of the class `@filter` has been defined (instance of `Card`)
            client: Client, // the Room's `client` instance which this data is going to be filtered to
            value: RoleCard['used'], // the value of the field to be filtered. (value of `number` field)
            root: Schema // the root state Schema instance
        ) {
            return  this.sessionId === client.sessionId;
        })
    */
    finalMessage(book, real, wrong) {
        if (this.lie == true) {
            book.addPrivateMessage(this, wrong, this.title() + wrong + "(伪)");
        }
        else {
            if (real == "")
                return;
            book.addPrivateMessage(this, real, this.title() + real);
        }
    }
    addMessage(msg) {
        this.messages.push(msg);
    }
    checkDemonBuff(book) {
        var immune = false;
        var shield = false;
        var result = false;
        var demon = this.buffs.get('imp');
        var monk = this.buffs.get('monk');
        if (demon) {
            if (this.id == "soldier") {
                if ((this.poisoned) || (this.drunked)) {
                    book.addMessage(this.title() + "无法使用被动技能");
                }
                else {
                    book.addMessage(this.title() + "发动了被动技能");
                    immune = true;
                }
            }
            if (monk) {
                book.addMessage("僧侣保护了" + this.title() + " <平安夜>");
                shield = true;
            }
            if (shield || immune) {
            }
            else {
                let nominate = new NominateState_1.Nominate().assign({
                    id: this.id,
                    name: this.name,
                    targetSeatId: this.seatId,
                    starterSeatId: demon.seatId,
                    round: book.round,
                    closed: true,
                    method: "buff",
                    executed: false
                });
                book.addVictime(nominate);
                this.deadRound = book.round;
                this.claimDeath();
                //book.addMessage(real);
                result = true;
            }
        }
        if (this.buffs.has('imp'))
            this.buffs.delete('imp');
        if (this.buffs.has('monk'))
            this.buffs.delete('monk');
        return result;
    }
    claimDeath() {
        //   book.addPrivateMessage(this,"你进入死亡状态",this.title()+"死亡")
        this.dead = true;
        this.alive = false;
    }
    claimAlive() {
        this.dead = false;
        this.alive = true;
    }
    getReal(book, exceptIds, team1, team2) {
        var result = "";
        var a = book.getOneRandomRole(exceptIds, team1, true, true);
        if (!a)
            return result;
        exceptIds.push(a.id);
        var b = book.getOneRandomRole(exceptIds, team2, true, true);
        var showName = a.name;
        if (this.id == "investigator")
            if (a.id == "drunk")
                showName = a.replaceName;
        if (Number(a.seatId) < Number(b.seatId))
            result = a.seatId + "或" + b.seatId + "是" + showName;
        else
            result = b.seatId + "或" + a.seatId + "是" + showName;
        console.warn("getReal.......................");
        console.warn(this.title() + ":" + result);
        return result;
    }
    getWrong(book, exceptIds, team1, team2) {
        var result = "";
        var c = book.getOneRandomRole(exceptIds, team1, true, false);
        if (!c) {
            c = book.getOneRandomRole(exceptIds, team1, true, true);
        }
        exceptIds.push(c.id);
        var a = book.getOneRandomRole(exceptIds, "", true, true);
        exceptIds.push(a.id);
        var b = book.getOneRandomRole(exceptIds, "", true, true);
        if (Number(a.seatId) < Number(b.seatId))
            result = a.seatId + "或" + b.seatId + "是" + c.name;
        else
            result = b.seatId + "或" + a.seatId + "是" + c.name;
        console.warn("getWrong.......................");
        console.warn(this.title() + ":" + result);
        return result;
    }
    changeRoleSkill(book) {
        var result;
        result = this;
        //   var realSeatId = this.seatId; //用此来标记原来的座位
        this.realSeatId = this.seatId; //用此来标记原来的座位
        if (this.id == "recluse") {
            if (this.poisoned) {
                book.addMessage(this.title() + "中毒了，无法改变身份");
                return result;
            }
            if (book.yesOrNo(false)) {
                var exceptIds = [this.id];
                var a;
                if (book.yesOrNo(false)) {
                    a = book.getOneRandomRoleInTeamm(exceptIds, 'minion');
                    a.realSeatId = this.realSeatId;
                }
                else {
                    a = book.getOneRandomRoleInTeamm(exceptIds, 'demon');
                    a.realSeatId = this.realSeatId;
                }
                book.addMessage(this.title() + "发动技能改变身份为" + a.name + book.getLuck());
                result = a;
            }
            else {
                book.addMessage(this.title() + "发动技能改变身份失败" + book.getLuck());
                result = this;
            }
        }
        if (this.id == "spy") {
            if (this.poisoned) {
                book.addMessage(this.title() + "中毒了，无法改变身份");
                return result;
            }
            if (book.yesOrNo(false)) {
                var exceptIds = [this.id];
                var a;
                if (book.yesOrNo(false)) {
                    a = book.getOneRandomRoleInTeamm(exceptIds, 'townsfolk');
                    a.realSeatId = this.realSeatId;
                }
                else {
                    a = book.getOneRandomRoleInTeamm(exceptIds, 'outsider');
                    a.realSeatId = this.realSeatId;
                }
                book.addMessage(this.title() + "发动技能改变身份为" + a.name + book.getLuck());
                result = a;
            }
            else {
                book.addMessage(this.title() + "发动技能改变身份失败" + book.getLuck());
                result = this;
            }
        }
        return result;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "sessionId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "replaceName", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "edition", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "team", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], RoleCard.prototype, "firstNight", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "firstNightReminder", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], RoleCard.prototype, "otherNight", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "otherNightReminder", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "abilityId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "ability", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "realSeatId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "playerId", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], RoleCard.prototype, "idx", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "locked", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "alive", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "lie", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "used", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "witch", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "sergant", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "citizen", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "picked", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "drunked", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "poisoned", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "dead", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], RoleCard.prototype, "poisonPeriod", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "marked", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "diablePreview", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "voteOnly", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "statu", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "triggerAfterDeath", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "enableSkill", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], RoleCard.prototype, "minion", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], RoleCard.prototype, "outsider", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], RoleCard.prototype, "townsfolk", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "wish", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "isMayor", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "isVirgin", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], RoleCard.prototype, "robot", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], RoleCard.prototype, "deadRound", void 0);
__decorate([
    schema_1.type(["string"]),
    __metadata("design:type", Array)
], RoleCard.prototype, "possibility", void 0);
__decorate([
    schema_1.type(["string"]),
    __metadata("design:type", Array)
], RoleCard.prototype, "messages", void 0);
__decorate([
    schema_1.type(["string"]),
    __metadata("design:type", Array)
], RoleCard.prototype, "targets", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], RoleCard.prototype, "target", void 0);
__decorate([
    schema_1.type({ map: TowerRoomHandCardState_1.HandCard }),
    __metadata("design:type", Object)
], RoleCard.prototype, "buffs", void 0);
__decorate([
    schema_1.filter(function (// the instance of the class `@filter` has been defined (instance of `Card`)
    client, // the Room's `client` instance which this data is going to be filtered to
    value, // the value of the field to be filtered. (value of `number` field)
    root // the root state Schema instance
    ) {
        return this.sessionId === client.sessionId;
    }),
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "seatId", void 0);
exports.RoleCard = RoleCard;
