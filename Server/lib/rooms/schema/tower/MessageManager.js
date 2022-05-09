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
exports.MessageManager = exports.Reciver = exports.Message = void 0;
const schema_1 = require("@colyseus/schema");
class Message extends schema_1.Schema {
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Message.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
exports.Message = Message;
class Reciver extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.messages = new schema_1.ArraySchema();
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Reciver.prototype, "id", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Reciver.prototype, "playerId", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], Reciver.prototype, "sessionId", void 0);
__decorate([
    schema_1.filterChildren(function (// the instance of the class `@filter` has been defined (instance of `Card`)
    client, // the Room's `client` instance which this data is going to be filtered to
    value, // the value of the field to be filtered. (value of `number` field)
    root // the root state Schema instance
    ) {
        return ((this.sessionId === client.sessionId) && (this.sessionId != '') && (this.sessionId != undefined));
    }),
    schema_1.type(["string"]),
    __metadata("design:type", Array)
], Reciver.prototype, "messages", void 0);
exports.Reciver = Reciver;
class MessageManager extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.recivers = new schema_1.MapSchema();
    }
    addMessage(roleId, content) {
        /*
         if (roleCard.robot){
             let reciver = this.recivers.get(roleCard.id);
             if (reciver)
             reciver.messages.push(content)
         }
 
 
 
        let reciver2 = this.recivers.get(roleCard.seatId);
        if (reciver2)
              reciver2.messages.push(content)
              */
        let reciver = this.recivers.get(roleId);
        if (reciver)
            reciver.messages.push(content);
    }
}
__decorate([
    schema_1.type({ map: Reciver }),
    __metadata("design:type", Object)
], MessageManager.prototype, "recivers", void 0);
exports.MessageManager = MessageManager;
