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
exports.HandCardDeck = exports.HandCard = void 0;
const schema_1 = require("@colyseus/schema");
//const roles = require('./json/roles.json');
const roles_json_1 = __importDefault(require("./json/roles.json"));
//import { Result } from "./TowerRoomState";
class HandCard extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.buffPeriod = 0;
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
], HandCard.prototype, "team", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], HandCard.prototype, "ability", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], HandCard.prototype, "type", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], HandCard.prototype, "used", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], HandCard.prototype, "buffPeriod", void 0);
exports.HandCard = HandCard;
class HandCardDeck extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.handCards = new schema_1.MapSchema();
    }
    init(options) {
        console.log("init");
        var editorId = options.id;
        for (var i = 0; i < roles_json_1.default.length; i++) {
            var str = String(i);
            var role = roles_json_1.default[i];
            if (role.edition == editorId) {
                if (role.buffPeriod) {
                    var card = new HandCard().assign(role);
                    this.handCards.set(card.id, card);
                }
            }
        }
    }
    monk() {
        console.log("monk");
    }
}
__decorate([
    schema_1.type({ map: HandCard }),
    __metadata("design:type", Object)
], HandCardDeck.prototype, "handCards", void 0);
exports.HandCardDeck = HandCardDeck;
