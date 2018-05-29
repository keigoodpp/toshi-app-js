const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}

function onMessage(session, message) {
  welcome(session)
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'ping':
      pong(session)
      break
    case 'count':
      count(session)
      break
    case 'donate':
      donate(session)
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
  sendMessage(session, `Hello Token!`)
}

function pong(session) {
  sendMessage(session, session.get('paymentAddress'))
}

// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, `${count}`)
}

function donate(session) {
  // request $1 USD at current exchange rates
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.JPY(100))
    
  })
}

// HELPERS

function sendMessage(session, message) {
  let controls = [
    {
      type: "group",
      label: "point management",
      controls: [
           {type: 'button', label: 'languageExchangePointを購入する', value: 'ping'},
    {type: 'button', label: '保有ポイントを確認する', value: 'ping'},
      ]}, 
    {
      type: "group",
      label: "implove your pronunciaton",
      controls: [
        {type: 'button', label: 'ラインで発音練習、録音する', value: 'count'},
    {type: 'button', label: '音声を登録する', value: 'ping'},
    {type: 'button', label: '登録音声を評価してもらう', value: 'ping'},
        
      ]},
{
      type: "group",
      label: "work for eth",
      controls: [
        {type: 'button', label: 'タスクに入札する', value: 'donate'},
    {type: 'button', label: '入札成功タスクにコミットする', value: 'ping'},
        {type: "button", label: "Directions", value: "directions"},
        {type: "button", label: "Timetable", value: "timetable"},
        {type: "button", label: "Exit Info", value: "exit"},
        {type: "button", label: "Service Conditions", value: "conditions"}
      ]},
{
      type: "group",
      label: "Trip",
      controls: [
        {type: "button", label: "Directions", value: "directions"},
        {type: "button", label: "Timetable", value: "timetable"},
        {type: "button", label: "Exit Info", value: "exit"},
        {type: "button", label: "Service Conditions", value: "conditions"}
      ]},

   
    {type: 'button', label: 'ポイントを清算してethを獲得する', value: 'count'},
    {type: 'button', label: 'setting', value: 'count'}
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}


