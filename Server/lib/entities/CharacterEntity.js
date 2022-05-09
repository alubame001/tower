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
exports.Character = void 0;
const core_1 = require("@mikro-orm/core");
const BaseEntity_1 = require("./BaseEntity");
/**
 * Entity to represent the character in the database and throughout the server
 */
let Character = class Character extends BaseEntity_1.BaseEntity {
};
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], Character.prototype, "name", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], Character.prototype, "brief", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], Character.prototype, "age", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], Character.prototype, "sexual", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], Character.prototype, "father", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], Character.prototype, "mother", void 0);
Character = __decorate([
    core_1.Entity()
], Character);
exports.Character = Character;
