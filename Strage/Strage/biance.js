

Alpha = 0.03 //指数移动平局的Alpha参数，设置的越大，基准价格跟踪越敏感，最终持仓也会越低，降低了杠杆，但会降低收益，具体需要根据回测结果自己权衡
Update_base_price_time_interval = 30*60 //多久更新一次基准价格, 单位秒，和Alpha参数相关,Alpha 设置的越小，这个间隔也可以设置的更小

if(IsVirtual()){
    throw '不能回测，回测参考 https://www.fmz.com/digest-topic/5294 '
}
if(exchange.GetName() != 'Futures_Binance'){
    throw '只支持币安期货交易所，和现货交易所不同，需要单独添加，名称为Futures_Binance'
}
var trade_symbols = Trade_symbols.split(',')
var symbols = trade_symbols
var index = 1 //指数
if(trade_symbols.indexOf('BTC')<0){
    symbols = trade_symbols.concat(['BTC'])
}
var update_profit_time = 0
var update_base_price_time= Date.now()
var assets = {}
var init_prices = {}


var trade_info = {}
var exchange_info = HttpQuery('https://fapi.binance.com/fapi/v1/exchangeInfo')
if(!exchange_info){
    throw '无法连接币安网络，需要海外托管者'
}
exchange_info = JSON.parse(exchange_info)
for (var i=0; i<exchange_info.symbols.length; i++){
    if(symbols.indexOf(exchange_info.symbols[i].baseAsset) > -1){
       assets[exchange_info.symbols[i].baseAsset] = {amount:0, hold_price:0, value:0, bid_price:0, ask_price:0,
                                                     btc_price:0, btc_change:1,btc_diff:0,
                                                     realised_profit:0, margin:0, unrealised_profit:0}
       trade_info[exchange_info.symbols[i].baseAsset] = {minQty:parseFloat(exchange_info.symbols[i].filters[1].minQty),
                                                         priceSize:parseInt((Math.log10(1.1/parseFloat(exchange_info.symbols[i].filters[0].tickSize)))),
                                                         amountSize:parseInt((Math.log10(1.1/parseFloat(exchange_info.symbols[i].filters[1].stepSize))))
                                                        }
    }
}
assets.USDT = {unrealised_profit:0, margin:0, margin_balance:0, total_balance:0, leverage:0, update_time:0}

function updateAccount(){ //更新账户和持仓
    var account = exchange.GetAccount()
    var pos = exchange.GetPosition()
    if (account == null || pos == null ){
        Log('update account time out')
        return
    }
    assets.USDT.update_time = Date.now()
    for(var i=0; i<trade_symbols.length; i++){
        assets[trade_symbols[i]].margin = 0
        assets[trade_symbols[i]].unrealised_profit = 0
        assets[trade_symbols[i]].hold_price = 0
        assets[trade_symbols[i]].amount = 0
        assets[trade_symbols[i]].unrealised_profit = 0
    }
    for(var j=0; j<account.Info.positions.length; j++){
        var pair = account.Info.positions[j].symbol
        var coin = pair.slice(0,pair.length-4)
        if(symbols.indexOf(coin) < 0){continue}
        assets[coin].margin = parseFloat(account.Info.positions[j].initialMargin) + parseFloat(account.Info.positions[j].maintMargin)
        assets[coin].unrealised_profit = parseFloat(account.Info.positions[j].unrealizedProfit)
    }
    assets.USDT.margin = _N(parseFloat(account.Info.totalInitialMargin) + parseFloat(account.Info.totalMaintMargin),2)
    assets.USDT.margin_balance = _N(parseFloat(account.Info.totalMarginBalance),2)
    assets.USDT.total_balance = _N(parseFloat(account.Info.totalWalletBalance),2)
    assets.USDT.unrealised_profit = _N(parseFloat(account.Info.totalUnrealizedProfit),2)
    assets.USDT.leverage = _N(assets.USDT.margin/assets.USDT.total_balance,2)
    pos = JSON.parse(exchange.GetRawJSON())
    if(pos.length > 0){
        for(var k=0; k<pos.length; k++){
            var pair = pos[k].symbol
            var coin = pair.slice(0,pair.length-4)
            if(symbols.indexOf(coin) < 0){continue}
            assets[coin].hold_price = parseFloat(pos[k].entryPrice)
            assets[coin].amount = parseFloat(pos[k].positionAmt)
            assets[coin].unrealised_profit = parseFloat(pos[k].unRealizedProfit)
        }
    }
}

function updateIndex(){ //更新指数
    
    if(!_G('init_prices') || Reset){
        Reset = false
        for(var i=0; i<trade_symbols.length; i++){
            init_prices[trade_symbols[i]] = (assets[trade_symbols[i]].ask_price+assets[trade_symbols[i]].bid_price)/(assets.BTC.ask_price+assets.BTC.bid_price)
        }
        Log('保存启动时的价格')
        _G('init_prices',init_prices)
    }else{
        init_prices = _G('init_prices')
        if(Date.now() - update_base_price_time > Update_base_price_time_interval*1000){
            update_base_price_time = Date.now()
            for(var i=0; i<trade_symbols.length; i++){ //更新初始价格
                init_prices[trade_symbols[i]] = init_prices[trade_symbols[i]]*(1-Alpha)+Alpha*(assets[trade_symbols[i]].ask_price+assets[trade_symbols[i]].bid_price)/(assets.BTC.ask_price+assets.BTC.bid_price)
            }
            _G('init_prices',init_prices)
            //Log(init_prices)
            Log('更新了一次基准价格')
        }
        var temp = 0
        for(var i=0; i<trade_symbols.length; i++){
            assets[trade_symbols[i]].btc_price =  (assets[trade_symbols[i]].ask_price+assets[trade_symbols[i]].bid_price)/(assets.BTC.ask_price+assets.BTC.bid_price)
            if(!(trade_symbols[i] in init_prices)){
                Log('添加新的币种',trade_symbols[i])
                init_prices[trade_symbols[i]] = assets[trade_symbols[i]].btc_price
                _G('init_prices',init_prices)
            }
            assets[trade_symbols[i]].btc_change = _N(assets[trade_symbols[i]].btc_price/init_prices[trade_symbols[i]],4)
            temp += assets[trade_symbols[i]].btc_change
        }
        index = _N(temp/trade_symbols.length, 4)
    }
    
}

function updateTick(){ //更新行情
    var ticker = HttpQuery('https://fapi.binance.com/fapi/v1/ticker/bookTicker')
    try {
        ticker = JSON.parse(ticker)
    }catch(e){
        Log('get ticker time out')
        return
    }
    for(var i=0; i<ticker.length; i++){
        var pair = ticker[i].symbol
        var coin = pair.slice(0,pair.length-4)
        if(symbols.indexOf(coin) < 0){continue}
        assets[coin].ask_price = parseFloat(ticker[i].askPrice)
        assets[coin].bid_price = parseFloat(ticker[i].bidPrice)
        assets[coin].ask_value = _N(assets[coin].amount*assets[coin].ask_price, 2)
        assets[coin].bid_value = _N(assets[coin].amount*assets[coin].bid_price, 2)
    }
    updateIndex()
    for(var i=0; i<trade_symbols.length; i++){
        assets[trade_symbols[i]].btc_diff = _N(assets[trade_symbols[i]].btc_change - index, 4)
    }
}



function trade(symbol, dirction, value){ //交易
    if(Date.now()-assets.USDT.update_time > 10*1000){
        Log('更新账户延时，不交易')
        return
    }
    var price = dirction == 'sell' ? assets[symbol].bid_price : assets[symbol].ask_price
    var amount = _N(Math.min(value,Ice_value)/price, trade_info[symbol].amountSize)
    if(amount < trade_info[symbol].minQty){
        Log(symbol, '合约价值偏离或冰山委托订单的大小设置过小，达不到最小成交, 至少需要: ', _N(trade_info[symbol].minQty*price,0)+1)
        return
    }
    exchange.IO("currency", symbol+'_'+'USDT')
    exchange.SetContractType('swap')
    exchange.SetDirection(dirction)
    var f = dirction == 'buy' ? 'Buy' : 'Sell'
    var id = exchange[f](price, amount, symbol)
    if(id){
        exchange.CancelOrder(id) //订单会立即撤销
    }
}



function updateStatus(){ //状态栏信息
        var table = {type: 'table', title: '交易对信息',
             cols: ['币种', '数量', '持仓价格',  '当前价格', '偏离平均', '持仓价值', '保证金', '未实现盈亏'],
             rows: []}
    for (var i=0; i<symbols.length; i++){
        var price = _N((assets[symbols[i]].ask_price + assets[symbols[i]].bid_price)/2, trade_info[symbols[i]].priceSize)
        var value = _N((assets[symbols[i]].ask_value + assets[symbols[i]].bid_value)/2, 2)
        var infoList = [symbols[i], assets[symbols[i]].amount, assets[symbols[i]].hold_price, price, assets[symbols[i]].btc_diff, value, _N(assets[symbols[i]].margin,3), _N(assets[symbols[i]].unrealised_profit,3)]
        table.rows.push(infoList)
    }
    var logString = _D() + '   ' + JSON.stringify(assets.USDT) + ' Index:' + index + '\n'
    LogStatus(logString + '`' + JSON.stringify(table) + '`')
    
    if(Date.now()-update_profit_time > Log_profit_interval*1000){
        LogProfit(_N(assets.USDT.margin_balance,3))
        update_profit_time = Date.now()
    }
    
}

function onTick(){ //策略逻辑部分
    for(var i=0; i<trade_symbols.length; i++){
        var symbol = trade_symbols[i]
        if(assets[symbol].ask_price == 0){ continue }
        var aim_value = -Trade_value * _N(assets[symbol].btc_diff/0.01,3)
        if(aim_value - assets[symbol].ask_value > Adjust_value){
            trade(symbol,'buy', aim_value - assets[symbol].ask_value)
        }
        if(aim_value - assets[symbol].bid_value < -Adjust_value){
            trade(symbol,'sell', -(aim_value - assets[symbol].bid_value))
        }
    }
}

function main() {
    while(true){
        updateAccount()
        updateTick()
        onTick()
        updateStatus()
        Sleep(Interval*1000)
    }
}
