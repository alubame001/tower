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
exports.Role = void 0;
const schema_1 = require("@colyseus/schema");
//import { Action} from "./TowerRoomMagicBook";
const TowerRoomHandCardState_1 = require("./TowerRoomHandCardState");
//const editions = require('./json/editions.json');
//const roles = require('./json/roles.json');
//const game = require('./json/game.json');
class Role extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.seatId = "";
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
        this.possibility = new schema_1.ArraySchema('', '', '');
        //  @type(["string"]) message: string[] =   new ArraySchema<string>();
        //@type(["string"]) targetIds: string[] =   new ArraySchema<string>();
        this.targets = new schema_1.ArraySchema();
        this.target = 0;
        this.buffs = new schema_1.MapSchema();
        /**
         *
         *
         *
         */
    }
    /*
    @filter(function(
        this: Role, // the instance of the class `@filter` has been defined (instance of `Card`)
        client: Client, // the Room's `client` instance which this data is going to be filtered to
        value: Role['seatId'], // the value of the field to be filtered. (value of `number` field)
        root: Schema // the root state Schema instance
    ) {
        return  this.sessionId === client.sessionId;
    })
    */
    doAutoFunction(func, value) {
        var f;
        if (value)
            var f = eval("this." + func + "(value);"); //hello world!
        else {
            var f = eval("this." + func + "();");
        }
    }
    title() {
        if (this.realSeatId)
            return "(" + this.realSeatId + ")" + this.name;
        else
            return "(" + this.seatId + ")" + this.name;
    }
    seat() {
        if (this.realSeatId)
            return this.realSeatId + "号";
        else
            return this.seatId + "号";
    }
    status() {
        var msg = "";
        if (this.drunked)
            msg = "<酒醉>";
        if (this.poisoned)
            msg = this.statu + "<中毒>";
        return msg;
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
            this.lie = true;
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
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "sessionId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "edition", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "team", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Role.prototype, "firstNight", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "firstNightReminder", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Role.prototype, "otherNight", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "otherNightReminder", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "abilityId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "ability", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "seatId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "realSeatId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "playerId", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Role.prototype, "idx", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "locked", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "alive", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "lie", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "used", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "witch", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "sergant", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "citizen", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "picked", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "drunked", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "poisoned", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "dead", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Role.prototype, "poisonPeriod", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "marked", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "diablePreview", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "voteOnly", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "statu", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "triggerAfterDeath", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "enableSkill", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Role.prototype, "minion", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Role.prototype, "outsider", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Role.prototype, "townsfolk", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "wish", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "isMayor", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "isVirgin", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Role.prototype, "revealed", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Role.prototype, "ownerId", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Role.prototype, "deadRound", void 0);
__decorate([
    schema_1.type(["string"]),
    __metadata("design:type", Array)
], Role.prototype, "possibility", void 0);
__decorate([
    schema_1.type(["string"]),
    __metadata("design:type", Array)
], Role.prototype, "targets", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Role.prototype, "target", void 0);
__decorate([
    schema_1.type({ map: TowerRoomHandCardState_1.HandCard }),
    __metadata("design:type", Object)
], Role.prototype, "buffs", void 0);
exports.Role = Role;
/*
export class MyRoom extends Schema {
    @filterChildren(function(client: any, key: string, value: RoleCard, root: MyRoom) {
        return (value.ownerId === client.sessionId) || value.revealed;
    })
    @type({ map: RoleCard })
    cards = new MapSchema<RoleCard>();
}
*/
