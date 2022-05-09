
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
//const roles = require('./json/roles.json');

import roles from "./json/roles.json"
//import { Result } from "./TowerRoomState";

export class HandCard extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("string") team: string;
    @type("string") ability: string;   
    @type("string") type: string;
    @type("boolean") used: boolean;  
    @type("number") buffPeriod: number=0;  

}

export class HandCardDeck extends Schema {    
  @type({ map: HandCard }) handCards = new MapSchema();
    



  init(options:any){
    console.log("init")
    var editorId =options.id;
    for (var i =0;i <roles.length;i++){
        var str = String(i);
        var role = roles[i];
        
        if (role.edition == editorId){
          if (role.buffPeriod){
            var card = new HandCard().assign(role);    
           
            this.handCards.set(card.id, card);
          }

        }          
         
    }

  }

  monk(){
    console.log("monk")
  }



 
}
