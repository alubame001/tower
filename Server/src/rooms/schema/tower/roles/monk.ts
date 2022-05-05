//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Monk  extends RoleCard {  

    skill(book:MagicBook){

        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        if (!_this){
            console.error("no _this role")
            return;
        }       
        var exceptIds = [];
        exceptIds.push(_this.id);
        var result = false;   
        var real_answer;
        let a:RoleCard;
        if (_this.targets.length ==0) {
            a=  book.getOneRandomRole(exceptIds,'',true,true);
            real_answer = "随机保护了" + a.seat();            
        }else{
            var t = _this.targets[0];
            a = book.roleManager.getRoleBySeatId(t);          //manual 
            real_answer =  "保护了" + a.seat();
        }
        var wrong_answer = real_answer;

   

        _this.handleStatu(book);
        if ((_this.drunked==false) &&(_this.poisoned==false)){
            var buff:HandCard = book.roleManager.buffs.get(_this.abilityId)
            if(a) a.buffs.set(buff.id,buff)           
        }

       _this.finalMessage(book,real_answer,wrong_answer)

    }

    


}
