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
exports.RoleManager = void 0;
//import {Client} from "colyseus";
const schema_1 = require("@colyseus/schema");
//import { RoleCard} from "./TowerRoomRoleCardState";
const TroubleRole_1 = require("./TroubleRole");
//import { Action} from "./TowerRoomMagicBook";
const TowerRoomHandCardState_1 = require("./TowerRoomHandCardState");
const TowerRoomWishRole_1 = require("./TowerRoomWishRole");
const roles_json_1 = __importDefault(require("./json/roles.json"));
class RoleManager extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.roleCards = new schema_1.MapSchema();
        this.used = new schema_1.MapSchema();
        this.wished = new schema_1.MapSchema();
        this.traveler = new schema_1.MapSchema();
        this.roles = new schema_1.MapSchema();
        this.wishRoles = new schema_1.MapSchema();
        this.buffs = new schema_1.MapSchema();
        this.order = new schema_1.MapSchema();
        this.orders = new schema_1.ArraySchema();
    }
    init(options) {
        var editorId = options.id;
        for (var i = 0; i < roles_json_1.default.length; i++) {
            var str = String(i);
            var role = roles_json_1.default[i];
            if (role.edition == editorId) {
                var roleCard = new TroubleRole_1.RoleCard().assign(role);
                roleCard.abilityId = roleCard.id;
                if (role.possibility)
                    roleCard.possibility = role.possibility;
                else
                    roleCard.possibility = [];
                this.roleCards.set(roleCard.id, roleCard);
            }
        }
        console.log("RoleManager init " + this.roleCards.size);
    }
    randomString(e) {
        e = e || 32;
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678", a = t.length, n = "";
        for (var i = 0; i < e; i++)
            n += t.charAt(Math.floor(Math.random() * a));
        return n;
    }
    arandom(a, b) {
        return (Math.random() > 0.5) ? 1 : -1;
        ;
    }
    shuffle() {
        var count = this.roleCards.size;
        const arr = Array.from(this.roleCards.values());
        arr.sort(this.arandom);
        for (var i = 0; i < arr.length; i++) {
            this.roleCards.set(String(i), arr[i]);
        }
    }
    deal() {
        var keys = this.roleCards.keys();
        const arr = Array.from(keys);
        var roleCard = this.roleCards.get(arr[0]);
        this.roleCards.delete(arr[0]);
        return roleCard;
    }
    /**
     * 从全部的牌推中抽出一张角色使用。
     */
    //townsfolk
    dealRandomRoleCard(team) {
        let arr = Array.from(this.roleCards.values());
        let res1 = arr.filter((item, index, array) => {
            return (item.team == team); // &&(item.edition =="tb")
        });
        var ran1 = Math.floor((Math.random() * res1.length) + 0);
        var card1 = res1[ran1];
        if (card1)
            this.roleCards.delete(card1.id);
        return card1;
    }
    dealCard(id) {
        let card = this.roleCards.get(id);
        if (card)
            this.roleCards.delete(card.id);
        return card;
    }
    pickCard(id, team) {
        let card = this.roleCards.get(id);
        let result;
        if (card) {
            if (card.team == team) {
                this.roleCards.delete(card.id);
                result = card;
            }
        }
        return result;
    }
    /*
    设定预选角色用的
    */
    getRandomRoleCard(exceptIds, team) {
        let arr = Array.from(this.roleCards.values());
        let res = arr.filter((item, index, array) => {
            return ((item.team == team) && (item.diablePreview == false)); // &&(item.edition =="tb")
        });
        let res1 = res.filter((item, index, array) => {
            var found = false;
            for (var i = 0; i < exceptIds.length; i++) {
                var e = exceptIds[i];
                if (e == item.id)
                    found = true;
            }
            if (found == false) {
                return item;
            }
        });
        var ran1 = Math.floor((Math.random() * res1.length) + 0);
        var card1 = res1[ran1];
        //this.roleCards.delete(card1.id);
        return card1;
    }
    /*
    设定随机角色用的
    */
    getRandomRole(team) {
        let arr = Array.from(this.roleCards.values());
        let res1 = arr.filter((item, index, array) => {
            return (item.team == team); // &&(item.edition =="tb")
        });
        var ran1 = Math.floor((Math.random() * res1.length) + 0);
        var card1 = res1[ran1];
        //this.roleCards.delete(card1.id);
        return card1;
    }
    execute(seatId) {
        this.roles.forEach((role) => {
            if (role.seatId == seatId) {
                role.alive = false;
                this.roles.set(role.id, role);
            }
        });
    }
    finishOther(book) {
        for (var i = 1; i <= book.playerCount; i++) {
            var idx = i;
            var role;
            var found = false;
            this.wished.forEach((role) => {
                if (role.idx == idx) {
                    found = true;
                }
            });
            if (found == false) {
                // var seat:Seat = book.seatManager.getSeatByPlayerId(wish.playerId);
                let arrRole = Array.from(this.used.values());
                var _role = arrRole[0];
                _role.idx = idx;
                _role.seatId = String(idx);
                _role.wish = true;
                this.wished.set(_role.id, _role);
                this.used.delete(_role.id);
            }
        }
    }
    replaceRole(book) {
        if (this.isRoleUsed('drunk')) {
            var drunk = this.roles.get('drunk');
            var role = book.getOneRandomRole(['drunk'], 'townsfolk', true, false);
            if (!role)
                return;
            //   if (!role) role =  book.getOneRandomRole(['drunk'],'townsfolk',true,true)
            drunk.replaceName = drunk.name;
            drunk.name = role.name;
            drunk.drunked = true;
            drunk.abilityId = role.abilityId;
            drunk.firstNight = role.firstNight;
            drunk.otherNight = role.otherNight;
            //this.used.set(drunk.id,drunk);
            this.roles.set(drunk.id, drunk);
            book.addMessage("有酒鬼，用另一个角色取代了:" + role.name);
        }
    }
    roleMark(book) {
        if (this.isRoleUsed('fortuneteller')) {
            var role1 = book.getOneRandomRole(['fortuneteller'], 'townsfolk', true, true);
            var role2 = book.getOneRandomRole(['fortuneteller'], 'outsider', true, true);
            if ((this.dropDice()) && role2) {
                book.addMessage(role2.title() + "被占卜师标记为宿敌");
                role2.marked = true;
            }
            else {
                role1.marked = true;
                book.addMessage(role1.title() + "被占卜师标记为宿敌");
            }
        }
    }
    isRoleUsed(id) {
        var result;
        var role = this.roles.get(id);
        if (role) {
            if (role.used)
                return true;
            else
                return false;
        }
        return result;
    }
    finishWish(book) {
        this.used.forEach((role) => {
            if (role.wish) {
                // console.log(role.name)
                var wish = this.getWishRole(role);
                var seat = book.seatManager.getSeatByPlayerId(wish.playerId);
                if (!seat) {
                    console.error("finishWish no seat");
                }
                if (wish.done == false) {
                    role.seatId = wish.seatId;
                    role.playerId = wish.playerId;
                    role.idx = wish.idx;
                    role.used = true;
                    role.sessionId = seat.sessionId;
                    wish.assigned = true;
                    //  this.wishRoles.delete(wish.id);
                    this.closeWish(role.name);
                    this.wished.set(role.id, role);
                    this.used.delete(role.id);
                }
            }
        });
    }
    getWishRole(role) {
        var result;
        let arrRole = Array.from(this.wishRoles.values());
        let res = arrRole.filter((item, index, array) => {
            return ((item.name == role.name) && (item.assigned == false));
        });
        var ran = Math.floor((Math.random() * res.length) + 0);
        result = res[ran];
        return result;
    }
    closeWish(name) {
        this.wishRoles.forEach((wish) => {
            if (wish.name == name) {
                wish.done = true;
            }
        });
    }
    fillRoleByWish(id, option) {
        var card = this.roleCards.get(id);
        if (!card)
            return option;
        var opt = 0;
        var team = card.team;
        switch (team) {
            case 'demon':
                opt = option.demon;
                break;
            case 'minion':
                opt = option.minion;
                break;
            case 'outsider':
                opt = option.outsider;
                break;
            case 'townsfolk':
                opt = option.townsfolk;
                break;
        }
        if (opt > 0) {
            card.wish = true;
            // this.roles.set(card.id,card);
            this.used.set(card.id, card);
            this.roleCards.delete(card.id);
            if (card.minion) {
                // console.warn("card.minion:",card.minion)
                option.minion += card.minion;
            }
            if (card.outsider) {
                //  console.warn("card.outsider:",card.outsider)
                option.outsider += card.outsider;
            }
            if (card.townsfolk) {
                // console.warn("card.townsfolk:",card.townsfolk)
                option.townsfolk += card.townsfolk;
            }
            if (this.roles.has(card.id)) {
                //  console.log(card.name)
                opt--;
            }
        }
        switch (team) {
            case 'demon':
                option.demon = opt;
                break;
            case 'minion':
                option.minion = opt;
                break;
            case 'outsider':
                option.outsider = opt;
                break;
            case 'townsfolk':
                option.townsfolk = opt;
                break;
        }
        return option;
    }
    fillRoleByTeam(team, option) {
        // var card =this.roleCards.get(id);
        var card = this.getRandomRole(team);
        if (!card)
            return option;
        var opt = 0;
        var team = card.team;
        switch (team) {
            case 'demon':
                opt = option.demon;
                break;
            case 'minion':
                opt = option.minion;
                break;
            case 'outsider':
                opt = option.outsider;
                break;
            case 'townsfolk':
                opt = option.townsfolk;
                break;
        }
        if (opt > 0) {
            card.used = true;
            console.log(card.name);
            this.used.set(card.id, card);
            this.roleCards.delete(card.id);
            if (card.minion) {
                option.minion += card.minion;
            }
            if (card.outsider) {
                option.outsider += card.outsider;
            }
            if (card.townsfolk) {
                option.townsfolk += card.townsfolk;
            }
            if (this.roles.has(card.id)) {
                opt--;
            }
        }
        switch (team) {
            case 'demon':
                option.demon = opt;
                break;
            case 'minion':
                option.minion = opt;
                break;
            case 'outsider':
                option.outsider = opt;
                break;
            case 'townsfolk':
                option.townsfolk = opt;
                break;
        }
        //  console.log("option:",option.getList())
        return option;
    }
    fillRoleMustHave(id, option) {
        // var card =this.roleCards.get(id);
        var card = this.roleCards.get(id);
        if (!card)
            return option;
        var opt = 0;
        var team = card.team;
        switch (team) {
            case 'demon':
                opt = option.demon;
                break;
            case 'minion':
                opt = option.minion;
                break;
            case 'outsider':
                opt = option.outsider;
                break;
            case 'townsfolk':
                opt = option.townsfolk;
                break;
        }
        if (opt > 0) {
            this.roles.set(card.id, card);
            //  this.used.set(card.id,card);
            this.roleCards.delete(card.id);
            if (card.minion) {
                //  console.warn("card.minion:",card.minion)
                option.minion += card.minion;
            }
            if (card.outsider) {
                //   console.warn("card.outsider:",card.outsider)
                option.outsider += card.outsider;
            }
            if (card.townsfolk) {
                // console.warn("card.townsfolk:",card.townsfolk)
                option.townsfolk += card.townsfolk;
            }
            if (this.roles.has(card.id)) {
                //   console.log(card.name)
                opt--;
            }
        }
        switch (team) {
            case 'demon':
                option.demon = opt;
                break;
            case 'minion':
                option.minion = opt;
                break;
            case 'outsider':
                option.outsider = opt;
                break;
            case 'townsfolk':
                option.townsfolk = opt;
                break;
        }
        return option;
    }
    dropDice() {
        var result = false;
        var ran = Math.floor((Math.random() * 100) + 0);
        if (ran > 50)
            result = true;
        return result;
    }
    yesOrNo() {
        return this.dropDice();
    }
    /**
     *
     */
    setUsedCard(team, option) {
        let arrRole = Array.from(this.roles.values());
        let res = arrRole.filter((item, index, array) => {
            return ((item.team == team) && (item.used == true));
        });
        var opt = 0;
        switch (team) {
            case 'demon':
                opt = option.demon;
                break;
            case 'minion':
                opt = option.minion;
                break;
            case 'outsider':
                opt = option.outsider;
                break;
            case 'townsfolk':
                opt = option.townsfolk;
                break;
        }
        // for (var i =0 ;i <need;i++){
        if (opt > 0) {
            var card = this.dealRandomRoleCard(team);
            if (card) {
                card.used = true;
                this.roleCards.delete(card.id);
                this.roles.set(card.id, card);
                // this.used.set(card.id,card);
            }
            if (!card)
                return option;
            if (card.minion) {
                //onsole.warn("card.minion:",card.minion)
                option.minion += card.minion;
            }
            if (card.outsider) {
                // console.warn("card.outsider:",card.outsider)
                option.outsider += card.outsider;
            }
            if (card.townsfolk) {
                //console.warn("card.townsfolk:",card.townsfolk)
                option.townsfolk += card.townsfolk;
            }
            if (this.roles.has(card.id)) {
                // console.log(card.name)
                opt--;
            }
        }
        // }
        switch (team) {
            case 'demon':
                option.demon = opt;
                break;
            case 'minion':
                option.minion = opt;
                break;
            case 'outsider':
                option.outsider = opt;
                break;
            case 'townsfolk':
                option.townsfolk = opt;
                break;
        }
        return option;
    }
    getWishRoleNotAssigned() {
        var result;
        let arr = Array.from(this.wishRoles.values());
        var wishes = arr.filter((item, index, array) => {
            return item.assigned == false;
        });
        if (wishes.length > 0) {
            var ran = Math.floor((Math.random() * wishes.length) + 0) - 1;
            if (ran < 0)
                ran = 0;
            var wish = wishes[ran];
            result = wish;
        }
        return result;
    }
    getOneRandomRole(exceptIds, team, alive, used) {
        var result = new TroubleRole_1.RoleCard();
        var _roleCard;
        let arr = Array.from(this.roles.values());
        let res = arr.filter((item, index, array) => {
            if ((team == null) || (team == "") || (!team)) {
                return ((item.alive == alive) && (item.used == used));
            }
            else {
                return ((item.team == team) && (item.alive == alive) && (item.used == used));
            }
        });
        let res1 = res.filter((item, index, array) => {
            var found = false;
            for (var i = 0; i < exceptIds.length; i++) {
                var e = exceptIds[i];
                if (e == item.id)
                    found = true;
            }
            if (found == false) {
                return item;
            }
        });
        if (_roleCard) {
            console.log(res1.length);
            res1.push(_roleCard);
            console.log(res1.length);
        }
        var ran1 = Math.floor((Math.random() * res1.length) + 0);
        var answer = res1[ran1];
        if (answer)
            if (!answer.seatId) {
                answer.seatId = this.getRandomSeatId(exceptIds);
            }
        return answer;
    }
    getOneRandomRoleInTeamm(exceptIds, team) {
        return this.getRoleInTeam(exceptIds, team);
    }
    getRoleInTeam(exceptIds, team) {
        var result = new TroubleRole_1.RoleCard();
        var _roleCard;
        let arr = Array.from(this.roles.values());
        let res = arr.filter((item, index, array) => {
            return (item.team == team);
        });
        let res1 = res.filter((item, index, array) => {
            var found = false;
            for (var i = 0; i < exceptIds.length; i++) {
                var e = exceptIds[i];
                if (e == item.id)
                    found = true;
            }
            if (found == false) {
                return item;
            }
        });
        var ran1 = Math.floor((Math.random() * res1.length) + 0);
        var answer = res1[ran1];
        return answer;
    }
    getRandomSeatId(exceptIds) {
        var result = '0';
        let arr = Array.from(this.roles.values());
        let res = arr.filter((item, index, array) => {
            return ((item.alive) && (item.used));
        });
        let res1 = res.filter((item, index, array) => {
            var found = false;
            for (var i = 0; i < exceptIds.length; i++) {
                var e = exceptIds[i];
                if (e == item.id)
                    found = true;
            }
            if (found == false)
                return item;
        });
        var ran1 = Math.floor((Math.random() * res1.length) + 0);
        var answer = res1[ran1];
        result = answer.seatId;
        return result;
    }
    getUniqueWish() {
        let arr = Array.from(this.wishRoles.values());
        var result = [''];
        result.pop();
        for (var i = 0; i < arr.length; i++) {
            var wish = arr[i];
            result.push(wish.rid);
        }
        result = Array.from(new Set(result));
        return result;
    }
    getRoleBySeatId(seatId) {
        var result;
        let arr = Array.from(this.roles.values());
        let res = arr.filter((item, index, array) => {
            return ((item.seatId == seatId) && (item.used));
        });
        if (res.length == 1)
            return res[0];
        else
            console.error("critical error on getRoleBySeatId:" + res.length);
        return result;
    }
    getRoleBySessionId(sessionId) {
        var result;
        let arr = Array.from(this.roles.values());
        let res = arr.filter((item, index, array) => {
            return ((item.sessionId == sessionId) && (item.used));
        });
        if (res.length == 1)
            return res[0];
        else
            console.error("critical error on getRoleBySessionId ");
        return result;
    }
    setRoleTargets(sessionId, targets) {
        var result = false;
        var role = this.getRoleBySessionId(sessionId);
        if (!role)
            return false;
        role.targets = targets;
        result = true;
        return result;
    }
    /**
     *
     */
    getDemonJustDead() {
        var role;
        let arr = Array.from(this.roles.values());
        let res = arr.filter((item, index, array) => {
            return ((item.team == "demon") && (item.used) && (item.dead) && (item.checkDead == false));
        });
        if (res.length == 1)
            return res[0];
        else
            console.error("critical error on getRoleBySessionId ");
        return role;
    }
}
__decorate([
    schema_1.type({ map: TroubleRole_1.RoleCard }),
    __metadata("design:type", Object)
], RoleManager.prototype, "roleCards", void 0);
__decorate([
    schema_1.type({ map: TroubleRole_1.RoleCard }),
    __metadata("design:type", Object)
], RoleManager.prototype, "used", void 0);
__decorate([
    schema_1.type({ map: TroubleRole_1.RoleCard }),
    __metadata("design:type", Object)
], RoleManager.prototype, "wished", void 0);
__decorate([
    schema_1.type({ map: TroubleRole_1.RoleCard }),
    __metadata("design:type", Object)
], RoleManager.prototype, "traveler", void 0);
__decorate([
    schema_1.type({ map: TroubleRole_1.RoleCard }),
    __metadata("design:type", Object)
], RoleManager.prototype, "roles", void 0);
__decorate([
    schema_1.type({ map: TowerRoomWishRole_1.WishRole }),
    __metadata("design:type", Object)
], RoleManager.prototype, "wishRoles", void 0);
__decorate([
    schema_1.type({ map: TowerRoomHandCardState_1.HandCard }),
    __metadata("design:type", Object)
], RoleManager.prototype, "buffs", void 0);
__decorate([
    schema_1.type({ map: TroubleRole_1.RoleCard }),
    __metadata("design:type", Object)
], RoleManager.prototype, "order", void 0);
__decorate([
    schema_1.type(["string"]),
    __metadata("design:type", Array)
], RoleManager.prototype, "orders", void 0);
exports.RoleManager = RoleManager;
