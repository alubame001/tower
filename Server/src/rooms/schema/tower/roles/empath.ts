//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Empath  extends RoleCard {     
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
            console.error("no __this role")
            return;
        } 
           
        var nextRole = book.nextRole(_this.idx);
        var changeRole = nextRole.changeRoleSkill(book);
        nextRole = changeRole;

       // console.log("nextRole",nextRole.sea)

        var previousRole = book.previousRole(_this.idx);
        var changeRole = previousRole.changeRoleSkill(book);
        previousRole = changeRole;

       
        var result1 = nextRole.isEvil();
        var result2 = previousRole.isEvil();
        var result = 0;
        var final;
        var real;
        if (result1) result ++;
        if (result2) result ++;
        real_answer = "相邻的邪恶陈营人数为"+result
        if (result==2){
            final=Array.of(0,1)         
        }else if (result==1){
            final=Array.of(0,2)
        }else if (result==0){
            final=Array.of(1,2)
        }
        var ran1 = Math.floor((Math.random() * final.length) + 0);            
        wrong_answer = "相邻的邪恶陈营人数为"+ final[ran1];   

       


        _this.handleStatu(book);
        _this.finalMessage(book,real_answer,wrong_answer)        


    }
    


}
