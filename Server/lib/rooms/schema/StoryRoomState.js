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
exports.StoryRoomState = exports.Result = exports.Evidence = exports.Event = exports.Option = exports.Condition = exports.Progress = void 0;
const schema_1 = require("@colyseus/schema");
const RoleCardState_1 = require("./RoleCardState");
const HandCardState_1 = require("./HandCardState");
const PlayerState_1 = require("./PlayerState");
const SeatState_1 = require("./SeatState");
class Progress extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.buff = false;
        this.hand = false;
        this.timeOut = 0;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Progress.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Progress.prototype, "name", void 0);
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
], Progress.prototype, "timeOut", void 0);
exports.Progress = Progress;
class Condition extends schema_1.Schema {
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Condition.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Condition.prototype, "filed", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Condition.prototype, "compare", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Condition.prototype, "value", void 0);
exports.Condition = Condition;
class Option extends schema_1.Schema {
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Option.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Option.prototype, "content", void 0);
exports.Option = Option;
class Event extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.targetPlayer = new PlayerState_1.Player();
        this.source = new schema_1.MapSchema();
        this.target = new schema_1.MapSchema();
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Event.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Event.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Event.prototype, "content", void 0);
__decorate([
    schema_1.type(PlayerState_1.Player),
    __metadata("design:type", PlayerState_1.Player)
], Event.prototype, "targetPlayer", void 0);
__decorate([
    schema_1.type({ map: Condition }),
    __metadata("design:type", Object)
], Event.prototype, "source", void 0);
__decorate([
    schema_1.type({ map: Condition }),
    __metadata("design:type", Object)
], Event.prototype, "target", void 0);
exports.Event = Event;
class Evidence extends schema_1.Schema {
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Evidence.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Evidence.prototype, "content", void 0);
exports.Evidence = Evidence;
class Result extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.evidence = new Evidence();
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Result.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Result.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Result.prototype, "content", void 0);
__decorate([
    schema_1.type(Evidence),
    __metadata("design:type", Evidence)
], Result.prototype, "evidence", void 0);
exports.Result = Result;
class StoryRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.seats = new schema_1.MapSchema();
        this.characters = new schema_1.MapSchema();
        this.seatIdx = 0;
        this.pid = 0;
        this.serverTime = 0;
        this.chatMessageCount = 0;
        this.reconnectCount = 0;
        this.timeOut = 0;
        this.maxClients = 0;
        this.maxSeats = 12;
        this.minSeats = 2;
        this.playerChooseCharacter = false;
        this.witchMoved = false;
        this.sergantMoved = false;
        this.playerMoved = false;
        this.gameOver = false;
        this.systemTimeout = 0;
        this.seatChanged = 0;
        // @type("number") lastBuffTime: number=0;  
        //@type([Player]) players2: Player[] = new ArraySchema<Player>();
        //  @type(["number"]) board: number[] = new ArraySchema<number>(0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.pids = new schema_1.MapSchema();
        this.evidences = new schema_1.MapSchema();
        this.roleCardDeck = new RoleCardState_1.RoleCardDeck();
        this.handCardDeck = new HandCardState_1.HandCardDeck();
        /*
            setLastBuffTime(){
                this.lastBuffTime = this.serverTime;
            }
        */
    }
    init() {
        var data = [
            { id: '10', name: '加入房间', timeOut: 1, func: '' },
            { id: '20', name: '座位调整', timeOut: 2, func: 'doAutoSeatReady' },
            { id: '25', name: '人物选单', timeOut: 1, func: 'doAutoSelectCharacter' },
            { id: '30', name: '设定参数', timeOut: 1, func: 'setRoomValue' },
            { id: '40', name: '发身份牌', timeOut: 1, func: '' },
            { id: '50', name: '发手牌', timeOut: 1, func: '' },
            { id: '60', name: '女巫放黑猫', buff: true, timeOut: 1, func: 'doAutotWitchAction' },
            { id: '61', name: 'blackcat   ', buff: true, timeOut: 1, func: 'firstBlackCat' },
            { id: '70', name: '下个玩家', buff: true, timeOut: 1, func: 'nextTurn' },
            { id: '80', name: '等待玩家行动', buff: false, timeOut: 5, func: 'doAutoPlayerAction' },
            { id: '81', name: '已抽牌', timeOut: 1, func: 'dealed' },
            { id: '82', name: '已出牌', buff: false, timeOut: 1, func: 'dealed' },
            { id: '83', name: '被扣', timeOut: 1, func: 'cuffed' },
            { id: '800', name: '黑夜了   ', timeOut: 1, func: 'nightComing' },
            { id: '801', name: '女巫剌杀', timeOut: 1, func: 'doAutotWitchAction' },
            { id: '802', name: '警长保护', timeOut: 1, func: 'doAutoSergantAction' },
            { id: '803', name: '玩家自首', buff: false, timeOut: 1, func: 'doAutoSurrenderAction' },
            { id: '804', name: '自首结算', timeOut: 1, func: 'checkSurrenderSucess' },
            { id: '805', name: '警长保护了', timeOut: 1, func: '' },
            { id: '806', name: '没有警长', timeOut: 1, func: '' },
            { id: '807', name: '没有黑猫', timeOut: 1, func: '' },
            { id: '808', name: '结算死亡', timeOut: 1, func: 'checkMurderScuess' },
            { id: '809', name: '因为自首保命了', timeOut: 1, func: '' },
            { id: '900', name: '抽到传染', timeOut: 1, func: '' },
            { id: '901', name: '开身份牌', timeOut: 1, func: 'doAutoKillerAction' },
            { id: '902', name: '玩家进行传染', timeOut: 1, func: 'doAutotInfectAction' },
            { id: '903', name: '传染结算', timeOut: 3, func: 'checkInfectSucess' },
            { id: '999', name: '结算是否结束', timeOut: 1, func: 'doCheckGameOverAction' },
            { id: '910', name: '游戏结束', timeOut: 1, func: 'doAutoGameOverAction' },
            { id: '911', name: '公布结果', timeOut: 1, func: 'doAutoReportScore' },
            { id: '912', name: '重新开始', timeOut: 1, func: 'doAutoRestart' },
        ];
        var pids = this.pids;
        for (var i = 0; i < data.length; i++) {
            var p = new Progress().assign(data[i]);
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
    getPlayerOwnBlackCat() {
        var result;
        var blackcatCard = this.handCardDeck.blackCatCard;
        this.players.forEach((player) => {
            var buffCards = player.buffCards;
            var p = player;
            buffCards.forEach((card) => {
                if (card.id == blackcatCard.id) {
                    result = player;
                }
            });
        });
        return result;
    }
    getSergant() {
        var p;
        this.players.forEach((player) => {
            player.checkRole();
            // console.log(player.name+" 身份是:"+player.getRole());
            /*
            if (player.sergant){
                console.log(player.name+" 是警长!!!!");
                return player;
            }
            */
            if (player.alive && player.sergant) {
                console.log(player.name + " 是警长!!!!");
                p = player;
            }
        });
        return p;
    }
    getRandomPlayerAlive(exceptId) {
        /*
        var count = this.players.size;
        const a = Array.from( this.players.values());
        var player;
        var finding = true;
        while(finding){
            var n = Math.floor(Math.random() *  count + 1)-1;
            player =a[n];
        
            if (exceptId!=player.id) {
                if (player.alive == true){
                    finding = false;
                   
                    return  player;
                }
            }
        }
        */
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
        var seat = this.seats.get(fromThisPlayer);
        var nextSeatId = seat.next;
        var player = this.players.get(nextSeatId);
        return player;
    }
    getPreviousPlayer(fromThisPlayer) {
        // var playerId= this.seats.get(fromThisPlayer)
        var seat = this.seats.get(fromThisPlayer);
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
    deletePickCard() {
        this.players.forEach((player) => {
            var cards = Array.from(player.pickRoleCard.keys());
            var cardId = cards[0];
            var card = player.pickRoleCard.get(cardId);
            this.players.forEach((p) => {
                if (p.id != player.id) {
                    if (p.roleCards.has(card.id)) {
                        p.roleCards.delete(card.id);
                        console.log("delete pickcard ", card.id);
                    }
                }
            });
            player.pickRoleCard.clear();
        });
    }
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
            var _a = seatA.idx;
            var _b = seatB.idx;
            seatA.idx = _b;
            seatB.idx = _a;
        }
        this.sortSeat();
        this.setSeat();
        this.seatChanged = new Date().getTime();
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
            //  this.seats.get(a[i]).next =a[j];
            //  this.seats.get(a[i]).previous =a[k];
            this.seats.get(a[i]).next = b[j].playerId;
            this.seats.get(a[i]).previous = b[k].playerId;
        }
        this.seats.forEach((seat) => {
            var player = this.players.get(seat.playerId);
            if (player)
                seat.name = player.name;
        });
    }
    playerDropAllHandCard(player) {
        if (!player)
            return;
        player.handCards.forEach((card) => {
            card.used = true;
            this.handCardDeck.usedCards.set(card.id, card);
        });
        player.handCards.clear();
        player.hands = 0;
    }
}
__decorate([
    schema_1.type({ map: PlayerState_1.Player }),
    __metadata("design:type", Object)
], StoryRoomState.prototype, "players", void 0);
__decorate([
    schema_1.type({ map: SeatState_1.Seat }),
    __metadata("design:type", Object)
], StoryRoomState.prototype, "seats", void 0);
__decorate([
    schema_1.type({ map: PlayerState_1.PlayerCharacter }),
    __metadata("design:type", Object)
], StoryRoomState.prototype, "characters", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "seatIdx", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "pid", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], StoryRoomState.prototype, "pidName", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "serverTime", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "chatMessageCount", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "reconnectCount", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "timeOut", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "maxClients", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "maxSeats", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "minSeats", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], StoryRoomState.prototype, "seed", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], StoryRoomState.prototype, "playerChooseCharacter", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], StoryRoomState.prototype, "winner", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], StoryRoomState.prototype, "currentTurn", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], StoryRoomState.prototype, "witchMoved", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], StoryRoomState.prototype, "sergantMoved", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], StoryRoomState.prototype, "playerMoved", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], StoryRoomState.prototype, "gameOver", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "systemTimeout", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], StoryRoomState.prototype, "seatChanged", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], StoryRoomState.prototype, "playerUseCard", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], StoryRoomState.prototype, "playerAddCard", void 0);
__decorate([
    schema_1.type({ map: Progress }),
    __metadata("design:type", Object)
], StoryRoomState.prototype, "pids", void 0);
__decorate([
    schema_1.type({ map: Evidence }),
    __metadata("design:type", Object)
], StoryRoomState.prototype, "evidences", void 0);
__decorate([
    schema_1.type(RoleCardState_1.RoleCardDeck),
    __metadata("design:type", RoleCardState_1.RoleCardDeck)
], StoryRoomState.prototype, "roleCardDeck", void 0);
__decorate([
    schema_1.type(HandCardState_1.HandCardDeck),
    __metadata("design:type", HandCardState_1.HandCardDeck)
], StoryRoomState.prototype, "handCardDeck", void 0);
exports.StoryRoomState = StoryRoomState;
