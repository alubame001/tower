// @ts-nocheck
import { Command } from "@colyseus/command";
import { TowerRoomState } from "../schema/tower/TowerRoomState";
import {Player } from "../schema/tower/TowerRoomPlayerState";

import { RoleCard } from "../schema/tower/TroubleRole";
import { RoleManager } from "../schema/tower/TowerRoomRoleManager";
import { HandCardDeck,HandCard } from "../schema/tower/TowerRoomHandCardState";
import { MagicBook } from "../schema/tower/TowerRoomMagicBook";
import { WishRole} from "../schema/tower/TowerRoomWishRole";
import { Seat, SeatManager } from "../schema/SeatState";
import { Nominate, NominateManager } from "../schema/NominateState";
import { Preview } from "../schema/tower/TowerPreviewManager";
import  {dice,arandom}from "./Utils";

 


export class UpdateSeat extends Command<TowerRoomState, {
    
}> {
 
  execute({}) {

    this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {
        var role = seat.role;
        if (role.dead) {
          if (!seat.dead){
            console.warn("this.state.magicBook.round:",this.state.magicBook.round)
            seat.deadRound = this.state.magicBook.round;
            seat.dead = role.dead;      
            seat.alive = seat.alive;
            role.targets =[];
            this.state.seatUpdate = seat.idx;

          }

        }

    })

    this.state.magicBook.roleManager.roles.forEach((role:RoleCard) => {
      role.targets =[];
    })


  }
 
}


