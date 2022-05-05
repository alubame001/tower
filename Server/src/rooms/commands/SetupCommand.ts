import { Command } from "@colyseus/command";
import { TowerRoomState } from "../schema/tower/TowerRoomState";
import {Player } from "../schema/tower/TowerRoomPlayerState";

import { RoleCard } from "../schema/tower/TroubleRole";
import { RoleManager } from "../schema/tower/TowerRoomRoleManager";
import { HandCardDeck,HandCard } from "../schema/tower/TowerRoomHandCardState";
import { MagicBook } from "../schema/tower/TowerRoomMagicBook";
import { WishRole} from "../schema/tower/TowerRoomWishRole";
import { Seat, SeatManager } from "../schema/SeatState";
import { Nominate, NominateManager } from "../schema/NominateState";
import { Preview,PreviewManager } from "../schema/tower/TowerPreviewManager";
import  {dice,arandom}from "./Utils";
 
export class DoCreateRobot extends Command<TowerRoomState, {  
}> { 
  execute({}) {    
      for (var i=0;i<this.state.options.robots;i++){
        let player = new Player().assign({
          id: "robot"+String(i+1),
          name :"robot"+String(i+1),
          admin : false,
          robot : true
        });
        this.state.players.set(player.id,player);      
        this.state.players.get(player.id).connected = true;       
       
      }
  }
 
}

export class DoAutoTakeSeat extends Command<TowerRoomState, {

}> {
 
  execute({}) {
    this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {          
 
        if (seat.locked==false){
        //  var player:Player = this.state.getRandomPlayerNoSeat()  
          let arr = Array.from(this.state.players.values())
  
          let res1=arr.filter((item,index,array)=>{
              return ((item.sitted == false) &&(!item.admin))
          });
          if (res1.length>0){
            var n =Math.floor((Math.random() * res1.length) + 0);
            var player = res1[n];

           // this.takeSeat(player,seat.id);

      
           
           //if (seat.ready) return;
           if (!seat.locked){
            // this.removeLastSeat(player)
              player.sitted = true; 
              player.seatId = seat.id;
           
          
              seat.sessionId = player.sessionId;
              seat.locked = true;
              seat.connected = true;
              seat.playerId = player.id;
              seat.playerName = player.name;
              seat.robot = player.robot;
           }

        }


        }
        
      })
  }
 
}


export class SortSeat extends Command<TowerRoomState, {

}> {
 
  execute({}) {
    let arr = Array.from(this.state.magicBook.seatManager.seats.values())
  
    let res1=arr.filter((item,index,array)=>{
        return (item.locked == true)
    });
  
    this.state.magicBook.seatManager.seats.clear();
    var idx = 1;
    res1.forEach((seat:Seat) => {   
      var id = String(idx);
      seat.idx = idx;     
      seat.id =String(idx);
      this.state.magicBook.seatManager.seats.set(id,seat);
      idx++;
    })
  }
 
}


export class DoAutoSeatReady extends Command<TowerRoomState, {

}> {
 
  execute({}) {
    this.state.magicBook.seatManager.lock = true;
    this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {    
        if (seat.locked){
          seat.ready = true;
        }      
       
    }) 
    const a = Array.from(  this.state.magicBook.seatManager.seats.keys());
    const b = Array.from(  this.state.magicBook.seatManager.seats.values());
    for (var i=0;i<a.length;i++){
        var j = i+1;
        var k = i-1;
        
        if (j>=a.length) j = 0;
        if (k<0) k =a.length-1;        
        this.state.magicBook.seatManager.seats.get(a[i]).next =b[j].playerId;
        this.state.magicBook.seatManager.seats.get(a[i]).previous =b[k].playerId;
        
     }  
     



  }
 
}

export class SendPreviewRole extends Command<TowerRoomState, {

}> {
 
  execute({}) {
    //  console.log("inside")
    this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {  
      //  console.log("seat",seat.id)

        var preview = new Preview().assign({
          id: seat.id,
          sessionId:seat.sessionId,
          playerId:seat.playerId,
          idx:seat.idx             
        });
        let book = this.state.magicBook;
       
       // preview =this.state.magicBook.setPreview(preview)


       
        var exceptIds = ['drunk'];      
        if (dice(50))        
             var card1 = book.roleManager.getRandomRoleCard(exceptIds,"demon");
        else 
             var card1 = book.roleManager.getRandomRoleCard(exceptIds,"minion");
         exceptIds.push(card1.id)
         

         if (dice(50))        
            var card2 = book.roleManager.getRandomRoleCard(exceptIds,"minion");
         else 
            var card2 = book.roleManager.getRandomRoleCard(exceptIds,"outsider");      
         exceptIds.push(card2.id)



         if (dice(50))        
            var card3 = book.roleManager.getRandomRoleCard(exceptIds,"outsider");
         else 
            var card3 = book.roleManager.getRandomRoleCard(exceptIds,"townsfolk");      
         exceptIds.push(card3.id)
         
         var card4 = book.roleManager.getRandomRoleCard(exceptIds,"townsfolk");
         exceptIds.push(card4.id)
         preview.previewRoleCards.clear();
         preview.previewRoleCards.set(card4.id,card4)

         preview.previewRoleCards.set(card3.id,card3)
         preview.previewRoleCards.set(card2.id,card2)
         if (seat.robot!= true)
           preview.previewRoleCards.set(card1.id,card1)      
         
         book.previewManager.previews.set(preview.id,preview);



      })


  }
 
}


export class DoAutoSelectRole extends Command<TowerRoomState, {

}> {
 
  execute({}) {
    this.state.magicBook.previewManager.previews.forEach((preview:Preview) => {  

        var  cards = Array.from(preview.pickRoleCard);
        if (cards.length==0){
            const arr = Array.from(preview.previewRoleCards.keys());
          
            let  idx = Math.floor((Math.random() * arr.length) + 0);
        
            let id= arr[idx];
           
           // console.log("id",id)
            var _card = preview.previewRoleCards.get(id);
            if (_card){
              preview.pickRoleCard.clear();             
              preview.pickRoleCard.set(_card.id,_card);  
            }
          
    

        } else {
          var role = cards[0]
        //  console.log(role)
          console.log("player "+preview.id +" selected" )            
        } 
    
       // preview.previewRoleCards.clear();   
  })


}
 
}




export class AddWishRole extends Command<TowerRoomState, {

}> {
 
  execute({}) {
    let book = this.state.magicBook

    const arr = Array.from( book.seatManager.seats.keys());
    arr.sort(arandom);     
  
    console.log('seatManager.seats arr',arr)
    for (var i =0;i<arr.length;i++){
      var seatId = arr[i];       
      var preview:Preview = book.previewManager.previews.get(seatId);      
      var card = preview.pickRoleCard.values().next().value
     
      
    //  this.state.magicBook.addWishRole(i,card.id,card.name,card.team,preview.id,preview.playerId,preview.idx)        
        // addWishRole(i:number,rid:string,name:string,team:string,seatId:string,playerId:string,idx:number){
      var wishRole :WishRole =new WishRole().assign({    
        id :String(i),  
        rid:card.id,   
        name :card.name,
        team:card.team,
        seatId:preview.id,
        playerId:preview.playerId,
        idx:preview.idx
      });   
      
      book.roleManager.wishRoles.set(wishRole.id,wishRole);



    }


}
 
}
//SetRolesSessionIdBySeat

export class SetupRoleAndSeat extends Command<TowerRoomState, {

}> {
 
  execute({}) {
    var roleManager:RoleManager =   this.state.magicBook.roleManager;
    var seatManager:SeatManager =   this.state.magicBook.seatManager;

    
    seatManager.seats.forEach((seat:Seat) => {  

      var role = roleManager.getRoleBySeatId(seat.id);
      if (role){
       // seat.roleId = role.id;    
        role.sessionId = seat.sessionId;
        role.robot = seat.robot;
        seat.role = role;
        role.addMessage("你的身份是:"+role.name)
      }

      
    })  

  }
 
}


export class CleanTrash extends Command<TowerRoomState, {

}> {
 
  execute({}) {
   
    var roleManager:RoleManager =   this.state.magicBook.roleManager;
    var previewManager:PreviewManager =   this.state.magicBook.previewManager;
    roleManager.wished.clear();
    roleManager.roleCards.clear();
    
    roleManager.wishRoles.clear();
    previewManager.previews.clear();


  }
 
}