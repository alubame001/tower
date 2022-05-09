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
exports.HandCardDeck = exports.HandCard = void 0;
const schema_1 = require("@colyseus/schema");
class HandCard extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.value = 0;
        this.used = false;
        this.invis = true;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], HandCard.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], HandCard.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], HandCard.prototype, "type", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], HandCard.prototype, "value", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], HandCard.prototype, "used", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], HandCard.prototype, "invis", void 0);
exports.HandCard = HandCard;
class HandCardDeck extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.cards = new schema_1.MapSchema();
        this.usedCards = new schema_1.MapSchema();
        this.num = 0;
    }
    init(options) {
        console.log("HandCard init");
        for (var i = 0; i < 5; i++) {
            var str = String(this.num);
            //   str = this.randomString(6);
            var card = new HandCard().assign({
                id: str,
                name: '指控',
                type: 'red',
                value: 1,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        for (var j = 0; j < 5; j++) {
            var str = String(this.num);
            //  str = this.randomString(6);
            var card = new HandCard().assign({
                id: str,
                name: '证据',
                type: 'red',
                value: 3,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        for (var k = 0; k < 3; k++) {
            var str = String(this.num);
            var card = new HandCard().assign({
                id: str,
                name: '目击',
                type: 'red',
                value: 7,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        for (var k = 0; k < 5; k++) {
            var str = String(this.num);
            var card = new HandCard().assign({
                id: str,
                name: '纵火',
                type: 'green',
                value: 0,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        for (var k = 0; k < 2; k++) {
            var str = String(this.num);
            var card = new HandCard().assign({
                id: str,
                name: '抢劫',
                type: 'green',
                value: 0,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        for (var k = 0; k < 2; k++) {
            var str = String(this.num);
            var card = new HandCard().assign({
                id: str,
                name: '抢劫',
                type: 'green',
                value: 0,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        for (var k = 0; k < 10; k++) {
            var str = String(this.num);
            var card = new HandCard().assign({
                id: str,
                name: '拘留',
                type: 'green',
                value: 0,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        for (var k = 0; k < 2; k++) {
            var str = String(this.num);
            var card = new HandCard().assign({
                id: str,
                name: '情侣',
                type: 'blue',
                value: 0,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        for (var k = 0; k < 1; k++) {
            var str = String(this.num);
            var card = new HandCard().assign({
                id: str,
                name: '避难',
                type: 'blue',
                value: 0,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        for (var k = 0; k < 1; k++) {
            var str = String(this.num);
            var card = new HandCard().assign({
                id: str,
                name: '圣人',
                type: 'blue',
                value: 0,
                used: true
            });
            this.usedCards.set(card.id, card);
            this.num++;
        }
        this.infectCard = new HandCard().assign({
            id: String(this.num),
            name: '传染',
            type: 'black',
            value: 0,
            used: false
        });
        //this.usedCards.set(card.id, card);
        this.num++;
        this.blackCatCard = new HandCard().assign({
            id: String(this.num),
            name: '黑猫',
            type: 'blue',
            value: 0,
            used: false
        });
        //this.usedCards.set(card.id, card);
        this.num++;
        this.murderCard = new HandCard().assign({
            id: String(this.num),
            name: '谋杀',
            type: 'blue',
            value: 0,
            used: false,
            invis: false //important
        });
        //this.usedCards.set(card.id, card);
        this.num++;
        this.sergantProtectCard = new HandCard().assign({
            id: String(this.num),
            name: '保护',
            type: 'blue',
            value: 0,
            used: false
        });
        this.num++;
        this.nightCard = new HandCard().assign({
            id: String(this.num),
            name: 'Night',
            type: 'black',
            value: 0,
            used: false
        });
        //this.usedCards.set(card.id, card);
        this.num++;
    }
    arandom(a, b) {
        return (Math.random() > 0.5) ? 1 : -1;
        ;
    }
    shuffle() {
        this.dropAlllCard();
        const arr = Array.from(this.usedCards.keys());
        arr.sort(this.arandom);
        //  console.log(arr)
        for (var i = 0; i < arr.length; i++) {
            var id = arr[i];
            var handCard = this.usedCards.get(id);
            handCard.used = false;
            this.cards.set(id, handCard);
            this.usedCards.delete(id);
        }
    }
    firstCard() {
        var keys = this.cards.keys();
        const arr = Array.from(keys);
        if (arr.length == 0)
            return null;
        var card = this.cards.get(arr[0]);
        return card;
    }
    deal() {
        var card = this.firstCard();
        if (card) {
            this.cards.delete(card.id);
            return card;
        }
        else {
            console.log("no card !!!!!!!!!!!!!!!!!!!!!!!!!!!");
            return null;
        }
    }
    randomString(e) {
        e = e || 32;
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678", a = t.length, n = "";
        for (var i = 0; i < e; i++)
            n += t.charAt(Math.floor(Math.random() * a));
        return n;
    }
    dropAlllCard() {
        this.cards.forEach((card) => {
            card.used = true;
            this.usedCards.set(card.id, card);
        });
        this.cards.clear();
        // console.log("dropallcard:",this.cards.size);
    }
    resetBlackCard() {
        console.log("resetBlackCard");
        this.dropAlllCard();
        var card = this.infectCard;
        if (!this.usedCards.has(card.id)) {
            this.usedCards.set(card.id, card);
        }
        this.shuffle();
        var card = this.nightCard;
        if (!this.usedCards.has(card.id)) {
            this.cards.set(card.id, card);
        }
    }
    useCard(card) {
        this.usedCards.set(card.id, card);
    }
    collectUsedCard() {
        /*
         this.usedCards.forEach((card:HandCard) => {
             card.used = false;
             this.cards.set(card.id,card);
         })
         this.usedCards.clear();
          */
    }
}
__decorate([
    schema_1.type({ map: HandCard }),
    __metadata("design:type", Object)
], HandCardDeck.prototype, "cards", void 0);
__decorate([
    schema_1.type({ map: HandCard }),
    __metadata("design:type", Object)
], HandCardDeck.prototype, "usedCards", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], HandCardDeck.prototype, "num", void 0);
__decorate([
    schema_1.type(HandCard),
    __metadata("design:type", HandCard)
], HandCardDeck.prototype, "infectCard", void 0);
__decorate([
    schema_1.type(HandCard),
    __metadata("design:type", HandCard)
], HandCardDeck.prototype, "blackCatCard", void 0);
__decorate([
    schema_1.type(HandCard),
    __metadata("design:type", HandCard)
], HandCardDeck.prototype, "nightCard", void 0);
__decorate([
    schema_1.type(HandCard),
    __metadata("design:type", HandCard)
], HandCardDeck.prototype, "murderCard", void 0);
__decorate([
    schema_1.type(HandCard),
    __metadata("design:type", HandCard)
], HandCardDeck.prototype, "sergantProtectCard", void 0);
exports.HandCardDeck = HandCardDeck;
