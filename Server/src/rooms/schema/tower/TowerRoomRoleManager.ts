//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";


import { Seat,SeatManager} from "../SeatState";
import { MagicBook,Option} from "./TowerRoomMagicBook";
//import { RoleCard} from "./TowerRoomRoleCardState";
import { RoleCard} from "./TroubleRole";
//import { Action} from "./TowerRoomMagicBook";
import { HandCardDeck,HandCard} from "./TowerRoomHandCardState";
import {ActionManager,Action } from "./TowerRoomActionState";
import {WishRole } from "./TowerRoomWishRole";


import options from "../../../config/mikro-orm.config";
import { realpath } from "fs";
import { createDecipheriv } from "crypto";
const editions = require('./json/editions.json');
const roles = require('./json/roles.json');
const game = require('./json/game.json');




export class RoleManager extends Schema{
    @type({ map: RoleCard }) roleCards = new MapSchema();
    @type({ map: RoleCard }) used = new MapSchema();
    @type({ map: RoleCard }) wished = new MapSchema();
    @type({ map: RoleCard }) traveler = new MapSchema();
    @type({ map: RoleCard }) roles = new MapSchema();
    @type({ map: WishRole }) wishRoles = new MapSchema();
    @type({ map: HandCard }) buffs = new MapSchema();  
    @type({ map: RoleCard }) order = new MapSchema();     
    @type(["string"]) orders: string[] =   new ArraySchema<string>();
    init(options:any){

        var editorId =options.id;
        for (var i =0;i <roles.length;i++){
            var str = String(i);
            var role = roles[i];
            
            if (role.edition == editorId){
                var roleCard = new RoleCard().assign(role); 
                roleCard.abilityId = roleCard.id;   
                if (role.possibility) 
                    roleCard.possibility =role.possibility;
                else 
                    roleCard.possibility =[];
                this.roleCards.set(roleCard.id, roleCard);
            }          
             
        }
        console.log("RoleManager init " +this.roleCards.size);

    }

    
    randomString(e:number) {  
        e = e || 32;
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
        for (var i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n
    }


    arandom(a:any,b:any){
    　　return (Math.random() > 0.5) ? 1 : -1;;
    }
    shuffle(){
        var count = this.roleCards.size;                  
        const arr = Array.from( this.roleCards.values());
        arr.sort(this.arandom);      
        for(var i=0;i<arr.length;i++){
            this.roleCards.set(String(i),arr[i]);
        }
    }

    deal(){
        var keys = this.roleCards.keys();
        const arr = Array.from( keys);
        var roleCard :RoleCard = this.roleCards.get(arr[0]);
        this.roleCards.delete(arr[0]);
        return roleCard;
    }
    /**
     * 从全部的牌推中抽出一张角色使用。
     */
    
    //townsfolk
    dealRandomRoleCard(team:string):RoleCard{
        let arr = Array.from(this.roleCards.values())
  
        let res1=arr.filter((item,index,array)=>{
            return (item.team ==team)// &&(item.edition =="tb")
         });
         var ran1 = Math.floor((Math.random() * res1.length) + 0);
         var card1 = res1[ran1];
         if (card1)
            this.roleCards.delete(card1.id);
         return card1;        

    }
    dealCard(id:string):RoleCard{
         let card = this.roleCards.get(id)
         if (card)
            this.roleCards.delete(card.id);
         return card;        

    }
    pickCard(id:string,team:string):RoleCard{
        let card = this.roleCards.get(id)
        let result :RoleCard;
        if (card){
            if (card.team == team){
                this.roleCards.delete(card.id);
                result = card;        
            }

        }

        return result;
         
      

   }

    /*
    设定预选角色用的
    */
    getRandomRoleCard(exceptIds:any,team:string):RoleCard{
        let arr = Array.from(this.roleCards.values())

        let res=arr.filter((item,index,array)=>{
            return ((item.team ==team)&&(item.diablePreview==false))// &&(item.edition =="tb")
         });

         let res1=res.filter((item,index,array)=>{
            var found = false;
            for (var i=0;i<exceptIds.length;i++){
                var e =  exceptIds[i] 
                if (e == item.id) found = true;
            }
            if (found == false){
                return item;
            }    
        })


         var ran1 = Math.floor((Math.random() * res1.length) + 0);
         var card1 = res1[ran1];
         //this.roleCards.delete(card1.id);
         return card1;        

         
    }    
    /*
    设定随机角色用的
    */    
    getRandomRole(team:string):RoleCard{
        let arr = Array.from(this.roleCards.values())

        let res1=arr.filter((item,index,array)=>{
            return (item.team ==team)// &&(item.edition =="tb")
         });
         var ran1 = Math.floor((Math.random() * res1.length) + 0);
         var card1 = res1[ran1];
         //this.roleCards.delete(card1.id);
         return card1;        

         
    }  

    execute(seatId:String){

        this.roles.forEach((role:RoleCard) => {
            if (role.seatId == seatId){
                role.alive = false;

                this.roles.set(role.id,role);
            }
        })


    }

    finishOther(book:MagicBook){
        for (var i=1;i<=book.playerCount;i++){
            var idx = i;
            var role:RoleCard;
            var found = false;
            this.wished.forEach((role:RoleCard) => {             
                if (role.idx == idx){    
                    found = true
                }
            }) 
            if (found ==false){
               // var seat:Seat = book.seatManager.getSeatByPlayerId(wish.playerId);
                let arrRole = Array.from(this.used.values())   
                var _role = arrRole[0];
                _role.idx = idx;
                _role.seatId = String(idx);
                _role.wish = true;
              
                this.wished.set(_role.id,_role);
                this.used.delete(_role.id);

            }           



        }

    }

    replaceRole(book:MagicBook){
        if (this.isRoleUsed('drunk')){          
            var drunk:RoleCard= this.roles.get('drunk')


        
           
            var role = book.getOneRandomRole(['drunk'],'townsfolk',true,false)
            if (!role) return;
            //   if (!role) role =  book.getOneRandomRole(['drunk'],'townsfolk',true,true)
            drunk.replaceName = drunk.name
            drunk.name = role.name;
           
            
            drunk.drunked =true;
            drunk.abilityId = role.abilityId;
            drunk.firstNight = role.firstNight;
            drunk.otherNight = role.otherNight;

            //this.used.set(drunk.id,drunk);
            this.roles.set(drunk.id,drunk);
          
            book.addMessage("有酒鬼，用另一个角色取代了:" + role.name )
        }
    }
    roleMark(book:MagicBook){
        if (this.isRoleUsed('fortuneteller')){          
            var role1 = book.getOneRandomRole(['fortuneteller'],'townsfolk',true,true);
            var role2 = book.getOneRandomRole(['fortuneteller'],'outsider',true,true);

            if ((this.dropDice()) && role2 ){
                book.addMessage(role2.title()+"被占卜师标记为宿敌")
                role2.marked = true;
            } else  {
                role1.marked = true;
                book.addMessage(role1.title()+"被占卜师标记为宿敌")
            } 
        }
    }

    isRoleUsed(id:string):boolean{
        var result ;
        var role = this.roles.get(id);
        if (role) {
            if (role.used) 
                return true
            else 
                return false;
        }
        return result;
    }
     
    finishWish(book:MagicBook){

        this.used.forEach((role:RoleCard) => { 
          
            if (role.wish){

                // console.log(role.name)
                    var wish = this.getWishRole(role);

                    var seat:Seat = book.seatManager.getSeatByPlayerId(wish.playerId);
                    if (!seat){console.error("finishWish no seat")}
                    if (wish.done ==false){
                        role.seatId = wish.seatId;
                        role.playerId = wish.playerId;
                        role.idx = wish.idx;
                        role.used = true;
                        role.sessionId =seat.sessionId;
                        wish.assigned = true;                   
                      //  this.wishRoles.delete(wish.id);
                        this.closeWish(role.name);
                      
                        this.wished.set(role.id,role)
                        this.used.delete(role.id);
                    }
                    
            }
        
        })
        
    }

    getWishRole(role:RoleCard):WishRole{
        var result :WishRole;
        let arrRole = Array.from(this.wishRoles.values())      
        let res=arrRole.filter((item,index,array)=>{
            return ((item.name==role.name)&&(item.assigned == false))
        }) 
        var ran = Math.floor((Math.random() * res.length) + 0);
        result= res[ran];
        return result;


    }
    closeWish(name:string){
        this.wishRoles.forEach((wish:WishRole) => { 
            if (wish.name==name){
                wish.done = true;
            }
            
        })

    }

    fillRoleByWish(id:string,option:Option):Option{

        var card:RoleCard =this.roleCards.get(id);
        if (!card) return option;    
        var opt = 0;
        var team = card. team;
        switch (team) {
            case 'demon':
                opt = option.demon
                break;
            case 'minion':
                opt = option.minion
                break;               
            case 'outsider':
                opt = option.outsider
                break;
            case 'townsfolk':
                opt = option.townsfolk
                break;     
        }


        if (opt>0){          
    
            card.wish = true;
           // this.roles.set(card.id,card);
            this.used.set(card.id,card);
            this.roleCards.delete(card.id);

            if (card.minion){
               // console.warn("card.minion:",card.minion)
                option.minion  +=card.minion
            }
            if (card.outsider){
              //  console.warn("card.outsider:",card.outsider)
                option.outsider +=card.outsider
            }

            if (card.townsfolk){
               // console.warn("card.townsfolk:",card.townsfolk)
                option.townsfolk +=card.townsfolk
            }            

            if (this.roles.has(card.id)){
              //  console.log(card.name)
                opt --;
            }
        }           


       switch (team) {
        case 'demon':
             option.demon = opt
            break;
        case 'minion':
           option.minion = opt
            break;               
        case 'outsider':
           option.outsider = opt
            break;
        case 'townsfolk':
           option.townsfolk = opt
            break;     

         }      
        return option;
    }
    fillRoleByTeam(team:string,option:Option):Option{

       // var card =this.roleCards.get(id);
        var card = this.getRandomRole(team)

        if (!card) return option;    
        var opt = 0;
        var team = card. team;
        switch (team) {
            case 'demon':
                opt = option.demon
                break;
            case 'minion':
                opt = option.minion
                break;               
            case 'outsider':
                opt = option.outsider
                break;
            case 'townsfolk':
                opt = option.townsfolk
                break;     
        }


        if (opt>0){          
            card.used = true;
            console.log(card.name)
           
            this.used.set(card.id,card);
            
            this.roleCards.delete(card.id);

            if (card.minion){              
                option.minion  +=card.minion
            }
            if (card.outsider){
            
                option.outsider +=card.outsider
            }

            if (card.townsfolk){
      
                option.townsfolk +=card.townsfolk
            }            

            if (this.roles.has(card.id)){
         
                opt --;
            }
        }           


       switch (team) {
        case 'demon':
             option.demon = opt
            break;
        case 'minion':
           option.minion = opt
            break;               
        case 'outsider':
           option.outsider = opt
            break;
        case 'townsfolk':
           option.townsfolk = opt
            break;     

         }      
       //  console.log("option:",option.getList())
        return option;
    }

    fillRoleMustHave(id:string,option:Option):Option{

        // var card =this.roleCards.get(id);
         var card = this.roleCards.get(id);
         if (!card) return option;    
         var opt = 0;
         var team = card. team;
         switch (team) {
             case 'demon':
                 opt = option.demon
                 break;
             case 'minion':
                 opt = option.minion
                 break;               
             case 'outsider':
                 opt = option.outsider
                 break;
             case 'townsfolk':
                 opt = option.townsfolk
                 break;     
         }
 
 
         if (opt>0){          
     
            
             this.roles.set(card.id,card);
           //  this.used.set(card.id,card);
             this.roleCards.delete(card.id);
 
             if (card.minion){
               //  console.warn("card.minion:",card.minion)
                 option.minion  +=card.minion
             }
             if (card.outsider){
              //   console.warn("card.outsider:",card.outsider)
                 option.outsider +=card.outsider
             }
 
             if (card.townsfolk){
                // console.warn("card.townsfolk:",card.townsfolk)
                 option.townsfolk +=card.townsfolk
             }            
 
             if (this.roles.has(card.id)){
              //   console.log(card.name)
                 opt --;
             }
         }           
 
 
        switch (team) {
         case 'demon':
              option.demon = opt
             break;
         case 'minion':
            option.minion = opt
             break;               
         case 'outsider':
            option.outsider = opt
             break;
         case 'townsfolk':
            option.townsfolk = opt
             break;     
 
          }      
         return option;
     }
           
      
    dropDice():boolean{
        var result = false;
        var ran = Math.floor((Math.random() *100) + 0);
        if (ran>50) result = true;
        return result;
    }
    yesOrNo():boolean{
        return this.dropDice();
    }
    /**
     *  
     */
    
    setUsedCard(team:string,option:Option):Option{
        let arrRole = Array.from(this.roles.values())      
        let res=arrRole.filter((item,index,array)=>{
            return ((item.team==team)&&(item.used == true))
        })
        var opt = 0;
        switch (team) {
            case 'demon':
                opt = option.demon
                break;
            case 'minion':
                opt = option.minion
                break;               
            case 'outsider':
                opt = option.outsider
                break;
            case 'townsfolk':
                opt = option.townsfolk
                break;     
        }

      
       // for (var i =0 ;i <need;i++){
        if (opt>0){
       
            var card =this.dealRandomRoleCard(team);              

            if (card){            
                card.used = true;
 
                this.roleCards.delete(card.id)
                this.roles.set(card.id,card);
               // this.used.set(card.id,card);
            } 
            
            
            if (!card) return option;

            if (card.minion){
                //onsole.warn("card.minion:",card.minion)
                option.minion  +=card.minion
            }
            if (card.outsider){
               // console.warn("card.outsider:",card.outsider)
                option.outsider +=card.outsider
            }

            if (card.townsfolk){
                //console.warn("card.townsfolk:",card.townsfolk)
                option.townsfolk +=card.townsfolk
            }            

            if (this.roles.has(card.id)){
               // console.log(card.name)
                opt --;
            }
        }           
       // }

       switch (team) {
        case 'demon':
             option.demon = opt
            break;
        case 'minion':
           option.minion = opt
            break;               
        case 'outsider':
           option.outsider = opt
            break;
        case 'townsfolk':
           option.townsfolk = opt
            break;    
         }      
        return option;
    }




    
    getWishRoleNotAssigned():WishRole{
        var result:WishRole;
        let arr = Array.from(this.wishRoles.values())      
        var wishes=arr.filter((item,index,array)=>{
            return item.assigned==false
        })
        if (wishes.length>0){
            var ran = Math.floor((Math.random() * wishes.length) + 0)-1;
            if (ran<0) ran =0;
            var wish= wishes[ran]
            result = wish;
        }

        return result;
    }

    
    getOneRandomRole(exceptIds:any,team:string,alive:boolean,used:boolean):RoleCard{        
       var result = new RoleCard();
       var _roleCard :RoleCard;
       let arr = Array.from(this.roles.values())           
       let res=arr.filter((item,index,array)=>{
           if ((team==null)||(team=="")||(!team)){
               return ((item.alive ==alive) &&(item.used ==used))
           }  else {              
               return ((item.team ==team) &&(item.alive ==alive)  &&(item.used ==used))
           }           
       })   

       let res1=res.filter((item,index,array)=>{
           var found = false;
           for (var i=0;i<exceptIds.length;i++){
               var e =  exceptIds[i] 
               if (e == item.id) found = true;
           }
           if (found == false){
               return item;
           }    
       })

       if (_roleCard) {
          console.log(res1.length) 
          res1.push(_roleCard)     
          console.log(res1.length) 
       }   
       var ran1 = Math.floor((Math.random() * res1.length) + 0);
       var answer:RoleCard = res1[ran1];
       if (answer)
       if (!answer.seatId){
           answer.seatId = this.getRandomSeatId(exceptIds);
       }
       return answer;
   }
   getOneRandomRoleInTeamm(exceptIds:any,team:string):RoleCard{        
      return this. getRoleInTeam(exceptIds,team)
   }
   
    getRoleInTeam(exceptIds:any,team:string):RoleCard{        
       var result = new RoleCard();
       var _roleCard :RoleCard;
       let arr = Array.from(this.roles.values())           
       let res=arr.filter((item,index,array)=>{            
          return (item.team ==team) 
       })   

       let res1=res.filter((item,index,array)=>{
           var found = false;
           for (var i=0;i<exceptIds.length;i++){
               var e =  exceptIds[i] 
               if (e == item.id) found = true;
           }
           if (found == false){
               return item;
           }    
       })


       var ran1 = Math.floor((Math.random() * res1.length) + 0);
       var answer:RoleCard = res1[ran1];

       return answer;
   } 

  

    getRandomSeatId(exceptIds:any):string{
        var result ='0'
        let arr = Array.from(this.roles.values())   

        let res=arr.filter((item,index,array)=>{

            return ((item.alive)  &&(item.used))
        })  
        let res1=res.filter((item,index,array)=>{
        var found = false;
        for (var i=0;i<exceptIds.length;i++){
            var e =  exceptIds[i] 
            if (e == item.id) found = true;
        }
        if (found == false)
            return item;        
        })       
        var ran1 = Math.floor((Math.random() * res1.length) + 0);
        var answer:RoleCard = res1[ran1];        
        result = answer.seatId;
        return result;
    }

    getUniqueWish():any{
        let arr = Array.from(this.wishRoles.values())  
        var result= ['']
        result.pop(); 
        for (var i=0;i<arr.length;i++){
            var wish:WishRole = arr[i];
            result.push(wish.rid);

        }
        result= Array.from(new Set(result))
        return result;
    }

    getRoleBySeatId(seatId:string):RoleCard{
        var result : RoleCard
        let arr = Array.from(this.roles.values())   

        let res=arr.filter((item,index,array)=>{

            return ((item.seatId==seatId)  &&(item.used))
        })  
        if (res.length==1)
             return res[0]
        else 
            console.error("critical error on getRoleBySeatId:" +res.length)


        return result;

    }

    getRoleBySessionId(sessionId:string):RoleCard{
        var result : RoleCard
        let arr = Array.from(this.roles.values())   

        let res=arr.filter((item,index,array)=>{

            return ((item.sessionId==sessionId)  &&(item.used))
        })  
        if (res.length==1)
             return res[0]
        else 
            console.error("critical error on getRoleBySessionId ")


        return result;

    }


    setRoleTargets(sessionId:string,targets:any):boolean{
        var result = false;
        var role:RoleCard = this.getRoleBySessionId(sessionId);
        if(!role) return false;
        role.targets = targets;
        result = true

        return result;
    }
    /**
     *  
     */
    
    getDemonJustDead():RoleCard{
        var role :RoleCard;
        let arr = Array.from(this.roles.values())   

        let res=arr.filter((item,index,array)=>{
            return ((item.team=="demon")  &&(item.used) &&(item.dead) &&(item.checkDead==false))
        })         
        if (res.length==1)
             return res[0]
        else 
            console.error("critical error on getRoleBySessionId ")        

        return role;
    }

    

}