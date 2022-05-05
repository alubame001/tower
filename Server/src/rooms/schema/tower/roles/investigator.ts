//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Investigator  extends RoleCard {     
    skill(book:MagicBook){
      
      //  console.warn("undertaker use skill")
        var exceptIds = [];
        //var result = false;   
        var real_answer;
        var wrong_answer;
        var answer;
        var real;
        let  a:RoleCard;
        let  b:RoleCard;
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        if (!_this){
            console.error("no this role")
            return;
        } 

        exceptIds.push(_this.id);
//        exceptIds.push('recluse');
        real_answer  = _this.getReal(book,exceptIds,"minion","")    
       
        wrong_answer = _this.getWrong(book,exceptIds,"townsfolk","")  

        _this.handleStatu(book);

        if (_this.lie==false) {
            
        }

        _this.finalMessage(book,real_answer,wrong_answer)               

    }
    


}
