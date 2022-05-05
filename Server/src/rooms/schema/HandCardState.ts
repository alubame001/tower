
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import logger from "../../helpers/logger";
import { Result } from "./StoryRoomState";

export class HandCard extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("string") type: string;
    @type("number") value: number=0;
    @type("boolean") used: boolean=false;
    @type("boolean") invis: boolean=true;
}

export class HandCardDeck extends Schema {    
    @type({ map: HandCard }) cards = new MapSchema();
    @type({ map: HandCard }) usedCards = new MapSchema();
    @type("number") num: number=0;
    //@type("string") blackCatId: string=this.randomString(6);
    //@type("string") infectId: string=this.randomString(6);
    //@type("string") murderId: string=this.randomString(6);
    //@type("string") sergantProtectId: string=this.randomString(6);
    @type(HandCard) infectCard: HandCard;
    @type(HandCard) blackCatCard: HandCard;
    @type(HandCard) nightCard: HandCard;
    @type(HandCard) murderCard: HandCard;
    @type(HandCard) sergantProtectCard: HandCard;

    init(options:any) {
      console.log("HandCard init")
        for (var i=0;i<5;i++){
            var str = String(this.num);
        //   str = this.randomString(6);
            
             var card = new HandCard().assign({    
                id :str,        
                name :'指控',
                type :'red',
                value :1,
                used:true  
              });            
            this.usedCards.set(card.id, card);
            this.num++               
        }

        for (var j=0;j<5;j++){
            var str = String(this.num);
          //  str = this.randomString(6);
            
             var card = new HandCard().assign({    
                id :str,       
                name :'证据',
                type :'red',
                value :3,
                used:true  
              });            
            this.usedCards.set(card.id, card);
            this.num++    
        }

        for (var k=0;k<3;k++){
            var str = String(this.num);

            
             var card = new HandCard().assign({    
                id :str,          
                name :'目击',
                type :'red',
                value :7,
                used:true  
              });            
            this.usedCards.set(card.id, card);
            this.num++    
        }
        for (var k=0;k<5;k++){
            var str = String(this.num);

            
             var card = new HandCard().assign({    
                id :str,          
                name :'纵火',
                type :'green',
                value :0,
                used:true  
              });            
            this.usedCards.set(card.id, card);
            this.num++    
        }

        for (var k=0;k<2;k++){
            var str = String(this.num);

            
             var card = new HandCard().assign({    
                id :str,          
                name :'抢劫',
                type :'green',
                value :0,
                used:true  
              });            
            this.usedCards.set(card.id, card);
            this.num++    
        }      
        
        for (var k=0;k<2;k++){
          var str = String(this.num);

          
           var card = new HandCard().assign({    
              id :str,          
              name :'抢劫',
              type :'green',
              value :0,
              used:true  
            });            
          this.usedCards.set(card.id, card);
          this.num++    
        }  
        for (var k=0;k<10;k++){
          var str = String(this.num);          
          var card = new HandCard().assign({    
              id :str,          
              name :'拘留',
              type :'green',
              value :0,
              used:true  
            });            
          this.usedCards.set(card.id, card);
          this.num++    
        }          
        
        for (var k=0;k<2;k++){
          var str = String(this.num);          
          var card = new HandCard().assign({    
              id :str,          
              name :'情侣',
              type :'blue',
              value :0,
              used:true  
            });            
          this.usedCards.set(card.id, card);
          this.num++    
        }     
             
        for (var k=0;k<1;k++){
          var str = String(this.num);          
          var card = new HandCard().assign({    
              id :str,          
              name :'避难',
              type :'blue',
              value :0,
              used:true  
            });            
          this.usedCards.set(card.id, card);
          this.num++    
        }  
        for (var k=0;k<1;k++){
          var str = String(this.num);          
          var card = new HandCard().assign({    
              id :str,          
              name :'圣人',
              type :'blue',
              value :0,
              used:true  
            });            
          this.usedCards.set(card.id, card);
          this.num++    
        }  

        this.infectCard = new HandCard().assign({    
            id :String(this.num),          
            name :'传染',
            type :'black',
            value :0,
            used:false  
          });            
        //this.usedCards.set(card.id, card);
        this.num++    

        this.blackCatCard = new HandCard().assign({    
            id :String(this.num),          
            name :'黑猫',
            type :'blue',
            value :0,
            used:false  
          });            
        //this.usedCards.set(card.id, card);
        this.num++  


        this.murderCard = new HandCard().assign({    
            id :String(this.num),          
            name :'谋杀',
            type :'blue',
            value :0,
            used:false,
            invis:false  //important
          });            
        //this.usedCards.set(card.id, card);
        this.num++       
        
        this.sergantProtectCard= new HandCard().assign({    
            id :String(this.num),          
            name :'保护',
            type :'blue',
            value :0,
            used:false           
          });            
        this.num++ 

        this.nightCard = new HandCard().assign({    
            id :String(this.num),          
            name :'Night',
            type :'black',
            value :0,
            used:false  
          });            
        //this.usedCards.set(card.id, card);
        this.num++  


    }
    
    arandom(a:any,b:any){
    　　return (Math.random() > 0.5) ? 1 : -1;;
    }
    shuffle(){
        this.dropAlllCard();
        const arr = Array.from( this.usedCards.keys());

        arr.sort(this.arandom); 
      //  console.log(arr)

        for (var i =0;i<arr.length;i++){
            var id = arr[i];

            var handCard:HandCard = this.usedCards.get(id);
            handCard.used = false;
            this.cards.set(id,handCard);
            this.usedCards.delete(id);
        }

    }
    firstCard(){
        var keys = this.cards.keys();
        const arr = Array.from( keys);        
        if (arr.length==0) return null;
        var card  = this.cards.get(arr[0]);    
        return card;       
    }

    deal(){        


        var card = this.firstCard();
        
        if (card) {
          this.cards.delete(card.id)
          return card;
        } else {
          console.log("no card !!!!!!!!!!!!!!!!!!!!!!!!!!!")
          return null;
        }
            

    }
    randomString(e:number) {  
        e = e || 32;
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
        for (var i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n
    }
    dropAlllCard(){
       
        
        this.cards.forEach((card:HandCard) => {
           card.used = true;             
           this.usedCards.set(card.id,card)
        });
        this.cards.clear();
       // console.log("dropallcard:",this.cards.size);
    }

    resetBlackCard(){
        console.log("resetBlackCard")

        this.dropAlllCard();
        
        var card = this.infectCard;  
        if (!this.usedCards.has(card.id)) {
            this.usedCards.set(card.id, card);            
        }  

      
        this.shuffle();


        var card =this.nightCard; 
        if (!this.usedCards.has(card.id)) { 
            this.cards.set(card.id, card);
        }
        
     

    }

    useCard(card:HandCard){

        this.usedCards.set(card.id, card);

    }

    collectUsedCard(){

     
       /*
        this.usedCards.forEach((card:HandCard) => {
            card.used = false;
            this.cards.set(card.id,card);  
        })
        this.usedCards.clear();
         */
    }




 
}
