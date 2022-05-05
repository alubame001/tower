import * as PIXI from 'pixi.js'
//import { Application } from 'pixi.js/lib/core';
import Application from '../Application'
export default class PreviewBoard extends PIXI.Container {

  constructor (app) {
    super()
    this.app = app
    this.loader = app.loader
    this.reset();
    this.boardName ="PreviewBoard"
    //228
    //352
    this.cardWith =228;
    this.cardHeight =352;
    this.cardScale =1;
    this.background =  new PIXI.Sprite(app.loader.resources.deckBoard.texture);
    this.background.x =0
    this.background.y =0
    //this.background.anchor.set(0.5)
    this.addChild(this.background)
    this.first = true;
    this.sprites= [];

    let text ="请选择身份(50%机率入选)";

    this.tipText = new PIXI.Text(text, {
      font: "50px JennaSue",
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
  }

  
  init (room){

    this.room = room;
    this.pid = this.room.state.pid;
    

    this.tilte = this.room.state.progress.tip;  

    this.room.state.listen("pid", (pid) => { 
      this.pid = pid ;
      this.logic()     
   }); 


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
  hide(){
    
    this.deActive();
  }
  show(){
    console.log("show",this.x,":",this.y)
  //  this.resetData();   
   // if (this.getSeat()==false) return;
     
   // this.getPrviewCards(); 
   // this.draw();
    this.fadeIn(this);
    this.active();
   
  }
  fadeIn(sprite) {
    if (!sprite) return;
     return tweener.add(sprite).to({ alpha: 1}, 500, Tweener.ease.quintOut)
   }
 
   fadeOut(sprite) {
    if (!sprite) return;
       return tweener.add(sprite).to({ alpha: 0}, 500, Tweener.ease.quintOut)
   }

  jumpUp(sprite){
    if (!sprite) return;
    if (sprite.running) return
    sprite.running = true;
    tweener.add(sprite).to({y: sprite.y - 100, alpha: 0.8}, 100, Tweener.ease.quintOut)
    tweener.add(sprite).from({y: sprite.y + 100, alpha: 1}, 300, Tweener.ease.quintOut).then(function(){
      console.log("done")
      sprite.running = false; 
    }) 
  
  }
  select(sprite){
    if (!sprite) return;
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
  
    if (!this.pid) return;
    this.seats= this.room.state.magicBook.seatManager.seats  
    this.cards = Array.from(this.seats.values())

     let res1=this.cards.filter((item,index,array)=>{
         return (item.sessionId == this.room.sessionId)
       
     });

    
     if (res1.length== 1){
        this.seat = res1[0]
        return true;
     } else {
      
        return false;
      }
      

     
   }
  getPrviewCards(){
    if(this.getSeat() ==false) return; 
    console.log("this.seat",this.seat)
    let arr2 = Array.from(this.seat.previewRoleCards.values())
    this.cards = arr2
    
    return this.cards;    
  }
     /**
   * 
   * @param {*} seats  server上的seats资料 
   */

  draw(reason){

   

    this.cards= this.getPrviewCards();
    if (!this.cards) return;

    
    this.resetSprites();
    var size = this.cards.length;
    for (var i=0;i<this.cards.length;i++){
        var card =  this.cards[i];

        card.type ='green'
        var sprite =this.newCard(card,size,i);
        sprite.interactive = true;
        this.background.addChild(sprite);
       
        this.sprites.push(sprite);
         
    }
    if (this.cards.length>0)
       this.show();  

  }
  getPrviewCards(){
    this.getSeat();
    if (!this.seat) return
    var preview = this.room.state.magicBook.previewManager.previews.get(this.seat.id);
    //console.log("this.preview",this.preview.previewRoleCards)
    let arr2 = Array.from(preview.previewRoleCards.values())
    return arr2;
  
}

  
  getPosition(count){
    var border = 20;
    var cardWidth =60;
    var height = 300;
    var width = 568;
  
    var result =[];

    var margin = 30;
  
    for (let i=0; i<count; i++) {
      var y =   border +i*(margin+(cardWidth/2));
      var data ={x:border,y:y};
        result.push(data)
    }
    return result;

  }
  reset(){



    this.size = 190
    this.cards = []

    
  }
  resetSprites(){
    
      while (this.sprites.length>0){
        var c =this.sprites.pop();
       // console.log("c",c)
        this.background.removeChild(c);
      }
  }
  makeDesciption(sprite,data){
    
    //var description = "每个夜晚*选择一个玩家将他杀害。当你杀害自已时，传位给一个爪牙。"
   var description = data.ability;
   // var description = "每个夜晚*选择一个"
   var fontSize =26;
    var a = this.mySubString(description,18,true,false)
    description = this.myReplace(description,a)
    var b = this.mySubString(description,18,true,false)
    description = this.myReplace(description,b)
    var c = this.mySubString(description,18,true,false)
    description = this.myReplace(description,c)
    var d = this.mySubString(description,18,true,true)



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
/*
    var descriptionText5 = new PIXI.Text(e, {
      font:fontSize+"px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    descriptionText5.y = 60;
    descriptionText5.x = 0;
    descriptionText5.anchor.set(0.5)     
*/

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

  newCard(data,size,idx){
   
    var id = this.loader.resources["tb"].textures; 
    var frame = new PIXI.Sprite(id["card_frame_"+data.team+".png"]) 
    frame.anchor.set(0.5)

   // var sprite =new PIXI.Sprite.fromImage('images/'+data.type+'-card.png')
   var sprite = new PIXI.Sprite(id["card_back"+".png"]) 
  // var icon_base = new PIXI.Sprite(id["default.png"]) 
  // icon_base.anchor.set(0.5)
   var icon = new PIXI.Sprite(id[data.id+".png"]) 
   icon.anchor.set(0.5)
    sprite.scale.set( this.cardScale)
    //icon.x =30;
   // icon.x =30;
   icon.x =-90;
   icon.y =130

    sprite.anchor.set(0.5)
    let x_border = -20;
    let y_border = 10;
    let center = Application.WIDTH / 2 +x_border;
    
    let _num = (size - 1) / 2
    let _angle = (idx - _num) * 90 / _num
    if (!_angle) _angle = 0;
    let _height =0
    let _width = 0
    let _height_offset = 5;
    let _width_offset = Application.WIDTH/size/2 +10;
    if (idx<_num){
      _height = (idx -_num) *_height_offset
      _width = (idx -_num) *_width_offset
    } else if (idx>_num){
      _height = (idx -_num) *_height_offset *-1
      _width = (idx -_num) *_width_offset 
    }
    //card.x =border+  (margin+width) *idx  
    sprite.x =x_border+ center +_width;
    sprite.y = y_border; 

   // console.log("idx:",idx,":",_angle,":",_height,":",_width,":", card.x);
   sprite.y  =  sprite.y -_height;
   sprite.rotation = _angle/360;

    var name =data.name
    var nameText = new PIXI.Text(name, {
      font: "36px JennaSue",
      fill: '#fff',
      textAlign: 'center'
    })
    nameText.y = 140;
    nameText.x = 0;
    nameText.anchor.set(0.5)



    

    if (data.value>0){
    
      var valueText = new PIXI.Text(data.value, {
        font: "160px JennaSue",
        fill: '#000',
        textAlign: 'center'
      })
      valueText.y = 75;
      valueText.anchor.set(0.5)
      sprite.addChild(valueText) 
    }
    //sprite.anchor.x =0.5;
    //sprite.anchor.y = 0.5;  
    sprite.interactive = true;
    sprite.buttonMode = true;
    sprite.id = data.id;
    sprite.on('tap', this.onSelect.bind(this, data.id))
    sprite.on('click', this.onSelect.bind(this, data.id))
   // icon_base.addChild(icon)
    sprite.addChild(frame)

    sprite.addChild(nameText)
    sprite.addChild(icon)
    this.makeTeam(sprite,data)
    this.makeDesciption(sprite,data)
    return sprite;
  }


  onSelect (id) {
  // console.log('card onSelect:'+id)
   
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
        //  console.log(sprite.id)
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
  //    console.log(s)
    }
  }
  active(){
   
    this.interactive = true;
    for (var i=0;i<this.sprites.length;i++){
      var s = this.sprites[i];
      s.interactive = true;
      //console.log(s)
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
