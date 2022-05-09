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
exports.SeatManager = exports.Seat = void 0;
const schema_1 = require("@colyseus/schema");
//import { RoleCard } from "./tower/TowerRoomRoleCardState";
const TroubleRole_1 = require("./tower/TroubleRole");
/*
export class Test extends Schema {
  @type("string") id: string;
  @type("string") sessionId: string;
  @type("string") name: string;
  @type("string") seatId: string="";


  
  @filter(function(
      this: Test, // the instance of the class `@filter` has been defined (instance of `Card`)
      client: Client, // the Room's `client` instance which this data is going to be filtered to
      value: Test['roleCard'], // the value of the field to be filtered. (value of `number` field)
      root: Schema // the root state Schema instance
  ) {
      return  this.sessionId === client.sessionId;
  })
  @type(RoleCard) roleCard: RoleCard = new RoleCard();
  
}
*/
class Seat extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.robot = false;
        this.idx = 0;
        this.connected = false;
        this.ready = false;
        this.locked = false;
        this.alive = true;
        this.dead = false;
        this.deadRound = 0;
        this.previous = "";
        this.next = "";
        this.icons = new schema_1.MapSchema();
        this.role = new TroubleRole_1.RoleCard();
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Seat.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Seat.prototype, "sessionId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Seat.prototype, "playerId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Seat.prototype, "playerName", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Seat.prototype, "robot", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Seat.prototype, "name", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Seat.prototype, "idx", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Seat.prototype, "connected", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Seat.prototype, "ready", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Seat.prototype, "locked", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Seat.prototype, "alive", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Seat.prototype, "dead", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Seat.prototype, "deadRound", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Seat.prototype, "pendingSessionTimestamp", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Seat.prototype, "previous", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Seat.prototype, "next", void 0);
__decorate([
    schema_1.type({ map: TroubleRole_1.Icon }),
    __metadata("design:type", Object)
], Seat.prototype, "icons", void 0);
__decorate([
    schema_1.filter(function (// the instance of the class `@filter` has been defined (instance of `Card`)
    client, // the Room's `client` instance which this data is going to be filtered to
    value, // the value of the field to be filtered. (value of `number` field)
    root // the root state Schema instance
    ) {
        return ((this.sessionId === client.sessionId) && (this.sessionId != '') && (this.sessionId != undefined));
    })
    //@type(RoleCard) role = new RoleCard();
    ,
    schema_1.type(TroubleRole_1.RoleCard),
    __metadata("design:type", TroubleRole_1.RoleCard)
], Seat.prototype, "role", void 0);
exports.Seat = Seat;
class SeatManager extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.lock = false;
        this.seats = new schema_1.MapSchema();
        this.maxSeats = 1;
        this.ready = 0;
        this.lockedCount = 0;
        this.aliveCount = 0;
    }
    get(seatId) {
        return this.seats.get(seatId);
    }
    /*
        var arr = [1,2,3,4,5,6,7,8,9,10];
        arr.sort(this.arandom);
  */
    arandom(a, b) {
        return (Math.random() > 0.5) ? 1 : -1;
        ;
    }
    playerChangeSeat(player, seatId) {
        var result = false;
        var seat = this.seats.get(seatId);
        var playerSeat = this.getSeatByPlayerId(player.id);
        if (seat.locked)
            return result;
        if (playerSeat) {
            console.log("playerSeat", playerSeat.id);
            player.stand();
            this.emptySeat(playerSeat);
        }
        if (seat) {
            player.sit(seat.id);
            this.takeSeat(player, seat.id);
        }
        return true;
    }
    changeSeat(a, b) {
        if (a == b)
            return;
        if (a <= -1)
            return;
        if (b <= -1)
            return;
        var seatA;
        var seatB;
        const seatArray = Array.from(this.seats.values());
        this.seats.forEach((seat) => {
            var idx = seat.idx;
            if (idx == a) {
                seatA = seat;
            }
            if (idx == b) {
                seatB = seat;
            }
        });
        if (seatA && seatB) {
            var _a = seatA;
            var _b = seatB;
            seatA.playerId = _b.playerId;
            seatA.playerName = _b.playerName;
            seatA.robot = _b.robot;
            seatB.playerId = _a.playerId;
            seatB.playerName = _a.playerName;
            seatB.robot = _a.robot;
            //  seatB.idx = _a;  
        }
        this.sortSeat();
        this.setSeat();
    }
    sortSeat() {
        const seatArray = Array.from(this.seats.values());
        this.seats.clear();
        // console.log('seatArray',seatArray)
        for (var j = 0; j < 1000; j++) {
            for (var i = 0; i < seatArray.length; i++) {
                var seat = seatArray[i];
                if (seat.idx == j) {
                    console.log(seat.id, seat.idx, seat.name);
                    this.seats.set(seat.id, seat);
                }
            }
        }
    }
    /**设定座位前后关系
     *
     */
    //remove
    setSeat() {
        const a = Array.from(this.seats.keys());
        const b = Array.from(this.seats.values());
        for (var i = 0; i < a.length; i++) {
            var j = i + 1;
            var k = i - 1;
            if (j >= a.length)
                j = 0;
            if (k < 0)
                k = a.length - 1;
            this.seats.get(a[i]).next = b[j].playerId;
            this.seats.get(a[i]).previous = b[k].playerId;
        }
    }
    /**
     *
     * @returns 随机座位排序的array
     */
    getRandomArray() {
        const arr = Array.from(this.seats.keys());
        arr.sort(this.arandom);
        return arr;
    }
    //增加空位到最大值
    addEmptySeats(maxSeats) {
        // var j = this.lockedCount;
        var j = this.seats.size;
        for (var i = 1; i <= maxSeats; i++) {
            let seat = new Seat().assign({
                id: String(i),
                idx: i
            });
            this.seats.set(seat.id, seat);
        }
    }
    takeSeat(player, seatId) {
        if (!player)
            return;
        if (!seatId)
            return;
        var _seatId = String(seatId);
        var seat = this.seats.get(_seatId);
        if (!seat)
            return;
        if (seat.ready)
            return;
        if (!seat.locked) {
            // this.removeLastSeat(player)
            player.sitted = true;
            player.seatId = seat.id;
            //  console.log("player.sessionId",player.sessionId)
            seat.sessionId = player.sessionId;
            seat.locked = true;
            seat.connected = true;
            seat.playerId = player.id;
            seat.playerName = player.name;
            seat.robot = player.robot;
            // console.log("takeSeat done :"+player.id,"-",seatId)
            //this.countLocked();
            // this.countAlive();
        }
        // this.sort();
    }
    /*
      leaveSeat(seatId:String){
        if (!seatId) return;
    
    
      }
    */
    getEmptySeat() {
        var seat;
        for (var i = 1; i < this.maxSeats; i++) {
            var str = String(i);
            var _seat = this.seats.get(str);
            if (_seat.locked == false)
                return _seat;
        }
        return seat;
    }
    playerOnSeat(player) {
        var result;
        let arr = Array.from(this.seats.values());
        arr.forEach((seat) => {
            if (seat.playerId == player.id) {
                //console.log("got it")
                seat.sessionId = player.sessionId;
                result = seat;
            }
        });
        return result;
    }
    emptySeat(seat) {
        if (!seat)
            return;
        seat.locked = false;
        seat.playerId = null;
        seat.connected = false;
        seat.playerName = null;
        seat.ready = false;
        seat.alive = true;
        seat.previous = null;
        seat.next = null;
        seat.sessionId = null;
        this.seats.set(seat.id, seat);
    }
    disconnectSeat(seat) {
        if (!seat)
            return;
        seat.connected = false;
        this.seats.set(seat.id, seat);
    }
    getSeatByPlayerId(playerId) {
        // console.log("getSeatByPlayerId playerId:",playerId)
        var result;
        let arr = Array.from(this.seats.values());
        let res1 = arr.filter((item, index, array) => {
            return (item.playerId == playerId); // &&(item.edition =="tb")
        });
        if (res1.length == 1) {
            return res1[0];
        }
        else {
            //console.error("getSeatByPlayerId critical error" + res1.length);
            return result;
        }
        return result;
    }
    execute(seatId) {
        if (!seatId)
            return;
        var seat = this.seats.get(seatId);
        if (seat) {
            seat.alive = false;
            this.seats.set(seat.id, seat);
        }
        else {
            console.error("no seat to execute");
        }
    }
    getSeatBySessionId(sessionId) {
        var result;
        let arr = Array.from(this.seats.values());
        let res1 = arr.filter((item, index, array) => {
            return (item.sessionId == sessionId); // &&(item.edition =="tb")
        });
        console.warn("res1.length:", res1.length);
        if (res1.length == 1) {
            return res1[0];
        }
        else {
            console.error("getSeatBySessionId critical error" + res1.length);
            return result;
        }
    }
}
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], SeatManager.prototype, "lock", void 0);
__decorate([
    schema_1.type({ map: Seat }),
    __metadata("design:type", Object)
], SeatManager.prototype, "seats", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], SeatManager.prototype, "maxSeats", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], SeatManager.prototype, "ready", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], SeatManager.prototype, "lockedCount", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], SeatManager.prototype, "aliveCount", void 0);
exports.SeatManager = SeatManager;
