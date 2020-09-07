function main() {
    exchange.SetContractType("swap")
    exchange.SetMarginLevel(100)
    exchange.IO("currency", "BTC_USDT")
    var coun = 0
    while (true) {

        checkAmount()
        dir = getDirection()
        if (dir == 0) {
            continue;
        }
        coun += 1;
        if (coun >= 9) {
            coun = 0;
            caclueProfile()
        } 
        if (getHighLow(dir == 1)) {
        } else {
            Log('休眠中')
            Sleep(1000* 60 * 3)
            getHighLow(dir == 1)
        }

        onTicker()
        updateStatus()
        Sleep(1000 * 60)
    }
   
}
var dir = 0;

var asset = {};
var Success = '#5cb85c'; //成功颜色
var Danger = '#ff0000'; //危险颜色
var Warning = '#f0ad4e'; //警告颜色

var blance_ = 0;
var initBlance = 1367;
var Stocks_ = 0;
var takeupBlance = 0;

function caclueProfile() {
    var account = exchange.GetAccount();
    blance_ = account.Balance;
    LogProfit(blance_ + Stocks_ - initBlance + _N(takeupBlance,2));

}


function getHighLow(more) {

    var currentPrice = GetTicker().Last;
    var records = exchange.GetRecords(PERIOD_M1)
    asset.lowPrice = TA.Lowest(records, 60, 'Low');
    asset.highPrice = TA.Highest(records, 60, 'High');
    asset.middlePrice = (asset.lowPrice + asset.highPrice)/2;
    var isContine = true
    if (more) {
        asset.buyPrice = asset.lowPrice + (asset.middlePrice - asset.lowPrice) * 0.66;
        asset.sellPrice = asset.highPrice - (asset.highPrice - asset.middlePrice) * 0.33;
        if (currentPrice < asset.lowPrice) {
            isContine = false
        }
    } else {
        asset.buyPrice = asset.lowPrice + (asset.middlePrice - asset.lowPrice) * 0.33;
        asset.sellPrice = asset.highPrice - (asset.highPrice - asset.middlePrice) * 0.66;
        if (currentPrice >  asset.highPrice) {
            isContine = false
        }
    }
    return isContine;

}

function onTicker() {
    var currentPrice = GetTicker().Last;
    var amount = 1;
    var diffMidABS = Math.abs((asset.middlePrice - currentPrice))
    if (currentPrice < asset.middlePrice && asset.sellAmount >= 1) {
        //1. -1
        cancleCoverOrders(ORDER_TYPE_SELL)
        var coverSellAmount = Math.round(diffMidABS / (asset.middlePrice - asset.lowPrice) + 1) * amount;
        if (coverSellAmount > asset.sellAmount) {
           coverSellAmount = asset.sellAmount 
        }
        if (asset.sellAmount >= 10) {
            coverSellAmount = 5
        }
        if (asset.sellAmount >= 20) {
            coverSellAmount = 15;
        }
        if (asset.sellAmount >= 30) {
            coverSellAmount = 20;
        }
        closeSellAction(currentPrice,coverSellAmount)
        //2. 
    }
    if (asset.buyAmount > 10 && (currentPrice - asset.openBuyPrice) >= 20) {
        var coverBuyAmount = 5;
        if (asset.buyAmount >= 10) {
            coverBuyAmount = 5
        }
         if (asset.buyAmount >= 20) {
            coverBuyAmount = 15;
        }
        if (asset.buyAmount >= 30) {
            coverBuyAmount = 20;
        }
        closeBuyAction(currentPrice,coverBuyAmount) 
    }
    if (asset.sellAmount > 10 && (asset.openSellPrice - currentPrice) >= 20 ) {
        var coverSellAmount = 5;
      
        if (asset.sellAmount >= 10) {
            coverSellAmount = 5
        }
        if (asset.sellAmount >= 20) {
            coverSellAmount = 15;
        }
        if (asset.sellAmount >= 30) {
            coverSellAmount = 20;
        }
         closeSellAction(currentPrice,coverSellAmount)
    }

    if (currentPrice > asset.middlePrice && asset.buyAmount >= 1) {
        //2.  1
        cancleCoverOrders(ORDER_TYPE_BUY)
        var coverBuyAmount = Math.round(diffMidABS / (asset.highPrice - asset.middlePrice ) + 1) * amount;
         if (coverBuyAmount > asset.buyAmount) {
           coverBuyAmount = asset.buyAmount 
        }
        if (asset.buyAmount >= 10) {
            coverBuyAmount = 5
        }
         if (asset.buyAmount >= 20) {
            coverBuyAmount = 15;
        }
        if (asset.buyAmount >= 30) {
            coverBuyAmount = 20;
        }
        closeBuyAction(currentPrice,coverBuyAmount) 


    }
    // && asset.buyAmount < 0.6
    if (currentPrice <= asset.buyPrice && asset.buyAmount < 80) {
        //1.
        cancleaddAction(ORDER_TYPE_SELL)
        var buyAmount = Math.round((asset.buyPrice - currentPrice)/(asset.buyPrice - asset.lowPrice) + 1) * amount;
        openAction("buy", currentPrice,buyAmount)

    }
//
    if (currentPrice >= asset.sellPrice && asset.sellAmount < 80) {
        //2.
        cancleaddAction(ORDER_TYPE_BUY)
        var sellAmount = Math.round((currentPrice - asset.sellPrice)/(asset.highPrice - asset.sellPrice) + 1) * amount;
        openAction("sell", currentPrice,sellAmount)
    }

}

function getDirection() {
   var records = exchange.GetRecords(60 * 30) //4小时
   var macd = TA.MACD(records)
   var m = macd[0][records.length - 1];
   var c = macd[1][records.length - 1];
   var d = macd[2][records.length - 1];
   
   if (d > 5) {
       return 1;//more
   }
   if (d < -5) {
       return -1;//less
   }
   
   return 0;//wait

}

function updateStatus() { //状态栏信息
    var table = {
        type: 'table',
        title: '交易对信息',
        cols: ['编号', '币种信息','开仓方向','当前价格','周期最高价','周期最低价','周期中间价','开多条件','开多数量','开多均价','开空条件','开空数量','开空均价'],
        rows: []
    };
    var dirS = '多'
    if (dir == 0) {
       dirS = '等待'
    }
    if (dir == -1) {
        dirS = '空'
    }
    var currentPrice = GetTicker().Last;
    table.rows.push([
        '1',
        'BTC_USDT',
        dirS + Success,
        currentPrice,
        asset.highPrice,
        asset.lowPrice,
        _N(asset.middlePrice,2),
        _N(asset.buyPrice,2),
        asset.buyAmount,
        asset.openBuyPrice,
        _N(asset.sellPrice,2),
        asset.sellAmount,
        asset.openSellPrice,
    ]);
    LogStatus('`' + JSON.stringify(table) + '`' + hasOrders())

}

function hasOrders() {
    var table = {
        type: 'table',
        title: '已存在限价委托',
        cols: ['编号', '限价类型', '下单价格', '下单数量', '成交数量'],
        rows: []
    };

    var orders = exchange.GetOrders()
    //takeupBlance = 0
    if (orders && orders.length > 0) {
        for (var i = 0; i < orders.length; i++) {
            var order = orders[i]
            if (order.Status != ORDER_STATE_PENDING) {
                continue;
            }
            if (order.Offset == ORDER_OFFSET_OPEN) {
                //开多
                if (order.Type == ORDER_TYPE_BUY) {
                    table.rows.push([
                        i + 1,
                        '买入开多' + Success,
                        order.Price,
                        order.Amount,
                        order.DealAmount,
                    ]);
                } else {
                    table.rows.push([
                        i + 1,
                        '卖出开空' + Danger,
                        order.Price,
                        order.Amount,
                        order.DealAmount,
                    ]);

                }
                takeupBlance = takeupBlance + (order.Price * order.Amount * 0.01 * 0.01)
            } else {
                if (order.Type == ORDER_TYPE_BUY) {
                    table.rows.push([
                        i + 1,
                        '买入平空' + Danger,
                        order.Price,
                        order.Amount,
                        order.DealAmount,
                    ]);
                } else {
                    table.rows.push([
                        i + 1,
                        '卖出平多' + Danger,
                        order.Price,
                        order.Amount,
                        order.DealAmount,
                    ]);
                }

            }
        }
    }
    return '\n' + '`' + JSON.stringify(table) + '`'

}

function checkAmount() {
    var position = exchange.GetPosition()
    Stocks_ = 0;
    asset.sellAmount = 0
    asset.buyAmount = 0
    asset.openBuyPrice = 0
    asset.openSellPrice = 0
    if (position && position.length > 0) {
        // Log("Amount:", position[0].Amount, "FrozenAmount:", position[0].FrozenAmount, "Price:",
        //  position[0].Price, "Profit:", position[0].Profit, "Type:", position[0].Type,
        // "ContractType:", position[0].ContractType)
        for (var i = 0; i < position.length; i++) {
            if (position[i].Type == 0) {
                asset.openBuyPrice = position[i].Price;
                asset.buyAmount = position[i].Amount;
                //asset.buyMargin = position[i].Margin;
                //asset.buyProfit = position[i].Profit;
            } else if (position[i].Type == 1) {
                asset.openSellPrice = position[i].Price;
                asset.sellAmount = position[i].Amount;
               // asset.sellMargin = position[i].Margin;
              //  asset.sellProfit = position[i].Profit;

            }
            Stocks_ = Stocks_ + position[i].Margin;
        }
    }
}

function openAction(type,price, count) {
    var tick = GetTicker(); //当前价格
    exchange.SetDirection(type)
    if (type == "buy") {
        // tradingCounter("buyNumber", 1);
        //容错防止一直开仓导致爆仓
        exchange.Buy(price, _N(count,2))
    } else {
        //tradingCounter("sellNumber", 1);
        exchange.Sell(price, _N(count,2))
    }
    Sleep(1000);
}


function cancleaddAction(oredrType) {
    var orders = exchange.GetOrders()
    if (orders && orders.length > 0) {
        for (var i = 0; i < orders.length; i++) {
            var order = orders[i]
            if (order.Status != ORDER_STATE_PENDING) {
                continue;
            }
            if (order.Offset == ORDER_OFFSET_OPEN) {
                //开多 、开空
                if (order.Type == oredrType) {
                    exchange.CancelOrder(order.Id)
                }
            }
        }
    }
}

//订单的开平仓方向，ORDER_OFFSET_OPEN为开仓，ORDER_OFFSET_CLOSE为平仓方向订单类型 平空ORDER_TYPE_BUY  平多ORDER_TYPE_SELL
function cancleCoverOrders(oredrType) {
    var orders = exchange.GetOrders()
    if (orders && orders.length > 0) {
        for (var i = 0; i < orders.length; i++) {
            var order = orders[i]
            if (order.Status != ORDER_STATE_PENDING) {
                continue;
            }
            if (order.Offset == ORDER_OFFSET_CLOSE) {
                //平空
                if (order.Type == oredrType) {
                    exchange.CancelOrder(order.Id)
                    continue;
                }
            }
        }
    }
}

function closeSellAction(price,amount) {
        exchange.SetDirection("closesell")
        exchange.Buy(price, _N(amount,2))
}

function closeBuyAction(price,amount) {
        exchange.SetDirection("closebuy")
        exchange.Sell(price, _N(amount,2))
}

function GetTicker(e) {
    if (typeof(e) == 'undefined') {
        e = exchange;
    }
    var ticker;
    while (!(ticker = e.GetTicker())) {
        Sleep(1000);
    }
    return ticker;
}
