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
exports.Player = exports.PlayerCharacter = void 0;
const schema_1 = require("@colyseus/schema");
const AvatarState_1 = require("./AvatarState");
const RoleCardState_1 = require("./RoleCardState");
const HandCardState_1 = require("./HandCardState");
class PlayerCharacter extends schema_1.Schema {
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], PlayerCharacter.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], PlayerCharacter.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], PlayerCharacter.prototype, "brief", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], PlayerCharacter.prototype, "sexual", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], PlayerCharacter.prototype, "age", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], PlayerCharacter.prototype, "used", void 0);
exports.PlayerCharacter = PlayerCharacter;
class Player extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.playerCharacter = new PlayerCharacter();
        this.avatar = new AvatarState_1.AvatarState();
        //  @type(RoleCard) pickRoleCard = new RoleCard();
        this.pickRoleCard = new schema_1.MapSchema();
        this.roleCards = new schema_1.MapSchema();
        this.handCards = new schema_1.MapSchema();
        this.buffCards = new schema_1.MapSchema();
        this.reconnectCount = 0;
        this.connected = true;
        this.charged = 0;
        this.life = 0;
        this.hands = 0;
        /*
            changeState(){
                this.state[0] = this.handCards.size;
                this.state[1] = this.getLife();
                this.state[2] = this.charged;
                this.state[3] = this.buffCards.size;
        
            }
        */
    }
    //  @type(["number"]) state: number[] = new ArraySchema<number>(0, 0, 0, 0, 0, 0);
    /*
        var arr = [1,2,3,4,5,6,7,8,9,10];
        arr.sort(this.Arandom);
   */
    arandom(a, b) {
        return (Math.random() > 0.5) ? 1 : -1;
        ;
    }
    reset() {
        console.log("reset player");
        this.handCards.clear();
        this.buffCards.clear();
        this.roleCards.clear();
        this.pickRoleCard.clear();
        this.alive = true;
        this.witch = false;
        this.sergant = false;
        this.charged = 0;
        this.claimSurrender = false;
        //this.hands  =0;
        this.life = 0;
    }
    /*
    getRandomRoleCard():RoleCard{
        var count = this.roleCards.size;
        const a = Array.from( this.roleCards.values());
        var roleCard;
        var finding = true;
    
        while(finding){
            var n = Math.floor(Math.random() *  count + 1) -1;
            console.log('n',n)
            roleCard =a[n];
            if(roleCard){

            
                if (roleCard.used==false){
                    finding = false;
                    return  roleCard;
                }
            }
        }
    }
    */
    getRandomRoleCard() {
        const arr = Array.from(this.roleCards.keys());
        arr.sort(this.arandom);
        for (var i = 0; i < arr.length; i++) {
            var id = arr[i];
            var card = this.roleCards.get(id);
            if (card.used == false) {
                return card;
            }
        }
        return null;
    }
    getRandomRoleCardCitizenFirst() {
        const arr = Array.from(this.roleCards.keys());
        var found = false;
        arr.sort(this.arandom);
        var data = [];
        for (var i = 0; i < arr.length; i++) {
            var id = arr[i];
            var card = this.roleCards.get(id);
            if (card.used == false) {
                data.push(card);
            }
        }
        for (var i = 0; i < data.length; i++) {
            var card = data[i];
            if (card.citizen == true) {
                found = true;
                return card;
            }
        }
        for (var i = 0; i < data.length; i++) {
            var card = data[i];
            if (card.sergant) {
                found = true;
                return card;
            }
        }
        for (var i = 0; i < data.length; i++) {
            var card = data[i];
            if (card.witch) {
                found = true;
                return card;
            }
        }
        return null;
    }
    addPickCard() {
        var cards = Array.from(this.pickRoleCard.keys());
        var cardId = cards[0];
        var card = this.pickRoleCard.get(cardId);
        card.picked = false;
        this.roleCards.set(card.id, card);
    }
    checkRole() {
        this.sergant = false;
        this.roleCards.forEach((card) => {
            if (card.witch) {
                this.witch = true;
            }
            if (card.sergant == true && card.used == false) {
                this.sergant = true;
            }
        });
    }
    reportRole() {
        var name = this.name + "是";
        if (this.witch == true) {
            if (this.sergant) {
                return name + "巫警";
            }
            else {
                return name + "女巫";
            }
        }
        else {
            if (this.sergant) {
                return name + "警长";
            }
            else {
                return name + "平民";
            }
        }
    }
    //check if player's witch card opened or all card opened;
    checkAlive() {
        this.checkRole();
        var result = true;
        if (this.roleCards.size > 5) {
            console.error("critical error ", this.roleCards.size + ":" + this.id);
        }
        this.roleCards.forEach((card) => {
            if (card.used && card.witch == true) {
                result = false;
            }
        });
        if (this.getLife() <= 0)
            result = false;
        ;
        this.alive = result;
        this.reportLife();
        return result;
    }
    getCardAmount(type) {
        var result = 0;
        this.handCards.forEach((card) => {
            if (card.used == false && card.type == type) {
                result++;
            }
        });
        return result;
    }
    getFirstCard(type) {
        if (this.getCardAmount(type) == 0) {
            return null;
        }
        var count = this.handCards.size;
        const a = Array.from(this.handCards.values());
        var card;
        var finding = true;
        while (finding) {
            var n = Math.floor(Math.random() * count + 1) - 1;
            card = a[n];
            if (card.type == type) {
                finding = false;
                return card;
            }
        }
        return null;
    }
    getLife() {
        var result = 0;
        this.roleCards.forEach((card) => {
            if (card.used == false) {
                result++;
            }
        });
        this.life = result;
        return result;
    }
    reportLife() {
        var result = this.getLife();
        console.log(this.name + " life left:", result);
    }
    checkBuffByName(cardName) {
        var result = false;
        this.buffCards.forEach((card) => {
            if (card.name == cardName) {
                result = true;
            }
        });
        return result;
    }
    hasSameBuffCard(cardName) {
        var result = false;
        this.buffCards.forEach((handCard) => {
            if (handCard.name == cardName)
                result = true;
        });
        return result;
    }
    getPlayerBoard() {
        this.hands = this.handCards.size;
        var hands = this.hands;
        var lifes = this.getLife();
        var charged = this.charged;
        var result = { id: this.id, hands: hands, life: lifes, charged: charged };
        return result;
    }
    getBuffCards() {
        const a = Array.from(this.buffCards.values());
        var result = { id: this.id, buffCards: a };
        return result;
    }
    getHandCards() {
        const a = Array.from(this.handCards.values());
        //  console.log('a',a)        
        var result = { id: this.id, handCards: a };
        return result;
    }
    checkIfCuffed() {
        var result = false;
        var _card;
        this.buffCards.forEach((card) => {
            if (card.name == "拘留") {
                result = true;
                _card = card;
            }
        });
        if (_card) {
            this.buffCards.delete(_card.id);
        }
        return result;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Player.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Player.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Player.prototype, "color", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Player.prototype, "activeSessionId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Player.prototype, "pendingSessionId", void 0);
__decorate([
    schema_1.type(PlayerCharacter),
    __metadata("design:type", PlayerCharacter)
], Player.prototype, "playerCharacter", void 0);
__decorate([
    schema_1.type(AvatarState_1.AvatarState),
    __metadata("design:type", AvatarState_1.AvatarState)
], Player.prototype, "avatar", void 0);
__decorate([
    schema_1.type({ map: RoleCardState_1.RoleCard }),
    __metadata("design:type", Object)
], Player.prototype, "pickRoleCard", void 0);
__decorate([
    schema_1.type({ map: RoleCardState_1.RoleCard }),
    __metadata("design:type", Object)
], Player.prototype, "roleCards", void 0);
__decorate([
    schema_1.type({ map: HandCardState_1.HandCard }),
    __metadata("design:type", Object)
], Player.prototype, "handCards", void 0);
__decorate([
    schema_1.type({ map: HandCardState_1.HandCard }),
    __metadata("design:type", Object)
], Player.prototype, "buffCards", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Player.prototype, "reconnectCount", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "connected", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "admin", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "alive", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "witch", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "sergant", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "claimSurrender", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Player.prototype, "charged", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Player.prototype, "life", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Player.prototype, "hands", void 0);
exports.Player = Player;
