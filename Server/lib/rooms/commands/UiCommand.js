"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSeat = void 0;
// @ts-nocheck
const command_1 = require("@colyseus/command");
class UpdateSeat extends command_1.Command {
    execute({}) {
        this.state.magicBook.seatManager.seats.forEach((seat) => {
            var role = seat.role;
            if (role.dead) {
                if (!seat.dead) {
                    console.warn("this.state.magicBook.round:", this.state.magicBook.round);
                    seat.deadRound = this.state.magicBook.round;
                    seat.dead = role.dead;
                    seat.alive = seat.alive;
                    role.targets = [];
                    this.state.seatUpdate = seat.idx;
                }
            }
        });
        this.state.magicBook.roleManager.roles.forEach((role) => {
            role.targets = [];
        });
    }
}
exports.UpdateSeat = UpdateSeat;
