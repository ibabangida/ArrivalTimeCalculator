# ArrivalTimeCalculator
ArrivalTimeCalculator is a Line Bot, which returns estimated arrival time to go home.<br>
Compared to using Google Maps, it returns arrival time more easily and simply.

# Demo
<img src="https://raw.githubusercontent.com/wiki/ibabangida/ArrivalTimeCalculator/20200409_demo.gif" width="320px">

# Requirement
* LINE Developers Account for LINE Messaging API and bot
* Google Account for Google Apps Script

# Prepareation
## Create a Line Developers Account and set up a bot
* Create a LINE developer account, and set up a bot as below until "Set a Webhook URL".
  * https://developers.line.biz/en/docs/messaging-api/building-bot/#before-you-begin
* Publish channel access token, which is used later.

## Create a Google sheet with apps script and setup an apps script
* Create a Google sheet with apps script.
  * https://developers.google.com/apps-script/guides/sheets
* Set script properties.
  * AccessToken: channel access token of created LINE message app
  * RedirectUrl: https://api.line.me/v2/bot/message/reply
  * BotUrl: https://api.line.me/v2/bot/
  * SheetName: sheet name of the google sheet. "Sheet1" will be default.
* Copy Code.gs and paste it on your project.
  
# Usage
## Initial Setting 
* Invite created bot to group talk or one on one communication.
* By posting "自宅登録", the bot request to regist your home location.
* The location can be changed by posting "自宅登録" again.

## After registration of your home location
* Post trigger words corresponding with your transportation.
  * by using public transportation: か|帰る|かえる|帰ります|かえります|帰るで|かえるで|帰るやで|かえるやで|帰るね|かえるね|帰るわ|かえるわ
  * by car: (車|くるま) + (か|帰る|かえる|帰ります|かえります|帰るで|かえるで|帰るやで|かえるやで|帰るね|かえるね|帰るわ|かえるわ)
  * on foot: (あるいて|あるきで|歩いて|歩きで|とほで|徒歩) + (か|帰る|かえる|帰ります|かえります|帰るで|かえるで|帰るやで|かえるやで|帰るね|かえるね|帰るわ|かえるわ)
* The bot ask your current location.
* Post your current location.
  * You can select a place which is different from your home location.
* Then, you get estimated arrival time.

# Note
* This bot support only Japanese so far.

# Author
* Keisuke Iba
* https://twitter.com/ibabangida

# License 
"ArrivalTimeCalculator" is under [MIT license](https://en.wikipedia.org/wiki/MIT_License).
