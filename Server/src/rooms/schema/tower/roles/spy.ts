//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Spy  extends RoleCard {     
    skill(book:MagicBook){
      //  this.abilityId ="spy";
      //  console.warn("spy use skill")
        book.addPrivateMessage(this,book.report,"");
    }

    


}
