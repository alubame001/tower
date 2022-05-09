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
exports.TowerRoomState = exports.Progress = exports.Options = void 0;
const schema_1 = require("@colyseus/schema");
//import {  RoleCard} from "./TowerRoomRoleCardState";
const TroubleRole_1 = require("./TroubleRole");
const TowerRoomHandCardState_1 = require("./TowerRoomHandCardState");
const TowerRoomPlayerState_1 = require("./TowerRoomPlayerState");
const TowerRoomMagicBook_1 = require("./TowerRoomMagicBook");
const roles = require('./json/roles.json');
const editions = require('./json/editions.json');
const progressIds = require('./json/progressId.json');
const game = require('./json/game.json');
//import { Vector3 } from "../../helpers/Vectors";
class Options extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.playerChooseCharacter = true;
        this.maxClients = 15;
        this.reconnect = false;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Options.prototype, "id", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Options.prototype, "robots", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Options.prototype, "playerChooseCharacter", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Options.prototype, "maxClients", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Options.prototype, "roomId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Options.prototype, "eid", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Options.prototype, "reconnect", void 0);
exports.Options = Options;
class Progress extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.tip = "";
        this.buff = false;
        this.hand = false;
        this.timeout = 0;
    }
    title() {
        return "(" + this.id + ")" + this.name + "<" + this.timeout + ">";
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Progress.prototype, "id", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Progress.prototype, "pid", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Progress.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Progress.prototype, "tip", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Progress.prototype, "func", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Progress.prototype, "buff", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Progress.prototype, "hand", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Progress.prototype, "timeout", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Progress.prototype, "leftTimeout", void 0);
exports.Progress = Progress;
class TowerRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.progress = new Progress();
        this.pids = new schema_1.MapSchema();
        this.options = new Options();
        this.pid = 0;
        this.i = 0;
        this.start = false;
        this.enableReconnect = false;
        this.players = new schema_1.MapSchema();
        this.characters = new schema_1.MapSchema();
        this.seatIdx = 0;
        this.serverTime = 0;
        this.chatMessageCount = 0;
        this.reconnectCount = 0;
        this.maxClients = 0;
        this.maxSeats = 16;
        this.minSeats = 5;
        this.gameOver = false;
        this.lockRoom = false;
        this.pause = false;
        this.systemTimeout = 0;
        this.seatChanged = 0;
        this.seatReseted = 0;
        this.seatUpdate = 0;
        this.iconChangedData = new TroubleRole_1.Icon();
        //@type("string") iconChangedData: string;   
        this.progressChanged = 0;
        this.playerCount = 0;
        this.serverTimeout = 0;
        this.nightDelay = 5; //晚上行动延时，建议60
        this.duskDelay = 1; //黄昏提名阶段总时长，建议600 
        this.duskDelayLeft = 0; //不用动  
        this.voteDelay = 1; //投票延时，这已经包括了双方的发言时间    建议60 
        this.dayDelay = 1; //白天公聊时长
        this.msgs = new schema_1.ArraySchema(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.roles = new schema_1.MapSchema();
        this.handCardDeck = new TowerRoomHandCardState_1.HandCardDeck();
        this.magicBook = new TowerRoomMagicBook_1.MagicBook();
    }
    // @type(MessageManager) messageManager: MessageManager = new MessageManager();
    //@type(SeatManager) seatManager: SeatManager = new SeatManager();
    init(options) {
        console.log("options", this.options.roomId);
        var data = progressIds;
        var pids = this.pids;
        for (var i = 0; i < data.length; i++) {
            var p = new Progress().assign(data[i]);
            p.pid = Number.parseInt(p.id);
            this.pids.set(p.id, p);
        }
    }
    setPlayerCharacter(sessionId, characterId) {
        if (this.players.has(sessionId)) {
            const player = this.players.get(sessionId);
            const playerCharacter = this.characters.get(characterId);
            player.playerCharacter = playerCharacter;
        }
    }
    getRandomPlayerAlive(exceptId) {
        const arr = Array.from(this.players.keys());
        arr.sort(this.arandom);
        for (var i = 0; i < arr.length; i++) {
            var id = arr[i];
            var player = this.players.get(id);
            if (exceptId) {
                if ((player.alive == true) && (player.id != exceptId)) {
                    return player;
                }
            }
            else {
                if (player.alive == true) {
                    return player;
                }
            }
        }
        return null;
    }
    getPlayerAliveCount() {
        var result = 0;
        this.players.forEach((player) => {
            if (player.life > 0) {
                result++;
            }
        });
        return result;
    }
    getWitchAliveCount() {
        var result = 0;
        this.players.forEach((player) => {
            if (player.life > 0 && player.witch) {
                result++;
            }
        });
        return result;
    }
    getCitizenAliveCount() {
        var result = 0;
        this.players.forEach((player) => {
            if (player.alive && player.witch == false) {
                result++;
            }
        });
        return result;
    }
    /*
        var arr = [1,2,3,4,5,6,7,8,9,10];
        arr.sort(this.arandom);
  */
    arandom(a, b) {
        return (Math.random() > 0.5) ? 1 : -1;
        ;
    }
    getRandomCharacterUnused() {
        var count = this.characters.size;
        const a = Array.from(this.characters.values());
        var character;
        var finding = true;
        while (finding) {
            var n = Math.floor(Math.random() * count + 1) - 1;
            character = a[n];
            if (character.used == false) {
                finding = false;
                return character;
            }
        }
    }
    getPlayerAvatarState(sessionId) {
        if (this.players.has(sessionId)) {
            const player = this.players.get(sessionId);
            return player.avatar;
        }
        return null;
    }
    getNextAlivePlayer(fromThisPlayerId) {
        if (!fromThisPlayerId) {
            console.error("no fromThisPlayerId");
        }
        // var from = fromThisPlayerId;
        let player;
        var finding = true;
        while (finding) {
            player = this.getNextPlayer(fromThisPlayerId);
            if (!player) {
                console.error("no player");
            }
            if (player.alive == true) {
                finding = false;
                return player;
            }
            else {
                fromThisPlayerId = player.id;
            }
        }
    }
    getNextPlayer(fromThisPlayer) {
        if (!fromThisPlayer) {
            console.error("no fromThisPlayerId");
        }
        var seat = this.magicBook.seatManager.get(fromThisPlayer);
        var nextSeatId = seat.next;
        var player = this.players.get(nextSeatId);
        return player;
    }
    getPreviousPlayer(fromThisPlayer) {
        if (!fromThisPlayer) {
            console.error("no fromThisPlayerId");
        }
        var seat = this.magicBook.seatManager.get(fromThisPlayer);
        var previousSeatId = seat.previous;
        var player = this.players.get(previousSeatId);
        return player;
    }
    playerAddHandCard(player, handCard) {
        if (player && handCard) {
            player.handCards.set(handCard.id, handCard);
            //  player.hands =  player.handCards.size;
            this.playerAddCard = player.id + ":" + player.handCards.size;
        }
    }
    /*
    
        deletePickCard(){
            this.players.forEach((player:Player) => {
              var cards = Array.from(player.pickRoleCard.keys());
              var cardId = cards[0];
              var card = player.pickRoleCard.get(cardId);
        
                this.players.forEach((p:Player) => {
                    if (p.id!= player.id){
                       if (p.roleCards.has(card.id)){
                         p.roleCards.delete(card.id)
                         console.log("delete pickcard ",card.id)
                       }
                    }
                })
              
    
              player.pickRoleCard.clear();
      
            })
        }
        */
    checkAlive() {
        this.players.forEach((player) => {
            player.checkAlive();
        });
    }
    checkRole() {
        this.players.forEach((player) => {
            player.checkRole();
            player.reportRole();
        });
    }
    /****************************************  about Seat
     *
     *

    */
    changeSeat(a, b) {
        this.magicBook.seatManager.changeSeat(a, b);
        this.seatChanged = new Date().getTime();
    }
    playerChangeSeat(a, b) {
        console.log("playerChangeSeat");
        this.changeSeat(a, b);
    }
    sortSeat() {
        this.magicBook.seatManager.sortSeat();
    }
    setSeat() {
        this.magicBook.seatManager.seats.forEach((seat) => {
            var player = this.players.get(seat.playerId);
            if (player)
                seat.name = player.name;
        });
    }
    getRandomPlayerNoSeat() {
        var result;
        let arr = Array.from(this.players.values());
        let res1 = arr.filter((item, index, array) => {
            return ((item.sitted == false) && (!item.admin));
        });
        // console.log('res1',res1)
        if (res1.length > 0) {
            var n = Math.floor((Math.random() * res1.length) + 0);
            result = res1[n];
            return res1[n];
        }
        else
            return result;
    }
    setMagicBook(playerCount, wishRoleFirst) {
    }
    setPlayerConnected(playerId, isConnected) {
        var player = this.players.get(playerId);
        if (!player)
            return;
        if ((isConnected == false) && (player.connected == true)) {
            player.reconnectCount++;
        }
        player.connected = isConnected;
        var msg = "";
        if (isConnected == true)
            msg = player.name + " 重新连上了!";
        else
            msg = player.name + " 断线了!";
        var seat = this.magicBook.seatManager.getSeatByPlayerId(player.id);
        if (seat)
            seat.connected = isConnected;
        return msg;
    }
    playerReachMaxReconnect(playerId, maxReconnect) {
        var result = false;
        var player = this.players.get(playerId);
        if (!player)
            return;
        if (player.reconnectCount >= maxReconnect)
            result = true;
        return result;
    }
    alllowPlayer(playerId) {
        var player = this.players.get(playerId);
        if (player)
            player.connected = true;
    }
    dropPlayer(playerId) {
        var player = this.players.get(playerId);
        if (player)
            player.connected = false;
    }
    deletePlayer(playerId) {
        if (this.players.has(playerId))
            this.players.delete(playerId);
    }
}
__decorate([
    schema_1.type(Progress),
    __metadata("design:type", Progress)
], TowerRoomState.prototype, "progress", void 0);
__decorate([
    schema_1.type({ map: Progress }),
    __metadata("design:type", Object)
], TowerRoomState.prototype, "pids", void 0);
__decorate([
    schema_1.type(Options),
    __metadata("design:type", Options)
], TowerRoomState.prototype, "options", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], TowerRoomState.prototype, "adminId", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "pid", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "i", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], TowerRoomState.prototype, "start", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], TowerRoomState.prototype, "enableReconnect", void 0);
__decorate([
    schema_1.type({ map: TowerRoomPlayerState_1.Player }),
    __metadata("design:type", Object)
], TowerRoomState.prototype, "players", void 0);
__decorate([
    schema_1.type({ map: TowerRoomPlayerState_1.PlayerCharacter }),
    __metadata("design:type", Object)
], TowerRoomState.prototype, "characters", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "seatIdx", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "serverTime", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "chatMessageCount", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "reconnectCount", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "maxClients", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "maxSeats", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "minSeats", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], TowerRoomState.prototype, "seed", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], TowerRoomState.prototype, "winner", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], TowerRoomState.prototype, "currentTurn", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], TowerRoomState.prototype, "gameOver", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], TowerRoomState.prototype, "lockRoom", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], TowerRoomState.prototype, "pause", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "systemTimeout", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "seatChanged", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "seatReseted", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "seatUpdate", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "iconChanged", void 0);
__decorate([
    schema_1.type(TroubleRole_1.Icon),
    __metadata("design:type", TroubleRole_1.Icon)
], TowerRoomState.prototype, "iconChangedData", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "progressChanged", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "playerCount", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], TowerRoomState.prototype, "playerUseCard", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], TowerRoomState.prototype, "playerAddCard", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "serverTimeout", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "nightDelay", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "duskDelay", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "duskDelayLeft", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "voteDelay", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], TowerRoomState.prototype, "dayDelay", void 0);
__decorate([
    schema_1.type(["number"]),
    __metadata("design:type", Array)
], TowerRoomState.prototype, "msgs", void 0);
__decorate([
    schema_1.type({ map: TroubleRole_1.RoleCard }),
    __metadata("design:type", Object)
], TowerRoomState.prototype, "roles", void 0);
__decorate([
    schema_1.type(TowerRoomHandCardState_1.HandCardDeck),
    __metadata("design:type", TowerRoomHandCardState_1.HandCardDeck)
], TowerRoomState.prototype, "handCardDeck", void 0);
__decorate([
    schema_1.type(TowerRoomMagicBook_1.MagicBook),
    __metadata("design:type", TowerRoomMagicBook_1.MagicBook)
], TowerRoomState.prototype, "magicBook", void 0);
exports.TowerRoomState = TowerRoomState;
