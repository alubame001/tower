//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Chef  extends RoleCard {     
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
                 
        var final;
        var evil =  book.getEvil();   
        let arr=Array.of(0)
        arr.pop();
        evil.forEach((role:RoleCard) => {      
            var role = role.changeRoleSkill(book);
            if (role){
                if (role.isEvil()){
                    var seatId = role.seatId
                    if (role.realSeatId)  seatId = role.realSeatId
                    var i = Number.parseInt(seatId)           
                    arr.push(i)
                }
            }
        })
        arr.sort();
        
        arr.sort(function(x,y){
            return x-y;
        })       


        var j = arr.length
        var result = 0;
        arr.forEach(function(value,key,arr){
             var n ;
            if (key<j-1)
              n=arr[key+1]
            else
              n=arr[0]+book.playerCount ;
            // console.log(value,":",n)
             if (n-value==1) result ++  

        });
        real_answer =  result + "对邪恶玩家相邻";
        if (result==3){
            final=Array.of(0,1,2)
        }else if (result==2){
            final=Array.of(0,1)
        }else if (result==1){
            final=Array.of(0,2)
        }else if (result==0){
            final=Array.of(1,2)
        }
        var ran1 = Math.floor((Math.random() * final.length) + 0);
        wrong_answer = final[ran1] + "对邪恶玩家相邻";

        _this.handleStatu(book);
        _this.finalMessage(book,real_answer,wrong_answer)

    }
    


}
