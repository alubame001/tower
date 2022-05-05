import { Command } from "@colyseus/command";
import { TowerRoomState } from "../schema/tower/TowerRoomState";
import {Player } from "../schema/tower/TowerRoomPlayerState";

//import { Role } from "../schema/tower/TowerRoomRoleCardState";
import { RoleCard } from "../schema/tower/TroubleRole";
import { RoleManager } from "../schema/tower/TowerRoomRoleManager";
import { HandCardDeck,HandCard } from "../schema/tower/TowerRoomHandCardState";
import { MagicBook } from "../schema/tower/TowerRoomMagicBook";
import { WishRole} from "../schema/tower/TowerRoomWishRole";
import { Seat, SeatManager } from "../schema/SeatState";
import { Nominate, NominateManager } from "../schema/NominateState";
import {MessageManager,Reciver,Message } from "../schema/tower/MessageManager";
import { Preview } from "../schema/tower/TowerPreviewManager";
import  {dice,arandom}from "./Utils";
const game = require('../schema/tower/json/game.json');

export class InitMessageManager extends Command<TowerRoomState, {
  sessionId:string
}> {
 
  execute({sessionId}) {
      var book:MagicBook = this.state.magicBook;
    
    var reciver :Reciver =new Reciver().assign({    
        id :"admin",
        sessionId:sessionId,
        playerId:book.adminId
    });    
   
    book.messageManager.recivers.set(reciver.id,reciver) 

    /*
    
    book.roleManager.roles.forEach((role:RoleCard) => {       
        if (role.used){
 
            var reciver :Reciver =new Reciver().assign({    
                id :role.id,
                playerId:role.playerId
            });    
   
            book.messageManager.recivers.set(reciver.id,reciver)    
        }

    })
    */

    /*
    book.seatManager.seats.forEach((seat:Seat) => {       
        if (true){
 
            var reciver :Reciver =new Reciver().assign({    
                id :seat.id,
                sessionId:seat.sessionId,
                playerId:seat.playerId
            });    
   
            book.messageManager.recivers.set(reciver.id,reciver)    
        }

    })
    */    
    



  }

} 

export class SetMessageCount extends Command<TowerRoomState, {   
}> {
 
  execute({}) {
   // console.log("SetMessageCount:"+this.state.magicBook.messageManager.recivers.size)
      this.state.magicBook.messageManager.recivers.forEach((reciver:Reciver) => {
       // console.log("SetMessageCount:",reciver.id,"-",reciver.messages.length)

          var l = reciver.messages.length;
         

           if (reciver.id=="admin"){
                this.state.msgs[0] =l
           }     
          
      })

      this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {
                var l = seat.role.messages.length;
                
                var id = seat.id;
                var idx = Number(id);
               // console.log(id,":",l)
                 this.state.msgs[idx] =l
                           
      })
     
  }
 
}


export class ShareInfo extends Command<TowerRoomState, {   
}> {
 
  execute({}) {
   // console.log("SetMessageCount:"+this.state.magicBook.messageManager.recivers.size)
    let book = this.state.magicBook;
    let roleManager = book.roleManager;
    var evil =  book.getEvil();  
  
    var evilPlayers ="邪恶阵营:";
    evil.forEach((role:RoleCard) => { 
      console.log(role.title())
      evilPlayers = evilPlayers +role.title();
    }) 
    
    var notExistPlayers = "";
    var exceptIds = [''];
    exceptIds.pop();    
    var role1 = book.getOneRandomRole(exceptIds,"outsider",true,false);
    if (!role1) 
      role1 = book.getOneRandomRole(exceptIds,"townsfolk",true,false);
    exceptIds.push(role1.id) 
    
    var role2 = book.getOneRandomRole(exceptIds,"townsfolk",true,false);
    if (!role2) 
      role2 = book.getOneRandomRole(exceptIds,"townsfolk",true,false);
    exceptIds.push(role2.id)
    

    var role3 = book.getOneRandomRole(exceptIds,"townsfolk",true,false);
    if (!role3) 
      role3 = book.getOneRandomRole(exceptIds,"townsfolk",true,false);
    exceptIds.push(role3.id)
 

    notExistPlayers ="不存在身份:"+ role1.name +","+ role2.name +","+ role3.name;
    evil.forEach((role:RoleCard) => { 
      role.addMessage(evilPlayers);
      role.addMessage(notExistPlayers);
    
    })
    book.addMessage(evilPlayers)
    book.addMessage(notExistPlayers)

   // console.log("evilPlayers:",evilPlayers)
  }
 
}

 
