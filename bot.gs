var ACCESS_TOKEN = '貼上你的哈哈姆特ACCESS_TOKEN'; //引號內貼上你的ACCESS_TOKEN
var sheetID = "貼上你的google表單id";  //引號內貼上你的google表單id
var CName = '貼上你的哈哈姆特指令代號'; //引號內貼上你的指令代號
var imageId ='貼上你的圖片Id';
var imageExt ='貼上你的圖片Ext';

function doPost(e) {

  var data = JSON.parse(e.postData.contents);
  console.log(data);
  var webhook_event = data.messaging[0];
  var senderID = data.messaging[0].sender_id; //把使用者id抓出來
  var eventID = data.messaging[0].message.event_id; //把server給的特殊介面event抓出來
  var botCommand = data.messaging[0].message.bot_command; //把使用者按下的按鈕對應指令抓出來
  var reciveMessage = data.messaging[0].message.text; //把使用者丟給bot的文字抓出來
  
  Users(senderID); //記錄使用者
  
  if(reciveMessage)
  {
   replyMessage(senderID, reciveMessage); //呼叫判斷
  }
  else if(eventID)
  {
    doExCommand(senderID, eventID, botCommand); //表示有收到互動介面的事件，要對互動介面做更動
  }
  else
  {
    console.log("request fail");
  }
  
  return ContentService.createTextOutput("200 OK");
}

function replyMessage(senderID, reciveMessage)
{
  var endReply = "May the force be with you.";
  
  if(reciveMessage.indexOf("約嗎")>-1)
  { 
    sendStickerMessage(senderID,"13","06");
  }

  if(reciveMessage == CName)
  {
    var messageText = "點擊圖片進行互動";
    sendTextMessage(senderID, messageText);
    quickMenu(senderID); //互動介面
  }
  else if(reciveMessage.indexOf("車圖")>-1||reciveMessage.indexOf("上車")>-1) //只要使用者輸入的文字裡含有“車圖”或是“上車”，都會被視為是要發圖給他
  {
    randImage(senderID);
  }
  else if(reciveMessage.indexOf("開啟每日車圖")>-1) //只要使用者輸入開啟每日車圖，就會啟動排程
  {
    startCustomTrigger();
    sendTextMessage(senderID, "好喔，開啟每日車圖");
  }
  else if(reciveMessage.indexOf("關閉每日車圖")>-1) //只要使用者輸入關閉每日車圖，就會關閉排程
  {
    deleteAllTrigger();
    sendTextMessage(senderID, "好喔，關閉每日車圖");
  }
  else
  {
    findCharacter(senderID, reciveMessage);
  }
}

//送出文字訊息的function
function sendTextMessage(recipientId, messageText)
{
   var url = "https://us-central1-hahamut-8888.cloudfunctions.net/messagePush?access_token="+ACCESS_TOKEN;
   
    var response = UrlFetchApp.fetch(url, {
      'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      'method': 'post',
      'payload': JSON.stringify({
        'recipient':{
          'id': recipientId
        },
        'message':{
          'type': 'text',
          'text': messageText
        }
      }),
    });
   
    Logger.log(response);
}

//送出貼圖訊息的function
function sendStickerMessage(recipientId, stickerGroup, stickerID)
{
   var url = "https://us-central1-hahamut-8888.cloudfunctions.net/messagePush?access_token="+ACCESS_TOKEN;
   
    var response = UrlFetchApp.fetch(url, {
      'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      'method': 'post',
      'payload': JSON.stringify({
        'recipient':{
          'id': recipientId
        },
        'message':{
          'type': 'sticker',
          'sticker_group': stickerGroup,
          'sticker_id': stickerID
        }
      }),
    });
   
    Logger.log(response);
}

function findCharacter(recipientId, keyword) 
{
  var SpreadSheet = SpreadsheetApp.openById(sheetID);
  var name = "character";
  var Sheet = SpreadSheet.getSheetByName(name);
  var lastRow = Sheet.getLastRow();
  var lastCol = Sheet.getLastColumn();
  var range = Sheet.getRange(1, 1, lastRow, lastCol);
  var keys = range.getValues();

//  Logger.log(keys);

  for(var i = 0;i<lastRow;i++)
  {
    for(var j = 0;j<lastCol;j++)
    {
      if(keys[i][j] == keyword && keys[i][j] != "")
      {
        var messageText = keyword+" 的資料：\n"+keys[i][0];
        sendTextMessage(recipientId, messageText)
      }
    }
   }
  
}


function randImage(recipientId) 
{
  var SpreadSheet = SpreadsheetApp.openById(sheetID);
  var name = "image";
  var Sheet = SpreadSheet.getSheetByName(name);
  var lastRow = Sheet.getLastRow();
  var range = Sheet.getRange(2, 1, lastRow);
  var keys = range.getValues();
  var key = keys[Math.floor(Math.random()*keys.length)]; //從data裡隨機取一個
  
  key = key[0].toString(); //轉成字串 
  sendTextMessage(recipientId,key);

}


//使用者的判斷寫在這裡，主要是要避免重複紀錄使用者的id
function Users(userID) 
{
  //如果從試算表裡面找到使用者(這個使用者有發過話了)，不做任何事，沒找到(第一次發話)就把id記錄下來
  if(findUser(userID)){
//    console.log("user "+ userID +" reply");
  }
  else{
//    console.log("New user "+ userID);
    addUser(userID);
  }
}


// 找看看試用者
function findUser(userID)
{
  var SpreadSheet = SpreadsheetApp.openById(sheetID);
  var name = "user";
  var Sheet = SpreadSheet.getSheetByName(name);
  var data = Sheet.getDataRange().getValues();
  
  for(var i = 0; i<data.length;i++){
    if(data[i][1] == userID){ //[1] because column B
//      Logger.log((i+1))
      return i+1;
    }
  }
}

// 把使用者的id記下來
function addUser(userID)  
{
  var SpreadSheet = SpreadsheetApp.openById(sheetID);
  var name = "user";
  var Sheet = SpreadSheet.getSheetByName(name);
  var lastRow = Sheet.getLastRow()+1;
  
  Sheet.getRange(lastRow, 1).setValue(new Date());
  Sheet.getRange(lastRow, 2).setValue(userID);
}

//啟動排程
function startCustomTrigger()
{
  //設定每天的8點、12點、20點要執行"StartImageProcess"這個function
  ScriptApp.newTrigger('StartImageProcess').timeBased().atHour(8).everyDays(1).create();
  ScriptApp.newTrigger('StartImageProcess').timeBased().atHour(12).everyDays(1).create();
  ScriptApp.newTrigger('StartImageProcess').timeBased().atHour(20).everyDays(1).create();
}

function StartImageProcess() 
{
  ImagePush(); 
}

//刪除所有排程
function deleteAllTrigger() {
  // Loop over all triggers.
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) 
  {
      ScriptApp.deleteTrigger(allTriggers[i]);
  }
}

function ImagePush() 
{

    var pushID = getIDs();
    
    for(var j in pushID)
    {
      randImage(pushID[j].toString) 
    }
}

function getIDs()
{
  var SpreadSheet = SpreadsheetApp.openById(sheetID);
  var name = "user";
  var Sheet = SpreadSheet.getSheetByName(name);
  var lastRow = Sheet.getLastRow();

  var range = Sheet.getRange(1, 2, lastRow);
  var ids = range.getValues();

  return ids;
}

function quickMenu(senderID) 
{
  var initMessage ='這裡打字這裡打字這裡打字'; //顯示的文字
  var button =[]; //指令button
  
  var hpObj = setHpObj(0, 0,"#FF0000", true);  //設定hp物件
  var textObj = setTextObj(initMessage, "#019BAD", false);   //設定文字物件
  
  button = addButton(button, false, "所有角色表", "CharacterList");   //新增按鈕
  button = addButton(button, false, "關於這個bot", "About"); //新增按鈕
  var buttonObj = setButtonObj(1, button, false);   //設定按鈕物件
  
  var initObj = setInitObj(imageId, imageExt, hpObj, textObj, buttonObj);  //初始特殊介面
  var messageObj = botStartMessageObj(imageId, imageExt, initObj); //初始啟動介面
  var jsonData = exMessage(senderID, messageObj); //打包
  sendExMessage(jsonData);
 
}

function doExCommand(senderID, eventID, botCommand)
{
  switch(botCommand) {
     case "CharacterList":
        SendCharacterLists(senderID);
        break;
     case "About":
      sendTextMessage(senderID, "直接輸入角色名稱和裝備名稱可以查資料，或輸入：車圖");
        break;
     default:
      sendTextMessage(senderID, "收到回應");
  }
  
  var initMessage ='這裡打字這裡打字這裡打字'; //顯示的文字
  var button =[]; //指令button
  
  var hpObj = setHpObj(0, 0,"#FF0000", true);  
  var textObj = setTextObj(initMessage, "#019BAD", false);   
  
  button = addButton(button, false, "所有角色表", "CharacterList");   
  button = addButton(button, false, "關於這個bot", "About");
  var buttonObj = setButtonObj(1, button, false);   
  
  var messageObj = botEventMessageObj(eventID, imageId, imageExt, hpObj, textObj, buttonObj) //特殊介面
  var jsonData = exMessage(senderID, messageObj);
  sendExMessage(jsonData);
}

//列出所有可以查詢的角色給使用者
function SendCharacterLists(senderID)
{
  var list = getCharacterLists();
  var outPutTable='';
  
  for(var i = 0; i<list.length;i++)
    {
      outPutTable += list[i]+'\n';
    }
//  Logger.log(outPutTable);
  sendTextMessage(senderID, "可以查詢的角色(輸入暱稱也可以)：\n"+outPutTable);
}

// 查表，把所有角色名單拉出來
function getCharacterLists()
{
  var SpreadSheet = SpreadsheetApp.openById(sheetID);
  var name = "character";
  var Sheet = SpreadSheet.getSheetByName(name);
  var lastRow = Sheet.getLastRow();
 
  var range = Sheet.getRange(2, 2, lastRow-1);
  var values = range.getValues();
  return values;
}

//以下為特殊介面-------------------------------------------------------------------------------------------------->

function sendExMessage(jsonData)
{
  
   var url = "https://us-central1-hahamut-8888.cloudfunctions.net/messagePush?access_token="+ACCESS_TOKEN;
   
    var response = UrlFetchApp.fetch(url, {
      'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      'method': 'post',
      'payload': jsonData
    });
  
    Logger.log(response);
}


function exMessage(senderID, messageObj)
{
  var jsonData = {};
  var recipient = {}; //回覆對象的物件
  
  recipient["id"] = senderID;
  jsonData["recipient"] = recipient;
  jsonData["message"] = messageObj; 
  jsonData = JSON.stringify(jsonData);
  
  return jsonData;
}

function textMessageObj(messageText)
{
  var message = {}; //回覆訊息物件
  message["type"] = "text";
  message["text"] = messageText;
  
  return message;
}

function stickerMessageObj(stickerGroup, stickerID)
{
  var message = {}; //回覆訊息物件
  message["type"] = "sticker";
  message["sticker_group"] = stickerGroup;
  message["sticker_id"] = stickerID;
  
  return message;
  
}

function imageMessageObj(imageID, imageExt, imageWidth, imageHeight)
{
  var message = {}; //回覆訊息物件
  message["type"] = "img";
  message["id"] = imageID;
  message["ext"] = imageExt;
  message["width"] = imageWidth;
  message["height"] = imageHeight;
  
  return message;
}

function botStartMessageObj(sImageID, sImageExt, initObj)
{
  var message = {}; //回覆訊息物件
  message["type"] = "botStart";
  message["start_img"] = sImageID + '.' + sImageExt; //start_img 要是一個字串
  message["init"] = initObj; 
  
  return message;
}

function setInitObj(imageID, imageExt, hpObj, textObj, buttonObj)
{
  var initObj = {}; //物件，一開始看到的特殊介面
  if(imageID == '')
  {
   initObj["image"] = ''; //image 要是一個字串
  }
  else
  {
   initObj["image"] = imageID + '.' + imageExt; //image 要是一個字串 
  }
  initObj["hp"] = hpObj;
  initObj["text"] = textObj;
  initObj["button"] = buttonObj;
  
  return initObj;
}

function botEventMessageObj(eventID, imageID, imageExt, hpObj, textObj, buttonObj)
{
  var message = {}; //回覆訊息物件
  message["type"] = "botEvent";
  message["event_id"] = eventID; //event_id 要是一個字串
  if(imageID == '')
  {
   message["image"] = ''; //image 要是一個字串
  }
  else
  {
   message["image"] = imageID + '.' + imageExt; //image 要是一個字串
  }
//  message["image"] = imageID + '.' + imageExt; //image 要是一個字串
  message["hp"] = hpObj;
  message["text"] = textObj;
  message["button"] = buttonObj;
   
  return message;
}

function setHpObj(maxHp, currentHp, hpColor, hidden)
{
  var hpObj = {}; //hp物件
  hpObj["max"] = maxHp; //max 是一個數字值
  hpObj["current"] = currentHp; //current 是一個數字值
  hpObj["color"] = hpColor;  //color 是一個字串
  hpObj["hidden"] = hidden; //hidden 是一個布林值

  return hpObj;
}

function setTextObj(message, backgroundColor, hidden)
{
  var textObj = {}; //文字物件
  textObj["message"] = message;
  textObj["color"] = backgroundColor; //color 是一個字串
  textObj["hidden"] = hidden; //hidden 是一個布林值
  
  return textObj;
}

function setButtonObj(buttonStyle, buttonSetting, hidden)
{
  var buttonObj = {}; //文字物件
  buttonObj["style"] = buttonStyle; // style 是一個數字值
  buttonObj["setting"] = buttonSetting; // setting 是一個array
  buttonObj["hidden"] = hidden; //hidden 是一個布林值
   
  return buttonObj;
}

function addButton(buttonArray, isDisabled, buttonText, buttonCommand)
{
  var bSettings = {}; //每個按鈕的設定物件
  bSettings["disabled"] = isDisabled; // disabled 是一個布林值
  bSettings["order"] = buttonArray.length; // order 是一個數字值， buttonArray 是一個array
  bSettings["text"] = buttonText;  // text 是一個字串
  bSettings["command"] = buttonCommand;  // command 是一個字串
  
  buttonArray.push(bSettings);
   
  return buttonArray;
}
//以上為特殊介面-------------------------------------------------------------------------------------------------->
