function doPost(e) 
{
  var reply_token = JSON.parse(e.postData.contents).events[0].replyToken; 
   
  var prop = PropertiesService.getScriptProperties();
  prop.setProperty('ReplyToken', reply_token);
  
  var code = handleMessage(e);
  prop.setProperty('ReplyToken', '');
}

function handleMessage(e)
{
  var prop = PropertiesService.getScriptProperties();
  var event   = JSON.parse(e.postData.contents).events[0];
  var message = event.message;
  var user_id = event.source.userId;
 
  // グループからの投稿であればgroupIdが取得できる
  var group_id = '';
  if (event.source.groupId)
  {
    group_id = event.source.groupId;
  }
    
  if (message.type == 'text')
  {
    // 自宅が未登録
    if (!isHomeLocationRegistered(user_id))
    {
      return requestHomeLocation();
    }
    // ユーザーが自宅登録をする
    else if (message.text == '自宅登録')
    {
      deleteUserHomeLocation(user_id);
      return requestHomeLocation();
    }
    // 車で帰宅
    else if (isUseCar(message.text))
    {
      setSearchMode(user_id, Maps.DirectionFinder.Mode.DRIVING);
      return requestCurrentLocation();
    }
    // 徒歩で帰宅
    else if (isUseWalk(message.text))
    {
      setSearchMode(user_id, Maps.DirectionFinder.Mode.WALKING);
      return requestCurrentLocation();
    }
    // 公共交通機関を使用して帰宅
    else if (isUsePublicTransportation(message.text))
    {
      setSearchMode(user_id, Maps.DirectionFinder.Mode.TRANSIT);
      return requestCurrentLocation();
    }
  }
  else if (message.type == 'location')
  {
    if (!isHomeLocationRegistered(user_id))
    {
      return registHomeLocation(user_id, message.latitude, message.longitude);
    }
    else if (isSetSearchMode(user_id))
    {
      return replyArrivalTimeInfo(user_id, group_id, message.latitude, message.longitude);
    }
  }
}

function isUsePublicTransportation(text)
{
  var pattern = '^か$';
  return text.match(pattern) || isGoHome(text);
}

function isUseCar(text)
{
  var pattern = '^か.*車$|^か.*くるま$';
  Logger.log(text.match(pattern));
  if (text.match(pattern)) return true;
  
  var pattern_not_car = '自転車|三輪車|馬車|人力車';
  var pattern_car = '車|くるま';
  if (!text.match(pattern_not_car) && text.match(pattern_car) && isGoHome(text)) return true;
  
  return false;
}

function isUseWalk(text)
{
  var pattern = '^か.*徒歩$|^か.*とほ$';
  Logger.log(text.match(pattern));
  if (text.match(pattern)) return true;
  
  var pattern_walk = 'あるいて|あるきで|歩いて|歩きで|とほで|徒歩';
  if (text.match(pattern_walk) && isGoHome(text)) return true; 
}

function isGoHome(text)
{
  var pattern_go_home = '帰る$|かえる$|帰ります$|かえります$|帰るで$|かえるで$|帰るやで$|かえるやで$|帰るね$|かえるね$|帰るわ$|かえるわ$';
  var pattern_not_go_home = '持ち|もち|逃げ|にげ|ひっくり';
  
  return text.match(pattern_go_home) && !text.match(pattern_not_go_home);
}

function isHomeLocationRegistered(user_id)
{
  var sheet = getSheet();
  if (sheet.getLastRow() < 1) return false; 
  var data = sheet.getRange(1, 1, sheet.getLastRow()).getValues();
  
  for (var i = 0; i < data.length; ++i)
  {
    if (data[i][0] == user_id) return true;
  }
  
  return false;
}

function getHomeLocationRegistered(user_id)
{
  var sheet = getSheet();
  var data = sheet.getRange(1, 1, sheet.getLastRow(), 3).getValues();
  
  for (var i = 0; i < data.length; ++i)
  {
    if (data[i][0] == user_id)
    {
      return {'latitude' : data[i][1], 'longitude' : data[i][2]};
    }
  }
  
  return {'latitude' : 0, 'longitude' : 0};
}

function deleteUserHomeLocation(user_id)
{
  var sheet = getSheet();
  var data = sheet.getRange(1, 1, sheet.getLastRow()).getValues();
  for (var i = 0; i < data.length; ++i)
  {
    if (data[i][0] == user_id) 
    {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  
  return false;
}

function registHomeLocation(user_id, latitude, longitude)
{
  var sheet = getSheet();
  sheet.appendRow([user_id, latitude, longitude]);
  
  var messages = 
  [
    {
      'type': 'text',
      'text': '自宅位置を登録しました'
    }
  ];
  
  return sendMessage(messages);
}

function requestHomeLocation()
{
  var messages = 
  [
    {
      'type': 'text',
      'text': '自宅位置を送信してください',
      'quickReply': {
        'items': [
          {
            'type': 'action',
            'action': 
            {
              'type': 'location',
              'label': '自宅位置選択'
            }
          }
        ]
      }
    }
  ];
  
  return sendMessage(messages);
}

function requestCurrentLocation()
{
  var messages = 
  [
    {
      'type': 'text',
      'text': '現在位置を送信してください',
      'quickReply': {
        'items': [
          {
            'type': 'action',
            'action': 
            {
              'type': 'location',
              'label': '現在位置選択',
              'title' : 'hoge'
            }
          }
        ]
      }
    }
  ];
  
  return sendMessage(messages);
}

function getUserName(user_id, group_id)
{
  var prop = PropertiesService.getScriptProperties();
 
  var send_data = {
    'method' : 'get',
    'headers' : {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + prop.getProperty('AccessToken')
    },
    'muteHttpExceptions' : true
  };
  
  var url = prop.getProperty('BotUrl');
  if (group_id == '')
  {
    url += ('profile/' + user_id);
  }
  else
  {
    url += ('group/' + group_id + '/member/' + user_id);
  }
  
  var response = UrlFetchApp.fetch(url, send_data);
  if (response.getResponseCode() == 200)
  {
    var data = JSON.parse(response.getContentText());
    if (typeof data != undefined && data.hasOwnProperty('displayName'))
    {
      return data['displayName'];
    }
    else
    {
      return 'anonymous';
    }
  }
  
  return 'anonymous';
}

function isSetSearchMode(user_id)
{
  var sheet = getSheet();
  var data = sheet.getRange(1, 1, sheet.getLastRow()).getValues();
  for (var i = 0; i < data.length; ++i)
  {
    if (data[i][0] == user_id) 
    {
      return !sheet.getRange(i + 1, 4).isBlank();
    }
  }
  
  return false;
}

function resetSearchMode(user_id)
{
  var sheet = getSheet();
  var data = sheet.getRange(1, 1, sheet.getLastRow()).getValues();
  for (var i = 0; i < data.length; ++i)
  {
    if (data[i][0] == user_id) 
    {
      sheet.getRange(i + 1, 4).clear();
    }
  }
}

function setSearchMode(user_id, mode)
{
  var sheet = getSheet();
  var data = sheet.getRange(1, 1, sheet.getLastRow()).getValues();
  for (var i = 0; i < data.length; ++i)
  {
    if (data[i][0] == user_id) 
    {
      sheet.getRange(i + 1, 4).setValue(mode);
    }
  }
}

function getSearchMode(user_id)
{
  var sheet = getSheet();
  var data = sheet.getRange(1, 1, sheet.getLastRow(), 4).getValues();
  
  for (var i = 0; i < data.length; ++i)
  {
    if (data[i][0] == user_id)
    {
      return data[i][3];
    }
  }
}

function replyArrivalTimeInfo(user_id, group_id, latitude, longitude)
{
  var home_location = getHomeLocationRegistered(user_id);
  
  var directions = Maps.newDirectionFinder()
                    .setDestination(home_location['latitude'], home_location['longitude'])
                    .setOrigin(latitude, longitude)
                    .setMode(getSearchMode(user_id))
                    .getDirections();
  
  var text_message = "";
  if (directions.routes.length < 1 || directions.routes[0].legs.length < 1)
  {
    text_message = '経路が検索できませんでした';
  }
  else
  {
    var leg = directions.routes[0].legs[0];
    var duration = leg.duration.value;
    var curr_time = new Date()
    var arrival_time = new Date()
    
    // arrival_timeがセットされている
    if (leg.arrival_time)
    {
      arrival_time = new Date(leg.arrival_time.value * 1000);
    }
    // 近距離などの場合はセットされていないこともあるので、durationから計算する
    else
    {
      arrival_time = new Date(curr_time.getTime() + duration * 1000);
    }
    
    var time = Utilities.formatDate(arrival_time, 'JST', 'HH:mm');
    var name = getUserName(user_id, group_id);
    text_message += name + 'さんの\n帰宅時間は' + time;
       
    var min = Math.floor(duration / 60);
    var hour = Math.floor(min / 60);
    var min = min % 60;
     
    text_message +='\n所要時間は';
    if (hour > 0) 
    {
      text_message += (hour.toString(10) + '時間');
    }
    if (hour > 0 && min < 10) text_message += '0';
    text_message += (min.toString(10) + '分\nです');
    
    // 検索タイプごとにアイコンを末尾に表示する
    switch (getSearchMode(user_id))
    {
    case Maps.DirectionFinder.Mode.TRANSIT:
    {
      text_message += '\uDBC0\uDC47';
    }
    break;
    case Maps.DirectionFinder.Mode.DRIVING:
    {
      text_message += '\uDBC0\uDC49';
    }
    break;
    case Maps.DirectionFinder.Mode.WALKING:
    {
      text_message += '\uDBC0\uDC67';
    }
    break;
    }
  }
  
  var messages = 
  [
    {
      'type': 'text',
      'text': text_message
    }
  ];
  
  // 検索条件をクリアする
  resetSearchMode(user_id);
  
  return sendMessage(messages);
}

function getSheet()
{
  var prop = PropertiesService.getScriptProperties();
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(prop.getProperty('SheetName'));
}

function sendMessage(messages)
{
  var prop = PropertiesService.getScriptProperties();

  var send_message = {
    'replyToken' : prop.getProperty('ReplyToken'),
    'messages' : messages,
  };
 
  var reply_data = {
    'method' : 'post',
    'headers' : {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + prop.getProperty('AccessToken'),
    },
    'payload' : JSON.stringify(send_message)
  };

  var response = UrlFetchApp.fetch(prop.getProperty('RedirectUrl'), reply_data);
  return response.getResponseCode();
}
