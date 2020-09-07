var asset = {
    buyPrice: 0,
    sellPrice: 0,
    buyAmount: 0,
    sellAmount: 0,
    sellAtr: 0,
    buyAtr: 0,
    highPrice: 199.87,
    lowPrice: 192.25,

}

var funding = 0; //期货账户开始金额
var Success = '#5cb85c'; //成功颜色
var Danger = '#ff0000'; //危险颜色
var Warning = '#f0ad4e'; //警告颜色
var runTime;

var atrValue = 0;
var currrentPrice = 0;
var cciValue = 0;
var diffM = 0;

var blance_ = 0;
//var initBlance = 2100.43;
var initBlance = 908;
var Stocks_ = 0;
var takeupBlance = 0;
var currentMa7 = 0;
var currentmacd = 0;
var sum = 0;


const BOLLEnum = {
    aboveUpline: 'aboveUpline', //上轨之上
    abovemidLine: 'abovemidLine', //中轨之上
    abovedownLine: 'abovedownLine', //下轨之上
    beLowdownLine: 'beLowdownLine', ////下轨之下
    throughUpline: 'throughUpline', //突破上轨
    throughmidLine: 'throughmidLine', //突破中轨
    throughdownLine: 'throughdownLine', //突破下轨
    underUpline: 'underUpline', //下穿上轨
    undermidLine: 'undermidLine', //下穿中轨
    underdownLine: 'underdownLine', //下穿下轨

}

const MA7Enum = {
    above: 'aboveline',
    throughup: 'throughupline', //突破上轨
    throughdow: 'throughdowline', //突破上轨
    under: 'underline', //上轨之下
}

function getATRValue(records) {
    var atr = TA.ATR(records, 7)

    if (atr[atr.length - 1] > 0) {
        return atr[atr.length - 1];
    }
    return 0.5;
}

function getMa7Value(records) {
    var ma = TA.MA(records, 5)
    //        var currrentPrice = GetTicker().Last; //当前价格
    var ma1 = ma[records.length - 1]
    var open = records[records.length - 1].Close // 收盘价格
    var close = records[records.length - 1].Open // 最低价
    var ma7e = calcuetma7(ma1, open, close)

    var ma2 = ma[records.length - 2]
    var open2 = records[records.length - 2].Close // 收盘价格
    var close2 = records[records.length - 2].Open // 最低价
    var ma7e2 = calcuetma7(ma2, open2, close2)

    var ma3 = ma[records.length - 3]
    var open3 = records[records.length - 3].Close // 收盘价格
    var close3 = records[records.length - 3].Open // 最低价
    var ma7e3 = calcuetma7(ma3, open3, close3)

    if (ma7e == MA7Enum.above && ma7e2 == MA7Enum.above && ma7e3 == MA7Enum.above) {
        return 2.5; // 1、2、3. 7上
    }

    if (ma7e == MA7Enum.above && ma7e2 == MA7Enum.throughup && (ma7e3 == MA7Enum.throughup || ma7e3 == MA7Enum.throughdow)) {
        return 2; // 1.上 2、3. 7上穿
    }
    if (ma7e == MA7Enum.above && (ma7e2 == MA7Enum.throughup || ma7e2 == MA7Enum.throughdow) && ma7e3 == MA7Enum.under) {
        return 1.5; // 1.上 2.上穿/下穿 3.下
    }
    if (ma7e == MA7Enum.throughup && (ma7e2 == MA7Enum.above || ma7e2 == MA7Enum.throughup) && (ma7e3 == MA7Enum.above || ma7e3 == MA7Enum.throughup)) {
        return 1.5; // 1、2、3. 7上穿
    }

    //        if (ma7e == MA7Enum.throughup && ma7e2 == MA7Enum.above && ma7e3 == MA7Enum.above) {
    //            return 1;// 1. 7上穿 2/3. 上/上穿
    //        }
    //        if (ma7e == MA7Enum.under && ma7e2 == MA7Enum.under && ma7e3 == MA7Enum.under) {
    //            return -1.5;// 全部在7日线之下
    //        }
    if (ma7e == MA7Enum.under && ma7e2 == MA7Enum.under && ma7e3 == MA7Enum.under) {
        return -2.5; // 1、2、3. 7上
    }

    if (ma7e == MA7Enum.under && ma7e2 == MA7Enum.throughdow && (ma7e3 == MA7Enum.throughup || ma7e3 == MA7Enum.throughdow)) {
        return -2; // 1.上 2、3. 7上穿
    }
    if (ma7e == MA7Enum.under && (ma7e2 == MA7Enum.throughup || ma7e2 == MA7Enum.throughdow) && ma7e3 == MA7Enum.above) {
        return -1.5; // 1.上 2.上穿/下穿 3.下
    }
    if (ma7e == MA7Enum.throughdow && (ma7e2 == MA7Enum.under || ma7e2 == MA7Enum.throughdow) && (ma7e3 == MA7Enum.under || ma7e3 == MA7Enum.throughdow)) {
        return -1.5; // 1、2、3. 7上穿
    }
    return 0
}

function calcuetma7(ma, open, close) {

    if (open <= ma && close <= ma) {
        return MA7Enum.under
    }

    if (open >= ma && close <= ma) {
        return MA7Enum.throughdow
    }

    if (open >= ma && close >= ma) {
        return MA7Enum.above;
    }

    if (open <= ma && close >= ma) {
        return MA7Enum.throughup;
    }

    Log('calcuetLine失败')
    return "nil";

}

function getMACDValue(records) {
    var macd = TA.MACD(records)
    var mcdArray = new Array();
    var firstBuy = false;
    var firstSell = false;
    for (var i = 0; i < 2; i++) {
        var model = {
            m: 0,
            c: 0,
            d: 0
        };
        model.m = macd[0][records.length - i - 1];
        model.c = macd[1][records.length - i - 1];
        model.d = macd[2][records.length - i - 1];
        mcdArray.push(model);
    }

    var firstModel = mcdArray[0];
    var secondeModel = mcdArray[0];
    diffM = firstModel.m
    //    var thirdeModel = mcdArray[0];
//    if (firstModel.d > 0 && secondeModel.d < 0) {
//        currentOpenP = GetTicker().Last; //当前价格
//    }
//    if (firstModel.d < 0 && secondeModel.d > 0) {
//        currentOpenP = GetTicker().Last; //当前价格
//    }
    if ( firstModel.d > 0.2) {
        if (asset.sellAmount > 0) {
            currentOpenP = 0;//停止开单
        }
        return 1;
    }
    
    if (firstModel.d < -0.2) {
        if (asset.buyAmount > 0) {
            currentOpenP = 0;//停止开单
        }
        return -1;
    }
    /*
    if ((firstModel.m >= 0.2 && firstModel.c >= 0.2 && firstModel.d > 0) && (secondeModel.m >= 0.2 && secondeModel.c >= 0.2 && secondeModel.d > 0)) {
        return -3;
    }

    if ((firstModel.m >= 0.2 && firstModel.c >= 0.2) && (secondeModel.m >= 0.2 && secondeModel.c >= 0.2)) {
        return -2.5;
    }
    if ((firstModel.m <= -0.2 && firstModel.c <= -0.2 && firstModel.d < 0) && (secondeModel.m <= -0.2 && secondeModel.c <= -0.2 && secondeModel.d < 0)) {
        return 3;
    }

    if ((firstModel.m <= -0.2 && firstModel.c <= -0.2) && (secondeModel.m <= -0.2 && secondeModel.c <= -0.2)) {
        return 2.5;
    }




    if ((firstModel.m <= -0.2 && firstModel.c <= -0.2 && firstModel.d > 0) && (secondeModel.m <= -0.2 && secondeModel.c <= -0.2)) {
        return 2.5;
    }

    //    if ((firstModel.m >= 0.2 && firstModel.c >= 0.2 && firstModel.d < 0) && (secondeModel.m >= 0.2 && secondeModel.c >= 0.2)) {
    //        return -2.5;
    //    }

    if ((firstModel.m <= 0 && firstModel.m >= -0.2 && firstModel.c >= -0.2 && firstModel.c <= -0.1 && firstModel.d > 0) && (secondeModel.m <= -0.1 && secondeModel.m >= -0.2 && secondeModel.c >= -0.2 && secondeModel.c <= -0.1 && secondeModel.d > 0)) {
        return 1.5;
    }

    if ((firstModel.m <= 0.2 && firstModel.m >= 0 && firstModel.c <= 0.2 && firstModel.c >= 0.1 && firstModel.d < 0) && (secondeModel.m <= 0.2 && secondeModel.m >= 0.1 && secondeModel.c <= 0.2 && secondeModel.c >= 0.1 && secondeModel.d < 0)) {
        return -1.5;
    }

    if ((firstModel.m < 0 && firstModel.m >= -0.1 && firstModel.c >= -0.1 && firstModel.c < 0 && firstModel.d > 0) && (secondeModel.m < 0 && secondeModel.m >= -0.1 && secondeModel.c >= -0.1 && secondeModel.c < 0)) {
        return 1;
    }

    if ((firstModel.m > 0 && firstModel.m <= 0.1 && firstModel.c <= 0.1 && firstModel.c > 0 && firstModel.d < 0) && (secondeModel.m > 0 && secondeModel.m < 0.1 && secondeModel.c <= 0.1 && secondeModel.c > 0)) {
        return -1;
    }
*/
    return 0;
}

function getMACDValue_1() {
    var records = exchange.GetRecords(PERIOD_M1)
    var macd = TA.MACD(records)
    var mcdArray = new Array();
    var firstBuy = false;
    var firstSell = false;
    for (var i = 0; i < 2; i++) {
        var model = {
            m: 0,
            c: 0,
            d: 0
        };
        model.m = macd[0][records.length - i - 1];
        model.c = macd[1][records.length - i - 1];
        model.d = macd[2][records.length - i - 1];
        mcdArray.push(model);
    }

    var firstModel = mcdArray[0];
    var secondeModel = mcdArray[1];
    diffM = firstModel.m
    //    var thirdeModel = mcdArray[0];
    if ( firstModel.d > 0.2 && secondeModel.d < 0) {
        if (asset.sellAmount > 0) {
            currentOpenP = 0;//停止开单
        }
        return 1;
    }
    
    if (firstModel.d < -0.2 && secondeModel.d > 0) {
        if (asset.buyAmount > 0) {
            currentOpenP = 0;//停止开单
        }
        return -1;
    }
    /*
    if ((firstModel.m >= 0.2 && firstModel.c >= 0.2 && firstModel.d > 0) && (secondeModel.m >= 0.2 && secondeModel.c >= 0.2 && secondeModel.d > 0)) {
        return -3;
    }

    if ((firstModel.m >= 0.2 && firstModel.c >= 0.2) && (secondeModel.m >= 0.2 && secondeModel.c >= 0.2)) {
        return -2.5;
    }
    if ((firstModel.m <= -0.2 && firstModel.c <= -0.2 && firstModel.d < 0) && (secondeModel.m <= -0.2 && secondeModel.c <= -0.2 && secondeModel.d < 0)) {
        return 3;
    }

    if ((firstModel.m <= -0.2 && firstModel.c <= -0.2) && (secondeModel.m <= -0.2 && secondeModel.c <= -0.2)) {
        return 2.5;
    }




    if ((firstModel.m <= -0.2 && firstModel.c <= -0.2 && firstModel.d > 0) && (secondeModel.m <= -0.2 && secondeModel.c <= -0.2)) {
        return 2.5;
    }

    //    if ((firstModel.m >= 0.2 && firstModel.c >= 0.2 && firstModel.d < 0) && (secondeModel.m >= 0.2 && secondeModel.c >= 0.2)) {
    //        return -2.5;
    //    }

    if ((firstModel.m <= 0 && firstModel.m >= -0.2 && firstModel.c >= -0.2 && firstModel.c <= -0.1 && firstModel.d > 0) && (secondeModel.m <= -0.1 && secondeModel.m >= -0.2 && secondeModel.c >= -0.2 && secondeModel.c <= -0.1 && secondeModel.d > 0)) {
        return 1.5;
    }

    if ((firstModel.m <= 0.2 && firstModel.m >= 0 && firstModel.c <= 0.2 && firstModel.c >= 0.1 && firstModel.d < 0) && (secondeModel.m <= 0.2 && secondeModel.m >= 0.1 && secondeModel.c <= 0.2 && secondeModel.c >= 0.1 && secondeModel.d < 0)) {
        return -1.5;
    }

    if ((firstModel.m < 0 && firstModel.m >= -0.1 && firstModel.c >= -0.1 && firstModel.c < 0 && firstModel.d > 0) && (secondeModel.m < 0 && secondeModel.m >= -0.1 && secondeModel.c >= -0.1 && secondeModel.c < 0)) {
        return 1;
    }

    if ((firstModel.m > 0 && firstModel.m <= 0.1 && firstModel.c <= 0.1 && firstModel.c > 0 && firstModel.d < 0) && (secondeModel.m > 0 && secondeModel.m < 0.1 && secondeModel.c <= 0.1 && secondeModel.c > 0)) {
        return -1;
    }
*/
    return 0;
}


function MACheck() {
    var records = exchange.GetRecords(PERIOD_M3);
    var ma = TA.EMA(records, 7)[records.length - 1]
    var ma14 = TA.EMA(records, 14)[records.length - 1]
    var ma_2 = TA.EMA(records, 7)[records.length - 2]
    var ma14_2 = TA.EMA(records, 14)[records.length - 2]

//    Log(ma,ma2)
    if (ma - ma14 > 1 && ma_2 < ma14_2) {
        return 1;
    }
    
    if (ma14 - ma > 1 && ma_2 > ma14_2) {
           return -1;
    }
    
    /*
    var ma = TA.MACD(records);
    var ma1 = ma[0][records.length - 1];
    var ma2 = ma[1][records.length - 2];
    var ma3 = ma[2][records.length - 3];
        var ticker = GetTicker();
    

    //Log("ma1:" + ma1 + "ma2:" + ma2 +"ma3：" + ma3);

//     if ((ma1 - ma2 > 0) && (ma1 - ma2 < 0.35) && (ma3 - ma2 > 0)) {
//       // Log("A" + "ma1:" + ma1 + "ma2:" + ma2 + "ma3：" + ma3);
//        if ((buyPrice > ticker.Last) || buyPrice == 0) {
//            return 1;
//        }
//        return -1;
//    }
    // || (ma1 > ma2 && ma2 > ma3)
    if (((ma1 > ma2) && (ma3 >= ma2) && (ma1 - ma2 >= 0.35) )) {
       // Log("b" + "ma1:" + ma1 + "ma2:" + ma2 + "ma3：" + ma3);

        //买入信号
        return 1;
    }
    //&& (ma2 - ma3 < 0.5)

//    if ((ma2 - ma1 > 0) && (ma2 - ma1 < 0.35) && (ma2 - ma3 > 0) ) {
//       // Log("C ma1:" + ma1 + "ma2:" + ma2 + "ma3：" + ma3);
////       if (buyPrice < ticker.Last) {
////           return -1;
////        }
//        return 1;
//    }

    //&& (ma2 - ma3 >= 0.5)
    if (((ma1 < ma2) && (ma3 <= ma2) && (ma2 - ma1 >= 0.35) )) {
        //Log("D ma1:" + ma1 + "ma2:" + ma2 + "ma3：" + ma3);

        //卖出信号
        return -1;
    }
     */
    return 0;
}

function startBuyGrids(price, amount) {
    exchange.SetDirection("closebuy")
    //取消当前closeBuy订单 重新排版
    exchange.Sell(price, amount)

}

function startSellGrids(price, amount) {
    //取消当前closesell订单 重新排版
    //    cancleOrders(ORDER_TYPE_BUY)
    exchange.SetDirection("closesell")
    exchange.Buy(price, amount)

}

function checkAmount() {
    var position = exchange.GetPosition()
    Stocks_ = 0;
    asset.sellAmount = 0
    asset.buyAmount = 0
    asset.buyPrice = 0;
    asset.sellPrice = 0;
    asset.sellMargin = 0;
    asset.buyMargin = 0;
    asset.buyProfit = 0;
    asset.sellProfit = 0;
    if (position && position.length > 0) {
        // Log("Amount:", position[0].Amount, "FrozenAmount:", position[0].FrozenAmount, "Price:",
        //  position[0].Price, "Profit:", position[0].Profit, "Type:", position[0].Type,
        // "ContractType:", position[0].ContractType)
        for (var i = 0; i < position.length; i++) {
            if (position[i].Type == 0) {
                asset.buyPrice = position[i].Price;
                asset.buyAmount = position[i].Amount;
                asset.buyMargin = position[i].Margin;
                asset.buyProfit = position[i].Profit;
                if (position[i].Amount != position[i].FrozenAmount) {
                    var records = exchange.GetRecords(PERIOD_M1)
                    if (records && records.length > 20) {
                        var boll = TA.BOLL(records, 20, 2)
                        //        var currrentPrice = GetTicker().Last; //当前价格
                        var upLine = boll[0][records.length - 1]
                        var midLine = boll[1][records.length - 1]
                        var downLine = boll[2][records.length - 1]
//                        cancleOrders(ORDER_TYPE_SELL)
//                        startBuyGrids(parseFloat((midLine + upLine)/2), position[i].Amount)
                        startBuyGrids(position[i].Price + 50, position[i].Amount)

                    }
                }
            } else if (position[i].Type == 1) {
                asset.sellPrice = position[i].Price;
                asset.sellAmount = position[i].Amount;
                asset.sellMargin = position[i].Margin;
                asset.sellProfit = position[i].Profit;
                if (position[i].Amount != position[i].FrozenAmount) {
                    var records = exchange.GetRecords(PERIOD_M1)
                    if (records && records.length > 20) {
                        var boll = TA.BOLL(records, 20, 2)
                        //        var currrentPrice = GetTicker().Last; //当前价格
                        var upLine = boll[0][records.length - 1]
                        var midLine = boll[1][records.length - 1]
                        var downLine = boll[2][records.length - 1]
//                        cancleOrders(ORDER_TYPE_BUY)
//                        startSellGrids(parseFloat((downLine + midLine)/2), position[i].Amount);
                        startSellGrids(position[i].Price - 50, position[i].Amount);

                    }
                }

            }
            Stocks_ = Stocks_ + position[i].Margin;
        }
        return true;
    }
    asset.buyAtr = 0;
    asset.sellAtr = 0;
    count += 1;
    if (count > 120) {
        cancleaddAction(ORDER_TYPE_BUY, true)
        cancleaddAction(ORDER_TYPE_SELL, true)

        LogProfit(blance_ - initBlance);
        count = 0;
    }

    return false
}
var count = 0;

function closeAction() {

    //    if (asset.buyAmount > 0 && cciValue >= 100) {
    //
    //        Log('cci开多止盈',currrentPrice, '@')
    //        tradingCounter("cciNumber", 1);
    //        closeBuyAction(currrentPrice - 1)
    //        return;
    //
    //    }
    //
    //    if (asset.sellAmount > 0 && cciValue <= -100) {
    //        tradingCounter("cciNumber", 1);
    //        Log('cci开空止盈',currrentPrice,'@')
    //        closeSellAction(currrentPrice + 1)
    //        return;
    //
    //    }
    //新版止损
        if (asset.buyAmount > 0 && (asset.buyPrice  - currrentPrice > 50)) {

//    if (asset.buyAmount > 0 && ((asset.buyPrice + asset.lowPrice) / 2 - currrentPrice > 1.5 * atrValue)) {
        Log('ATR开多止损', currrentPrice, '@')
        tradingCounter("atrNumber", 1);
        closeBuyAction(currrentPrice - 1)
        return;
    }
    if (asset.sellAmount > 0 && (currrentPrice - asset.sellPrice  > 50)) {

//    if (asset.sellAmount > 0 && (currrentPrice - (asset.sellPrice + asset.highPrice) / 2 > 1.5 * atrValue)) {
        Log('ATR开空止损', currrentPrice, '@')
        tradingCounter("atrNumber", 1);
        closeSellAction(currrentPrice + 1)
        return;
    }
}


function closeBuyAction(price) {
    if (asset.buyAmount > 0) {
        exchange.SetDirection("closebuy")
        cancleOrders(ORDER_TYPE_SELL)
        var buyid = exchange.Sell(price, asset.buyAmount)
        if (buyid) {
            exchange.CancelOrder(buyid)
        }
        asset.buyAmount = 0; //默认卖出成功

    }
}

function closeSellAction(price) {
    if (asset.sellAmount > 0) {
        exchange.SetDirection("closesell")
        cancleOrders(ORDER_TYPE_BUY)
        var buyid = exchange.Buy(price, asset.sellAmount)
        if (buyid) {
            exchange.CancelOrder(buyid)
        }
        asset.sellAmount = 0; //默认卖出成功
    }
}

//订单的开平仓方向，ORDER_OFFSET_OPEN为开仓，ORDER_OFFSET_CLOSE为平仓方向订单类型 平空ORDER_TYPE_BUY  平多ORDER_TYPE_SELL
function cancleOrders(oredrType) {
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

function cancleaddAction(oredrType, isAll) {
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

function openAction(type, count) {
    var tick = GetTicker(); //当前价格
    exchange.SetDirection(type)
    if (type == "buy") {
        var buyPrice = tick.Buy; //当前价格
        var buyCount = count;
        if (asset.buyAmount == 0) {
            buyPrice = tick.Last;
            tradingCounter("buyNumber", 1);
        }
        //容错防止一直开仓导致爆仓
        if (asset.buyAmount < 6) {
            exchange.Buy(buyPrice, count)
        }

    } else {
        var sellPrice = tick.Sell; //当前价格
        var sellCount = count
        if (asset.sellAmount == 0) {
            sellPrice = tick.Last;
            tradingCounter("sellNumber", 1);

        }
        if (asset.sellAmount < 6) {
            exchange.Sell(sellPrice, sellCount)
        }
    }
    Sleep(1000);
}

function tradingCounter(key, newValue) {
    var value = _G(key);
    if (!value) {
        _G(key, newValue);
    } else {
        _G(key, value + newValue);
    }
}

function MAOut() {
    
      var records = exchange.GetRecords(PERIOD_M3);
        var ma = TA.MA(records, 7)
//        [records.length - 1]
//        var ma14 = TA.EMA(records, 14)[records.length - 1]
//        var ma_2 = TA.EMA(records, 7)[records.length - 2]
//        var ma14_2 = TA.EMA(records, 14)[records.length - 2]
        var ma1 = ma[ma.length - 1]
        var ma2 = ma[ma.length - 2]
        var ma3 = ma[ma.length - 3]
    //    Log(ma,ma2)
        if (ma1 < ma2 && ma2 < ma3) {
            return -1;
        }
        
        if (ma1 > ma2 && ma2 > ma3) {
               return 1;
           }
    
}

function openDirction() {
    var records = exchange.GetRecords(PERIOD_H1)
    var macd = TA.MACD(records)
    d = macd[2][records.length - 1];
    if (d > 5) {
        currentOpenP = GetTicker().Last; //当前价格

        return true //多头
    }
    
    if (d < -5) {
        currentOpenP = GetTicker().Last; //当前价格
        return false//空头
    }
    currentOpenP = 0;
}
var currentOpenP = 0

function main() {

    exchange.SetContractType("quarter")
    exchange.SetMarginLevel(20)
    //exchange.IO("currency", "BSV_USDT")
    var account = exchange.GetAccount();
    blance_ = account.Balance;
    SetErrorFilter('CancelOrder|Buy|400|Sell')

    _G("buyNumber", null)
    _G("addBuyNumber", null)
    _G("cciNumber", null)
    _G("atrNumber", null)
    _G("sellNumber", null)
    _G("addsellNumber", null)
  

    while (true) {
        
        var dir = openDirction()

        var records = exchange.GetRecords(PERIOD_M5)
        currrentPrice = GetTicker().Last; //当前价格
        atrValue = getATRValue(records)
        cciValue = _N(getCCIValue(records), 2)

                    
        if (!records || records.length < 7 || currrentPrice <= 0 || atrValue <= 0) {
            continue
        }
//        currentMa7 = getMa7Value(records)
        currentmacd = getMACDValue(records)
//        sum = currentMa7 + currentmacd
        //检查当前是否持仓
        if (checkAmount()) {
//            closeAction()
        }
        
        currentmacd_1 = getMACDValue_1()


//       var out =  MAOut()
//                   var res = MACheck()
//        if (out == 1  && asset.sellAmount > 0) {
//                                    cancleOrders(ORDER_TYPE_BUY)
//            startSellGrids(currrentPrice + 5, asset.sellAmount );
//        }
//        if (out == -1 && asset.buyAmount > 0) {
//             cancleOrders(ORDER_TYPE_SELL)
//            startBuyGrids(currrentPrice - 5, asset.buyAmount ,"附带数据1","...");
//        }
        //&& dayopen < currrentPrice
        if (currentmacd == 1 && currentmacd_1 == -1) {
            cancleaddAction(ORDER_TYPE_BUY, true)
        }
        if (currentmacd == -1 && currentmacd_1 == 1) {
            cancleaddAction(ORDER_TYPE_SELL, true)
        }
                                 if (currentmacd == 1  && asset.buyAmount < 2 && currentmacd_1 == 1) {
//        if (sum >= 1.5 && asset.buyAmount < 2) {
//                                     startSellGrids(currrentPrice + 1, 4);
                                     
                                                  if (asset.sellAmount > 0) {
                                                                                     cancleOrders(ORDER_TYPE_BUY)
                                                             startSellGrids(currrentPrice + 5, asset.sellAmount );
                                                         }

            cancleaddAction(ORDER_TYPE_BUY, true)
            cancleaddAction(ORDER_TYPE_SELL, true)
                                     if (currrentPrice < currentOpenP && currentOpenP != 0) {
                                         
            openAction("buy", 4)
            asset.lowPrice = TA.Lowest(records, 30, 'Low');;
            Log('asset.lowPrice', asset.lowPrice)
                                 if (asset.lowPrice < currrentPrice) {
                                 asset.lowPrice = currrentPrice - 1
                                 }
            Sleep(1000 * 60 * 3);
                                         }

            count = 0;

        }
if (currentmacd == -1  && asset.sellAmount < 2 && currentmacd_1 == -1 ) {
//    startBuyGrids(currrentPrice - 1, 4)
     if ( asset.buyAmount > 0) {
                 cancleOrders(ORDER_TYPE_SELL)
                startBuyGrids(currrentPrice - 5, asset.buyAmount ,"附带数据1","...");
            }
//        if (sum <= -4 && asset.sellAmount < 2) {
            cancleaddAction(ORDER_TYPE_SELL, true)
            cancleaddAction(ORDER_TYPE_BUY, true)
 if (currrentPrice > currentOpenP && currentOpenP != 0) {
            openAction("sell", 4)
            asset.highPrice = TA.Highest(records, 30, 'High');
            Log('asset.highPrice', asset.highPrice)
            Sleep(1000 * 60 * 3);
            count = 0
 }

        }
        runTime = RuningTime();
        updateStatus();
        Sleep(1000 * 30);


    }

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
    var dateEnd = new Date();
    var tmpHours = dateEnd.getHours();
    dateEnd.setHours(tmpHours + 8); //时区+8
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

function getCCIValue(records) {
    var cci = talib.CCI(records, 14)
    return cci[records.length - 1]
}

function updateStatus() { //状态栏信息
    var table = {
        type: 'table',
        title: '交易对信息',
        cols: ['编号', '币种信息', '开仓方向', '开仓数量', '持仓价格', '开仓次数', '补仓次数', 'cci止盈次数', 'atr止损次数', '占用保证金', '可用保证金'],
        rows: []
    };
    table.rows.push([
        '1',
        'BSV_USDT',
        '多' + Success,
        asset.buyAmount,
        asset.buyPrice,
        _G("buyNumber") ? _G("buyNumber") : 0 + Success, //做多次数
        _G("addBuyNumber") ? _G("addBuyNumber") : 0 + Danger, //做多次数
        _G("cciNumber") ? _G("cciNumber") : 0 + Success,
        _G("atrNumber") ? _G("atrNumber") : 0 + Danger,
        asset.buyMargin + Danger,
        _N(blance_, 2) + (blance_ > 500 ? Success : Danger),

    ]);
    table.rows.push([
        '2',
        'BSV_USDT',
        '空' + Danger,
        asset.sellAmount,
        asset.sellPrice,
        _G("sellNumber") ? _G("sellNumber") : 0 + Success, //做多次数
        _G("addsellNumber") ? _G("addsellNumber") : 0 + Danger, //做多次数
        _G("cciNumber") ? _G("cciNumber") : 0 + Success,
        _G("atrNumber") ? _G("atrNumber") : 0 + Danger,
        asset.sellMargin + Danger,
        _N(blance_, 2) + (blance_ > 500 ? Success : Danger),

    ]);

    LogStatus(AppendedStatus() + '`' + JSON.stringify(table) + '`' + hasOrders());

}

function hasOrders() {
    var table = {
        type: 'table',
        title: '已存在限价委托',
        cols: ['编号','限价类型', '下单价格', '下单数量', '成交数量'],
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
                takeupBlance = takeupBlance + (order.Price * order.Amount / 10)
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

function getBlance() {
    var account = exchange.GetAccount();
    return account.Balance;
}

function AppendedStatus() {

    var accountTable = {
        type: "table",
        title: "币种信息",
        cols: ["运行时间", '初始资金', '总盈利', '当前价格', '买入止损价', '卖出止损价', 'cci', 'ma7', 'mcd7', 'bool7', 'sum'],
        rows: []
    };
    var runday = runTime.dayDiff;
    if (runday == 0) {
        runday = 1;
    }
    var currrentPrice = GetTicker().Last; //当前价格
    blance_ = getBlance();
    accountTable.rows.push([
        runday,
        '$' + initBlance,
        _N((blance_ + Stocks_ - initBlance + takeupBlance), 2) + Success,
        currrentPrice,
        asset.lowPrice,
        asset.highPrice,
        cciValue,
        currentMa7,
        currentmacd,
        0,
        sum,
    ]);
    var exchangecount = (_G("buyNumber") ? _G("buyNumber") : 0) + (_G("addBuyNumber") ? _G("addBuyNumber") : 0) + (_G("sellNumber") ? _G("sellNumber") : 0) + (_G("addsellNumber") ? _G("addsellNumber") : 0)
    return runTime.str + '\n' + "更新时间: " + _D() + '\n' + '总交易次数:' + exchangecount + '\n' + '`' + JSON.stringify(accountTable) + '`\n';

}


var setup_coef = 0.25
var break_coef = 0.2
var enter_coef_1 = 1.07
var enter_coef_2 = 0.07
var fixed_size = 1
var donchian_window = 30
var trailing_long = 0.4
var trailing_short = 0.4
var multiplier = 3
var buy_break = 0 //突破买入价
var sell_setup = 0 //观察卖出价
var sell_enter = 0 //反转卖出价
var buy_enter = 0 //反转买入价
var buy_setup = 0 //观察买入价
var sell_break = 0 //突破卖出价

var intra_trade_high = 0
var intra_trade_low = 0
var day_high = 0
var day_open = 0
var day_close = 0
var day_low = 0
var tend_high = 0
var tend_low = 0

var pos = 0

function test() {


    var records = exchange.GetRecords(PERIOD_D1)
    var m_records = exchange.GetRecords(PERIOD_M1)

//    if (!records || records.length <= 2) {
//        continue;
//    }
    var m_bar = m_records[m_records.length - 1]
    var bar = records[records.length - 2]

    if (day_open) {
        buy_setup = day_low - setup_coef * (day_high - day_close)
        sell_setup = day_high + setup_coef * (day_close - day_low)
        buy_enter = (enter_coef_1 / 2) * (day_high + day_low) - (enter_coef_2 * day_high)
        sell_enter = (enter_coef_1 / 2) * (day_high + day_low) - (enter_coef_2 * day_low)
        buy_break = buy_setup + break_coef * (sell_setup - buy_setup)
        sell_break = sell_setup - break_coef * (sell_setup - buy_setup)
        if (pos == 0) {
            Log('buy_setup', buy_setup, 'sell_setup', sell_setup, 'buy_enter', buy_enter, 'sell_enter', sell_enter, 'buy_break', buy_break, 'sell_break',
                sell_break)
            pos = 100
        }
    }
    day_open = bar.Open
    day_close = bar.Close
    day_low = bar.Low
    day_high = bar.High
//    if (sell_setup <= 0) {
//        continue;
//    }
    var long_coefficient = 0.999
    var short_coefficient = 1.001
    var cycle_length = 50
    var bar_arr = exchange.GetRecords(PERIOD_M15)
    var close_new = bar_arr[bar_arr.length - 1].Close
    var close_last = bar_arr[bar_arr.length - 2].Close
    var on_line = TA.Highest(bar_arr, cycle_length, 'High') * long_coefficient
    var under_line = TA.Lowest(bar_arr, cycle_length, 'Low') * short_coefficient
    var middle_line = (on_line + under_line) / 2
    tend_high = on_line;
    tend_low = under_line;
    //        if (pos == 0) {
    intra_trade_low = bar.low_price
    intra_trade_high = bar.high_price

    if (tend_high > sell_setup) {
        var long = Math.max(buy_break, day_high);
        Log(long, '买入做多', close_new)
        Log(sell_enter, '预计卖出做空', close_new)
    } else if (tend_low < buy_setup) {
        var short = Math.min(sell_break, day_low)
        Log(short, '卖出做空', close_new)
        Log(buy_enter, '预计做多', close_new)
    }
    //                               } else if (pos > 0) {
    //
    //                               }



}


