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
    var amount = 5;
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
    var records = exchange.GetRecords(PERIOD_H4) //4小时
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
    var currentPrice = GetTicker().Last;
    var cci = getCCIValue(records)
    ccigy = cci;
    gyma5 = ma7;
    gyma15 = ma15
    gyma30 = ma30
    var macd = TA.MACD(records,7,14,9)

    var d = macd[2][records.length - 1];
    if (asset.buyAmount > 0 && asset.buyAmount < 15 && DTime - Date.parse(new Date()) > 1000 * 60 * 15 * 10 && cci > 0 && currentPrice < asset.openBuyPrice - 15) {
            Log('K补仓')
            return -1
        }
    var middle = (ma7 + ma15) / 2
    if (currentPrice > middle && currentPrice > ma7 && currentPrice < ma15 && ma7 > ma72) {
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
                             if (asset.buyAmount > 0) {
                             return 0;
                             }

        return 1;
    }

    if (asset.sellAmount > 0 && asset.sellAmount < 15 && kTime - Date.parse(new Date()) > 1000 * 60 * 15 * 10 && cci < 0 && currentPrice > asset.openSellPrice + 15) {
            Log('K补仓')
            return -1
        }
    if (currentPrice < middle && currentPrice < ma7 && currentPrice > ma15 && ma7 < ma72) {

//    if ((currentPrice < ma7) && (currentPrice < ma15) && (currentPrice < ma30)  && d < 0) {
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
                             if (asset.sellAmount > 0) {
                             return 0;
                             }

        return -1;
    }
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
        if (asset.buyAmount < 15) {
            exchange.Buy(price, _N(count, 2))
        }
    } else {
        //tradingCounter("sellNumber", 1);
        if (asset.sellAmount < 15) {
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


var atr = getATRValue2() * 1.3
                             var currentPrice = GetTicker().Last;

                             if (asset.buyAmount > 0 && currentPrice - asset.openBuyPrice >= atr) {
                                       
                                         //p
                                         cancleCoverOrders(ORDER_TYPE_SELL)
                                         closeBuyAction(currentPrice - 50, asset.buyAmount)
                                         Log('止盈触发D触发价格:',currentPrice)
                                     
                             }

                             if (asset.sellAmount > 0&& currentPrice - asset.openBuyPrice <= atr) {
                                
                                         //p
                                         cancleCoverOrders(ORDER_TYPE_BUY)
                                         closeSellAction(currentPrice + 50, asset.sellAmount)
                                         Log('止盈触发K','触发价格:',currentPrice)
                                         //Sleep(1000 * 60 * 10)
                                         stopSellOne = false;
                                         initSellProfile = 50;
                             }
                             
                             return;
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
                       
                       var atr = getATRValue2()
                       var currentPrice = GetTicker().Last;

                       if (asset.buyAmount > 0 && asset.openBuyPrice - currentPrice  >= atr) {
                                 
                                   //p
                                   cancleCoverOrders(ORDER_TYPE_SELL)
                                   closeBuyAction(currentPrice, asset.buyAmount)
                                   Log('止损触发D','触发价格:',currentPrice)
                               
                       }

                       if (asset.sellAmount > 0&& currentPrice - asset.openSellPrice >= atr) {
                          
                                   //p
                                   cancleCoverOrders(ORDER_TYPE_BUY)
                                   closeSellAction(currentPrice, asset.sellAmount)
                                   Log('止损触发K','触发价格:',currentPrice)
                                   //Sleep(1000 * 60 * 10)
                                   stopSellOne = false;
                                   initSellProfile = 50;
                       }
                       
                       return;
                       
    // var records = exchange.GetRecords(PERIOD_M1)
    // if (!records || records.length < 120) {
    //     Log('请求问题,休眠3s...')
    //     Sleep(1000 * 3)
    //     return;
    // }
                var currentPrice = GetTicker().Last;
    if (asset.stopLossDPrice > currentPrice + 10) {

    // if (asset.openBuyPrice > currentPrice + 800) {
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
        if (asset.stopLossKPrice < currentPrice - 10) {

     // if (asset.openSellPrice < currentPrice - 800) {
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
                             
 function getATRValue2(records) {
     var records = exchange.GetRecords(PERIOD_H1)
     if (!records || records.length < 120) {
         Log('请求问题,休眠3s...')
         Sleep(1000 * 3)
         return;
     }
     var atr = TA.ATR(records, 14)
     return atr[records.length - 1]
 }
                             
                             













