//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Librarian  extends RoleCard {     
    skill(book:MagicBook){
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        var real_answer;
        var wrong_answer;
        var exceptIds = [];
        exceptIds.push(_this.id);
        exceptIds.push('recluse');
        real_answer = _this.getReal(book,exceptIds,"outsider","")  
        if (real_answer =="") real_answer ="没有外来者"         
        wrong_answer = _this.getWrong(book,[],"outsider","")      
        
        

        



        _this.handleStatu(book);
        _this.finalMessage(book,real_answer,wrong_answer)


    }
    


}
