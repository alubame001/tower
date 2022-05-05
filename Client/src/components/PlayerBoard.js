import * as PIXI from 'pixi.js'
import Application from '../Application'
import BuffBoard from './BuffBoard'
import Player from './Player'
import PlayerSlot from './PlayerSlot'

export default class PlayerBoard extends PIXI.Container {

  constructor (app) {
    super()
    this.app = app
    this.loader = app.loader;
    this.boardName ="PlayerBoard"
    this.maxPlayer = 16;
    this.playerSlotTopMargin =100;
    this.playerSlotSize =110;
    this.playerCount =0;
    this.room;
    this.selectedPlayerId ='';
    this.sprites =[];
    this.background =  new PIXI.Sprite(app.loader.resources.playerBoard.texture);
    var id = this.loader.resources["tb"].textures; 
    this.slot = new PIXI.Sprite(id["scroll5_left.png"])  
    this.addChild(this.background)    
    this.reset();
    this.first = true;

    this.pid =0;

    this.selectSeatId = "0";
    this.maxSelect = 1;
    this.selections =[];
    this.targets =[];
    this.func ="playerChangeSeat"
    //this.application = new Application();
   
  }

  mask(){


  }
  show(){
    this.active()

  }
  hide(){
    this.deActive()

  }
  reset(){
    this.resetSprite();

    
  }


  fadeOut(sprite){
    tweener.add(sprite).to({ alpha: 0}, 300, Tweener.ease.quintOut).then(function(){
    
    
    }) 
  }

   resetSprite(){

  
    while (this.sprites.length>0){
        var c =this.sprites.pop();
        this.background.removeChild(c);
        
    }
    var len = this.background.children.length;
    for (var i =0; i<len;i++){
       var iconFrame = this.background.children[i].iconFrame;
       iconFrame.alpha = 0;

       

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

      return true;
    } else {

      return false;
    }          
 }
  getSprite(sessionId){

    const arr =  Array.from( this.room.state.seats.keys()); 
    var k = arr.indexOf(sessionId);

    var sprite = this.sprites[k];

    return sprite;

  }
  getSpriteById(id){
      for (var i=0; i<this.sprites.length;i++){
          var sprite = this.sprites[i]
          if (id==sprite.id) return sprite;

      }

      return null;

  }
  init(room){
    this.room = room;
    var pid = this.room.state.pid ;     

   
    this.room.state.listen("pid", (pid) => {     
      this.pid = pid;     
      this.logic(); 
    }); 
    this.room.onStateChange.once((state) =>{  
      this.updateIcons("onStateChange")
    });


    this.room.state.listen("seatChanged", (seatChanged) => { 
      var state = this.room.state;   
      var seats =state.magicBook.seatManager.seats;   
       if (seats) this.seatsUpdate(seats);      
    })

    this.room.state.listen("seatReseted", (seatReseted) => { 
      var state = this.room.state;   
      var seats =state.magicBook.seatManager.seats;   
       if (seats) this.draw(seats,"seatReseted");  
    })
    this.room.state.listen("seatUpdate", (seatUpdate) => { 

      var state = this.room.state;   
      var seats =state.magicBook.seatManager.seats;   
      var seat = seats.get(String(seatUpdate))
      if (seat) this.seatUpdate(seat);      
    })



    this.room.onStateChange.once((state) =>{
      this.sessionId = this.room.state.sessionId;         
    })
    

  }
  selectLogic(){ 
 
    switch (this.pid) {   
      case 15:
      this.maxSelect = 1;
     // this.func ="playerChangeSeat"
      this.playerChangeSeat(); 
      break
      
      case 25:
      this.maxSelect = this.getRole();  
    
      break
      case 50:
        this.maxSelect = this.getRole(); 
        this.nightAbility(); 

      break
      case 62:
    
        this.maxSelect = 1;
      
        this.startNominate();
      break     
      default:
        this.maxSelect =0;
    }

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
        this.unSelectAll();
        this.deActive();
       
    }
  }
  hide(){
   // this.reset();    
    this.deActive();
  }
  show(){

    this.active();
  }
  /**
   * 
   * @param {*} count 
   * @returns 
   */
  getPosition(count){
  //console.log(" Application", Application.width)
    var p = Application.width;
    var s = this.slot.width
    console.log("  this.slot.width",  this.slot.width)   
 
    var border_x = 30;
    var border_y = 10;
    var leftSideFrom = 640 /2  + border_x;//  Application.width - this.slot.width - border_x;
 
    var playerSlotSize = this.playerSlotSize;
    var height = 800;
    var width = 568;
  
    var result =[];

    var margin = ((height -2*border_y)-(count *playerSlotSize)) /(count+1)
    if (margin <playerSlotSize/2) margin =playerSlotSize/2;
    console.log(" margin ", margin)  
    var j = 8

    for (let i=0; i<j; i++) {
      var y =   border_y +i*(margin+playerSlotSize/2) +  this.playerSlotTopMargin ;
      var data ={x:leftSideFrom,y:y,leftSide:false};
        result.push(data)
    }

    for (let i=15; i>=8; i--) {
      var y =   border_y +(i-8)*(margin+playerSlotSize/2) +  this.playerSlotTopMargin ;
      var data ={x:border_x,y:y,leftSide:true};
        result.push(data)
    }
    return result;
  }

  getSeatPosition(size){  
    var  pos = [];    
    switch(size) {
      case 1:
        pos = [3];
        break;
      case 2:
        pos = [3,10];
        break;
      case 3:
        pos = [2,5,8];
        break;
      case 4:
        pos = [2,5,8,11];
        break;
      case 5:
        pos = [2,3,4,11,13];
        break;
      case 6:
        pos = [2,3,4,11,12,13];
        break;
      case 7:
        pos =[2,3,4,5,12,13,14];
        break;
      case 8:
        pos = [2,3,4,5,12,13,14,15];
        break;
      case 9:
        pos =[1,2,3,4,5,12,13,14,15];
        break;
      case 10:
        pos = [1,2,3,4,5,12,13,14,15,16];
        break;
      case 11:
        pos =[1,2,3,4,5,6,7,8,9,10,11];
        break;
      case 12:
        pos =[1,2,3,4,5,6, 11,12 ,13,14,15,16];
        break; 

      case 13:
        pos =[1,2,3,4,5,6,7,8,9,10,11,12 ,13];
        break;   

      case 14:
        pos =[1,2,3,4,5,6,7,8,9,10,11,12 ,13,14];
        break;   
      case 15:
        pos =[1,2,3,4,5,6,7,8,9,10,11,12 ,13,14,15];
        break;                  
      case 16:
        pos =[1,2,3,4,5,6,7,8,9,10,11,12 ,13,14,15,16];
        break;                  
          
      default:
        pos=[];
    
      } 
     return pos;

  }
  
  getData(seats){
    var size = seats.size;

    var positions = this.getPosition(seats.size);
    var pos = this.getSeatPosition(seats.size);
    var seatArray = Array.from( seats.values()); 
    var result =[];



    
    for (let i=0; i<seatArray.length; i++) {
  
       seatArray[i].pickRoleCard =[];
       seatArray[i].previewRoleCards =[]
       var data =seatArray[i]
       var  j = pos[i];    
       var  k = positions[j-1]

       data.x =k.x;
       data.y = k.y ;
       data.leftSide = k.leftSide;

        result.push(data)
    }

    return result;
  

  }

  updateIcons(reason){
   console.log('updateIcons:',reason)
   /*
    if (!this.role) this.getRole();
   
    var arr = Array.from(this.role.icons.values())
    for (let i=0; i< arr.length; i++) {
      var icon = arr[i]
      console.log("icon.iconSeatId:",icon.iconSeatId)
      if (icon.iconSeatId){
        var sprite = this.getSpriteById(icon.iconSeatId);
        if (sprite)
        sprite.updateIcon(icon,reason);
      }

    
    }
    */
   // if (this.seat) console.log(this.seat)
    
    if (this.getSeat()) {
      console.log("this.seat:",this.seat)
      var icons = this.seat.icons;
      if (!icons) return;
    
      var arr = Array.from(icons.values())
      console.log("icons",arr.length)
      for (let i=0; i< arr.length; i++) {
        var icon = arr[i]
        var sprite = this.getSpriteById(icon.id);
       // console.log(sprite)
        if (sprite)
           sprite.updateIcon(icon,reason);
      
      }
    } else {
      console.warn("no seat")
    }
    
  }
  
  /**
   * 
   * @param {*} seats  server上的seats资料 
   */

  draw(seats,reason){
 
    //if (this.isDraw) return;
    //this.isDraw = true;
    console.log(this.boardName +" draw " +reason )   
    this.resetSprite();

  
    this.playerCount = seats.size;   
    var result = this.getData(seats)  
  
    for (let i=0; i<result.length; i++) {

    
      var data = result[i];
      let  playerSlot = new PlayerSlot(this.loader)
      var sprite =   playerSlot.create(data)
      this.background.addChild(sprite);
      sprite.x =data.x;
      sprite.y =data.y;


      sprite.interactive = true
     
      sprite.on('click', this.onSelect.bind(this,  sprite))
      sprite.on('touchend', this.onSelect.bind(this,  sprite))

      this.sprites.push(sprite);       
     
    } 


   
    this.logic();
  }
/*
  resetIcon(){
    if (!this.sprites) return;
    console.log("resetIcon" ,this.sprites.length )
    for (let i=0; i< this.sprites.length; i++) {
      var sprite =this.sprites[i];
    //  var data = {roleId:"empty"}
      sprite.hideIcon();
    }
  }
  */

  seatsUpdate(seats){

    let arr = Array.from(seats.values())   
    for (let i=0; i<this.sprites.length; i++) {
        var sprite =this.sprites[i];

          let res=arr.filter((item,index,array)=>{

            return  (item.id == sprite.id)
         })
         if (res.length>0){
            sprite.update(res[0])
           //if (sprite.children.length>2)
          // sprite.children[2].text =res[0].playerName;           
         }        
    }

  }

  seatUpdate(seat){

   // let arr = Array.from(seats.values())   
    for (let i=0; i<this.sprites.length; i++) {        
        var sprite =this.sprites[i];   
        if(sprite.id==seat.id){
            sprite.update(seat)

        }
    }

  }



  deActive(){

    this.interactive = false;
    for (var i=0;i<this.sprites.length;i++){
      var seat = this.sprites[i];
      seat.interactive = false;
    }
  }
  active(){

    for (var i=0;i<this.sprites.length;i++){
      var s = this.sprites[i];
      s.interactive = true;
   
    }

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
     return 0
    

   }

    onSelect(sprite){
     

      if (sprite.selected) return
      if (sprite.running) return
      sprite.selected = true;
      sprite.running = true;
      var that = this;
      tweener.add(sprite.scale).to({x: 0.98 , y: 0.98}, 100, Tweener.ease.quintOut).then(function(){
    
    //tweener.add(sprite).to({y: sprite.y - 150, alpha: 1}, 500, Tweener.ease.quintOut).then(function(){

      that.makeSelect(sprite)
      sprite.running = false; 
    }) 
  
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
  
  playerChangeSeat(){

     this.room.send("action",{"action":"playerChangeSeat",data:{'targets':this.targets}});
     //this.playerBoard.selectedPlayerId = id;
   }
   nightAbility(){
       this.room.send("action",{'action':'nightAbility',data:{'targets':this.targets}});
   }
   startNominate(){
     var d= {'action':'startNominate',data:{'targets':this.targets}}

    this.room.send("action",{'action':'startNominate',data:{'targets':this.targets}});
   }


  unSelectAll(){
    for (var i =0;i< this.sprites.length;i++){
        var sprite = this.sprites[i];
        this.unSelect(sprite);
    }
    this.targets=[];

  }
  

}
