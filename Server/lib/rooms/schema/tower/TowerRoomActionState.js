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
exports.ActionManager = exports.Action = void 0;
const schema_1 = require("@colyseus/schema");
class Action extends schema_1.Schema {
    constructor() {
        super(...arguments);
        // @type("string") target: string; 
        this.targets = new schema_1.ArraySchema();
        this.targetAmount = 1;
        this.done = false;
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Action.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Action.prototype, "seatId", void 0);
__decorate([
    schema_1.type(["string"]),
    __metadata("design:type", Array)
], Action.prototype, "targets", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Action.prototype, "msg", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Action.prototype, "round", void 0);
__decorate([
    schema_1.type("number"),
    __metadata("design:type", Number)
], Action.prototype, "targetAmount", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], Action.prototype, "done", void 0);
exports.Action = Action;
class ActionManager extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.actions = new schema_1.MapSchema();
    }
    addAction(id, seatId, round) {
        var action = new Action().assign({
            id: id,
            seatId: seatId,
            done: false,
            round: round
        });
        this.actions.set(action.id, action);
    }
}
__decorate([
    schema_1.type({ map: Action }),
    __metadata("design:type", Object)
], ActionManager.prototype, "actions", void 0);
exports.ActionManager = ActionManager;
