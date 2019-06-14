var ACCESS_TOKEN = '貼上你的哈哈姆特ACCESS_TOKEN'; //引號內貼上你的ACCESS_TOKEN
var sheetID = "貼上你的google表單id";  //引號內貼上你的google表單id
var CName = '貼上你的哈哈姆特指令代號'; //引號內貼上你的指令代號

function doPost(e) {

  var data = JSON.parse(e.postData.contents);
  console.log(data);
  var webhook_event = data.messaging[0];
  var senderID = data.messaging[0].sender_id; //把使用者id抓出來
  var reciveMessage = data.messaging[0].message.text; //把使用者丟給bot的文字抓出來
  
  replyMessage(senderID, reciveMessage); //呼叫判斷
  
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
    var messageText = "直接輸入角色名稱和裝備名稱可以查資料，或輸入：車圖";
    sendTextMessage(senderID, messageText);
  }
  else if(reciveMessage.indexOf("車圖")>-1||reciveMessage.indexOf("上車")>-1) //只要使用者輸入的文字裡含有“車圖”或是“上車”，都會被視為是要發圖給他
  {
    randImage(senderID);
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
