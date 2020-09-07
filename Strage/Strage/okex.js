/*backtest
start: 2020-02-20 00:00:00
end: 2020-05-19 00:00:00
period: 1d
basePeriod: 1h
*/

function main() {
    exchange.SetContractType("swap")
    exchange.SetMarginLevel(100)
    exchange.IO("currency", "BTC_USDT")
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
            onTicker()
        }

        //取消当前挂单
        if (tickerCount >= 110) {
            cancleMintesAction(ORDER_TYPE_BUY)
            cancleMintesAction(ORDER_TYPE_SELL)
            tickerCount = 0;

        }

//        calculateStopProfile()
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
var initBlance = 2470.02;
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

/// 当前时间和前两分钟布林轨指数
function BOLLCheck(records) {

    if (records && records.length > 20) {
        var boll = TA.BOLL(records, 20, 2)
        //        var currrentPrice = GetTicker().Last; //当前价格
        var upLine = boll[0][records.length - 1]
        var midLine = boll[1][records.length - 1]
        var downLine = boll[2][records.length - 1]
        asset.highPrice = _N(upLine, 2);
        asset.lowPrice = _N(downLine, 2);
        asset.middlePrice = _N(midLine, 2);
        asset.buyPrice = _N((upLine + midLine) / 2, 2)
        asset.sellPrice = _N((midLine + downLine) / 2, 2)

    }

}

function onTicker() {
    var currentPrice = GetTicker().Last;
    var amount = 5;
    if (dir == 1) {

        //1.
        if (asset.openBuyPrice <= currentPrice && asset.openBuyPrice > 0) {
            return
        }
        tickerCount = 0;
        cancleaddAction(ORDER_TYPE_SELL)
        if (asset.buyAmount > 0) {
            amount = 2 * amount;
            if (asset.openBuyPrice - currentPrice < 350) {
                return
            }
        }
        openAction("buy", currentPrice, amount)

    }
    if (dir == -1) {
        if (asset.openSellPrice >= currentPrice && asset.openSellPrice > 0) {
            return
        }
        tickerCount = 0;
        //2.
        cancleaddAction(ORDER_TYPE_BUY)
        if (asset.sellAmount > 0) {
            amount = 2 * amount
            if (currentPrice - asset.openSellPrice < 350) {
                return
            }
        }
        openAction("sell", currentPrice, amount)
    }
    Sleep(1000 * 60)

}
var dir_15 = '等待'

function getDirection() {
    //getHighLow(true)
    var records = exchange.GetRecords(PERIOD_H1) //4小时
    if (!records || records.length < 60) {
        Log('请求问题,休眠3s...')
        Sleep(1000 * 3)
        return;
    }
    var sma_4h = getSMA(records)
    var records2 = exchange.GetRecords(PERIOD_M30) //4小时
    if (!records2 || records2.length < 60) {
        Log('请求问题,休眠3s...')
        Sleep(1000 * 3)
        return;
    }
    var sma_1h = getSMA(records2)
                             var sma_1h_2 = getLastSMA(records2)
    var records3 = exchange.GetRecords(60 * 3) //4小时
    if (!records3 || records3.length < 60) {
        Log('请求问题,休眠3s...')
        Sleep(1000 * 3)
        return;
    }
    var sma_5M = getSMA(records3)
                             var sma_5M_2 = getLastSMA(records3)
    var currentPrice = GetTicker().Last;

                             if (sma_5M > currentPrice && sma_1h > currentPrice && sma_4h > currentPrice && asset.buyAmount <= 0) {
                                return 1;//开多
                             }
                             
                             if (sma_5M < currentPrice && sma_1h < currentPrice && sma_4h < currentPrice && asset.sellAmount <= 0) {
                                return -1;//开多
                             }
                             
                             if (sma_5M_2 < currentPrice && sma_1h_2 < currentPrice && asset.buyAmount > 0) {
                                return 2;//平多
                             }
                             if (sma_5M_2 > currentPrice && sma_1h_2 > currentPrice && asset.sellAmount > 0) {
                                return -2;//平空
                             }
                             return 0;


}

function updateStatus() { //状态栏信息
    var table = {
        type: 'table',
        title: '交易对信息',
        cols: ['编号', '币种信息', '15分开仓方向', '当前价格', '周期最高价', '周期最低价', '周期中间价', '开多条件', '开多数量', '开多均价', '多止盈率', '开多止损', '开空条件', '开空数量', '开空均价', '空止盈率'],
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
        asset.highPrice,
        asset.lowPrice,
        _N(asset.middlePrice, 2),
        _N(asset.buyPrice, 2),
        asset.buyAmount + Danger,
        asset.openBuyPrice + Danger,
        initBuyProfile,
        asset.stopLossDPrice,
        _N(asset.sellPrice, 2),
        asset.sellAmount + Danger,
        asset.openSellPrice + Danger,
        initSellProfile
    ]);
    runTime = RuningTime()
    LogStatus(runTime.str + '\n' + "更新时间: " + toLocal() + '\n' + '`' + JSON.stringify(table) + '`' + hasOrders())

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
                var orderTime = new Date(order.Info.timestamp).getTime()
                if (order.Type == oredrType && adjustFloat(Date.now()) - orderTime > 1000 * 60 * 3) {
                    exchange.CancelOrder(order.Id)
                }
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
var initBuyProfile = 20;
var initSellProfile = 20;

function calculateStopProfile() {

    if (asset.sellAmount <= 0 && asset.buyAmount <= 0) {

        stopSellOne = false;
        stopBuyOne = false;
        initBuyProfile = 20;
        initSellProfile = 20;
        return;
    }
    if (asset.sellAmount <= 0) {
        stopSellOne = false;
        initSellProfile = 20;
    }
    if (asset.buyAmount <= 0) {
        stopBuyOne = false;
        initBuyProfile = 20;
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
                    initBuyProfile = 20;
                    Log('回调过快D')
                    return
                }
                //p
                cancleCoverOrders(ORDER_TYPE_SELL)
                closeBuyAction(currentPrice - 50, asset.buyAmount)
                Log('止盈触发D', profile, '触发价格:', currentPrice)
                //  Sleep(1000 * 60 * 10)
                stopBuyOne = false;
                initBuyProfile = 20;
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
                    initSellProfile = 20;
                    return
                }
                //p
                cancleCoverOrders(ORDER_TYPE_BUY)
                closeSellAction(currentPrice + 50, asset.sellAmount)
                Log('止盈触发K', profile, '触发价格:', currentPrice)
                //Sleep(1000 * 60 * 10)
                stopSellOne = false;
                initSellProfile = 20;
            }
            return
        }
    }
}
var stopBuyLossTime = 0
var stopSellLossTime = 0
var stopISFisrstBLossTime = false;
var stopISFisrstSLossTime = false;

function calculateStopLoss() {
    var currentPrice = GetTicker().Last;
                       if (dir == 2 && asset.buyAmount > 0) {
                        cancleCoverOrders(ORDER_TYPE_SELL)
                       closeBuyAction(currentPrice, asset.buyAmount)


                       }
                       
                       if (dir == -2 && asset.sellAmount > 0) {
                       cancleCoverOrders(ORDER_TYPE_BUY)
                       closeSellAction(currentPrice, asset.sellAmount)

                       }
                       return;
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
    ret.str = "运行时间: " + dayDiff + " 天 " + hours + " 小时 " + minutes + " 分钟";
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

                             function getSMA(re) {
                                var sma = talib.SMA(re, 60)
                                return sma[re.length - 2]

                             }
                             
                             
                             function getLastSMA(re) {
                                var sma = talib.SMA(re, 60)
                                return sma[re.length - 2]

                             }
