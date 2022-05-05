//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Washerwoman  extends RoleCard {     
    skill(book:MagicBook){
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        var exceptIds = [];
        var real_answer 
        var wrong_answer 
        exceptIds.push(_this.id);
       
        real_answer = _this.getReal(book,exceptIds,"townsfolk","townsfolk")        
        wrong_answer = _this.getWrong(book,exceptIds,"townsfolk","")          

        _this.handleStatu(book);
        _this.finalMessage(book,real_answer,wrong_answer)

    }
    


}
