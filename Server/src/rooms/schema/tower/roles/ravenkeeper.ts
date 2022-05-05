//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Ravenkeeper  extends RoleCard {     
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

        var actions =book.actionManager.actions;
        if (book.isDay()) return;
        if (_this.alive) return;
     

        console.log(_this.title()+"使用亡语技能")


        var action:Action = actions.get(_this.id)
        if (action){
           // var target = action.target;


            if (action.done) return;
            if (true){
               
                var role :RoleCard = book.getRole(action.targets[0]);
                a = book.getOneRandomRole(exceptIds,'',true,true)
                exceptIds.push(a.id);
                 b= book.getOneRandomRole(exceptIds,'',true,true)
                 wrong_answer = a.seatId +"号是"+b.name;
                 real_answer =role.seatId+"号是"+role.name;

                _this.handleStatu(book);
                _this.finalMessage(book,_this.statu,real_answer,wrong_answer)              
                action.done = true;
                action.msg = real_answer;
                actions.set(action.id,action);              
            } 

        } else {
            book.addMessage(_this.title()+"在夜晚被杀了,发动亡语技能!")
            book.actionManager.addAction(_this.id,_this.seatId,book.round);     
        }
        
    }

    


}
