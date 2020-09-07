/*backtest
start: 2020-02-20 00:00:00
end: 2020-05-19 00:00:00
period: 1d
basePeriod: 1h
*/

var ccigy = 0
var gyma5 = 0;
var gyma15 = 0;
var gyma30 = 0;
function main() {
    exchange.SetContractType("quarter")
    exchange.SetMarginLevel(20)
    // exchange.IO("currency", "BTC_USDT")
    var coun = 0
    var tickerCount = 0
    asset.buyAmount = 0;
    asset.buyPrice = 0;
    asset.openBuyPrice = 0;
    asset.sellAmount = 0;
    asset.sellPrice = 0;
    asset.middlePrice = 0;
    asset.stopLossDPrice = 0;
    while (true) {

        checkAmount()
        dir = getDirection()

        coun += 1;
        if (coun >= 300) {
            coun = 0;
            caclueProfile()
        }
        tickerCount += 1;

        if (dir != 0) {
            // if (getHighLow(dir == 1)) {

            // } else {
            //     Log('休眠中')
            //     Sleep(1000* 60 * 3)
            //     getHighLow(dir == 1)
            // }
            // if (tickerCount >= 30) {
            onTicker()
            //     tickerCount = 0;
            // }
        }
        
        //取消当前挂单
        if (tickerCount >= 110) {
           cancleMintesAction(ORDER_TYPE_BUY)
           cancleMintesAction(ORDER_TYPE_SELL)
           tickerCount = 0;
            
        }

    //     if (asset.sellAmount > 20) {
    //     cancleCoverOrders(ORDER_TYPE_BUY)
    //     closeSellAction(asset.openSellPrice - 15, asset.sellAmount)
    //     Sleep(1000 * 50 )
    // }
    // if (asset.buyAmount > 20) {
    //     cancleCoverOrders(ORDER_TYPE_SELL)
    //     closeBuyAction(asset.openBuyPrice  + 15, asset.buyAmount)
    //     Sleep(1000 * 50)
    // }

        calculateStopProfile()
        calculateStopLoss()
        updateStatus()
        Sleep(1000 * 2)
    }

}
var dir = 0;

var asset = {};
var Success = '#5cb85c'; //成功颜色
var Danger = '#ff0000'; //危险颜色
var Warning = '#f0ad4e'; //警告颜色

var blance_ = 0;
var initBlance = 0.1733;
var Stocks_ = 0;
var takeupBlance = 0;

function caclueProfile() {
    var account = exchange.GetAccount();
    blance_ = account.Balance;
    LogProfit(blance_ + Stocks_ - initBlance + _N(takeupBlance, 2));

}
var oneStop = 0.10;
var twopStop = 0.15;
var threeStop = 0.25;
var oneEffect = false;
var twoEffect = false;
var threeEffect = false;


function Checksurplus() {
    var currentPrice = GetTicker().Last;



}


function getHighLow(more) {

    var currentPrice = GetTicker().Last;
    var records = exchange.GetRecords(PERIOD_M1)
    asset.lowPrice = TA.Lowest(records, 49, 'Low');
    asset.highPrice = TA.Highest(records, 49, 'High');
    asset.middlePrice = (asset.lowPrice + asset.highPrice) / 2;
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
        if (currentPrice > asset.highPrice) {
            isContine = false
        }
    }
    return isContine;

}
var kTime = 0;
var DTime = 0;

/// 当前时间和前两分钟布林轨指数
function BOLLCheck(records) {

    if (records && records.length > 20) {
        var boll = TA.BOLL(records, 20, 2)
        //        var currrentPrice = GetTicker().Last; //当前价格
        var upLine = boll[0][records.length - 1]
        var midLine = boll[1][records.length - 1]
        var downLine = boll[2][records.length - 1]
        asset.highPrice = _N(upLine,2);
        asset.lowPrice =  _N(downLine,2);
        asset.middlePrice = _N(midLine,2);
        asset.buyPrice = _N((upLine + midLine)/2,2)
        asset.sellPrice = _N((midLine + downLine)/2,2)

    }

}

function onTicker() {
    var currentPrice = GetTicker().Last;
    var amount = 10;
    // var diffMidABS = Math.abs((asset.middlePrice - currentPrice))
    // if (currentPrice < asset.middlePrice && asset.sellAmount >= 1) {
    //     //1. -1
    //     cancleCoverOrders(ORDER_TYPE_SELL)
    //     var coverSellAmount = Math.round(diffMidABS / (asset.middlePrice - asset.lowPrice) + 1) * amount;
    //     if (coverSellAmount > asset.sellAmount) {
    //        coverSellAmount = asset.sellAmount
    //     }
    //     if (asset.sellAmount >= 10) {
    //         coverSellAmount = 5
    //     }
    //     if (asset.sellAmount >= 20) {
    //         coverSellAmount = 15;
    //     }
    //     if (asset.sellAmount >= 30) {
    //         coverSellAmount = 20;
    //     }
    //     closeSellAction(currentPrice,coverSellAmount)
    //     //2.
    // }
    // if (asset.buyAmount > 10 && (currentPrice - asset.openBuyPrice) >= 20) {
    //     var coverBuyAmount = 5;
    //     if (asset.buyAmount >= 10) {
    //         coverBuyAmount = 5
    //     }
    //      if (asset.buyAmount >= 20) {
    //         coverBuyAmount = 15;
    //     }
    //     if (asset.buyAmount >= 30) {
    //         coverBuyAmount = 20;
    //     }
    //     closeBuyAction(currentPrice,coverBuyAmount)
    // }
    // if (asset.sellAmount > 10 && (asset.openSellPrice - currentPrice) >= 20 ) {
    //     var coverSellAmount = 5;

    //     if (asset.sellAmount >= 10) {
    //         coverSellAmount = 5
    //     }
    //     if (asset.sellAmount >= 20) {
    //         coverSellAmount = 15;
    //     }
    //     if (asset.sellAmount >= 30) {
    //         coverSellAmount = 20;
    //     }
    //      closeSellAction(currentPrice,coverSellAmount)
    // }

    // if (currentPrice > asset.middlePrice && asset.buyAmount >= 1) {
    //     //2.  1
    //     cancleCoverOrders(ORDER_TYPE_BUY)
    //     var coverBuyAmount = Math.round(diffMidABS / (asset.highPrice - asset.middlePrice ) + 1) * amount;
    //      if (coverBuyAmount > asset.buyAmount) {
    //        coverBuyAmount = asset.buyAmount
    //     }
    //     if (asset.buyAmount >= 10) {
    //         coverBuyAmount = 5
    //     }
    //      if (asset.buyAmount >= 20) {
    //         coverBuyAmount = 15;
    //     }
    //     if (asset.buyAmount >= 30) {
    //         coverBuyAmount = 20;
    //     }
    //     closeBuyAction(currentPrice,coverBuyAmount)


    // }
    // && asset.buyAmount < 0.6
    // if (currentPrice <= asset.buyPrice && asset.buyAmount < 80 && dir == 1) {
    if (dir == 1) {

        //1.
        // if (asset.openBuyPrice <= currentPrice && asset.openBuyPrice > 0) {
        //     return
        // }
       // if (asset.highPrice <= currentPrice * 0.99) {
         //   Log('高位D，过滤')
           // return
        //}
        tickerCount = 0;
        cancleaddAction(ORDER_TYPE_BUY)
        // var buyAmount = Math.round((asset.buyPrice - currentPrice)/(asset.buyPrice - asset.lowPrice) + 1) * amount;
        // if ( asset.buyAmount > 0) {
        //     amount = 2 * asset.buyAmount;
        //     if (amount + asset.buyAmount > 160) {
        //         amount = 160 - asset.buyAmount;
        //     }

        //    if (asset.openBuyPrice - currentPrice < 400 || amount <= 0) {
        //        return
        //    }
        // }
        // if (asset.sellAmount > 0) {
        //     amount = 3 * asset.sellAmount;
        // }
        openAction("buy", currentPrice, amount)

    }
    //
    // if (currentPrice >= asset.sellPrice && asset.sellAmount < 80 && dir == -1) {
    if (dir == -1) {
        // if (asset.openSellPrice >= currentPrice && asset.openSellPrice > 0) {
        //     return
        // }
       // if (asset.lowPrice >= currentPrice * 0.99) {
         //   Log('高位K，过滤')
           // return
        //}
        tickerCount = 0;
        //2.
        cancleaddAction(ORDER_TYPE_SELL)
        //var sellAmount = Math.round((currentPrice - asset.sellPrice)/(asset.highPrice - asset.sellPrice) + 1) * amount;
        // if (asset.sellAmount > 0) {
        //     amount = 2 * asset.sellAmount
        //     if (amount + asset.sellAmount > 160) {
        //         amount = 160 - asset.sellAmount;
        //     }
        //    if (currentPrice - asset.openSellPrice  < 400 || amount <= 0) {
        //        return
        //    }
        // }
        // if (asset.buyAmount > 0) {
        //     amount = 3 * asset.buyAmount;
        // }
        openAction("sell", currentPrice, amount)
    }

    if (dir == 2) {
        Log("D止损")
        cancleCoverOrders(ORDER_TYPE_SELL)
        closeBuyAction(currentPrice, asset.buyAmount)

    }

    if (dir == -2) {
        Log("K止损")
            cancleCoverOrders(ORDER_TYPE_BUY)
            closeSellAction(currentPrice, asset.sellAmount)
    }

    Sleep(1000 * 60)

}
var dir_15 = '等待'

function getDirection() {
    //getHighLow(true)
    var records = exchange.GetRecords(PERIOD_M15) //4小时
    if (!records || records.length < 10) {
        Log('请求问题,休眠3s...')
        Sleep(1000 * 3)
        return;
    }
    var len = records.length - 1;
    var ma7 = TA.MA(records,7)[len]
    var ma15 = TA.MA(records,15)[len];
    var ma30 = TA.MA(records,30)[len];
    var ma72 = TA.MA(records,7)[len - 1]
    var ma152 = TA.MA(records,15)[len - 1];
    var ma302 = TA.MA(records,30)[len - 1];
    var lastPr = records[records.length -2].Close
    var currentPrice = GetTicker().Last * 1.01;
    var cci = getCCIValue(records)
    ccigy = cci;
    gyma5 = ma7;
    gyma15 = ma15
    gyma30 = ma30
    var macd = TA.MACD(records,7,14,9)

    var d = macd[2][records.length - 1];
    if (asset.buyAmount > 0 && asset.buyAmount < 60 && DTime - Date.parse(new Date()) > 1000 * 60 * 15 * 10 && cci > 0 && currentPrice < asset.openBuyPrice - 5) {
            Log('K补仓')
            return -1
        }
    if (ma7 > ma15 && ma72 < ma152 && (cci > 0) && (cci < 50) && d > 0 ) {
        if (DTime == 0) {
            kTime = 0
            DTime = Date.parse(new Date())
        }

        if (DTime - Date.parse(new Date()) > 1000 * 60 * 15 * 10) {
             Log('D线时间过长')
            return 0
        }
        // if (asset.buyAmount <= 0) {
        //     asset.stopLossDPrice = TA.Lowest(records, 10, 'Low');//止损价格
        // }
        //           if (cci > 50 && asset.openSellPrice < currentPrice - 50) {

        //   // if (asset.sellAmount > 20) {
        //     Log('突破最高价止损K')
        //     cancleCoverOrders(ORDER_TYPE_BUY)
        //     closeSellAction(currentPrice , asset.sellAmount)
        //     Sleep(1000 * 10)
        //             // openAction("buy", currentPrice + 10, 10)

        // }

        return 1;
    }
          if (lastPr > ma72 && lastPr > ma152 && asset.sellAmount < 0) {

          // if (asset.sellAmount > 20) {
            Log('突破最高价止损K')
            cancleCoverOrders(ORDER_TYPE_BUY)
            closeSellAction(currentPrice , asset.sellAmount)
            Sleep(1000 * 30)
                    // openAction("buy", currentPrice + 10, 10)

        }
        if  (lastPr < ma72 && lastPr < ma152 && asset.buyAmount < 0) {

        // if  (cci < -50 && asset.openBuyPrice > currentPrice - 50 && d < 0) {
            Log('突破最低价止损D')
                        var currentPrice = GetTicker().Last;
            cancleCoverOrders(ORDER_TYPE_SELL)
            closeBuyAction(currentPrice , asset.buyAmount)
            Sleep(1000 * 30)
                    // openAction("sell", currentPrice - 10, 10)

        }

    // if (cci < - 20 && asset.buyAmount > 0 && (currentPrice < ma7) && (currentPrice < ma15)) {
    //     return 2;//止损
    // }

    if ( asset.sellAmount > 0 && asset.sellAmount < 60 && kTime - Date.parse(new Date()) > 1000 * 60 * 15 * 10 && cci < 0 && currentPrice > asset.openSellPrice + 5) {
            Log('K补仓')
            return -1
        }

    if ( ma7 < ma15 && ma72 > ma152 && (cci < 0) && cci > - 50  && d < 0) {
        // if (asset.sellAmount <= 0) {
        //     asset.stopLossKPrice = TA.Lowest(records, 10, 'High');//止损价格
        // }
        if (kTime == 0) {
            DTime = 0
            kTime = Date.parse(new Date())
        }

        if (kTime - Date.parse(new Date()) > 1000 * 60 * 15 * 10) {
            Log('K线时间过长')
            return 0
        }
        // if (asset.buyAmount > 20) {
        //     Log('突破最低价止损D')
        //                 var currentPrice = GetTicker().Last;
        //     cancleCoverOrders(ORDER_TYPE_SELL)
        //     closeBuyAction(currentPrice - 5, asset.buyAmount)
        //     Sleep(1000 * 10)
        //             // openAction("sell", currentPrice - 10, 10)

        // }
        return -1;
    }

    // if (cci >  20 && asset.sellAmount > 0 && (currentPrice > ma7) && (currentPrice > ma15)) {

    //     return 2;//止损
    // }

    /*
    BOLLCheck(records)
    var macd = TA.MACD(records,7,14,9)

    var d = macd[2][records.length - 1];
    var d2 = macd[2][records.length - 2];
    var d3 = macd[2][records.length - 3];


    var records2 = exchange.GetRecords(PERIOD_M15) //4小时
    if (!records2 || records2.length < 10) {
        Log('请求问题,休眠3s...')
        Sleep(1000 * 3)
        return;
    }
    var macd2 = TA.MACD(records2,7,14,9)
    var d1_15 = macd2[2][records2.length - 1];
    var d2_15 = macd2[2][records2.length - 2];
    var d3_15 = macd2[2][records2.length - 3];
    if (d1_15 > 0) {
        dir_15 = '多'
    } else {
        dir_15 = '空'
    }
    var currentPrice = GetTicker().Last;
    if (d > 0 && d2 < 0 && d1_15 > 1) {
        if (d3_15 > d2_15 && d2_15 > d1_15 && d2_15 - d1_15 < 8.5) {
            Log('多即将转空')
            Sleep(1000 * 60)
            return 0;
        }
        if ( currentPrice >= asset.buyPrice) {
            Log(currentPrice,'高位禁开D',asset.buyPrice)
            Sleep(1000 * 60)
            return 0;
        }
        if (asset.sellAmount<0) {
            Log('转向止损K')
            closeSellAction(currentPrice + 5, asset.sellAmount)
        }
         var records2 = exchange.GetRecords(PERIOD_M1)
    if (!records2 || records2.length < 120) {
        Log('请求问题,休眠3s...')
        Sleep(1000 * 3)
        return;
    }
        asset.stopLossDPrice = TA.Lowest(records2, 120, 'Low');//止损价格
        return 1; //more
    }
    if (d < 0 && d2 > 0 && d1_15 < -1) {
        if (d3_15 < d2_15 && d2_15 < d1_15 && d1_15 - d2_15 < 8.5) {
            Log('空即将转多')
            Sleep(1000 * 60)
            return 0;
        }
        if ( currentPrice <= asset.sellPrice) {
            Log(currentPrice,'低位禁开K',asset.sellPrice)
            Sleep(1000 * 60)
            return 0;
        }
        if (asset.buyAmount < 0) {
            Log('转向止损D')
            closeBuyAction(currentPrice - 5, asset.buyAmount)

        }
            var records2 = exchange.GetRecords(PERIOD_M1)
    if (!records2 || records2.length < 120) {
        Log('请求问题,休眠3s...')
        Sleep(1000 * 3)
        return;
    }
        asset.stopLossKPrice = TA.Lowest(records2, 120, 'High');//止损价格
        return -1; //less
    }
    */
    return 0; //wait

}

function updateStatus() { //状态栏信息
    var table = {
        type: 'table',
        title: '交易对信息',
        cols: ['编号', '币种信息', '15分开仓方向', '当前价格', '周期最高价', '周期最低价', '周期中间价', '开多条件', '开多数量', '开多均价', '多止盈率','开多止损价', '开空条件', '开空数量', '开空均价', '空止盈率','开空止损价'],
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
        dir_15 + Success,
        currentPrice,
        _N(ccigy, 2),
        _N(gyma5, 2),
        _N(gyma15, 2),
        _N(gyma30, 2),
        asset.buyAmount + Danger,
        asset.openBuyPrice + Danger,
        initBuyProfile,
        asset.stopLossDPrice,
        _N(asset.sellPrice, 2),
        asset.sellAmount + Danger,
        asset.openSellPrice + Danger,
        initSellProfile,
        asset.stopLossKPrice
    ]);
    runTime = RuningTime()
    LogStatus( runTime.str + '\n' + "更新时间: " + toLocal() + '\n'  + '`' + JSON.stringify(table) + '`' + hasOrders())

}

function hasOrders() {
    var table = {
        type: 'table',
        title: '已存在限价委托',
        cols: ['编号', '限价类型', '下单价格', '下单数量', '成交数量'],
        rows: []
    };

    var orders = exchange.GetOrders()
    takeupBlance = 0
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

function openAction(type, price, count) {
    var tick = GetTicker(); //当前价格
    exchange.SetDirection(type)
    if (type == "buy") {
        // tradingCounter("buyNumber", 1);
        //容错防止一直开仓导致爆仓
        if (asset.buyAmount < 30) {
            exchange.Buy(price, _N(count, 2))
        }
    } else {
        //tradingCounter("sellNumber", 1);
        if (asset.sellAmount < 30) {
            exchange.Sell(price, _N(count, 2))
        }
    }
    Sleep(1000 * 60);
}

function cancleMintesAction(oredrType) {
    var orders = exchange.GetOrders()
    if (orders && orders.length > 0) {
        for (var i = 0; i < orders.length; i++) {
            var order = orders[i]
            if (order.Status != ORDER_STATE_PENDING) {
                continue;
            }
            if (order.Offset == ORDER_OFFSET_OPEN) {
                //开多 、开空
                // var orderTime = new Date(order.Info.timestamp).getTime()
                // if (order.Type == oredrType && adjustFloat(Date.now()) - orderTime > 1000 * 60 * 3) {
                    exchange.CancelOrder(order.Id)
                // }
            }
        }
    }
}

function adjustFloat(v) {
    return Math.floor(v * 100) / 100;
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

function closeSellAction(price, amount) {
    exchange.SetDirection("closesell")
    exchange.Buy(price, _N(amount, 2))
}

function closeBuyAction(price, amount) {
    exchange.SetDirection("closebuy")
    exchange.Sell(price, _N(amount, 2))
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

//1.一级 20
var stopBuyOne = false;
var stopSellOne = false;
var initBuyProfile = 50;
var initSellProfile = 50;

function calculateStopProfile() {



    if (asset.sellAmount <= 0 && asset.buyAmount <= 0) {

        stopSellOne = false;
        stopBuyOne = false;
        initBuyProfile = 50;
        initSellProfile = 50;
        return;
    }
    if (asset.sellAmount <= 0) {
        stopSellOne = false;
        initSellProfile = 50;
    }
    if (asset.buyAmount <= 0) {
        stopBuyOne = false;
        initBuyProfile = 50;
    }
    var currentPrice = GetTicker().Last;
    if (asset.buyAmount > 0) {
        var profile = ((currentPrice - asset.openBuyPrice) / asset.openBuyPrice) * 10000

        if (profile >= (initBuyProfile + 10)) {
            initBuyProfile = profile - 5;
        }

        if (profile >= initBuyProfile) {
            stopBuyOne = true;
        } else {
            if (stopBuyOne) {
                       if (profile < 10) {
                       stopBuyOne = false;
                        initBuyProfile = 50;
                       Log('回调过快D')
                        return
                       }
                //p
                cancleCoverOrders(ORDER_TYPE_SELL)
                closeBuyAction(currentPrice - 50, asset.buyAmount)
                Log('止盈触发D', profile,'触发价格:',currentPrice)
               //  Sleep(1000 * 60 * 10)
                stopBuyOne = false;
                initBuyProfile = 50;
            }
            
        }
    }

    if (asset.sellAmount > 0) {
        var profile = ((asset.openSellPrice - currentPrice) / asset.openSellPrice) * 10000

        if (profile >= (initSellProfile + 10)) {
            initSellProfile = profile - 5;
        }

        if (profile >= initSellProfile) {
            stopSellOne = true;
        } else {
            if (stopSellOne) {
                       if (profile < 10) {
                       Log('回调过快K')
                        stopSellOne = false;
                        initSellProfile = 50;
                        return
                       }
                //p
                cancleCoverOrders(ORDER_TYPE_BUY)
                closeSellAction(currentPrice + 50, asset.sellAmount)
                Log('止盈触发K', profile,'触发价格:',currentPrice)
                //Sleep(1000 * 60 * 10)
                stopSellOne = false;
                initSellProfile = 50;
            }
            return
        }
    }

     
}
var stopBuyLossTime = 0
var stopSellLossTime = 0
var stopISFisrstBLossTime = false;
var stopISFisrstSLossTime = false;

// function calculateStopLoss() {
//     var currentPrice = GetTicker().Last;
//     if (asset.buyAmount > 0 && asset.openBuyPrice > currentPrice) {
//         var profile = ((asset.openBuyPrice - currentPrice) / asset.openBuyPrice) * 10000

//         // if (profile >= 20) {
//         //     initBuyProfile = initBuyProfile + 15;
//         // }

//         if (profile >= 100) {
//             openAction("buy", currentPrice, amount * 2)
//             Sleep(1000 * 30)
//             cancleaddAction(ORDER_TYPE_BUY)
//             // var time = Date.parse(new Date())
//             // if (!stopISFisrstBLossTime) {
//             //     stopBuyLossTime = time;
//             // }
//             // stopISFisrstBLossTime = true;
//             // if (stopISFisrstBLossTime && (time - stopBuyLossTime > 3 * 1000 * 60)) {
//             //     //p
//             //     stopBuyLossTime = 0
//             //     stopISFisrstBLossTime = false;
//             //     cancleCoverOrders(ORDER_TYPE_BUY)
//             //     closeBuyAction(currentPrice - 5, asset.buyAmount)
//             //     Log('止损触发D', profile)
//             //     stopBuyOne = false;
//             //     initBuyProfile = 20;
//             // } else {
//             //     stopISFisrstBLossTime = 0;
//             //     stopISFisrstBLossTime = false;
//             // }
//     }
// }
//     if (asset.sellAmount > 0 && asset.openSellPrice < currentPrice) {
//         var profile = ((currentPrice - asset.openSellPrice) / asset.openSellPrice) * 10000
//         if (profile >= 20) {
//             openAction("sell", currentPrice, amount * 2)
//             Sleep(1000 * 30)
//             cancleaddAction(ORDER_TYPE_SELL)
//         //     var time = Date.parse(new Date())
//         //     if (!stopISFisrstSLossTime) {
//         //         stopSellLossTime = time;
//         //     }
//         //     stopISFisrstSLossTime = true;
//         //     if (stopISFisrstSLossTime && (time - stopSellLossTime > 3 * 1000 * 60)) {
//         //         //p
//         //         stopSellLossTime = 0;
//         //         stopISFisrstSLossTime = false;
//         //         cancleCoverOrders(ORDER_TYPE_SELL)
//         //         closeSellAction(currentPrice + 5, asset.sellAmount)
//         //         Log('止损触发K', initSellProfile)
//         //         stopSellOne = false;
//         //         initSellProfile = 20;
//         //     }
//         // } else {
//         //     stopSellLossTime = 0;
//         //     stopISFisrstSLossTime = false;
//         }
//     }


// }

function calculateStopLoss() {
    // var records = exchange.GetRecords(PERIOD_M1)
    // if (!records || records.length < 120) {
    //     Log('请求问题,休眠3s...')
    //     Sleep(1000 * 3)
    //     return;
    // }
                var currentPrice = GetTicker().Last;
//    if (asset.stopLossDPrice > currentPrice + 10) {

     if (asset.openBuyPrice > currentPrice + 60) {
        if (asset.buyAmount > 0) {
            Log('突破最低价止损D')
            cancleCoverOrders(ORDER_TYPE_SELL)
            closeBuyAction(currentPrice - 5, asset.buyAmount)
            Sleep(1000 * 10)
                    // openAction("sell", currentPrice - 10, 10)

        }
        // if (asset.buyAmount <= 0) {
        //     Log('突破最低价止损D')
        //     cancleCoverOrders(ORDER_TYPE_SELL)
        //     asset.stopLossKPrice = TA.Lowest(records, 120, 'High');//止损价格
        //                         openAction("sell", currentPrice - 10, 50)

        //     // closeBuyAction(currentPrice - 5, asset.buyAmount)
        //     Sleep(1000 * 10)


        // }
        
    }
//        if (asset.stopLossKPrice < currentPrice - 10) {

      if (asset.openSellPrice < currentPrice - 60) {
         if (asset.sellAmount > 0) {
            Log('突破最高价止损K')
            // var currentPrice = GetTicker().Last;
            cancleCoverOrders(ORDER_TYPE_BUY)
            closeSellAction(currentPrice + 5, asset.sellAmount)
            Sleep(1000 * 10)
                    // openAction("buy", currentPrice + 10, 10)

        }
        // if (asset.sellAmount <= 0) {
        //     Log('突破最高价止损K')
        //     // var currentPrice = GetTicker().Last;
        //     cancleCoverOrders(ORDER_TYPE_BUY)
        //     // closeSellAction(currentPrice + 5, asset.sellAmount)
        //             // asset.stopLossDPrice = TA.Lowest(records, 120, 'Low');//止损价格
        //                                 // openAction("buy", currentPrice + 10, 50)

        //     Sleep(1000 * 10)

        // }


    }


}

function RuningTime() {
    var ret = {};
    var dateBegin = new Date(StartTime());
    var dateEnd = new Date();
    var tmpHours = dateEnd.getHours();
    //dateEnd.setHours(tmpHours + 12); //时区+8
    var dateDiff = dateEnd.getTime() - dateBegin.getTime();
    var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));
    var leave1 = dateDiff % (24 * 3600 * 1000);
    var hours = Math.floor(leave1 / (3600 * 1000));
    var leave2 = leave1 % (3600 * 1000);
    var minutes = Math.floor(leave2 / (60 * 1000));
    ret.dayDiff = dayDiff;
    ret.hours = hours;
    ret.minutes = minutes;
    ret.str = "运行时间: " + dayDiff  + " 天 " + hours + " 小时 " + minutes + " 分钟";
    return ret;
}

function StartTime() {
    var StartTime = _G("StartTime");
    if (StartTime == null) {
        StartTime = _D();
        _G("StartTime", StartTime);
    }
    return StartTime;
}

function toLocal() {
  // 确保date 最终为Date object
  var date = new Date();
  var local = date.toLocaleString('cn', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return local;
};

function getCCIValue(records,isD) {
    var cci = talib.CCI(records, 14)

    // var count = 0;
    // for (var i = 0; i < 10; i++) {
    //     if (cci[records.length - 1 - i] > 0 && isD) {
    //         count += 1;
    //     }
    //     if (cci[records.length - 1 - i] < 0 && !isD) {
    //         count += 1;
    //     }
    // }
    // if (count > 5) {
        return cci[records.length - 1]
    // }
    // return 0;

}

// function getCCIValue2(records) {
//     var cci = talib.CCI(records, 14)
//     return cci[records.length - 1]
// }







//                             Alpha = 0.03 //指数移动平局的Alpha参数，设置的越大，基准价格跟踪越敏感，最终持仓也会越低，降低了杠杆，但会降低收益，具体需要根据回测结果自己权衡
//                             Update_base_price_time_interval = 30*60 //多久更新一次基准价格, 单位秒，和Alpha参数相关,Alpha 设置的越小，这个间隔也可以设置的更小
//
//                             if(IsVirtual()){
//                                 throw '不能回测，回测参考 https://www.fmz.com/digest-topic/5294 '
//                             }
//                             if(exchange.GetName() != 'Futures_Binance'){
//                                 throw '只支持币安期货交易所，和现货交易所不同，需要单独添加，名称为Futures_Binance'
//                             }
//                             var trade_symbols = Trade_symbols.split(',')
//                             var symbols = trade_symbols
//                             var index = 1 //指数
//                             if(trade_symbols.indexOf('BTC')<0){
//                                 symbols = trade_symbols.concat(['BTC'])
//                             }
//                             var update_profit_time = 0
//                             var update_base_price_time= Date.now()
//                             var assets = {}
//                             var init_prices = {}
//
//
//                             var trade_info = {}
//                             var exchange_info = HttpQuery('https://fapi.binance.com/fapi/v1/exchangeInfo')
//                             if(!exchange_info){
//                                 throw '无法连接币安网络，需要海外托管者'
//                             }
//                             exchange_info = JSON.parse(exchange_info)
//                             for (var i=0; i<exchange_info.symbols.length; i++){
//                                 if(symbols.indexOf(exchange_info.symbols[i].baseAsset) > -1){
//                                    assets[exchange_info.symbols[i].baseAsset] = {amount:0, hold_price:0, value:0, bid_price:0, ask_price:0,
//                                                                                  btc_price:0, btc_change:1,btc_diff:0,
//                                                                                  realised_profit:0, margin:0, unrealised_profit:0}
//                                    trade_info[exchange_info.symbols[i].baseAsset] = {minQty:parseFloat(exchange_info.symbols[i].filters[1].minQty),
//                                                                                      priceSize:parseInt((Math.log10(1.1/parseFloat(exchange_info.symbols[i].filters[0].tickSize)))),
//                                                                                      amountSize:parseInt((Math.log10(1.1/parseFloat(exchange_info.symbols[i].filters[1].stepSize))))
//                                                                                     }
//                                 }
//                             }
//                             assets.USDT = {unrealised_profit:0, margin:0, margin_balance:0, total_balance:0, leverage:0, update_time:0}
//
//                             function updateAccount(){ //更新账户和持仓
//                                 var account = exchange.GetAccount()
//                                 var pos = exchange.GetPosition()
//                                 if (account == null || pos == null ){
//                                     Log('update account time out')
//                                     return
//                                 }
//                                 assets.USDT.update_time = Date.now()
//                                 for(var i=0; i<trade_symbols.length; i++){
//                                     assets[trade_symbols[i]].margin = 0
//                                     assets[trade_symbols[i]].unrealised_profit = 0
//                                     assets[trade_symbols[i]].hold_price = 0
//                                     assets[trade_symbols[i]].amount = 0
//                                     assets[trade_symbols[i]].unrealised_profit = 0
//                                 }
//                                 for(var j=0; j<account.Info.positions.length; j++){
//                                     var pair = account.Info.positions[j].symbol
//                                     var coin = pair.slice(0,pair.length-4)
//                                     if(symbols.indexOf(coin) < 0){continue}
//                                     assets[coin].margin = parseFloat(account.Info.positions[j].initialMargin) + parseFloat(account.Info.positions[j].maintMargin)
//                                     assets[coin].unrealised_profit = parseFloat(account.Info.positions[j].unrealizedProfit)
//                                 }
//                                 assets.USDT.margin = _N(parseFloat(account.Info.totalInitialMargin) + parseFloat(account.Info.totalMaintMargin),2)
//                                 assets.USDT.margin_balance = _N(parseFloat(account.Info.totalMarginBalance),2)
//                                 assets.USDT.total_balance = _N(parseFloat(account.Info.totalWalletBalance),2)
//                                 assets.USDT.unrealised_profit = _N(parseFloat(account.Info.totalUnrealizedProfit),2)
//                                 assets.USDT.leverage = _N(assets.USDT.margin/assets.USDT.total_balance,2)
//                                 pos = JSON.parse(exchange.GetRawJSON())
//                                 if(pos.length > 0){
//                                     for(var k=0; k<pos.length; k++){
//                                         var pair = pos[k].symbol
//                                         var coin = pair.slice(0,pair.length-4)
//                                         if(symbols.indexOf(coin) < 0){continue}
//                                         assets[coin].hold_price = parseFloat(pos[k].entryPrice)
//                                         assets[coin].amount = parseFloat(pos[k].positionAmt)
//                                         assets[coin].unrealised_profit = parseFloat(pos[k].unRealizedProfit)
//                                     }
//                                 }
//                             }
//
//                             function updateIndex(){ //更新指数
//                                 
//                                 if(!_G('init_prices') || Reset){
//                                     Reset = false
//                                     for(var i=0; i<trade_symbols.length; i++){
//                                         init_prices[trade_symbols[i]] = (assets[trade_symbols[i]].ask_price+assets[trade_symbols[i]].bid_price)/(assets.BTC.ask_price+assets.BTC.bid_price)
//                                     }
//                                     Log('保存启动时的价格')
//                                     _G('init_prices',init_prices)
//                                 }else{
//                                     init_prices = _G('init_prices')
//                                     if(Date.now() - update_base_price_time > Update_base_price_time_interval*1000){
//                                         update_base_price_time = Date.now()
//                                         for(var i=0; i<trade_symbols.length; i++){ //更新初始价格
//                                             init_prices[trade_symbols[i]] = init_prices[trade_symbols[i]]*(1-Alpha)+Alpha*(assets[trade_symbols[i]].ask_price+assets[trade_symbols[i]].bid_price)/(assets.BTC.ask_price+assets.BTC.bid_price)
//                                         }
//                                         _G('init_prices',init_prices)
//                                         //Log(init_prices)
//                                         Log('更新了一次基准价格')
//                                     }
//                                     var temp = 0
//                                     for(var i=0; i<trade_symbols.length; i++){
//                                         assets[trade_symbols[i]].btc_price =  (assets[trade_symbols[i]].ask_price+assets[trade_symbols[i]].bid_price)/(assets.BTC.ask_price+assets.BTC.bid_price)
//                                         if(!(trade_symbols[i] in init_prices)){
//                                             Log('添加新的币种',trade_symbols[i])
//                                             init_prices[trade_symbols[i]] = assets[trade_symbols[i]].btc_price
//                                             _G('init_prices',init_prices)
//                                         }
//                                         assets[trade_symbols[i]].btc_change = _N(assets[trade_symbols[i]].btc_price/init_prices[trade_symbols[i]],4)
//                                         temp += assets[trade_symbols[i]].btc_change
//                                     }
//                                     index = _N(temp/trade_symbols.length, 4)
//                                 }
//                                 
//                             }
//
//                             function updateTick(){ //更新行情
//                                 var ticker = HttpQuery('https://fapi.binance.com/fapi/v1/ticker/bookTicker')
//                                 try {
//                                     ticker = JSON.parse(ticker)
//                                 }catch(e){
//                                     Log('get ticker time out')
//                                     return
//                                 }
//                                 for(var i=0; i<ticker.length; i++){
//                                     var pair = ticker[i].symbol
//                                     var coin = pair.slice(0,pair.length-4)
//                                     if(symbols.indexOf(coin) < 0){continue}
//                                     assets[coin].ask_price = parseFloat(ticker[i].askPrice)
//                                     assets[coin].bid_price = parseFloat(ticker[i].bidPrice)
//                                     assets[coin].ask_value = _N(assets[coin].amount*assets[coin].ask_price, 2)
//                                     assets[coin].bid_value = _N(assets[coin].amount*assets[coin].bid_price, 2)
//                                 }
//                                 updateIndex()
//                                 for(var i=0; i<trade_symbols.length; i++){
//                                     assets[trade_symbols[i]].btc_diff = _N(assets[trade_symbols[i]].btc_change - index, 4)
//                                 }
//                             }
//
//
//
//                             function trade(symbol, dirction, value){ //交易
//                                 if(Date.now()-assets.USDT.update_time > 10*1000){
//                                     Log('更新账户延时，不交易')
//                                     return
//                                 }
//                                 var price = dirction == 'sell' ? assets[symbol].bid_price : assets[symbol].ask_price
//                                 var amount = _N(Math.min(value,Ice_value)/price, trade_info[symbol].amountSize)
//                                 if(amount < trade_info[symbol].minQty){
//                                     Log(symbol, '合约价值偏离或冰山委托订单的大小设置过小，达不到最小成交, 至少需要: ', _N(trade_info[symbol].minQty*price,0)+1)
//                                     return
//                                 }
//                                 exchange.IO("currency", symbol+'_'+'USDT')
//                                 exchange.SetContractType('swap')
//                                 exchange.SetDirection(dirction)
//                                 var f = dirction == 'buy' ? 'Buy' : 'Sell'
//                                 var id = exchange[f](price, amount, symbol)
//                                 if(id){
//                                     exchange.CancelOrder(id) //订单会立即撤销
//                                 }
//                             }
//
//
//
//                             function updateStatus(){ //状态栏信息
//                                     var table = {type: 'table', title: '交易对信息',
//                                          cols: ['币种', '数量', '持仓价格',  '当前价格', '偏离平均', '持仓价值', '保证金', '未实现盈亏'],
//                                          rows: []}
//                                 for (var i=0; i<symbols.length; i++){
//                                     var price = _N((assets[symbols[i]].ask_price + assets[symbols[i]].bid_price)/2, trade_info[symbols[i]].priceSize)
//                                     var value = _N((assets[symbols[i]].ask_value + assets[symbols[i]].bid_value)/2, 2)
//                                     var infoList = [symbols[i], assets[symbols[i]].amount, assets[symbols[i]].hold_price, price, assets[symbols[i]].btc_diff, value, _N(assets[symbols[i]].margin,3), _N(assets[symbols[i]].unrealised_profit,3)]
//                                     table.rows.push(infoList)
//                                 }
//                                 var logString = _D() + '   ' + JSON.stringify(assets.USDT) + ' Index:' + index + '\n'
//                                 LogStatus(logString + '`' + JSON.stringify(table) + '`')
//                                 
//                                 if(Date.now()-update_profit_time > Log_profit_interval*1000){
//                                     LogProfit(_N(assets.USDT.margin_balance,3))
//                                     update_profit_time = Date.now()
//                                 }
//                                 
//                             }
//
//                             function onTick(){ //策略逻辑部分
//                                 for(var i=0; i<trade_symbols.length; i++){
//                                     var symbol = trade_symbols[i]
//                                     if(assets[symbol].ask_price == 0){ continue }
//                                     var aim_value = -Trade_value * _N(assets[symbol].btc_diff/0.01,1)
//                                     if(aim_value - assets[symbol].ask_value > Adjust_value){
//                                         trade(symbol,'buy', aim_value - assets[symbol].ask_value)
//                                     }
//                                     if(aim_value - assets[symbol].bid_value < -Adjust_value){
//                                         trade(symbol,'sell', -(aim_value - assets[symbol].bid_value))
//                                     }
//                                 }
//                             }
//
//                             function main() {
//                                 while(true){
//                                     updateAccount()
//                                     updateTick()
//                                     onTick()
//                                     updateStatus()
//                                     Sleep(Interval*1000)
//                                 }
//                             }





/*
 * @Description: 加分号版,首先这是一个山寨版,添加的功能已经在下面,没有动过逻辑上的内容
 * @Version: 0.1.3
 * @Author: RedSword
 * @Email: redsword@gamil.com
 * @Date: 2020-04-10 11:48:38
 * @LastEditors: Home RedSword
 * @LastEditTime: 2020-04-18 19:49:28
 *
 * 运行之前,一定要仔细的看草神的文章,地址 https://www.fmz.com/strategy/195226
 *
 * 添加功能
 *
 * 2020-04-18
 * 1.添加草神的均衡对冲功能
 * 2.修改了默认Alpha值和基准价格更新时间,Alpha改为了0.001,基准价格更新时间改为了1分钟
 * 3.添加强平距离以及百分比
 * 4.修改偏离平均和各币种的预估胜率放到了币指数信息里
 * 5.屏蔽了Log收益的功能,省点空间
 *
 * 2020-04-16
 * 1.修复了月亮走我也走的BUG
 * 2.修复了添加新币种出错的BUG
 *
 * 2020-04-15
 * 1.添加账户资产信息
 * 2.添加币种指数信息
 * 3.添加各币种的胜率
 * 4.添加单币种投降功能
 * 5.感谢fmzero开源的代码
 *
 * 2020-04-13
 * 1.添加交易相关的统计,感谢豆子开源的代码
 * 2.带预估字样的,都是不准的,只能做大概的参考
 * 3.加入草神最新的止损逻辑
 * 4.删除原有Max_amount的止损方法
 * 5.添加显示绝对收益的开关
 * 6.显示原版策略的提示,在盈利统计加了止损的提示
 *
 * 2020-04-12
 * 1.添加了最大开仓量限制,0为不限制
 * 2.持仓价值显示绝对值,不显负号
 * 3.显示当前币种杠杆倍数和持仓强平价格
 * 4.添加币种的开仓模式,全仓或者逐仓
 * 5.修正重置不起作用的BUG
 * 6.修改运行时间不准的BUG
 * 7.修改保证金显示,和官方一至
 * 8.保证金不显示比例,改为比率,和官方一至
 *
 * 2020-04-10
 * 1.给强迫症加了分号
 * 2.添加了盈利统计
 * 3.添加了开仓方向,并对持仓方向和持仓盈亏做了颜色区分
 */

var Alpha = 0.001; //指数移动平均的Alpha参数，设置的越大，基准价格跟踪越敏感，最终持仓也会越低，降低了杠杆，但会降低收益，具体需要根据回测结果自己权衡
var Update_base_price_time_interval = 60; //多久更新一次基准价格, 单位秒，和Alpha参数相关,Alpha 设置的越小，这个间隔也可以设置的更小



//Stop_loss设置为0.8表示当资金达到低于初始资金的80%时，止损，清空所有仓位，停止策略。
//随着策略运行，Stop_loss可以设置大于1（重启生效），比如从1000赚到1500，Stop_loss设置为1.3，则回撤到1300元止损。不想止损可以把这个参数设置的很小。
//风险是大家都用这种止损会形成踩踏，加大亏损。
//初始资金在状态栏的init_balance字段，注意提现等操作会影响，别不小心止损了。
//如果还是怕黑天鹅事件，比如某个币归0等，可以手动提现出来。

var Stop_loss = 0.8;
var Max_diff = 0.4; //当偏差diff大于0.4时，不继续加空仓, 自行设置
var Min_diff = -0.3; //当diff小于-0.3时，不继续加多仓, 自行设置

var Version = '0.1.3';
var Show = false; //默认为false累计收益显示是账户余额,改为true累计收益显示为收益,如果之前是显示的账户余额,你使用LogProfitReset()来清空图表
var Funding = 0; //账户初始金额,为0的时候,自动获取,非0为自定义
var Success = '#5cb85c'; //成功颜色
var Danger = '#ff0000'; //危险颜色
var Warning = '#f0ad4e'; //警告颜色
var RunTime; //运行时间
var SelfFee = '0.04'; //https://www.binance.com/cn/fee/futureFee
var TotalLong;
var TotalShort;
var UpProfit = 0;
var accountAssets = []; //保存资产
var WinRateData = {}; //保存所有币种的胜率及开仓次数

if (IsVirtual()) {
    throw '不能回测，回测参考 https://www.fmz.com/digest-topic/5294 ';
}
if (exchange.GetName() != 'Futures_Binance') {
    throw '只支持币安期货交易所，和现货交易所不同，需要单独添加，名称为Futures_Binance';
}
var trade_symbols = Trade_symbols.split(',');
var symbols = trade_symbols;
var index = 1; //指数
if (trade_symbols.indexOf('BTC') < 0) {
    symbols = trade_symbols.concat(['BTC']);
}
var update_profit_time = 0;
var update_base_price_time = Date.now();
var assets = {};
var init_prices = {};
var trade_info = {};

function init() {
    InitRateData();
    var exchange_info = HttpQuery('https://fapi.binance.com/fapi/v1/exchangeInfo');
    if (!exchange_info) {
        throw '无法连接币安网络，需要海外托管者';
    }
    exchange_info = JSON.parse(exchange_info);
    for (var i = 0; i < exchange_info.symbols.length; i++) {
        if (symbols.indexOf(exchange_info.symbols[i].baseAsset) > -1) {
            assets[exchange_info.symbols[i].baseAsset] = {
                amount: 0,
                hold_price: 0,
                value: 0,
                bid_price: 0,
                ask_price: 0,
                btc_price: 0,
                btc_change: 1,
                btc_diff: 0,
                realised_profit: 0,
                margin: 0,
                unrealised_profit: 0,
                leverage: 20,
                positionInitialMargin: 0,
                liquidationPrice: 0
            };
            trade_info[exchange_info.symbols[i].baseAsset] = {
                minQty: parseFloat(exchange_info.symbols[i].filters[1].minQty),
                priceSize: parseInt((Math.log10(1.1 / parseFloat(exchange_info.symbols[i].filters[0].tickSize)))),
                amountSize: parseInt((Math.log10(1.1 / parseFloat(exchange_info.symbols[i].filters[1].stepSize))))
            };
        }
    }
}
assets.USDT = {
    unrealised_profit: 0,
    margin: 0,
    margin_balance: 0,
    total_balance: 0,
    leverage: 0,
    update_time: 0,
    margin_ratio: 0,
    init_balance: 0,
    stop_balance: 0,
    short_value: 0,
    long_value: 0,
    profit: 0
};

function updateAccount() { //更新账户和持仓
    var account = exchange.GetAccount();
    var pos = exchange.GetPosition();
    if (account == null || pos == null) {
        Log('update account time out');
        return;
    }
    accountAssets = account.Info.assets;
    assets.USDT.update_time = Date.now();
    for (var i = 0; i < trade_symbols.length; i++) {
        assets[trade_symbols[i]].margin = 0;
        assets[trade_symbols[i]].unrealised_profit = 0;
        assets[trade_symbols[i]].hold_price = 0;
        assets[trade_symbols[i]].amount = 0;
    }
    for (var j = 0; j < account.Info.positions.length; j++) {
        if (account.Info.positions[j].positionSide == 'BOTH') {
            var pair = account.Info.positions[j].symbol;
            var coin = pair.slice(0, pair.length - 4);
            if (trade_symbols.indexOf(coin) < 0) {
                continue;
            }
            assets[coin].margin = parseFloat(account.Info.positions[j].initialMargin) + parseFloat(account.Info.positions[j].maintMargin);
            assets[coin].unrealised_profit = parseFloat(account.Info.positions[j].unrealizedProfit);
            assets[coin].positionInitialMargin = parseFloat(account.Info.positions[j].positionInitialMargin);
            assets[coin].leverage = account.Info.positions[j].leverage;
        }
    }
    assets.USDT.margin = _N(parseFloat(account.Info.totalInitialMargin) + parseFloat(account.Info.totalMaintMargin), 2);
    assets.USDT.margin_balance = _N(parseFloat(account.Info.totalMarginBalance), 2);
    assets.USDT.total_balance = _N(parseFloat(account.Info.totalWalletBalance), 2);
    if (assets.USDT.init_balance == 0) {
        if (_G('init_balance')) {
            assets.USDT.init_balance = _N(_G('init_balance'), 2);
        } else {
            assets.USDT.init_balance = assets.USDT.total_balance;
            _G('init_balance', assets.USDT.init_balance);
        }
    }
    assets.USDT.profit = _N(assets.USDT.margin_balance - assets.USDT.init_balance, 2);
    assets.USDT.stop_balance = _N(Stop_loss * assets.USDT.init_balance, 2);
    assets.USDT.total_balance = _N(parseFloat(account.Info.totalWalletBalance), 2);
    assets.USDT.unrealised_profit = _N(parseFloat(account.Info.totalUnrealizedProfit), 2);
    assets.USDT.leverage = _N(assets.USDT.margin / assets.USDT.total_balance, 2);
    assets.USDT.margin_ratio = (account.Info.totalMaintMargin / account.Info.totalMarginBalance * 100);
    pos = JSON.parse(exchange.GetRawJSON());
    if (pos.length > 0) {
        for (var k = 0; k < pos.length; k++) {
            var pair = pos[k].symbol;
            var coin = pair.slice(0, pair.length - 4);
            if (trade_symbols.indexOf(coin) < 0) {
                continue;
            }
            if (pos[k].positionSide != 'BOTH') {
                continue;
            }
            assets[coin].hold_price = parseFloat(pos[k].entryPrice);
            assets[coin].amount = parseFloat(pos[k].positionAmt);
            assets[coin].unrealised_profit = parseFloat(pos[k].unRealizedProfit);
            assets[coin].liquidationPrice = parseFloat(pos[k].liquidationPrice);
            assets[coin].marginType = pos[k].marginType;
        }
    }
}

function updateIndex() { //更新指数
    if (!_G('init_prices') || Reset) {
        Reset = false;
        for (var i = 0; i < trade_symbols.length; i++) {
            init_prices[trade_symbols[i]] = (assets[trade_symbols[i]].ask_price + assets[trade_symbols[i]].bid_price) / (assets.BTC.ask_price + assets.BTC.bid_price);
        }
        Log('保存启动时的价格');
        _G('init_prices', init_prices);
        _G("StartTime", null); //重置开始时间
        _G("initialAccount_" + exchange.GetLabel(), null); //重置开始资金
        _G("tradeNumber", null); //重置交易次数
        _G("tradeVolume", null); //重置交易量
        _G("buyNumber", null); //重置做多次数
        _G("sellNumber", null); //重置做空次数
        _G("totalProfit", null); //重置打印次数
        _G("profitNumber", null); //重置盈利次数
    } else {
        init_prices = _G('init_prices');
        if (Date.now() - update_base_price_time > Update_base_price_time_interval * 1000) {
            update_base_price_time = Date.now();
            for (var i = 0; i < trade_symbols.length; i++) { //更新初始价格
                init_prices[trade_symbols[i]] = init_prices[trade_symbols[i]] * (1 - Alpha) + Alpha * (assets[trade_symbols[i]].ask_price + assets[trade_symbols[i]].bid_price) / (assets.BTC.ask_price + assets.BTC.bid_price);
            }
            _G('init_prices', init_prices);
        }
        var temp = 0;
        for (var i = 0; i < trade_symbols.length; i++) {
            assets[trade_symbols[i]].btc_price = (assets[trade_symbols[i]].ask_price + assets[trade_symbols[i]].bid_price) / (assets.BTC.ask_price + assets.BTC.bid_price);
            if (!(trade_symbols[i] in init_prices)) {
                Log('添加新的币种', trade_symbols[i]);
                init_prices[trade_symbols[i]] = assets[trade_symbols[i]].btc_price;
                _G('init_prices', init_prices);
            }
            assets[trade_symbols[i]].btc_change = _N(assets[trade_symbols[i]].btc_price / init_prices[trade_symbols[i]], 4);
            temp += assets[trade_symbols[i]].btc_change;
        }
        index = _N(temp / trade_symbols.length, 4);
    }

}

function updateTick() { //更新行情
    var ticker = HttpQuery('https://fapi.binance.com/fapi/v1/ticker/bookTicker');
    try {
        ticker = JSON.parse(ticker);
    } catch (e) {
        Log('get ticker time out');
        return;
    }
    assets.USDT.short_value = 0;
    assets.USDT.long_value = 0;
    for (var i = 0; i < ticker.length; i++) {
        var pair = ticker[i].symbol;
        var coin = pair.slice(0, pair.length - 4);
        if (symbols.indexOf(coin) < 0) {
            continue;
        }
        assets[coin].ask_price = parseFloat(ticker[i].askPrice);
        assets[coin].bid_price = parseFloat(ticker[i].bidPrice);
        assets[coin].ask_value = _N(assets[coin].amount * assets[coin].ask_price, 2);
        assets[coin].bid_value = _N(assets[coin].amount * assets[coin].bid_price, 2);
        if (trade_symbols.indexOf(coin) < 0) {
            continue;
        }
        if (assets[coin].amount < 0) {
            assets.USDT.short_value += Math.abs((assets[coin].ask_value + assets[coin].bid_value) / 2);
        } else {
            assets.USDT.long_value += Math.abs((assets[coin].ask_value + assets[coin].bid_value) / 2);
        }
        assets.USDT.short_value = _N(assets.USDT.short_value, 0);
        assets.USDT.long_value = _N(assets.USDT.long_value, 0);
    }
    updateIndex();
    for (var i = 0; i < trade_symbols.length; i++) {
        assets[trade_symbols[i]].btc_diff = _N(assets[trade_symbols[i]].btc_change - index, 4);
    }
}



function trade(symbol, dirction, value) { //交易
    if (Date.now() - assets.USDT.update_time > 10 * 1000) {
        Log('更新账户延时，不交易');
        return;
    }
    var price = dirction == 'sell' ? assets[symbol].bid_price : assets[symbol].ask_price;
    var amount = _N(Math.min(value, Ice_value) / price, trade_info[symbol].amountSize);
    if (amount < trade_info[symbol].minQty) {
        Log(symbol, '合约价值偏离或冰山委托订单的大小设置过小，达不到最小成交, 至少需要: ', _N(trade_info[symbol].minQty * price, 0) + 1);
        return;
    }
    exchange.IO("currency", symbol + '_' + 'USDT');
    exchange.SetContractType('swap');
    exchange.SetDirection(dirction);
    var f = dirction == 'buy' ? 'Buy' : 'Sell';
    var id = exchange[f](price, amount, symbol);
    if (id) {
        exchange.CancelOrder(id); //订单会立即撤销
    }
    tradingCounter("tradeVolume", price * amount); //保存交易量
    tradingCounter("tradeNumber", 1); //保存交易次数
    WinRateData[symbol].tradeNumber += 1;
    if (dirction == 'buy') {
        tradingCounter("buyNumber", 1);
        WinRateData[symbol].buyNumber += 1;
    } else {
        tradingCounter("sellNumber", 1);
        WinRateData[symbol].sellNumber += 1;
    }
    _G("WinRateData", WinRateData); //保存各币种的交易数据
    return id;
}

function InitRateData() {
    if (Reset) {
        _G("WinRateData", null);
    }
    if (_G("WinRateData")) {
        WinRateData = _G("WinRateData");
    }
    for (var i = 0; i < symbols.length; i++) {
        if (typeof WinRateData[symbols[i]] == 'undefined') {
            WinRateData[symbols[i]] = {
                totalProfit: 0, //统计次数
                profitNumber: 0, //盈利次数
                tradeNumber: 0, //交易次数
                buyNumber: 0, //做多次数
                sellNumber: 0 //做空次数
            };
        }
    }
    _G("WinRateData", WinRateData);
}

function RunCommand() {
    var str_cmd = GetCommand();
    if (str_cmd) {
        var arrCmd = str_cmd.split(':');
        var symbol = arrCmd[1];
        var amount = parseFloat(arrCmd[2]);
        if (amount == 0) {
            Log('亲,你还记得大明湖畔的乔碧萝吗?' + Danger);
            return;
        }
        var f = amount < 0 ? 'Buy' : 'Sell';
        var dirction = amount < 0 ? 'buy' : 'sell';
        exchange.IO("currency", symbol + '_' + 'USDT');
        exchange.SetContractType('swap');
        exchange.SetDirection(dirction);
        exchange[f](-1, Math.abs(amount), symbol);
    }
}

function FirstAccount() {
    var key = "initialAccount_" + exchange.GetLabel();
    var initialAccount = _G(key);
    if (initialAccount == null) {
        initialAccount = exchange.GetAccount();
        _G(key, initialAccount);
    }
    return initialAccount;
}

function StartTime() {
    var StartTime = _G("StartTime");
    if (StartTime == null) {
        StartTime = _D();
        _G("StartTime", StartTime);
    }
    return StartTime;
}

function RuningTime() {
    var ret = {};
    var dateBegin = new Date(StartTime());
    var dateEnd = new Date(_D());
    var dateDiff = dateEnd.getTime() - dateBegin.getTime();
    var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));
    var leave1 = dateDiff % (24 * 3600 * 1000);
    var hours = Math.floor(leave1 / (3600 * 1000));
    var leave2 = leave1 % (3600 * 1000);
    var minutes = Math.floor(leave2 / (60 * 1000));
    ret.dayDiff = dayDiff;
    ret.hours = hours;
    ret.minutes = minutes;
    ret.str = "运行时间: " + dayDiff + " 天 " + hours + " 小时 " + minutes + " 分钟";
    return ret;
}

function AppendedStatus() {
    var accountTable = {
        type: "table",
        title: "盈利统计",
        cols: ["运行天数", "初始资金", "现有资金", "保证金余额", "已用保证金", "保证金比率", "止损", "总收益", "预计年化", "预计月化", "平均日化"],
        rows: []
    };
    var feeTable = {
        type: 'table',
        title: '交易统计',
        cols: ["策略指数", '交易次数', '做多次数', '做空次数', '预估胜率', '预估成交额', '预估手续费', "未实现盈利", '持仓总值', '做多总值', '做空总值'],
        rows: []
    };
    var runday = RunTime.dayDiff;
    if (runday == 0) {
        runday = 1;
    }
    if (Funding == 0) {
        Funding = parseFloat(FirstAccount().Info.totalWalletBalance);
    }
    var profitColors = Danger;
    var totalProfit = assets.USDT.total_balance - Funding; //总盈利
    if (totalProfit > 0) {
        profitColors = Success;
    }
    var dayProfit = totalProfit / runday; //天盈利
    var dayRate = dayProfit / Funding * 100;
    accountTable.rows.push([
        runday,
        '$' + _N(Funding, 2),
        '$' + assets.USDT.total_balance,
        '$' + assets.USDT.margin_balance,
        '$' + assets.USDT.margin,
        _N(assets.USDT.margin_ratio, 2) + '%',
        _N(assets.USDT.stop_balance, 2) + Danger,
        _N(totalProfit / Funding * 100, 2) + "% = $" + _N(totalProfit, 2) + (profitColors),
        _N(dayRate * 365, 2) + "% = $" + _N(dayProfit * 365, 2) + (profitColors),
        _N(dayRate * 30, 2) + "% = $" + _N(dayProfit * 30, 2) + (profitColors),
        _N(dayRate, 2) + "% = $" + _N(dayProfit, 2) + (profitColors)
    ]);
    var vloume = _G("tradeVolume") ? _G("tradeVolume") : 0;
    feeTable.rows.push([
        index, //指数
        _G("tradeNumber") ? _G("tradeNumber") : 0, //交易次数
        _G("buyNumber") ? _G("buyNumber") : 0, //做多次数
        _G("sellNumber") ? _G("sellNumber") : 0, //做空次数
        _N(_G("profitNumber") / _G("totalProfit") * 100, 2) + '%', //胜率
        '$' + _N(vloume, 2) + ' ≈ ฿' + _N(vloume / ((assets.BTC.bid_price + assets.BTC.ask_price) / 2), 6), //成交金额
        '$' + _N(vloume * (SelfFee / 100), 4), //手续费
        '$' + _N(assets.USDT.unrealised_profit, 2) + (assets.USDT.unrealised_profit >= 0 ? Success : Danger),
        '$' + _N(TotalLong + Math.abs(TotalShort), 2), //持仓总价值
        '$' + _N(TotalLong, 2) + Success, //做多总值
        '$' + _N(Math.abs(TotalShort), 2) + Danger, //做空总值
    ]);
    var assetTable = {
        type: 'table',
        title: '账户资产信息',
        cols: ['编号', '资产名', '起始保证金', '维持保证金', '保证金余额', '最大可提款金额', '挂单起始保证金', '持仓起始保证金', '持仓未实现盈亏', '账户余额'],
        rows: []
    };
    for (var i = 0; i < accountAssets.length; i++) {
        var acc = accountAssets[i];
        assetTable.rows.push([
            i + 1,
            acc.asset, acc.initialMargin, acc.maintMargin, acc.marginBalance,
            acc.maxWithdrawAmount, acc.openOrderInitialMargin, acc.positionInitialMargin,
            acc.unrealizedProfit, acc.walletBalance
        ]);
    }
    var indexTable = {
        type: 'table',
        title: '币指数信息',
        cols: ['编号', '币种信息', '当前价格', 'BTC计价', 'BTC计价变化(%)', '偏离平均', '交易次数', '做空次数', '做多次数', '预估胜率'],
        rows: []
    };
    for (var i = 0; i < symbols.length; i++) {
        var price = _N((assets[symbols[i]].ask_price + assets[symbols[i]].bid_price) / 2, trade_info[symbols[i]].priceSize);
        if (symbols.indexOf(symbols[i]) < 0) {
            indexTable.rows.push([i + 1, symbols[i], price, assets[symbols[i]].btc_price, _N((1 - assets[symbols[i]].btc_change) * 100), assets[symbols[i]].btc_diff], 0, 0, 0, '0%');
        } else {
            var rateData = _G("WinRateData");
            var winRate = _N(rateData[symbols[i]].profitNumber / rateData[symbols[i]].totalProfit * 100, 2);
            indexTable.rows.push([
                (i + 1),
                symbols[i] + Warning,
                price,
                _N(assets[symbols[i]].btc_price, 6),
                _N((1 - assets[symbols[i]].btc_change) * 100),
                assets[symbols[i]].btc_diff + (assets[symbols[i]].btc_diff >= 0 ? Success : Danger),
                rateData[symbols[i]].tradeNumber,
                rateData[symbols[i]].sellNumber,
                rateData[symbols[i]].buyNumber,
                (rateData[symbols[i]].profitNumber > 0 && rateData[symbols[i]].totalProfit > 0 ? winRate : '0') + '%' + (winRate >= 50 ? Success : Danger), //胜率
            ]);
        }
    }
    var retData = {};
    retData.upTable = RunTime.str + '\n' + "最后更新: " + _D() + '\n' + 'Version:' + Version + '\n' + '`' + JSON.stringify([accountTable, assetTable]) + '`\n' + '`' + JSON.stringify(feeTable) + '`\n';
    retData.indexTable = indexTable;
    return retData;
}

function WinRate() {
    for (var i = 0; i < symbols.length; i++) {
        var unrealised = assets[symbols[i]].unrealised_profit;
        WinRateData[symbols[i]].totalProfit += 1;
        if (unrealised != 0) {
            if (unrealised > 0) {
                WinRateData[symbols[i]].profitNumber += 1;
            }
        }
    }
    _G("WinRateData", WinRateData);
}


function tradingCounter(key, newValue) {
    var value = _G(key);
    if (!value) {
        _G(key, newValue);
    } else {
        _G(key, value + newValue);
    }
}

function updateStatus() { //状态栏信息
    var table = {
        type: 'table',
        title: '交易对信息',
        cols: ['编号', '[模式][倍数]', '币种信息', '开仓方向', '开仓数量', '持仓价格', '当前价格', '强平价格', '强平差价', '持仓价值', '保证金', '未实现盈亏', '投降'],
        rows: []
    };
    TotalLong = 0;
    TotalShort = 0;
    for (var i = 0; i < symbols.length; i++) {
        var direction = '空仓';
        var margin = direction;
        if (assets[symbols[i]].amount != 0) {
            direction = assets[symbols[i]].amount > 0 ? '做多' + Success : '做空' + Danger;
            margin = (assets[symbols[i]].marginType == 'cross' ? '全仓' : '逐仓');
        }

        var price = _N((assets[symbols[i]].ask_price + assets[symbols[i]].bid_price) / 2, trade_info[symbols[i]].priceSize);
        var value = _N((assets[symbols[i]].ask_value + assets[symbols[i]].bid_value) / 2, 2);
        if (value != 0) {
            if (value > 0) {
                TotalLong += value;
            } else {
                TotalShort += value;
            }
        }
        // var rateData = _G("WinRateData");
        var infoList = [
            i + 1,
            "[" + margin + "] [" + assets[symbols[i]].leverage + 'x] ',
            symbols[i],
            direction,
            Math.abs(assets[symbols[i]].amount),
            assets[symbols[i]].hold_price,
            price,
            assets[symbols[i]].liquidationPrice, //强平价格
            assets[symbols[i]].liquidationPrice == 0 ? '0' : '$' + _N(assets[symbols[i]].liquidationPrice - price, 5) + ' ≈ ' + _N(assets[symbols[i]].liquidationPrice / price * 100, 2) + '%' + Warning, //强平价格
            Math.abs(value),
            _N(assets[symbols[i]].positionInitialMargin, 2),
            // assets[symbols[i]].btc_diff,
            _N(assets[symbols[i]].unrealised_profit, 3) + (assets[symbols[i]].unrealised_profit >= 0 ? Success : Danger),
            // (rateData[symbols[i]].profitNumber > 0 && rateData[symbols[i]].totalProfit > 0 ? _N(rateData[symbols[i]].profitNumber / rateData[symbols[i]].totalProfit * 100, 2) : '0') + '%', //胜率
            {
                'type': 'button',
                'cmd': '说好的没有撤退可言呢？？?:' + symbols[i] + ':' + assets[symbols[i]].amount + ':',
                'name': symbols[i] + ' 投降'
            }
        ];
        table.rows.push(infoList);
    }
    delete assets.USDT.update_time; //时间戳没什么用,不要了
    var logString = JSON.stringify(assets.USDT) + '\n';
    var StatusData = AppendedStatus();
    LogStatus(StatusData.upTable + '`' + JSON.stringify([table, StatusData.indexTable]) + '`\n' + logString);

    if (Date.now() - update_profit_time > Log_profit_interval * 1000) {
        var balance = assets.USDT.margin_balance;
        if (Show) {
            balance = assets.USDT.margin_balance - Funding;
        }
        LogProfit(_N(balance, 3), '&');
        update_profit_time = Date.now();
        if (UpProfit != 0 && (_N(balance, 0) != UpProfit)) { //第一次不计算,并且小数点面的不进行胜率计算
            tradingCounter("totalProfit", 1); //统计打印次数, 胜率=盈利次数/打印次数*100
            if (_N(balance, 0) > UpProfit) {
                tradingCounter("profitNumber", 1); //盈利次数
            }
            WinRate();
        }
        UpProfit = _N(balance, 0);
    }

}

function stopLoss() { //止损函数
    while (true) {
        if (assets.USDT.margin_balance < Stop_loss * assets.USDT.init_balance && assets.USDT.init_balance > 0) {
            Log('触发止损，当前资金：', assets.USDT.margin_balance, '初始资金：', assets.USDT.init_balance);
            Ice_value = 200; //止损的快一些，可修改
            updateAccount();
            updateTick();
            var trading = false; //是否正在交易
            for (var i = 0; i < trade_symbols.length; i++) {
                var symbol = trade_symbols[i];
                if (assets[symbol].ask_price == 0) {
                    continue;
                }
                if (assets[symbol].bid_value >= trade_info[symbol].minQty * assets[symbol].bid_price) {
                    trade(symbol, 'sell', assets[symbol].bid_value);
                    trading = true;
                }
                if (assets[symbol].ask_value <= -trade_info[symbol].minQty * assets[symbol].ask_price) {
                    trade(symbol, 'buy', -assets[symbol].ask_value);
                    trading = true;
                }
            }
            Sleep(1000);
            if (!trading) {
                throw '止损结束,如果需要重新运行策略，需要调低止损';
            }
        } else { //不用止损
            return;
        }
    }
}

function onTick() { //策略逻辑部分
    for (var i = 0; i < trade_symbols.length; i++) {
        var symbol = trade_symbols[i];
        if (assets[symbol].ask_price == 0) {
            continue;
        }
        var aim_value = -Trade_value * _N(assets[symbol].btc_diff / 0.01, 3);
        if (aim_value - assets[symbol].ask_value >= Adjust_value && assets[symbol].btc_diff > Min_diff && assets.USDT.long_value - assets.USDT.short_value <= 1.1 * Trade_value) {
            trade(symbol, 'buy', aim_value - assets[symbol].ask_value);
        }
        if (aim_value - assets[symbol].bid_value <= -Adjust_value && assets[symbol].btc_diff < Max_diff && assets.USDT.short_value - assets.USDT.long_value <= 1.1 * Trade_value) {
            trade(symbol, 'sell', -(aim_value - assets[symbol].bid_value));
        }
    }
}

function main() {
    SetErrorFilter("502:|503:|tcp|character|unexpected|network|timeout|WSARecv|Connect|GetAddr|no such|reset|http|received|EOF|reused|Unknown");
    while (true) {
        RunTime = RuningTime();
        RunCommand(); //捕获交互命令
        updateAccount(); //更新账户和持仓
        updateTick(); //行情
        stopLoss(); //止损
        onTick(); //策略逻辑部分
        updateStatus(); //输出状态栏信息
        Sleep(Interval * 1000);
    }
}
