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
exports.WishRole = void 0;
//import {Client} from "colyseus";
const schema_1 = require("@colyseus/schema");
class WishRole extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.happened = false;
        this.assigned = false;
        this.done = false;
    }
    title() {
        return "(" + this.seatId + ")" + this.name;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], WishRole.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], WishRole.prototype, "rid", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], WishRole.prototype, "name", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], WishRole.prototype, "team", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], WishRole.prototype, "seatId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], WishRole.prototype, "playerId", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], WishRole.prototype, "idx", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], WishRole.prototype, "happened", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], WishRole.prototype, "assigned", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], WishRole.prototype, "done", void 0);
exports.WishRole = WishRole;
