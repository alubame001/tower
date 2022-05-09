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
exports.PreviewManager = exports.Preview = void 0;
const schema_1 = require("@colyseus/schema");
const TroubleRole_1 = require("./TroubleRole");
class Preview extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.pickRoleCard = new schema_1.MapSchema();
        this.previewRoleCards = new schema_1.MapSchema();
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Preview.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Preview.prototype, "sessionId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Preview.prototype, "playerId", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Preview.prototype, "idx", void 0);
__decorate([
    schema_1.type({ map: TroubleRole_1.RoleCard }),
    __metadata("design:type", Object)
], Preview.prototype, "pickRoleCard", void 0);
__decorate([
    schema_1.type({ map: TroubleRole_1.RoleCard }),
    __metadata("design:type", Object)
], Preview.prototype, "previewRoleCards", void 0);
exports.Preview = Preview;
class PreviewManager extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.previews = new schema_1.MapSchema();
    }
}
__decorate([
    schema_1.type({ map: Preview }),
    __metadata("design:type", Object)
], PreviewManager.prototype, "previews", void 0);
exports.PreviewManager = PreviewManager;
