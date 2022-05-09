"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareInfo = exports.SetMessageCount = exports.InitMessageManager = void 0;
// @ts-nocheck
const command_1 = require("@colyseus/command");
const MessageManager_1 = require("../schema/tower/MessageManager");
const game = require('../schema/tower/json/game.json');
class InitMessageManager extends command_1.Command {
    execute({ sessionId }) {
        var book = this.state.magicBook;
        var reciver = new MessageManager_1.Reciver().assign({
            id: "admin",
            sessionId: sessionId,
            playerId: book.adminId
        });
        book.messageManager.recivers.set(reciver.id, reciver);
        /*
        
        book.roleManager.roles.forEach((role:RoleCard) => {
            if (role.used){
     
                var reciver :Reciver =new Reciver().assign({
                    id :role.id,
                    playerId:role.playerId
                });
       
                book.messageManager.recivers.set(reciver.id,reciver)
            }
    
        })
        */
        /*
        book.seatManager.seats.forEach((seat:Seat) => {
            if (true){
     
                var reciver :Reciver =new Reciver().assign({
                    id :seat.id,
                    sessionId:seat.sessionId,
                    playerId:seat.playerId
                });
       
                book.messageManager.recivers.set(reciver.id,reciver)
            }
    
        })
        */
    }
}
exports.InitMessageManager = InitMessageManager;
class SetMessageCount extends command_1.Command {
    execute({}) {
        // console.log("SetMessageCount:"+this.state.magicBook.messageManager.recivers.size)
        this.state.magicBook.messageManager.recivers.forEach((reciver) => {
            // console.log("SetMessageCount:",reciver.id,"-",reciver.messages.length)
            var l = reciver.messages.length;
            if (reciver.id == "admin") {
                this.state.msgs[0] = l;
            }
        });
        this.state.magicBook.seatManager.seats.forEach((seat) => {
            var l = seat.role.messages.length;
            var id = seat.id;
            var idx = Number(id);
            // console.log(id,":",l)
            this.state.msgs[idx] = l;
        });
    }
}
exports.SetMessageCount = SetMessageCount;
class ShareInfo extends command_1.Command {
    execute({}) {
        // console.log("SetMessageCount:"+this.state.magicBook.messageManager.recivers.size)
        let book = this.state.magicBook;
        let roleManager = book.roleManager;
        var evil = book.getEvil();
        var evilPlayers = "邪恶阵营:";
        evil.forEach((role) => {
            console.log(role.title());
            evilPlayers = evilPlayers + role.title();
        });
        var notExistPlayers = "";
        var exceptIds = [''];
        exceptIds.pop();
        var role1 = book.getOneRandomRole(exceptIds, "outsider", true, false);
        if (!role1)
            role1 = book.getOneRandomRole(exceptIds, "townsfolk", true, false);
        exceptIds.push(role1.id);
        var role2 = book.getOneRandomRole(exceptIds, "townsfolk", true, false);
        if (!role2)
            role2 = book.getOneRandomRole(exceptIds, "townsfolk", true, false);
        exceptIds.push(role2.id);
        var role3 = book.getOneRandomRole(exceptIds, "townsfolk", true, false);
        if (!role3)
            role3 = book.getOneRandomRole(exceptIds, "townsfolk", true, false);
        exceptIds.push(role3.id);
        notExistPlayers = "不存在身份:" + role1.name + "," + role2.name + "," + role3.name;
        evil.forEach((role) => {
            role.addMessage(evilPlayers);
            role.addMessage(notExistPlayers);
        });
        book.addMessage(evilPlayers);
        book.addMessage(notExistPlayers);
        // console.log("evilPlayers:",evilPlayers)
    }
}
exports.ShareInfo = ShareInfo;
