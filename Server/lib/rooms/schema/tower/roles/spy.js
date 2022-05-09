"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spy = void 0;
const TroubleRole_1 = require("../TroubleRole");
class Spy extends TroubleRole_1.RoleCard {
    skill(book) {
        //  this.abilityId ="spy";
        //  console.warn("spy use skill")
        book.addPrivateMessage(this, book.report, "");
    }
}
exports.Spy = Spy;
