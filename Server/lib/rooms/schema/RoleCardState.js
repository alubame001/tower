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
exports.RoleCardDeck = exports.RoleCard = void 0;
const schema_1 = require("@colyseus/schema");
//平民 警长 女巫
class RoleCard extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.used = false;
        this.witch = false;
        this.sergant = false;
        this.citizen = false;
        this.picked = false;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], RoleCard.prototype, "name", void 0);
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
exports.RoleCard = RoleCard;
class RoleCardDeck extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.rolecards = new schema_1.MapSchema();
    }
    init(options) {
        var num = 0;
        for (var i = 0; i < options.平民; i++) {
            var str = String(num);
            // str = this.randomString(6);
            var roleCard = new RoleCard().assign({
                id: str,
                citizen: true,
                name: '平民'
            });
            this.rolecards.set(roleCard.id, roleCard);
            num++;
        }
        for (var i = 0; i < options.警长; i++) {
            var str = String(num);
            //str = this.randomString(6);
            var roleCard = new RoleCard().assign({
                id: str,
                sergant: true,
                name: '警长'
            });
            this.rolecards.set(roleCard.id, roleCard);
            num++;
        }
        for (var i = 0; i < options.女巫; i++) {
            var str = String(num);
            //str = this.randomString(6);
            var roleCard = new RoleCard().assign({
                id: str,
                witch: true,
                name: '女巫'
            });
            this.rolecards.set(roleCard.id, roleCard);
            num++;
        }
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
        var count = this.rolecards.size;
        const arr = Array.from(this.rolecards.values());
        arr.sort(this.arandom);
        for (var i = 0; i < arr.length; i++) {
            this.rolecards.set(String(i), arr[i]);
        }
    }
    deal() {
        /*
        const arr = Array.from( this.rolecards.values());
        const firstCard = arr[0];
        var id = firstCard.id;
        const roleCard :RoleCard = this.rolecards.get(id);
        this.rolecards.delete(id);
         */
        var keys = this.rolecards.keys();
        const arr = Array.from(keys);
        var roleCard = this.rolecards.get(arr[0]);
        this.rolecards.delete(arr[0]);
        return roleCard;
    }
    afterDeal() {
    }
}
__decorate([
    schema_1.type({ map: RoleCard }),
    __metadata("design:type", Object)
], RoleCardDeck.prototype, "rolecards", void 0);
exports.RoleCardDeck = RoleCardDeck;
