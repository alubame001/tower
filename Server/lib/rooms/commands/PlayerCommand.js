"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetIcon = exports.PlayerJoin = void 0;
// @ts-nocheck
const command_1 = require("@colyseus/command");
const TroubleRole_1 = require("../schema/tower/TroubleRole");
const TowerRoomPlayerState_1 = require("../schema/tower/TowerRoomPlayerState");
/*
export class TakeSeat extends Command<TowerRoomState, {
    player:Player,seatId:String)
}> {
 
  execute({ player ,seatId}) {
    if (!player) return;
    if (!seatId) return;
    var _seatId = String(seatId)
    var seat:Seat = this.state.magicBook.seatManager.seats.get(seatId)
    
    
     if (!seat) return
     if (seat.ready) return;
     if (!seat.locked){
      // this.removeLastSeat(player)
        player.sitted = true;
        player.seatId = seat.id;
      //  console.log("player.sessionId",player.sessionId)
    
        seat.sessionId = player.sessionId;
        seat.locked = true;
        seat.connected = true;
        seat.playerId = player.id;
        seat.playerName = player.name;
        seat.robot = player.robot;
   
    }
 
  }

}
 
*/
class PlayerJoin extends command_1.Command {
    execute({ client }) {
        console.warn("PlayerJoin:", client.auth.id);
        var id = client.auth.id;
        var pid = this.state.pid;
        var player = new TowerRoomPlayerState_1.Player().assign({
            id: client.auth.id,
            name: client.auth.username,
            sessionId: client.sessionId,
            roomId: this.roomId,
            admin: false,
            robot: false
        });
        this.state.players.set(player.id, player);
        client.send("onJoin", player);
    }
}
exports.PlayerJoin = PlayerJoin;
class SetIcon extends command_1.Command {
    execute({ seatId, iconSeatId, roleId, team }) {
        console.warn("SetIcon", seatId, iconSeatId, roleId);
        if (!seatId)
            return;
        if (!iconSeatId)
            return;
        if (!roleId)
            return;
        /*
        var role = this.state.magicBook.roleManager.getRoleBySeatId(seatId);
        if (!role) return;
        var icon =  new Icon().assign({
          id : seatId+":"+iconSeatId,
          seatId :seatId,
          iconSeatId :  iconSeatId,
          roleId :roleId,
          team:team
        });
        role.icons.set(icon.id,icon)
        this.state.iconChanged = new Date().getTime();
       // this.state.iconChangedData =icon;
       */
        var seat = this.state.magicBook.seatManager.seats.get(seatId);
        if (!seat)
            return;
        var icon = new TroubleRole_1.Icon().assign({
            id: iconSeatId,
            seatId: seatId,
            roleId: roleId,
            team: team
        });
        seat.icons.set(icon.id, icon);
        this.state.iconChanged = new Date().getTime();
        this.state.iconChangedData = icon;
    }
}
exports.SetIcon = SetIcon;
