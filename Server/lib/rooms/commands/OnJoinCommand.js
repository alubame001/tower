"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnJoinCommand = void 0;
// @ts-nocheck
const command_1 = require("@colyseus/command");
class OnJoinCommand extends command_1.Command {
    execute({ sessionId, aid }) {
        console.log("sesssionId!!!!!!!!!!!!!!!!!!!!!!!!", sessionId);
        console.log("aid!!!!!!!!!!!!!!!!!!!!!!!!", aid);
        console.log("start", this.state.dayDelay);
    }
}
exports.OnJoinCommand = OnJoinCommand;
