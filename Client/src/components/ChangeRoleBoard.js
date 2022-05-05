import * as PIXI from 'pixi.js'
import Application from '../Application'
import BuffBoard from './BuffBoard'
import Player from './Player'
import PlayerBoard from './PlayerBoard'
import PlayerSlot from './PlayerSlot'

export default class ChangeRoleBoard  extends PIXI.Container{

  constructor (app,gameScreen) {
    super()
    this.app = app
    this.loader = app.loader;
    this.boardName ="ChangeRoleBoard"
    this.sprites =[];
    this.marignTop = 240
    this.isShow = false
    this.background =  new PIXI.Sprite(app.loader.resources.messageBoard.texture)//new PIXI.Sprite.fromImage('images/message-board.png') 
    this.background.x = 20
    this.background.y = this.background.height + this.marignTop
    this.background.alpha = 0;
    this.gameScreen = gameScreen;
    this.isDraw = false;
    this.isDrawIconList = false;
    var id = this.loader.resources["tb"].textures; 
    //var base = new PIXI.Sprite(id[role.team+".png"])
    this.buttons =new PIXI.Sprite(id["empty.png"])
    
    this.addChild(this.buttons)
    this.addChild(this.background)
    // tweener.add(this.background).to({ alpha: 1}, 10, Tweener.ease.quintOut)
  }


  init(room){
    this.room = room;
    this.pid = this.room.state.pid ; 
    
    this.room.onStateChange.once((state) =>{  
      this.updateIcons("onStateChange")
    });


    this.room.state.listen("iconChanged", (iconChanged) => { 
     
     
      var state = this.room.state;  
      var data =  state.iconChangedData;
    
     // console.warn("iconChanged",iconChanged)
      if (this.getSeat()==false) return;
      if (this.seat.id ==data.seatId){
         console.log("data",data)
        this.updateIcon(data,"iconChanged");
      }
    
    
    })




  }
  selectLogic(){ 


  }
  logic(){
    this.pid = this.room.state.pid;

    switch (this.pid) {   
      case 11:
      
        this.reset();    
      break
      case 15:   //选位
        this.active(); 
      break
      
      case 25:
        this.hide();
      break
      case 50:
        this.getRole();
        this.show();

      
      break;
      case 40:

      
      break;     
      case 62:
        this.getRole();
        this.show();    
        this.active();  
        

      break
      default:

    }
  }

  


  resetSpriteChildren(sprite){

    while (sprite.children.length>0){
   
      var c =sprite.children.pop();
    
         sprite.removeChild(c);
    }
  } 
  /**
   *  draw buttons
   * @param {} seats 
   * @param {} reason 
   */
  draw(seats,reason){
    this.resetSpriteChildren(this.buttons);

    this.playerCount = seats.size;   
    var id = this.loader.resources["tb"].textures; 
    this.seats =  Array.from( seats.values()); 
  

   

   
    for (let i=0; i<this.seats.length; i++) {

      var data = this.seats[i];


      var sprite = this.makeIcon(data)
      sprite.id = data.id;
      sprite.leftSide = data.leftSide;
      if (data.leftSide){
          data.x = 0;
          
      } else {
         data.x = this.background.width - sprite.width
      }

      sprite.x =data.x+ 20;
      sprite.y =data.y  + this.background.y -108;

      this.buttons.addChild(sprite);


      sprite.interactive = true
      sprite.id =data.id;
      sprite.on('click', this.onSelect.bind(this,  sprite))
      sprite.on('touchend', this.onSelect.bind(this,  sprite))
         
     
    }    
  
  
  }
  /**
   *  draw Icon
   * @param {} roles 
   * @param {*} reason 
   */
  drawIconList(roles,reason){
   

    if (this.isDrawIconList) return;
    this.isDrawIconList = true;
    this.resetSpriteChildren(this.background);  
    

    let arr = Array.from(roles.values())
    this.townsfolk=arr.filter((item,index,array)=>{
         return (item.team=="townsfolk")       
     });
    this.outsider=arr.filter((item,index,array)=>{
         return (item.team=="outsider")       
     });
    this.minion=arr.filter((item,index,array)=>{
         return (item.team=="minion")       
     });
    this.demon=arr.filter((item,index,array)=>{
         return (item.team=="demon")       
     });



    var id = this.loader.resources["tb"].textures; 
    
    for (var i= 0;i<4 ;i++){
        for (var j= 0;j<4 ;j++){
           var idx = j *4 +i
          
          if (idx < this.townsfolk.length){
            var role = this.townsfolk[idx]
        
            //console.log(idx+":"+role.id)
           
           
            
            var nameButton = new PIXI.Sprite(id["name_button.png"])
            nameButton.anchor.set(0.5)
            nameButton.y =40
            var text = String(role.name);      
            var idText = new PIXI.Text(text, {
              font: "26px",
              fill: '#fff',
              textAlign: 'center'
            })
            idText.anchor.set(0.5)
            nameButton.addChild(idText)       



            var base = new PIXI.Sprite(id[role.team+".png"])
            var icon = new PIXI.Sprite(id[role.id+".png"]) 
            icon.anchor.set(0.5)   
            base.scale.set( 1)
            base.anchor.set(0.5) 
            base.addChild(icon) 
            base.addChild(nameButton) 
            
             base.x =120 +(i*120)
             base.y =80 +(j*120)

             base.id =role.id;
             base.team =role.team;
             base.interactive = true;
             base.on('click', this.onSelectIcon.bind(this,  base))
             base.on('touchend', this.onSelectIcon.bind(this, base))
             this.background.addChild(base)  

           }
        }        
    }
    
   
    for (var i= 0;i<4 ;i++){
        for (var j= 0;j<4 ;j++){
           var idx = j *4 +i
          
          if (idx < this.outsider.length){
            var role = this.outsider[idx]
        
            var nameButton = new PIXI.Sprite(id["name_button.png"])
            nameButton.anchor.set(0.5)
            nameButton.y =40
            var text = String(role.name);      
            var idText = new PIXI.Text(text, {
              font: "26px",
              fill: '#fff',
              textAlign: 'center'
            })
            idText.anchor.set(0.5)
            nameButton.addChild(idText)   


            var base = new PIXI.Sprite(id[role.team+".png"])
            base.anchor.set(0.5) 
            
           
           
            var icon = new PIXI.Sprite(id[role.id+".png"]) 
            icon.anchor.set(0.5)   
            base.scale.set( 1)
             
            base.addChild(icon) 
            base.addChild(nameButton) 
             base.x =120 +(i*120)
             base.y =480+80 +(j*120)
             base.id =role.id;
             base.team =role.team;
             base.interactive = true;
             base.on('click', this.onSelectIcon.bind(this,  base))
             base.on('touchend', this.onSelectIcon.bind(this, base))             
             this.background.addChild(base)  

           }
        }        
    } 

    for (var i= 0;i<4 ;i++){
        for (var j= 0;j<4 ;j++){
           var idx = j *4 +i
          
          if (idx < this.minion.length){
            var role = this.minion[idx]
        
            var nameButton = new PIXI.Sprite(id["name_button.png"])
            nameButton.anchor.set(0.5)
            nameButton.y =40
            var text = String(role.name);      
            var idText = new PIXI.Text(text, {
              font: "26px",
              fill: '#fff',
              textAlign: 'center'
            })
            idText.anchor.set(0.5)
            nameButton.addChild(idText)   


            var base = new PIXI.Sprite(id[role.team+".png"])
            base.anchor.set(0.5) 
            
           
           
            var icon = new PIXI.Sprite(id[role.id+".png"]) 
            icon.anchor.set(0.5)   
            base.scale.set( 1)
             
            base.addChild(icon) 
            base.addChild(nameButton) 
             base.x =120 +(i*120)
             base.y =480+120+20+80 +(j*120)

             base.id =role.id;
             base.team =role.team;
             base.interactive = true;
             base.on('click', this.onSelectIcon.bind(this,  base))
             base.on('touchend', this.onSelectIcon.bind(this, base))             
             this.background.addChild(base)  

           }
        }        
    } 
    for (var i= 0;i<4 ;i++){
        for (var j= 0;j<4 ;j++){
           var idx = j *4 +i
          
          if (idx < this.demon.length){
            var role = this.demon[idx]
        
        
            var nameButton = new PIXI.Sprite(id["name_button.png"])
            nameButton.anchor.set(0.5)
            nameButton.y =40
            var text = String(role.name);      
            var idText = new PIXI.Text(text, {
              font: "26px",
              fill: '#fff',
              textAlign: 'center'
            })
            idText.anchor.set(0.5)
            nameButton.addChild(idText)   
            var base = new PIXI.Sprite(id[role.team+".png"])
            base.anchor.set(0.5) 
            
           
           
            var icon = new PIXI.Sprite(id[role.id+".png"]) 
            icon.anchor.set(0.5)   
            base.scale.set( 1)
             
            base.addChild(icon) 
            base.addChild(nameButton) 
             base.x =120 +(i*120)
             base.y =480+120+120+20+80 +(j*120)

             base.id =role.id;
             base.team =role.team;
             base.interactive = true;
             base.on('click', this.onSelectIcon.bind(this,  base))
             base.on('touchend', this.onSelectIcon.bind(this, base))             
             this.background.addChild(base)  

           }
        }        
    }   
//    console.log("this.background",this.background)
  
  
  }
  getButtonById(id){
    for (var i=0; i<this.buttons.children.length;i++){
        var button = this.buttons.children[i]
        if (id==button.id) return button;

    }

    return null;

}
  updateIcons(reason){
    console.log('updateIcons:',reason)
    

     if (this.getSeat()) {
       console.log("this.seat:",this.seat)
       var icons = this.seat.icons;
       if (!icons) return;
     
       var arr = Array.from(icons.values())
       console.log("icons",arr.length)
       
       for (let i=0; i< arr.length; i++) {
         var icon = arr[i]
         console.log(icon)
         this.updateIcon(icon,reason)
       //  var sprite = this.getButtonById(icon.id);
       
      
         //   sprite.updateIcon(icon,reason);
       
       }
       
     } else {
       console.warn("no seat")
     }
    
     
   }

  updateIcon(data,reason){
    var id = this.loader.resources["tb"].textures; 
   console.log("updateIcon",reason,data)
   var button = this.getButtonById(data.id)
  console.log("button",button)
   
   button.children.pop();
   button.children.pop();
   
   var iconFrame = new PIXI.Sprite(id[data.team+".png"])  
   var icon  = new PIXI.Sprite(id[data.roleId+".png"])  

   var  text = String(data.id);      
   var idText = new PIXI.Text(text, {
     font: "36px",
     fill: '#fff',
     textAlign: 'right'
   })
   var circle = new PIXI.Sprite(id["circle2.png"])  
   //circle.anchor.set(0.5)
   icon.anchor.set(0.5)
   circle.addChild(idText);


   iconFrame.scale.set(0.8)

   if (button.leftSide){
    if (button.id<10){
      idText.x =15
    }
  
    icon.x = 60;
    icon.y =50;
    
    circle.y =40;
    circle.x =60 
  } else {
    idText.x =10
    icon.x =70;
    icon.y =50;

    circle.y =38;    
    circle.x =12 
  
              
  }



   button.addChild(iconFrame)    
   iconFrame.addChild(icon)
   circle.addChild(idText)
   button.addChild(circle)

 // var b = this.makeIcon(data)
 
  
   //  var iconFrame = new PIXI.Sprite(id[data.team+".png"])    
 //  var icon  = new PIXI.Sprite(id[data.roleId+".png"])  
  // console.log(this.buttons)
    /*
   if (data.id==undefined) return;
   if (data.id=="") return;

    var id = this.loader.resources["tb"].textures; 
    //this.icon = new PIXI.Sprite(id[data.roleId+".png"])  
    //this.iconFrame = new PIXI.Sprite(id[data.team+".png"])     

    //if(this.children.length==0) return;
    var iconFrame = this.children[1].children[1]
    var icon = this.children[1].children[1].children[0]

    this.iconFrame =new PIXI.Sprite(id[data.team+".png"])    
   
    this.icon = new PIXI.Sprite(id[data.roleId+".png"])  
    this.iconFrame.alpha = 1;
    this.iconFrame.addChild(this.icon)
    console.log(this.iconFrame)
*/

    

  }
  active(){

    for (var i=0;i<this.background.children.length;i++){
      var s = this.background.children[i];
      s.interactive = true;
   
    }

  }
  activeChildren(sprite){
    for (var i=0;i<sprite.children.length;i++){
      var s = sprite.children[i];
      s.interactive = true;
   
    } 
  }

  deActive(){
  
    for (var i=0;i<this.background.children.length;i++){
      var s = this.background.children[i];
      s.interactive = false;
   
    }
  }
 

   show(){
  //  this.background.y =100
  //   console.log(this.background.x,this.background.y)
    tweener.add(this.background).to({ alpha: 1}, 300, Tweener.ease.quintOut)
    this.active();
   }
   hide(){
    tweener.add(this.background).to({ alpha: 0}, 300, Tweener.ease.quintOut)
    this.deActive();
   }


  onSelectIcon(sprite){     
    
     if (this.getSeat()==false) return;
      var that = this;
      that.isShow =false;
      tweener.add(sprite.scale).to({x: 0.9, y: 0.9}, 100, Tweener.ease.quintOut).then(function(){
        tweener.add(sprite.scale).to({x: 1, y:1}, 200, Tweener.ease.quintOut).then(function(){
           // console.log("sprite.id "+sprite.id)
            var _data ={'seatId':that.seat.id,'iconSeatId':that.iconSeatId,'roleId':sprite.id,'team':sprite.team}
           // console.log(_data);
           that.room.send("action",{'action':'setIcon',data:_data});
          
           that.hide();

        })
      }) 
  
  }
    onSelect(sprite){ 
      if (!sprite) return;
      if (!sprite.id) return;  
      var roles = this.room.state.roles;

      if (roles)  
      this.drawIconList(roles,"onSelect")
      
  
      this.iconSeatId = sprite.id;
      console.warn("onSelect:"+sprite.id)
     var that = this;
     that.isShow =(that.isShow==true) ? false: true;
      tweener.add(sprite.scale).to({x: 0.9, y: 0.9}, 100, Tweener.ease.quintOut).then(function(){
        tweener.add(sprite.scale).to({x: 1, y:1}, 100, Tweener.ease.quintOut).then(function(){


        })
      }) 

      if (that.isShow) {

        that.show();
      } else {
        that.hide();
     
      }


  
  }
  unSelect(sprite){

    //if (!sprite.selected) return
   
    sprite.selected = false;
    
    var that = this;
    tweener.add(sprite.scale).to({x: 1, y: 1}, 200, Tweener.ease.quintOut).then(function(){
    }) 
  
  }
  makeSelect(sprite){
    this.selections.push(sprite)
    this.selectSeatId =String(sprite.id);
    if (this.selections.length>this.maxSelect ){
     
      var s =this.selections.shift();

      this.unSelect(s)
    }
   
    this.targets =[];
    for (var i =0;i< this.selections.length;i++){
      var id = this.selections[i].id;
      this.targets.push(id)
    }
     
   this.selectLogic();
  }
 

  unSelectAll(){
    for (var i =0;i< this.sprites.length;i++){
        var sprite = this.sprites[i];
        this.unSelect(sprite);
    }
    this.targets=[];

  }
  
  getRole(){
    this.roles= this.room.state.magicBook.roleManager.roles
    let arr = Array.from(this.roles.values())
     let res1=arr.filter((item,index,array)=>{
         return (item.sessionId == this.room.sessionId)       
     });
   
     if (res1.length== 1){
        this.role = res1[0]
        return this.role.target
     }
     return 
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

 
 makeIcon(data){
  //console.log("makeIcon data",data)
     
  var team = data.team ||'townsfolk' 
  var roleId = data.roleId || 'empty'
  var id = this.loader.resources["tb"].textures; 
 
  let text = String(data.idx);      
  this.idText = new PIXI.Text(text, {
    font: "36px",
    fill: '#fff',
    textAlign: 'right'
  })
  //this.idText.anchor.set(0.5)
   
 //
  
  this.circle = new PIXI.Sprite(id["circle2.png"])  
  this.icon = new PIXI.Sprite(id[roleId+".png"])  
  this.iconFrame = new PIXI.Sprite(id[team+".png"])    

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
    if (data.id<10){
      this.idText.x =15
    }

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
  if (data.leftSide==false){
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


}
