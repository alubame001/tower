"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationCommand = exports.DeepThreeAsync = exports.DeepTwoAsync = exports.DeepOneAsync = exports.DeepAsync = exports.DeepThreeSync = exports.DeepTwoSync = exports.DeepOneSync = exports.DeepSync = exports.Wait = exports.AsyncSequence = exports.ChildAsyncCommand = exports.EnqueueAsyncCommand = exports.ChildCommand = exports.EnqueueCommand = exports.DrawCommand = exports.DiscardCommand = exports.NextTurnCommand = exports.CardGameRoom = exports.CardGameState = exports.Player = exports.Card = void 0;
// @ts-nocheck
const colyseus_1 = require("colyseus");
const command_1 = require("@colyseus/command");
class Card {
    constructor() {
        this.played = false;
    }
}
exports.Card = Card;
class Player {
    constructor() {
        this.cards = [];
    }
}
exports.Player = Player;
class CardGameState {
    constructor() {
        this.isGameOver = false;
        this.players = new Map();
    }
}
exports.CardGameState = CardGameState;
class CardGameRoom extends colyseus_1.Room {
}
exports.CardGameRoom = CardGameRoom;
class NextTurnCommand extends command_1.Command {
    execute() {
        const sessionIds = Object.keys(this.state.players);
        this.state.currentTurn = (this.state.currentTurn)
            ? sessionIds[(sessionIds.indexOf(this.state.currentTurn) + 1) % sessionIds.length]
            : sessionIds[0];
    }
}
exports.NextTurnCommand = NextTurnCommand;
class DiscardCommand extends command_1.Command {
    validate({ sessionId, index } = this.payload) {
        const player = this.state.players.get(sessionId);
        return player !== undefined && player.cards[index] !== undefined;
    }
    execute({ sessionId, index } = this.payload) {
        this.state.players.get(sessionId).cards.splice(index, 1);
    }
}
exports.DiscardCommand = DiscardCommand;
class DrawCommand extends command_1.Command {
    execute({ sessionId }) {
        this.state.players.get(sessionId).cards.push(new Card());
    }
}
exports.DrawCommand = DrawCommand;
class EnqueueCommand extends command_1.Command {
    execute({ count }) {
        this.state.i = 0;
        return [...Array(count)].map(_ => new ChildCommand().setPayload({ i: count }));
    }
}
exports.EnqueueCommand = EnqueueCommand;
class ChildCommand extends command_1.Command {
    execute({ i }) {
        this.state.i += i;
    }
}
exports.ChildCommand = ChildCommand;
class EnqueueAsyncCommand extends command_1.Command {
    execute({ count }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state.i = 0;
            return [...Array(count)].map(_ => new ChildAsyncCommand().setPayload({ i: count }));
        });
    }
}
exports.EnqueueAsyncCommand = EnqueueAsyncCommand;
class ChildAsyncCommand extends command_1.Command {
    execute({ i }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => {
                setTimeout(() => {
                    this.state.i += i;
                    resolve(true);
                }, 100);
            });
        });
    }
}
exports.ChildAsyncCommand = ChildAsyncCommand;
class AsyncSequence extends command_1.Command {
    execute() {
        return [new Wait().setPayload(1), new Wait().setPayload(2), new Wait().setPayload(3)];
    }
}
exports.AsyncSequence = AsyncSequence;
class Wait extends command_1.Command {
    execute(number) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.delay(100);
        });
    }
}
exports.Wait = Wait;
//
// DEEP SYNC
//
class DeepSync extends command_1.Command {
    execute() {
        this.state.i = 0;
        return [new DeepOneSync(), new DeepOneSync()];
    }
}
exports.DeepSync = DeepSync;
class DeepOneSync extends command_1.Command {
    execute() {
        this.state.i += 1;
        return [new DeepTwoSync()];
    }
}
exports.DeepOneSync = DeepOneSync;
class DeepTwoSync extends command_1.Command {
    execute() {
        this.state.i += 10;
        return [new DeepThreeSync()];
    }
}
exports.DeepTwoSync = DeepTwoSync;
class DeepThreeSync extends command_1.Command {
    execute() {
        this.state.i += 100;
    }
}
exports.DeepThreeSync = DeepThreeSync;
//
// DEEP ASYNC
//
class DeepAsync extends command_1.Command {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            this.state.i = 0;
            return [new DeepOneAsync(), new DeepOneAsync()];
        });
    }
}
exports.DeepAsync = DeepAsync;
class DeepOneAsync extends command_1.Command {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.delay(100);
            this.state.i += 1;
            return [new DeepTwoAsync()];
        });
    }
}
exports.DeepOneAsync = DeepOneAsync;
class DeepTwoAsync extends command_1.Command {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.delay(100);
            this.state.i += 10;
            return [new DeepThreeAsync()];
        });
    }
}
exports.DeepTwoAsync = DeepTwoAsync;
class DeepThreeAsync extends command_1.Command {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.delay(100);
            this.state.i += 100;
        });
    }
}
exports.DeepThreeAsync = DeepThreeAsync;
class ValidationCommand extends command_1.Command {
    validate(n = this.payload) {
        return n === 1;
    }
    execute() {
        throw new Error("This should never execute!");
    }
}
exports.ValidationCommand = ValidationCommand;
