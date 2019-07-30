
const panelSize = 30;//パネルの縦横の幅
const maxPanelW = 200;//パネルの最大横個数
const maxPanelH = 200;//パネルの最大縦個数



var fieldArray = [];//パネルのステータス
var openFlagArray = [];//パネルが開いてるかどうか

var gamestate = 0;//ゲーム開始状態 [0:止まってる / 1:動いてる]

var countOfWPanel = 8;//パネルの列数
var countOfHPanel = 10;//パネルの行数
var countOfBomb = 15;//地雷の数
var panelRemain = 0;//パネルの残数

var seccounter = 0;//経過秒数カウンタ
var cltimer;//タイマオブジェクト
var myStart;//時間いれる器



window.onload = function () {

  //パネルクリックしたとき
  document.addEventListener("click", function(event) {
    if(event.target.classList.contains("cell")){
      if (gamestate == 1){
        let varx = event.target.getAttribute('namex')
        let vary = event.target.getAttribute('namey')
        openPanel(varx, vary);
      }
    }
  }, false);


  //新規ゲーム開始したとき
  document.getElementById('newgame').addEventListener('click', function (event){
    countOfWPanel = parseInt(document.getElementById('panelw').value);//パネルの列数
    countOfHPanel = parseInt(document.getElementById('panelh').value);//パネルの行数
    countOfBomb = parseInt(document.getElementById('bombnumb').value);//地雷の数
    if (countOfWPanel > maxPanelW) {
      window.alert('横幅大きすぎる問題');
    }else if (countOfHPanel > maxPanelH){
      window.alert('高さそんなに？');
    }else if(countOfWPanel * countOfHPanel > countOfBomb){
      initPanels();
    }else{
      window.alert('パネルの数より地雷の数が多いとかおかしいでしょ');
    }
  }, false);

}


//パネル開く
function openPanel(varx, vary){
  varx = parseInt(varx);
  vary = parseInt(vary);
  if (openFlagArray[varx][vary] < 1){
    panelRemain--;
    openFlagArray[varx][vary] = 1;
    changeImage(varx, vary);

    //開いたパネルが０だったとき、再帰的に周辺をパカーッと開く
    if (fieldArray[varx][vary] == 0){
      for (let i = (varx - 1); i <= (varx + 1); ++i) {
        if (i >= 0 && i < countOfWPanel){
          for (let j = (vary - 1); j <= (vary + 1); ++j) {
            if (j >= 0 && j < countOfHPanel && (i != varx || j != vary) ) {
              openPanel(i, j);
            }
          }
        }
      }
    }
    if (fieldArray[varx][vary] == 9){
      //地雷踏んだ
      document.getElementById('message').innerHTML = 'なんか踏みました失敗です！';
      gamestate = 0;
      clearInterval(cltimer);
    }
  }
}


//50msecごとに定期的に呼ばれるやつ
function clock(){
  var nowADate = new Date();
  seccounter =  nowADate.getTime() - myStart.getTime();
  seccounter = Math.round(seccounter / 10) / 100;
  document.getElementById('stopwatch').textContent = seccounter.toFixed(2);
  if(panelRemain == countOfBomb && gamestate == 1){
    //クリア処理
    document.getElementById('message').innerHTML = 'おめでとうございます全部でました！';
    gamestate = 0;
    clearInterval(cltimer);
  }
}



//イニシャライズ
function initPanels(){
  seccounter = 0;
  document.getElementById('stopwatch').textContent = seccounter;

  fieldArray.length = 0;
  openFlagArray.length = 0;
  panelRemain = 0;
  document.getElementById('message').innerHTML = '';

  panelRemain = countOfWPanel*countOfHPanel;//パネルの残り枚数

  //パネル作成
  var initialHTML = '<div id="box" style="width:'+(countOfWPanel * panelSize)+'px;height:'+(countOfHPanel * panelSize)+'px;margin-left:auto;margin-right:auto;margin-top:50px;">';
  for(var i = 0; i < countOfWPanel; i++){
    for(var j = 0; j < countOfHPanel; j++){
      initialHTML = initialHTML+'<img class="cell" namex="'+i+'" namey="'+j+'" src="img/closed.png" style="position:absolute;height:'+panelSize+'px;width:'+panelSize+'px" alt="■" />';
    }
  }
  document.getElementById("mine").innerHTML = initialHTML;

  var box = document.getElementById("box");
  var rect = box.getBoundingClientRect();
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  var myTop = rect.top + scrollTop;
  var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  var myLeft = rect.left + scrollLeft;

  //フィールドを０で初期化
  for(var i = 0; i < countOfWPanel; i++){
    var littleArray = [];
    for(var j = 0; j < countOfHPanel; j++){
      document.querySelector('.cell[namex = "'+i+'"][namey = "'+j+'"]').style.top = j * panelSize + myTop + "px";
      document.querySelector('.cell[namex = "'+i+'"][namey = "'+j+'"]').style.left = i * panelSize + myLeft + "px";
      littleArray.push(0);
    }
    fieldArray.push(littleArray);
  }
  //パネル開放フラグを０で初期化
  for(var i = 0; i < countOfWPanel; i++){
    var littleArray = [];
    for(var j = 0; j < countOfHPanel; j++){
      littleArray.push(0);
    }
    openFlagArray.push(littleArray);
  }
  //地雷を設置
  for(var i = 0; i < countOfBomb; i++){
    var randx = 0;
    var randy = 0;
    var flag = 1;
    while (flag){
      randx = Math.floor(Math.random()*countOfWPanel);
      randy = Math.floor(Math.random()*countOfHPanel);
      if (fieldArray[randx][randy] == 0){
        fieldArray[randx][randy] = 9
        flag = 0;
      }
    }
  }
  //セル周辺の爆弾の数をカウント
  for(var i = 0; i < countOfWPanel; ++i){
    for(var j = 0; j < countOfHPanel; ++j){
      var counter = 0;
      if (fieldArray[i][j] == 0){
        for (let k = (i - 1); k <= (i + 1); ++k) {
          if (k >= 0 && k < countOfWPanel){
            for (let l = (j - 1); l <= (j + 1); ++l) {
              if (l >= 0 && l < countOfHPanel && fieldArray[k][l] == 9) {
                counter++;
              }
            }
          }
        }
        fieldArray[i][j] = counter;
      }
    }
  }

  gamestate = 1;

  document.addEventListener("contextmenu", function(event) {
    if(event.target.classList.contains("cell")){
      contextCellChange(event.target.getAttribute('namex'), event.target.getAttribute('namey'));
      event.preventDefault();
    }
  }, false);

  myStart = new Date();
  clearInterval(cltimer);
  cltimer = setInterval("clock()",50);
}


//パネル開いたときに画像書き換える
function changeImage(hx, hy){
  if (fieldArray[hx][hy] == 9) {
    document.querySelector('.cell[namex = "'+hx+'"][namey = "'+hy+'"]').setAttribute("src", "img/mine.png");
  }else{
    document.querySelector('.cell[namex = "'+hx+'"][namey = "'+hy+'"]').setAttribute("src", "img/state"+fieldArray[hx][hy]+".png");
  }
}



//パネル右クリックしたとき
function contextCellChange(hx, hy){
  if (gamestate != 0) {
    if (openFlagArray[hx][hy] == 0) {
      document.querySelector('.cell[namex = "'+hx+'"][namey = "'+hy+'"]').setAttribute("src", "img/checked.png");
      openFlagArray[hx][hy] = -1;
    }else if (openFlagArray[hx][hy] == -1) {
      document.querySelector('.cell[namex = "'+hx+'"][namey = "'+hy+'"]').setAttribute("src", "img/closed.png");
      openFlagArray[hx][hy] = 0;
    }
  }
}
