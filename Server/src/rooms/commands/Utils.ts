const NAMES: Array<string> = [
    '断笔画墨',
    '默然相爱',
    '旅人不扰',
    '多余温情',
    '云中谁忆',
    '残雪冰心',
    '末世岛屿',
    '桑榆非晚',
    '扉匣与桔',
    '木槿暖夏',
    '空城旧梦',
];
 
/**
 * 返回随机的中文名
 *
 * @export
 * @returns {string}
 */
export function randomChineseName(): string {
    return NAMES[~~(NAMES.length * Math.random())];
}

export function dice(lucky:number):boolean{
    var result = false;
    var ran = Math.floor((Math.random() *100) + 0);
    
    if (ran>lucky) 
         result = true;
        else 
         result = false

    return result;
}


export function arandom(a:any,b:any){
    　　return (Math.random() > 0.5) ? 1 : -1;;
  }


export  function randomString(e:number):string {  
    e = e || 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
    for (var i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}