//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Undertaker  extends RoleCard {     
    skill(book:MagicBook){

      //  console.warn("undertaker use skill")
        var exceptIds = [];
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
        var exceptIds = [];
        exceptIds.push(this.id);
        var round = book.round;
        let arr = Array.from(book.victims.values())
  
        let res1=arr.filter((item,index,array)=>{
            return ((item.round ==round -1)&&(item.method=="executed"))
          
        });
        


        if (res1.length ==0){
            
            real_answer = ""
            wrong_answer =""
        }else {
            var v = res1[0];
            console.log("vid:",v.id)
            var role = book.roleManager.roles.get(v.id);
            var changeRole = role.changeRoleSkill(book);
            role = changeRole;

            a= book.getOneRandomRole(exceptIds,null,true,true);
            if (!a) a= book.getOneRandomRole(exceptIds,null,true,false);

            real_answer = role.name+"在这个白天被处决"
            wrong_answer = a.name+"在这个白天被处决"
        }
        answer = real_answer;
        real = real_answer;

        _this.handleStatu(book);
        _this.finalMessage(book,real_answer,wrong_answer)       
        


    }
    


}
