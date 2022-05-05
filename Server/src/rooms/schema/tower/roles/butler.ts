//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Butler  extends RoleCard {     
    skill(book:MagicBook){

        console.warn("ravenkeeper use skill")
        var exceptIds = [this.id];
        var result = false;   
        var real_answer;
        var wrong_answer;
        var answer;
        var real;
        let  a:RoleCard;
        let  b:RoleCard;
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        if (!_this){
            console.error("no __this role")
            return;
        }    
        //let statu = "";
        exceptIds = [];
        exceptIds.push(_this.id);
        if (_this.targets.length ==0) {
          a =  book.getOneRandomRole(exceptIds,null,true,true);
          _this.voteOnly = a.seatId;
        } else {
            var t = _this.targets[0];
            a = book.roleManager.getRoleBySeatId(t);          //manual 
            real_answer = _this.name +"白天只能跟投" + a.seat();
        }
          if ((_this.poisoned)||(_this.drunked)){
              book.addMessage(_this.title()+"白天可以随意投票")
          } else {
             
            _this.voteOnly =null;  
          } 
        
    }

    


}
