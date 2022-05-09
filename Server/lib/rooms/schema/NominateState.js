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
exports.NominateManager = exports.Nominate = exports.Ticket = void 0;
const schema_1 = require("@colyseus/schema");
const logger_1 = __importDefault(require("../../helpers/logger"));
class Ticket extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.value = 1;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Ticket.prototype, "id", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Ticket.prototype, "value", void 0);
exports.Ticket = Ticket;
class Nominate extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.tickets = new schema_1.MapSchema();
        this.value = 0;
        this.closed = false;
        this.executed = false;
    }
    countValue() {
        var i = 0;
        this.tickets.forEach((ticket) => {
            i += ticket.value;
        });
        this.value = i;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Nominate.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Nominate.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Nominate.prototype, "targetSeatId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Nominate.prototype, "starterSeatId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Nominate.prototype, "method", void 0);
__decorate([
    schema_1.type({ map: Ticket }),
    __metadata("design:type", Object)
], Nominate.prototype, "tickets", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Nominate.prototype, "round", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Nominate.prototype, "value", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Nominate.prototype, "closed", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Nominate.prototype, "executed", void 0);
exports.Nominate = Nominate;
class NominateManager extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.nominates = new schema_1.MapSchema();
        this.votes = new schema_1.MapSchema();
        this.maxRunPerRound = 3;
        this.message = new schema_1.ArraySchema();
    }
    init() {
    }
    countNominatePerRound(round) {
        var result = 0;
        let arr = Array.from(this.votes.values());
        let res = arr.filter((item, index, array) => {
            return (item.round == round);
        });
        result = res.length;
        return result;
    }
    checkNominate(seatId, starterId, round) {
        var roundId = String(round);
        var nid = roundId + ":" + seatId;
        var result = true;
        if (this.countNominatePerRound(this.round) >= this.maxRunPerRound) {
            console.log("不能提名，本轮可提名次数已达" + this.maxRunPerRound + "次");
        }
        console.log("!!!!!!!!!!!!!!!!checkNominate nid:" + nid);
        if (this.votes.has(nid)) {
            console.log("本轮不能再提名" + seatId + "号了");
            result = false;
        }
        this.votes.forEach((nominate) => {
            if (nominate.round == round) {
                if (nominate.starterSeatId == starterId) {
                    console.log(starterId + "号本轮不能再提名了");
                    result = false;
                }
            }
        });
        return result;
    }
    startNominate(target, starter) {
        var result;
        var roundId = String(this.round);
        var nid = roundId + ":" + target.seatId;
        var nominate = new Nominate().assign({
            id: nid,
            name: target.name,
            targetSeatId: target.seatId,
            starterSeatId: starter.seatId,
            round: this.round
        });
        this.votes.set(nominate.id, nominate);
        if (this.votes.has(nominate.id)) {
            var msg = starter.seatId + "号对" + target.seatId + "号提名处决，进入投票环节";
            console.log(" this.voting," + this.voting);
            this.voting = nid;
            result = msg;
        }
        return result;
    }
    /**
     * 计算出要处决的对象
     * @param alives 目前还存活的人数
     * @returns
     */
    countVote(alives) {
        var nominate;
        if (this.votes.size == 0)
            return null;
        this.votes.forEach((nominate) => {
            nominate.countValue();
        });
        var line = Math.ceil(alives / 2);
        line = 1; // to fix
        logger_1.default.silly("计票中...超过" + line + "即生效");
        let arr = Array.from(this.votes.values());
        let res = arr.filter((item, index, array) => {
            return (item.value >= line);
        });
        var i = res.length;
        let a = Array.of(0);
        a.pop();
        let _n;
        res.forEach((nominate) => {
            var i = nominate.value;
            a.push(i);
            if (i > max) {
                max = i;
                _n = nominate;
            }
        });
        a.sort();
        a.sort(function (x, y) {
            return x - y;
        });
        var max = a[0];
        let res2 = res.filter((item, index, array) => {
            return (item.value == max);
        });
        if (res2.length >= 2) {
            return null;
        }
        else {
            return res2[0];
        }
        return nominate;
    }
    execute(seatId) {
        if (!seatId)
            return;
        console.log("execute :" + seatId);
        // var vote = this.votes
    }
    checkVoteOver() {
    }
    playerVote(tickedId, value) {
        var result;
        //var tickedId = player.seatId;
        var voting = this.voting;
        console.log("voting  " + voting);
        if (!voting)
            return;
        var nominate = this.votes.get(voting);
        var ticket = new Ticket().assign({
            id: tickedId,
            value: value
        });
        result = ticket.id;
        nominate.tickets.set(ticket.id, ticket);
        return result;
    }
    playerRemoveVote(tickedId) {
        var result;
        var voting = this.voting;
        if (!voting)
            return;
        var nominate = this.votes.get(voting);
        if (nominate.tickets.has(tickedId)) {
            var ticket = nominate.tickets.get(tickedId);
            result = ticket.id;
            nominate.tickets.delete(ticket.id);
        }
        return result;
    }
    nextRound(round) {
        this.round = round;
        this.maxRunPerRound = 3;
    }
}
__decorate([
    schema_1.type({ map: Nominate }),
    __metadata("design:type", Object)
], NominateManager.prototype, "nominates", void 0);
__decorate([
    schema_1.type({ map: Nominate }),
    __metadata("design:type", Object)
], NominateManager.prototype, "votes", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], NominateManager.prototype, "round", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], NominateManager.prototype, "timeOut", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], NominateManager.prototype, "pid", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], NominateManager.prototype, "voting", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], NominateManager.prototype, "voteOver", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], NominateManager.prototype, "maxRunPerRound", void 0);
__decorate([
    schema_1.type(["string"]),
    __metadata("design:type", Array)
], NominateManager.prototype, "message", void 0);
exports.NominateManager = NominateManager;
