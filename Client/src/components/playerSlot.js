import * as PIXI from 'pixi.js'
import Application from '../Application'
import BuffBoard from './BuffBoard'


export default class PlayerSlot extends PIXI.Container {

  constructor (loader) {
    super()   
    this.loader = loader;
    this.boardName ="PlayerSlot"
 //   this.loader = Application.loader;

    this.size = 120
    this.room;

      //this.button = new PIXI.Sprite.fromImage('images/player-background.png')   
   
    var id = this.loader.resources["tb"].textures; 
    this.playerSlotLeft = new PIXI.Sprite(id["scroll5_left.png"])  
    this.playerSlotRight = new PIXI.Sprite(id["scroll5_right.png"])  

   // this.slot =  this.playerSlot;


    this.iconFrame =  new PIXI.Sprite(id["icon_frame.png"])  

    this.dot = new PIXI.Sprite(id["circle2.png"])  

    this.dead = new PIXI.Sprite(id["dead.png"])  

    this.pid = 0;

    var maskGraphic = new PIXI.Graphics();


  }
  
  reset(){

  }









  create(data){

    this.id = data.id
    this.data =data;

 
     
   
      var _id = data.id ;


   
    
    let name =this.data.playerName
    this.playerNameText = new PIXI.Text(name, {
      font: "50px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    if (data.leftSide){
      this.slot = this.playerSlotLeft;
      this.slot.x = 60
      this.playerNameText.x =  this.slot.width/2 ; 
      this.playerNameText.y = 30;
    } else {
      this.slot = this.playerSlotRight;
      this.slot.x = 0
      //this.iconFrame.x = this.slot.width/2
      this.playerNameText.x = 50 ; 
      this.playerNameText.y = 30;    
    }

    
  
    this.slot.addChild(this.playerNameText) 


   
  
    this.addDeadMark(data)
    this.addChild(this.slot)


    return this;

    
  }
  getIcon(data){
   
    if (data.role){
  
      let arr = Array.from(data.role.icons.values())   
     
      for (var i=0;i<arr.length;i++){
        console.log("arr",arr[i])
        var icon = arr[i];
        if (icon.iconSeatId>8)
          icon.leftSide = true;
         else 
          icon.leftSide = false;
        console.log("d :"+icon.iconSeatId +":"+icon.roleId)
        console.log("this.id:",this.id)
       // if (this.data.id ==icon.seatId)
          this.updateIcon(icon,"getIcon");
        
      }
    }
    //var icons = data.role.icons


  }
  makeIcon(data){
  
     
    data.team = 'townsfolk'
    data.roleId = 'empty'
    var id = this.loader.resources["tb"].textures; 
   
    let text = String(data.idx);      
    this.idText = new PIXI.Text(text, {
      font: "36px",
      fill: '#fff',
      textAlign: 'right'
    })
    //this.idText.anchor.set(0.5)
     

    
    this.circle = new PIXI.Sprite(id["circle2.png"])  
    this.icon = new PIXI.Sprite(id[data.roleId+".png"])  
    this.iconFrame = new PIXI.Sprite(id[data.team+".png"])    

    this.icon.anchor.set(0.5)
    this.iconFrame.scale.set(0.8)
    if (data.leftSide){
      this.iconButton = new PIXI.Sprite(id["icon_button_left.png"])
      this.iconButton.x = 0  
      this.iconButton.y = 10  
      this.iconFrame.x = 10   
      this.icon.x =30
      this.icon.y =0
      this.circle.y =40;
      this.circle.x =60 
    } else {
      this.iconButton = new PIXI.Sprite(id["icon_button_right.png"])  
      this.iconButton.x = 170 
      this.iconButton.y = 10  
      this.icon.x =30
      this.icon.y =0
      this.iconFrame.x = 0 
      this.circle.y =38;
      
       this.circle.x =12 
    
                
    }
    if (data.idx<10){
      this.idText.x =10
    }
  //  this.iconFrame.addChild(this.iconButton)
  //  this.iconFrame.addChild(this.icon)
    this.iconFrame.alpha =0
    
    this.iconButton.addChild(this.iconFrame)    
    this.iconFrame.addChild(this.icon)
    this.circle.addChild(this.idText)
    this.iconButton.addChild(this.circle)
    
    return this.iconButton;
  
  }
  hideIcon(){
    this.iconFrame.alpha = 0;    
  }
  resetSpriteChildren(sprite){

    while (sprite.children.length>0){
   
      var c =sprite.children.pop();
    
         sprite.removeChild(c);
    }
  } 
  updateIcon(data,reason){
    /*
   console.log("updateIcon",reason,data)
   
   if (data.id==undefined) return;
   if (data.id=="") return;

    var id = this.loader.resources["tb"].textures; 
    //this.icon = new PIXI.Sprite(id[data.roleId+".png"])  
    //this.iconFrame = new PIXI.Sprite(id[data.team+".png"])     

    //if(this.children.length==0) return;
    var iconFrame = this.children[1].children[1]
    var icon = this.children[1].children[1].children[0]

    this.iconFrame == new PIXI.Sprite(id[data.team+".png"])    
   
    this.icon = new PIXI.Sprite(id[data.roleId+".png"])  
    this.iconFrame.alpha = 1;
    this.iconFrame.addChild(this.icon)
    console.log(this.iconFrame)
*/

    

  }

  addDeadMark(data){
    if (data.dead==false) return;

    if (data.leftSide)  {
      var slot = this.playerSlotLeft;
      this.dead.anchor.set(0.5)
     
      this.dead.x =slot.width - this.dead.width/2;
      this.dead.y = 60;
      slot.addChild(this.dead)   

    }  else{
      var slot  = this.playerSlotRight;
      this.dead.anchor.set(0.5)
   
      this.dead.x =this.dead.width/2;
      this.dead.y = 60;
      slot.addChild(this.dead)
    }
   
     
   
    this.fadeIn(this.dead)

    var date = this.getDate(data.deadRound)
    let text = String(date);      
    this.deadRoundText = new PIXI.Text(text, {
     // font: "40px JennaSue",
      font: "30px",
      fill: '#fff',
      textAlign: 'center'
    })
    this.deadRoundText.y = -20;
    this.deadRoundText.x = -8;  
    if (date>=10) 
    this.deadRoundText.x =-20;  
    
    this.dead.addChild(this.deadRoundText)

  

  }
  getDate(round){
    var result =''
    var a = round % 2;
    var b
    var dt;
    if (a==0){
        dt ="日"
        b = Math.floor( round/2);           
    }  else {
        dt ="夜"
        b = Math.floor( round/2)+1  ;
    }

 //   result = "第"+ b+dt
 result = b;
    return result;

}

    
  fadeIn(sprite) {
 
    return tweener.add(sprite).from({ alpha: 0}, 1000, Tweener.ease.quintOut).to({ alpha: 1}, 4000, Tweener.ease.quadOut)
  }
  blink(sprite) {
    tweener.add(sprite).to({ scale: 0}, 1000, Tweener.ease.quintOut).then(function(){

    }) 
  }

  jump(sprite){
   
    tweener.add(sprite).from({ scale: 1}, 1000, Tweener.ease.quintOut).to({ scale: 1.5}, 4000, Tweener.ease.quadOut).then(function(){
      return tweener.add(sprite).to({ scale: 1}, 1000, Tweener.ease.quadOut)
    }) 
  }

  update(data){
     this.addDeadMark(data)
     this.playerNameText.text =data.playerName;

  }

  


}
