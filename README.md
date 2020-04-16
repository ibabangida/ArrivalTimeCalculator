# ArrivalTimeCalculator
Codes for Line Bot, which returns estimated arrival time to go home.

# Requirement
* LINE Developers Account for using LINE Messaging API and bot
* Google Account for Google Apps Script

# Prepareation

## Make Line Developers Account and set up a bot

* Make a LINE developer account, and set up a bot as below until "Set a Webhook URL".
  * https://developers.line.biz/en/docs/messaging-api/building-bot/#before-you-begin
* Publish channel access token, which is used later.

## Make a Google sheet with apps script and setup an apps script
* Make a Google sheet with apps script.
  * https://developers.google.com/apps-script/guides/sheets
* Set Script Properties.
  * AccessToken: channel access token of created LINE message app
  * RedirectUrl: https://api.line.me/v2/bot/message/reply
  * BotUrl: https://api.line.me/v2/bot/
  * SheetName: sheet name of the google sheet. "Sheet1" will be default.
  
# Usage
* Invite created bot to group talk or one on one communication.
* Post wake words, which differ from your transportation.
  * by using public transportation: 帰る|かえる|帰り|かえり|か
  * by car: 車|くるま + 帰る|かえる|帰り|かえり|か
  * on foot: あるいて|あるきで|歩いて|歩きで|とほで|徒歩 + 帰る|かえる|帰り|かえり|か

# Note
* This bot support only Japanese.

# Author
* Keisuke Iba
* https://twitter.com/ibabangida

# License 
"ArrivalTimeCalculator" is under [MIT license](https://en.wikipedia.org/wiki/MIT_License).
  
