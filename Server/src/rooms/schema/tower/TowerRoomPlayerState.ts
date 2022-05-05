
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { AvatarState } from "../AvatarState";
//import { RoleCard} from "./TowerRoomRoleCardState";
import { RoleCard} from "./TroubleRole";
import { HandCardDeck ,HandCard} from "./TowerRoomHandCardState";


import { Seat,SeatManager} from "../SeatState";

import { NullHighlighter } from "@mikro-orm/core";



export class PlayerCharacter extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("string") brief: string;
    @type("string") sexual: string;
    @type("string") age:string;
    @type("boolean") used:boolean ;
}

export class Player extends Schema {
    @type("string") id: string;
    @type("string") sessionId: string;
    @type("string") roomId: string;
    @type("string") name: string;
    @type("string") color: string;
    @type("string") activeSessionId: string;
    @type("string") pendingSessionId: string;
    @type("string") seatId: string;

    @type(PlayerCharacter) playerCharacter: PlayerCharacter = new PlayerCharacter();
    @type(AvatarState) avatar: AvatarState = new AvatarState();


   // @type({ map: RoleCard }) pickRoleCard = new MapSchema();
   // @type({ map: RoleCard }) previewRoleCards = new MapSchema();


    @type({ map: RoleCard }) roleCards = new MapSchema();
    @type({ map: HandCard }) handCards = new MapSchema();
    @type({ map: HandCard }) buffCards = new MapSchema();
    @type("number") reconnectCount: number=0;
    @type("boolean") connected: boolean=true;
    @type("boolean") admin: boolean=false;
    @type("boolean") robot: boolean=false;
    @type("boolean") sitted: boolean=false;
 
    @type("boolean") alive: boolean;
    @type("boolean") witch: boolean;
    @type("boolean") sergant: boolean;
    @type("boolean") claimSurrender: boolean;
    @type("number") charged: number=0;
    @type("number") life: number=0;
    @type("number") hands: number=0;
  //  @type(["number"]) state: number[] = new ArraySchema<number>(0, 0, 0, 0, 0, 0);


    /*
        var arr = [1,2,3,4,5,6,7,8,9,10];           
        arr.sort(this.Arandom); 
   */
    arandom(a:any,b:any){
        　　return (Math.random() > 0.5) ? 1 : -1;;
    }

    reset():Player{
       

        this.charged = 0;
        this.seatId = "";
        this.life =0;
        this.sitted = false;
        return this;
    }

    stand(){
        this.seatId ="";
    }
    sit(seatId:string){
        this.seatId = seatId;
    }

    /*
    getRandomRoleCard():RoleCard{
        var count = this.roleCards.size;                  
        const a = Array.from( this.roleCards.values());
        var roleCard;       
        var finding = true;
    
        while(finding){
            var n = Math.floor(Math.random() *  count + 1) -1;
            console.log('n',n)
            roleCard =a[n];
            if(roleCard){

            
                if (roleCard.used==false){
                    finding = false;        
                    return  roleCard;
                }  
            }      
        }        
    }
    */
    getRandomRoleCard():RoleCard{
        const arr = Array.from( this.roleCards.keys());

        arr.sort(this.arandom); 


        for (var i =0;i<arr.length;i++){
            var id = arr[i];

            var card:RoleCard = this.roleCards.get(id);
            if (card.used ==false){
                return card;
            }
        }
        return null;

    }


    getRandomRoleCardCitizenFirst():RoleCard{
       
        const arr = Array.from( this.roleCards.keys());
        var found = false;
        arr.sort(this.arandom); 
        var data = []


        for (var i =0;i<arr.length;i++){
            var id = arr[i];

            var card:RoleCard = this.roleCards.get(id);
            if (card.used ==false){
                
                data.push(card)
            }
        }

        for (var i =0;i<data.length;i++){
            var card = data[i];
            if (card.citizen==true){
                found = true;
                return card;
            }
        }

        for (var i =0;i<data.length;i++){
            var card = data[i];
            if (card.sergant){
                found = true;
                return card;
            }
        }
        for (var i =0;i<data.length;i++){
            var card = data[i];
            if (card.witch){
                found = true;
                return card;
            }
        }

        return null
       
    }
    /*
    addPickCard(){
        var cards = Array.from(this.pickRoleCard.keys());
        var cardId = cards[0];
        var card = this.pickRoleCard.get(cardId);   
        card.picked = false;      
        this.roleCards.set(card.id,card); 
    }
    */
    
    checkRole(){
        this.sergant= false;


        this.roleCards.forEach((card:RoleCard) => { 
            if (card.witch) {
                this.witch = true;               
            }
            if (card.sergant==true && card.used==false) {
                this.sergant = true;  
            }           

         });
        
    }

    reportRole():string{

        var name = this.name+"是"
        if (this.witch == true){
            if (this.sergant){
                return name+"巫警"
            }else {
                return name+"女巫"
            }
        }else {
            if (this.sergant){
                return name+"警长"
            }else {
                return name+"平民"
            }
        }  
    }
    //check if player's witch card opened or all card opened;
    checkAlive():boolean{
       this.checkRole();
        var result = true;
        if (this.roleCards.size>5){
            console.error("critical error ",this.roleCards.size +":"+ this.id)
        }
        this.roleCards.forEach((card:RoleCard) => { 
           if (card.used && card.witch == true){
             result = false;
           }
        });  

        
        
     
       
        if  (this.getLife()<=0) result = false; ;
        this.alive = result;
        this.reportLife();         
        return result;
    }

    getCardAmount(type:string):number{
        var result =0;
        this.handCards.forEach((card:HandCard) => { 
            if (card.used==false && card.type==type) {
                result++           
            }            
         });


        return result;
    }
    getFirstCard(type:string):HandCard{
        if (this.getCardAmount(type)==0) {
            return null;
        }
      
        var count = this.handCards.size;                  
        const a = Array.from(this.handCards.values());
        var card  
        var finding = true;
        while(finding){
            var n = Math.floor(Math.random() *  count + 1)-1;
            card =a[n];
            if (card.type==type){
                finding = false;       
                return  card;
            }
        }

        return null

    }
    getLife():number{
        var result = 0;

        this.roleCards.forEach((card:RoleCard) => { 
           if (card.used==false) {
               result ++;               
           }
        });

        this.life = result;
        return result ;
    }
    reportLife(){
        var result = this.getLife();
        console.log(this.name+" life left:",result)
        
    }

    checkBuffByName(cardName:string):boolean{
        var result = false;
        this.buffCards.forEach((card:HandCard) => { 
            if (card.name==cardName) {
                result = true;            
            }
         });


        return result;
    }

    hasSameBuffCard(cardName:String):boolean{
        var result = false;  
        this.buffCards.forEach((handCard:HandCard) => {
            if (handCard.name == cardName) result = true;
        })  
        return result;
    }


    getPlayerBoard():any{
        this.hands = this.handCards.size;
        var hands = this.hands;
        var lifes= this.getLife();
        var charged = this.charged;
    
        
        var result = {id:this.id,hands:hands,life:lifes,charged:charged}
        return result;
    }

    getBuffCards():any{

        const a = Array.from( this.buffCards.values());
        
        var result = {id:this.id,buffCards:a}
        return result;
    }
/*
    getPreviewRoleCards():any{
        const a = Array.from( this.previewRoleCards.values());
        
        var result = {id:this.id,previewCards:a}
        return result;       
    }
*/
    getHandCards():any{

         const a = Array.from( this.handCards.values());
      //  console.log('a',a)        
        var result = {id:this.id,handCards:a}
        return result;
    }
    checkIfCuffed():boolean{
        var result = false;
        var _card:HandCard;
        this.buffCards.forEach((card:HandCard) =>{

            if (card.name == "拘留"){
                result = true;
                _card = card;
            }
        })
        if (_card){
            
            this.buffCards.delete(_card.id)
        }
        
        return result;

    }

/*
    changeState(){
        this.state[0] = this.handCards.size;
        this.state[1] = this.getLife();
        this.state[2] = this.charged;
        this.state[3] = this.buffCards.size;

    }
*/
       

}
  


