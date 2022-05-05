import * as PIXI from 'pixi.js'
//import { Application } from 'pixi.js/lib/core';
import Application from '../Application'
import Message from './Message'
export default class MessageBoard extends PIXI.Container {

  constructor (app) {
    super()
    this.app = app;
    this.loader = app.loader
    this.reset();
    this.isShow = false;
    this.msgCount =0;

    var id = this.loader.resources["tb"].textures; 
   // this.playerSlot = new PIXI.Sprite(id["scroll.png"])  
    this.cardScale =1;
   this.background =  new PIXI.Sprite(app.loader.resources.messageBoard.texture)// new PIXI.Sprite.fromImage('images/message-board.png')
    //this.background = new PIXI.Sprite(id["message-board.png"])  
    this.background.x =0
    this.background.y =0

    this.addChild(this.background)
    this.first = true;
    this.sprites= [];

    let text ="..............";

    this.tipText = new PIXI.Text(text, {
      font: "50px",
      fill: '#fff',
      textAlign: 'center'
    })
    this.tipText.pivot.x = this.tipText.width / 2
    this.tipText.pivot.y = this.tipText.height / 2
    this.tipText.x = this.background.width/2
    this.tipText.y = this.background.height-50
    this.background.addChild(this.tipText)




    this.maxSelect = 1;
    this.selections =[];
    this.title ="";
    this.hide(); 
    this.cards=[];
    this.isShow =false;
    console.log(" this.isShow", this.isShow)
    
  }

  
  init (room){
    
    this.seat =null;
    this.room = room;
    this.pid = this.room.state.pid;
    

    this.tilte = this.room.state.progress.tip;  

    this.room.state.listen("pid", (pid) => { 
      this.pid = pid ;
      if (pid>=40)
         this.getSeat();
      
    }); 
    
    this.room.state.msgs.onChange = (value,index) => {
    //  console.log("msgs.msgs =>", value,index);
     
      if (this.seat){
        if (index ==this.seat.id){
          console.log(value)
          this.msgCount = value;
        }
      }
    }
    /*
    this.room.state.messageManager.onChange = (value) => {
      console.log("messageManager.onChange =>", value);
      var arr= Array.from(value.values())
       console.log("arrL",arr)
    }
    */

  }

  logic(){
    switch (this.pid) {   
      case 25:
       // this.draw();  
     
      break

      default:
        this.hide()
    }
  }
  onClick(){

    this.isShow =(this.isShow==true) ? false: true;
    if (this.isShow) {
      this.show();
    } else {
      this.hide();       
    }
     
  
      
      return this.isShow
  }
  getMessage(){
   
    if(this.getSeat() ==false) return; 
    if (!this.seat.role) return ;
    if (!this.seat.role.messages) return ;
    var messages =  this.seat.role.messages
    var arr = Array.from(messages.values())
    this.cards = arr;

  
   // 
    return   this.cards;

  }
  hide(){
    this.fadeOut(this);
    this.deActive();
  }
  show(){
   // this.isShow = true;
    if (this.getSeat()) {
     // this.getMessage();
      this.draw('show');
      this.fadeIn(this);
      this.active();
    }

 
   
  }
  
  fadeIn(sprite) {  
    return tweener.add(sprite).to({ alpha: 1}, 500, Tweener.ease.quintOut)
  }

  fadeOut(sprite) {
      return tweener.add(sprite).to({ alpha: 0}, 500, Tweener.ease.quintOut)
  }
  popUp(sprite){
    if (sprite.running) return
    sprite.running = true;
   // tweener.add(sprite).to({y: sprite.y - 100, alpha: 0.8}, 500, Tweener.ease.quintOut)
    tweener.add(sprite).from({y: sprite.y + 100, alpha: 1}, 600, Tweener.ease.quintOut).then(function(){
      console.log("done")
      sprite.running = false; 
    }) 
  
  }
  jumpUp(sprite){
    if (sprite.running) return
    sprite.running = true;
    tweener.add(sprite).to({y: sprite.y - 100, alpha: 0.8}, 500, Tweener.ease.quintOut)
    tweener.add(sprite).from({y: sprite.y + 100, alpha: 1}, 600, Tweener.ease.quintOut).then(function(){
      console.log("done")
      sprite.running = false; 
    }) 
  
  }

  select(sprite){
    if (sprite.selected) return
    if (sprite.running) return
    sprite.selected = true;
    sprite.running = true;
    var that = this;
    tweener.add(sprite).to({y: sprite.y - 350, alpha: 1}, 300, Tweener.ease.quintOut).then(function(){
     // console.log(sprite)
     that.makeSelect(sprite)
      sprite.running = false; 
    }) 
  
  }
  unSelect(sprite){
    if (!sprite.selected) return
   
    sprite.selected = false;
    
    var that = this;
    tweener.add(sprite).to({y: sprite.y + 350, alpha: 1}, 100, Tweener.ease.quintOut).then(function(){
    }) 
  
  }
  makeSelect(sprite){
    this.selections.push(sprite)
   // console.log("select" , sprite.id)
    if (this.selections.length>this.maxSelect ){
     
      var s =this.selections.shift();
       console.log("unselect" , s.id)
      this.unSelect(s)
    }
   


  }


  getSeat(){
      if (!this.room.state) return false;
      this.seats= this.room.state.magicBook.seatManager.seats  
      this.cards = Array.from(this.seats.values())
      let res1=this.cards.filter((item,index,array)=>{
          return (item.sessionId == this.room.sessionId)
        
      });
      if (res1.length== 1){
        this.seat = res1[0]
      //  console.log("this.seat.id:" ,this.seat.id)
        return true;
      } else {

        return false;
      }          
   }




  draw(reason){
    this.rows =0;
    this.cards = this.getMessage();
    var top_margin = 100;
    var left_margin = 70;
    if (!this.cards) return;

    this.resetSprites();
    var size = this.cards.length;
    var k = 0;
    for (var i=0;i<this.cards.length;i++){
        var card =  this.cards[i];
        this.rows ++
          
        var sprite =this.newCard(card);
     
        var x = left_margin;
        var y =  50 * (i+k) +top_margin;
        if (sprite.twoRow){
            this.rows ++
            k ++;
        } else {

        }
        sprite.x = x
        sprite.y = y
        
        sprite.interactive = true;
        this.background.addChild(sprite);
       
        this.sprites.push(sprite);
         
    }
    console.log("this.rows",this.rows)
 

  }
  /*
  getPrviewCards(){
    this.getSeat();
    if (!this.seat) return
    var preview = this.room.state.magicBook.previewManager.previews.get(this.seat.id);
    //console.log("this.preview",this.preview.previewRoleCards)
    let arr2 = Array.from(preview.previewRoleCards.values())
    return arr2;
  
}
*/

  
  getPosition(count){
    var border_x = 5;
    var border_y = 10;
    var cardWidth =60;
    var height = 300;
    var width = 568;
  
    var result =[];

    var margin = 30;
  
    for (let i=0; i<count; i++) {
      var y =   border +i*(margin+(cardWidth/2));
      var data ={x:border_x,y:y};
        result.push(data)
    }
    return result;

  }
  reset(){



    this.size = 190
    this.cards = []

    
  }
  resetSprites(){
      /*
      while (this.sprites.length>0){
        var c =this.sprites.pop();
       // console.log("c",c)
        this.background.removeChild(c);
        this.removeChild(c);
      }
      */
     this.resetSpriteChildren(this.background);
  }

  resetSpriteChildren(sprite){

      while (sprite.children.length>0){     
        var c =sprite.children.pop();      
           sprite.removeChild(c);
      }
      
    } 

  makeDesciption(sprite,data){
    
   
   var description = data.ability;

   var fontSize =26;
    var a = this.mySubString(description,18,true)
    description = this.myReplace(description,a)
    var b = this.mySubString(description,18,true)
    description = this.myReplace(description,b)
    var c = this.mySubString(description,18,true)
    description = this.myReplace(description,c)
    var d = this.mySubString(description,18,true)



    var descriptionText1 = new PIXI.Text(a, {
      font: fontSize+"px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    descriptionText1.y = -45;
    descriptionText1.x = 0;
    descriptionText1.anchor.set(0.5)

    var descriptionText2 = new PIXI.Text(b, {
      font:fontSize+"px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    descriptionText2.y = -15;
    descriptionText2.x = 0;
    descriptionText2.anchor.set(0.5)

    var descriptionText3 = new PIXI.Text(c, {
      font: fontSize+"px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    descriptionText3.y = 15;
    descriptionText3.x = 0;
    descriptionText3.anchor.set(0.5)   
    
    var descriptionText4 = new PIXI.Text(d, {
      font: fontSize+"px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    descriptionText4.y = 45;
    descriptionText4.x = 0;
    descriptionText4.anchor.set(0.5)     

    sprite.addChild(descriptionText1)
    sprite.addChild(descriptionText2)
    sprite.addChild(descriptionText3)
    sprite.addChild(descriptionText4)


  }
  makeTeam(sprite,data){
    var team =data.team
    var name="";
    switch(team){
      case "townsfolk":
        name = "村民"
      break;
      case "outsider":
        name = "外来"
      break;
      case "minion":
        name = "爪牙"
      break;
      case "demon":
        name = "恶魔"
      break;
    }
    var nameText = new PIXI.Text(name, {
      font: "30 JennaSue",
      fill: '#fff',
      textAlign: 'center'
    })
    nameText.y = -100
    nameText.x = -25
    sprite.addChild(nameText)
  }

  newCard(msg){
    var id = this.loader.resources["tb"].textures; 
    var sprite = new PIXI.Sprite(id["circle.png"]) 
    var fontSize  = 26
    var len = 36
    var a = this.mySubString(msg,len,true,false)
    msg = this.myReplace(msg,a)
    var b = this.mySubString(msg,len,true,false)

    var nameText = new PIXI.Text(a, {
      font: fontSize+"px",
      fill: '#fff',
      textAlign: 'left'
    })
    nameText.y = 5;
    nameText.x = 40;

    var nameText2 = new PIXI.Text(b, {
      font: fontSize+"px",
      fill: '#fff',
      textAlign: 'left'
    })
    nameText2.y = 40;
    nameText2.x = 40;


    sprite.addChild(nameText);
    sprite.addChild(nameText2);
    if (b.length>0)
      sprite.twoRow = true;


    return sprite;
  }


  onSelect (id) {
   
   var s=  this.getSprite(id);
   this.select(s);
    
   
    var pid = this.room.state.pid;
    if (!pid) return;
     
    switch (pid){
        case 25:
          this.room.send("action",{'action':'selectPreviewRole',data:{'roleId':id}});          
        break;

    }

  }
  getSprite(id){
     for (var i=0;i<this.sprites.length;i++){
          var sprite = this.sprites[i];
          if (sprite.id ==id) return sprite;
     }
    
  }


  deActive(){
    this.fadeOut(this)
    //console.log("deactive")
    this.interactive = false;
    for (var i=0;i<this.sprites.length;i++){
      var s = this.sprites[i];
      s.interactive = false;
    }
  }
  active(){   
    this.interactive = true;
    for (var i=0;i<this.sprites.length;i++){
       var s = this.sprites[i];
       s.interactive = true;
    }

  }

  mySubString (str, len, hasDot,rep){
    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = str.replace(chineseRegex,"**").length;
    for(var i = 0;i < strLength;i++)     {
      singleChar = str.charAt(i).toString();
      if(singleChar.match(chineseRegex) != null) {
        newLength += 2;
      }else {
        newLength++;
      }
      if(newLength > len) {
        break;
      }
      newStr += singleChar;
    }
    /*
    if(hasDot && strLength > len) {
      newStr += "...";
    }
    */
   if (rep){
     newStr += "...";
   }
    return newStr;
  }

  myReplace(source,str){
    return    source.replace(str,"");

  }


}
