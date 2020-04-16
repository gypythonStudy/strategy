var asset = {
    buyPrice: 0,
    sellPrice: 0,
    buyAmount: 0,
    sellAmount: 0,

}

var funding = 0; //期货账户开始金额
var Success = '#5cb85c'; //成功颜色
var Danger = '#ff0000'; //危险颜色
var Warning = '#f0ad4e'; //警告颜色
var runTime;
var bugGrids = [0.5, 0.3, 0.5, 0.5, 0.4, 0.5, 1, 1, 1.5]; //多网格
var sellGrids = [-0.5, -0.3, -0.5, -0.5, -0.4, -0.5, -1, -1, -1.5]; //空网格
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

/// 当前时间和前两分钟布林轨指数
function BOLLCheck() {

    var records = exchange.GetRecords(PERIOD_M1)
    if (records && records.length > 20) {
        var boll = TA.BOLL(records, 20, 2)
        //        var currrentPrice = GetTicker().Last; //当前价格
        var upLine = boll[0][records.length - 1]
        var midLine = boll[1][records.length - 1]
        var downLine = boll[2][records.length - 1]
        var ClosePrice3 = records[records.length - 1].Close // 收盘价格
        //        var HighPrice3 = records[records.length - 2].High // 最高价
        //        var LowPrice3 = records[records.length - 2].Low // 最低价
        var OpenPrice3 = records[records.length - 1].Open // 最低价

        //前一分钟布林
        var preupLine = boll[0][records.length - 2]
        var premidLine = boll[1][records.length - 2]
        var predownLine = boll[2][records.length - 2]
        var ClosePrice = records[records.length - 2].Close // 收盘价格
        //        var HighPrice = records[records.length - 2].High // 最高价
        //        var LowPrice = records[records.length - 2].Low // 最低价
        var OpenPrice = records[records.length - 2].Open // 最低价

        //前两分钟布林轨
        var preupLine2 = boll[0][records.length - 3]
        var premidLine2 = boll[1][records.length - 3]
        var predownLine2 = boll[2][records.length - 3]
        var ClosePrice2 = records[records.length - 3].Close // 收盘价格
        //        var HighPrice2 = records[records.length - 3].High // 最高价
        //        var LowPrice2 = records[records.length - 3].Low // 最低价
        var OpenPrice2 = records[records.length - 3].Open // 最低价

        var bollEnum = calcuetLine(OpenPrice3, ClosePrice3, upLine, midLine, downLine);
        var prebollEnum = calcuetLine(OpenPrice, ClosePrice, preupLine, premidLine, predownLine);
        var prebollEnum2 = calcuetLine(OpenPrice2, ClosePrice2, preupLine2, premidLine2, predownLine2);
        //        return {bollEnum:bollEnum,prebollEnum:prebollEnum,prebollEnum2:prebollEnum2};

        if (bollEnum == BOLLEnum.throughdownLine && (prebollEnum == BOLLEnum.throughdownLine || prebollEnum == BOLLEnum.beLowdownLine || prebollEnum2.underdownLine) && (prebollEnum2.throughdownLine || prebollEnum2.underdownLine || prebollEnum2.beLowdownLine)) {
            return 1;
        }

        if (bollEnum == BOLLEnum.beLowdownLine && (prebollEnum == BOLLEnum.throughdownLine || prebollEnum == BOLLEnum.beLowdownLine) && (prebollEnum2.throughdownLine || prebollEnum2.beLowdownLine)) {
            return -2.1;
        }

        if (bollEnum == BOLLEnum.underUpline && (prebollEnum == BOLLEnum.aboveUpline || prebollEnum == BOLLEnum.underUpline) && (prebollEnum2.aboveUpline || prebollEnum2.underUpline)) {
            return -2;
        }

        if (bollEnum == BOLLEnum.underUpline && (prebollEnum == BOLLEnum.aboveUpline || prebollEnum == BOLLEnum.underUpline || prebollEnum == BOLLEnum.abovemidLine) && (prebollEnum2.aboveUpline || prebollEnum2.underUpline || prebollEnum2 == BOLLEnum.abovemidLine)) {
            return -2.3;
        }

        if (bollEnum == BOLLEnum.throughmidLine && (prebollEnum == BOLLEnum.abovedownLine || prebollEnum == BOLLEnum.throughmidLine) && (prebollEnum2.abovedownLine || prebollEnum2.throughmidLine)) {
            return 2;
        }

        if (bollEnum == BOLLEnum.underdownLine && (prebollEnum == BOLLEnum.underdownLine) && (prebollEnum2.underdownLine)) {
            return -2.5;
        }
    }
    return 0;
}
//上 中 下
function calcuetLine(OpenPrice2, ClosePrice2, preupLine2, premidLine2, predownLine2) {
    //上之上
    if (OpenPrice2 >= preupLine2 && ClosePrice2 >= preupLine2) {
        return BOLLEnum.aboveUpline;
    }
    //中之上
    if (OpenPrice2 < preupLine2 && OpenPrice2 > premidLine2 && ClosePrice2 > premidLine2 && ClosePrice2 < preupLine2) {
        return BOLLEnum.abovemidLine;
    }
    //下之下
    if (OpenPrice2 < predownLine2 && ClosePrice2 < predownLine2) {
        return BOLLEnum.beLowdownLine;
    }
    //下之上
    if (OpenPrice2 < premidLine2 && OpenPrice2 > predownLine2 && ClosePrice2 > predownLine2 && ClosePrice2 < premidLine2) {
        return BOLLEnum.abovedownLine;
    }
    //下穿上
    if (OpenPrice2 >= preupLine2 && ClosePrice2 <= preupLine2) {
        return BOLLEnum.underUpline;
    }
    //上穿上
    if (OpenPrice2 < preupLine2 && ClosePrice2 >= preupLine2) {
        return BOLLEnum.throughUpline;
    }
    //下穿中
    if (OpenPrice2 > premidLine2 && ClosePrice2 < premidLine2) {
        return BOLLEnum.undermidLine;
    }
    //上穿中
    if (OpenPrice2 < premidLine2 && ClosePrice2 > premidLine2) {
        return BOLLEnum.throughmidLine;
    }
    //下穿下
    if (OpenPrice2 > predownLine2 && ClosePrice2 < predownLine2) {
        return BOLLEnum.underdownLine;
    }
    //上穿上
    if (OpenPrice2 < predownLine2 && ClosePrice2 > predownLine2) {
        return BOLLEnum.throughdownLine;
    }
    return "nil";
}

function MACDC() {
    var records = exchange.GetRecords(PERIOD_M1);
    if (!records) {
        return 0;
    }
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
    //    var thirdeModel = mcdArray[0];

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

    //    if ((firstModel.m >= 2 && firstModel.c >= 2 && firstModel.d > 0) && (secondeModel.m >= 2 && secondeModel.c >= 2  && secondeModel.d > 0)) {
    //        return -3;
    //    }

    return 0;

}

//function checkMACDValue(model,conditions1,conditions2,conditions3) {
//
//    if (model.m > conditions1) {
//        return true
//    }
//
//    return false;
//}

function MACheck() {
    var records = exchange.GetRecords(PERIOD_M1);
    if (!records) {
        return 0;
    }
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
    var buyCount = 0;
    var sellCount = 0
    for (var i = 0; i < mcdArray.length; i++) {
        var model = mcdArray[i];
        //if ((model.d > 0) && (model.m < 0) && (model.c < 0) && (model.m > model.c)) {
        if ((model.d > 0)) {

            buyCount += 1;
            if (i == 0) {
                firstBuy = true;
            }
            if ((model.m > 0.25 && model.c > 0.2) || (model.m < 0.08 && model.c < 0.06 && model.m > -0.1 && model.c < 0.12)) {
                firstBuy = false;
            }
            //            if (mcdArray[0].d - mcdArray[1].d < 0.02) {
            //                buyCount = 0;
            //            }
        }

        //if ((model.d < 0) && (model.m > 0) && (model.c > 0) && (model.m < model.c)) {
        if ((model.d < 0)) {

            sellCount = sellCount + 1;
            if (i == 0) {
                firstSell = true;
            }
            if (model.m > -0.25 && model.c > -0.2 && model.m < 0.15 && model.c < 0.1) {
                firstSell = false;
            }
            //            if (mcdArray[0].d - mcdArray[1].d < -0.02) {
            //                sellCount = 0;
            //            }
        }

    }

    //Log(buyCount, sellCount)
    //开多
    if (buyCount >= 2 && firstBuy) {
        return 1;
    }

    if (sellCount >= 2 && firstSell) {
        return -1;
    }

    return 0;

}

function ma7Check() {
    var records = exchange.GetRecords(PERIOD_M1)
    // K线bar数量满足指标计算周期
    if (records && records.length > 7) {
        var ma = TA.MA(records, 7)
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


    }

    return 0;

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
                if (position[0].Amount != position[0].FrozenAmount) {
                    startBuyGrids()
                }
            } else if (position[i].Type == 1) {
                asset.sellPrice = position[i].Price;
                asset.sellAmount = position[i].Amount;
                asset.sellMargin = position[i].Margin;
                asset.sellProfit = position[i].Profit;
                if (position[0].Amount != position[0].FrozenAmount) {
                    startSellGrids();
                }

            }
            Stocks_ = Stocks_ + position[i].Margin;
        }
        return true;
    }

    return false
}

//价格取样 防止利润回吐
//function checkBuyPrice(close) {
//
//    var records = exchange.GetRecords(PERIOD_M1);
//    var priceArr = new Array()
//    for (var i = 0;i < 4; i++) {
//        var model = records[records.length - 1 -i];
//        priceArr.push(model.Close)
//    }
//    var currrentPrice = GetTicker().Last; //当前价格
//
//    //for (var i = 0;i < priceArr.length; i++) {
//    if (!close) {
//        if (((priceArr[0] <= priceArr[1]) || (priceArr[1] <= priceArr[2])) && asset.openprice <  currrentPrice) {
//            return true;
//        }
//    } else {
//        if (((priceArr[0] >= priceArr[1]) || (priceArr[1] >= priceArr[2])) &&  asset.openprice > currrentPrice) {
//            return true;
//        }
//    }
//    // }
//    return false;
//
//}

//价格取样 防止利润回吐
//function checkPrice() {
//
//    var records = exchange.GetRecords(PERIOD_M1);
//    var priceArr = new Array()
//    for (var i = 0;i < 4; i++) {
//        var model = records[records.length - 1 -i];
//        priceArr.push(model.Close)
//    }
//    var currrentPrice = GetTicker().Last; //当前价格
//
//    //for (var i = 0;i < priceArr.length; i++) {
//    if (asset.isOpenmore) {
//        if (((priceArr[0] <= priceArr[1]) || (priceArr[1] <= priceArr[2])) && asset.openprice <  currrentPrice) {
//            return true;
//        }
//    } else {
//        if (((priceArr[0] >= priceArr[1]) || (priceArr[1] >= priceArr[2])) &&  asset.openprice > currrentPrice) {
//            return true;
//        }
//    }
//    // }
//    return false;
//
//}

//function isCanClose() {
//    var records = exchange.GetRecords(PERIOD_M1);
//    var macd = TA.MACD(records)
//    var m = macd[0][records.length - 1];
//    var c = macd[1][records.length - 1];
//    var d = macd[2][records.length - 1];
//    var currrentPrice = GetTicker().Last; //当前价格
//    //    var result = BOLLCheck();
//    //    if (result) {
//    //        return result;
//    //    }
//    var ma7 = ma7Check()
//
//    if (asset.isOpenmore) {
//        /*
//         if (d < -0.12) {
//         Log(m,c,d);
//
//         Log('开多正常盈利离场', '@');
//
//         return true;
//         }
//
//
//         if (m > 0.12  && d < 0.12) {
//         Log(m,c,d);
//
//         Log('开多极限盈利离场', '@');
//
//         return 2;
//         }
//         */
//                var diff = (currrentPrice - asset.openprice) / asset.openprice * currrentPrice * asset.amount;
//
//        if (ma7 < 0 && ((diff <= -1.2) || diff > 0)) {
//            Log('开多ma7', ma7, '盈利', diff, '@');
//            return 2;
//        }
//
//        if (diff >= 2) {
//            Log('开多盈利离场', diff, '@');
//            return 2;
//        }
//        diff = (asset.openprice - currrentPrice) / asset.openprice * currrentPrice * asset.amount;
//        if ((currrentPrice < asset.openprice) && (diff >= (2.2 * asset.amount))) {
//            //加仓
//            //            if (asset.amount < 2) {
//            //                Log('开多补仓', diff,'@');
//            //
//            //                return 1;
//            //            }
//            Log('开多止损离场', diff, '@');
//
//            return 2;
//        }
//
//
//    } else {
//                var diff = (asset.openprice - currrentPrice) / asset.openprice * currrentPrice * asset.amount;
//
//        if (ma7 > 0 && ((diff <= -1.2) || diff)) {
//            Log('开空ma7', ma7, '盈利', diff, '@');
//            return 2;
//        }
//        /*
//         if (d > 0.12) {
//         Log('开空正常离场', '@');
//         Log(m,c,d);
//
//         return true
//         }
//
//
//         if (m < -0.12 && d > -0.12) {
//         Log(m,c,d);
//         Log('开空极限离场', '@');
//
//         return 2;
//         }
//         */
//
//        if (diff >= 2) {
//            Log('开空获利离场', diff, '@');
//            return 2;
//        }
//        diff = (currrentPrice - asset.openprice) / asset.openprice * currrentPrice * asset.amount;
//        if ((currrentPrice > asset.openprice) && (diff >= (2.2 * asset.amount))) {
//            //加仓
//            //            if (asset.amount < 2) {
//            //                Log('开空补仓', diff,'@');
//            //
//            //                return 1;
//            //            }
//            Log('开空止损离场', diff, '@');
//
//            return 2;
//        }
//
//    }
//    return 0;
//}

function closeBuyAction(currrentPrice) {
    var currrentPrice = GetTicker().Last; //当前价格
    var spreads = currrentPrice - asset.buyPrice;
    if (spreads > 0 && asset.buyAmount > 0) {
        exchange.SetDirection("closebuy")
        cancleOrders(ORDER_TYPE_SELL)
        Log('closema7:', gyma7, 'mcd7:', gymcd7, 'bool7:', gybool7, 'sum:', gysum, '@');
        Log('开多盈利离场', spreads, '@');
        var buyid = exchange.Sell(currrentPrice - 1, asset.buyAmount)
        if (buyid) {
            exchange.CancelOrder(buyid)
        }
        asset.buyAmount = 0; //默认卖出成功

    }
}

function closeSellAction(currrentPrice) {
    var spreads = asset.sellPrice - currrentPrice;
    if (spreads > 0 && asset.sellAmount > 0) {
        exchange.SetDirection("closesell")
        cancleOrders(ORDER_TYPE_BUY)
        Log('closema7:', gyma7, 'mcd7:', gymcd7, 'bool7:', gybool7, 'sum:', gysum, '@');
        Log('开空盈利离场', spreads, '@');
        var buyid = exchange.Buy(currrentPrice + 1, asset.sellAmount)
        if (buyid) {
            exchange.CancelOrder(buyid)
        }
        asset.sellAmount = 0; //默认卖出成功
    }
}


function checkIsHaveaddAction(oredrType) {
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
                    return true;
                }
            }
        }
    }
    return false;
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

function addBuyAction(currrentPrice) {
    //检测当前是否已挂加仓订单。
    if (!checkIsHaveaddAction(ORDER_TYPE_BUY) && checkBoll(true)) {

        openAction("buy");
        startBuyGrids();
        Log('开多补仓', '@');
    }
}

function addSellAction(currrentPrice) {
    if (!checkIsHaveaddAction(ORDER_TYPE_SELL) && checkBoll(false)) {
        openAction("sell");
        startSellGrids();
        Log('开空补仓', '@');
    }

}

function getBlance() {
    var account = exchange.GetAccount();
    return account.Balance;
}

function closeAction() {
    var currrentPrice = GetTicker().Last; //当前价格
    //    var account = exchange.GetAccount();
    //    var total_balance = _N(parseFloat(account.Info.totalWalletBalance), 2);
    // Log(total_balance)
    blance_ = getBlance();
    var currrentPrice = GetTicker().Last; //当前价格

    if (asset.buyAmount > 0 && (asset.buyPrice - currrentPrice > 2.8) && asset.buyAmount < 6) {
        //补仓操作
        addBuyAction(currrentPrice)
        return;
    }

    if (asset.sellAmount > 0 && (currrentPrice - asset.sellPrice > 2.8) && asset.sellAmount < 6) {
        //补仓操作
        addSellAction(currrentPrice)
        return;
    }

    //条件需修改
    //取消当前排版 盈利>0.1时
    if ((gysum <= -3.5)) {
        closeBuyAction(currrentPrice)
    } else if ((gysum >= 3.5)) {
        closeSellAction(currrentPrice)
    }
    /* 待修改
    if (asset.isOpenmore ) {
        var diff = (asset.openprice - currrentPrice) / asset.openprice * currrentPrice * asset.amount;
        if ((currrentPrice < asset.openprice) && (diff >= (2.8 * asset.amount))) {
            Log('开多止损离场', diff, '@');
            exchange.SetDirection("closebuy")
            Log('closema7:', gyma7 ,'mcd7:',gymcd7,'bool7:',gybool7,'sum:',gysum,'@');

            var buyid = exchange.Sell(currrentPrice - 1, asset.amount)
            if (buyid) {
                exchange.CancelOrder(buyid)
            }
            Sleep(1000 * 60 * 30);//止损休眠
        }

    } else {
        var diff = (currrentPrice - asset.openprice) / asset.openprice * currrentPrice * asset.amount;
        if ((currrentPrice > asset.openprice) && (diff >= (2.8 * asset.amount))) {
            Log('开空止损离场', diff, '@');

            exchange.SetDirection("closesell")
            var buyid = exchange.Buy(currrentPrice + 1, asset.amount)
            if (buyid) {
                exchange.CancelOrder(buyid)
            }
            Log('closema7:', gyma7 ,'mcd7:',gymcd7,'bool7:',gybool7,'sum:',gysum,'@');
            Sleep(1000 * 60 * 30);//止损休眠
        }


    }
     */

}



function openAction(type) {
    var tick = GetTicker(); //当前价格
    exchange.SetDirection(type)
    if (type == "buy") {
        checkIsHaveaddAction(ORDER_TYPE_BUY)
        var buyPrice = tick.Buy; //当前价格
        var buyCount = 4;
        if (asset.buyAmount == 0) {
//            buyPrice = tick.Last + 1;
            tradingCounter("buyNumber", 1);

        } else {
            checkIsHaveaddAction(ORDER_TYPE_SELL)
            if (asset.buyAmount == 2) {
                buyCount = buyCount * 2;
            }
            tradingCounter("addBuyNumber", 1);


        }


        //容错防止一直开仓导致爆仓
        if (asset.buyAmount < 6) {
            checkIsHaveaddAction(ORDER_TYPE_BUY)
            var buyid = exchange.Buy(buyPrice, buyCount)
            if (buyid && asset.buyAmount == 0) {
                exchange.CancelOrder(buyid)
            }
        }

    } else {
        var sellPrice = tick.Sell; //当前价格
        var sellCount = 4
        if (asset.sellAmount == 0) {
//            sellPrice = tick.Last - 1;
            tradingCounter("sellNumber", 1);

        } else {
            if (asset.sellAmount == 2) {
                //                sellCount = 4;
            }
            tradingCounter("addsellNumber", 1);
        }
        if (asset.sellAmount < 6) {
            var buyid = exchange.Sell(sellPrice, sellCount)
            if (buyid && asset.sellAmount == 0) {
                exchange.CancelOrder(buyid)
            }
        }
    }
    Sleep(1000);
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



function AppendedStatus() {
    /*
    var accountTable = {
        type: "table",
        title: "币种信息",
        cols: ["运行时间",'初始资金','盈利资金',"开仓方向", "开仓价格", "当前价格", "盈利信息",'ma7','mcd7', 'bool7','sum'],
        rows: []
    };
    var runday = runTime.dayDiff;
    if (runday == 0) {
        runday = 1;
    }
    //     var profitColors = Danger;
    //     var totalProfit = assets.USDT.total_balance - funding; //总盈利
    //     if (totalProfit > 0) {
    //         profitColors = Success;
    //     }
    //     var dayProfit = totalProfit / runday; //天盈利
    //     var dayRate = dayProfit / funding * 100;
    var currrentPrice = GetTicker().Last; //当前价格
    var diff = _N(((asset.openprice - currrentPrice) / asset.openprice) * currrentPrice * asset.amount,2);
    if (asset.isOpenmore) {
        diff = _N(((currrentPrice - asset.openprice) / asset.openprice) * currrentPrice * asset.amount,2);
    }
    var gyBlance = _N(parseFloat(blance_ + Stocks_  - initBlance),2);
    accountTable.rows.push([
        runday,
        '$' + initBlance,
        '$' + gyBlance + (((blance_ + Stocks_  - initBlance) >= 0) ?  Success :  Danger),
        (asset.isOpenmore ? "多" + Success : "空" + Danger),
        '$' + asset.openprice,
        '$' + currrentPrice,
        '$' + diff + Success,
        gyma7,
        gymcd7,
        gybool7,
        gysum,
    ]);
    return runTime.str + '\n' + '`' + JSON.stringify(accountTable) + '`\n' + "更新时间: " + _D() + '\n';
                              */

    var accountTable = {
        type: "table",
        title: "币种信息",
        cols: ["运行时间", '初始资金', '总盈利', '当前价格', 'ma7', 'mcd7', 'bool7', 'sum'],
        rows: []
    };
    var runday = runTime.dayDiff;
    if (runday == 0) {
        runday = 1;
    }
    //     var profitColors = Danger;
    //     var totalProfit = assets.USDT.total_balance - funding; //总盈利
    //     if (totalProfit > 0) {
    //         profitColors = Success;
    //     }
    //     var dayProfit = totalProfit / runday; //天盈利
    //     var dayRate = dayProfit / funding * 100;
    var currrentPrice = GetTicker().Last; //当前价格
    //       var diff = _N(((asset.openprice - currrentPrice) / asset.openprice) * currrentPrice * asset.amount,2);
    //       if (asset.isOpenmore) {
    //           diff = _N(((currrentPrice - asset.openprice) / asset.openprice) * currrentPrice * asset.amount,2);
    //       }
    //       var gyBlance = _N(parseFloat(blance_ + Stocks_  - initBlance),2);
    blance_ = getBlance();
    accountTable.rows.push([
        runday,
        '$' + initBlance,
        _N((blance_ + Stocks_ - initBlance + takeupBlance), 2) + Success,
        currrentPrice,
        gyma7,
        gymcd7,
        gybool7,
        gysum,
    ]);
    var exchangecount = (_G("buyNumber") ? _G("buyNumber") : 0) + (_G("addBuyNumber") ? _G("addBuyNumber") : 0) + (_G("sellNumber") ? _G("sellNumber") : 0) + (_G("addsellNumber") ? _G("addsellNumber") : 0)
    return runTime.str + '\n' + "更新时间: " + _D() + '\n' + '总交易次数:' + exchangecount + '\n' + '`' + JSON.stringify(accountTable) + '`\n';

}



var gyma7 = 0;
var gymcd7 = 0;
var gybool7 = 0;
var gysum = 0;

var blance_ = 0;
var initBlance = 1527.43;
var Stocks_ = 0;
var takeupBlance = 0;

function caclueProfile() {
    //     var position = exchange.GetPosition()
    //     if (position.length > 0) {
    //         var currrentPrice = GetTicker().Last; //当前价格
    //         Stocks_ = position[0].Margin
    //     } else {
    //         Stocks_ = 0;
    //     }
    var account = exchange.GetAccount();
    blance_ = account.Balance;
    LogProfit(blance_ + Stocks_ - initBlance + takeupBlance);

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


function startBuyGrids() {
    exchange.SetDirection("closebuy")
    //取消当前closeBuy订单 重新排版
    cancleOrders(ORDER_TYPE_SELL)
    var position = exchange.GetPosition()
    if (position && position.length > 0) {
        for (var j = 0; j < position.length; j++) {
            if (position[j].Type == 0) {
                for (var i = 0; i < bugGrids.length; i++) {
                    var buyid = exchange.Sell(position[j].Price + bugGrids[i], 1)
                }
                break;
            }
        }
    }
}

function startSellGrids() {
    //取消当前closesell订单 重新排版
    cancleOrders(ORDER_TYPE_BUY)
    exchange.SetDirection("closesell")
    var position = exchange.GetPosition()

    if (position && position.length > 0) {
        for (var j = 0; j < position.length; j++) {
            if (position[j].Type == 1) {
                for (var i = 0; i < sellGrids.length; i++) {
                    var buyid = exchange.Buy(position[j].Price + sellGrids[i], 1)
                }
                break;
            }
        }
    }
}


function main() {

    exchange.SetContractType("swap")
    exchange.SetMarginLevel(10)
    exchange.IO("currency", "BSV_USDT")
    var account = exchange.GetAccount();
    blance_ = account.Balance;
    SetErrorFilter('CancelOrder|Buy|400|Sell')
    var count = 0;
    while (true) {
        gyma7 = ma7Check();
        gymcd7 = MACDC();
        gybool7 = BOLLCheck();
        gysum = gyma7 + gymcd7 + gybool7;
        //检查当前是否持仓
        if (checkAmount()) {
            closeAction()
        }

        if (gysum >= 4 && asset.buyAmount < 2) {
            cancleaddAction(ORDER_TYPE_BUY)
            openAction("buy")
            Log('开多ma7:', gyma7, 'mcd7:', gymcd7, 'bool7:', gybool7, 'sum:', gysum, '@');
            startBuyGrids();
        }

        if (gysum <= -4 && asset.sellAmount < 2) {
            cancleaddAction(ORDER_TYPE_SELL)
            openAction("sell")
            Log('开空ma7:', gyma7, 'mcd7:', gymcd7, 'bool7:', gybool7, 'sum:', gysum, '@');
            startSellGrids();
        }

        runTime = RuningTime();

        if (count >= 300) {
            count = 0;
            caclueProfile()
        }
        count += 1;
        updateStatus()

        //等待下次查询交易所
        Sleep(1000 * 2);

    }
}

function updateStatus() { //状态栏信息
    var table = {
        type: 'table',
        title: '交易对信息',
        cols: ['编号', '币种信息', '开仓方向', '开仓数量', '持仓价格', '开仓次数', '补仓次数', '占用保证金', '可用保证金'],
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
        asset.sellMargin + Danger,
        _N(blance_, 2) + (blance_ > 500 ? Success : Danger),

    ]);

    // var logString = _D() + '   ' + JSON.stringify(assets.USDT) + ' Index:' + index + '\n';
    LogStatus(AppendedStatus() + '`' + JSON.stringify(table) + '`' + hasOrders());

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


function tradingCounter(key, newValue) {
    var value = _G(key);
    if (!value) {
        _G(key, newValue);
    } else {
        _G(key, value + newValue);
    }
}

function checkBoll(isOpenmore) {


    var records = exchange.GetRecords(PERIOD_M1)
    if (records && records.length > 20) {
        var boll = TA.BOLL(records, 20, 2)
        var currrentPrice = GetTicker().Last; //当前价格
        var upLine = boll[0][records.length - 1]
        var midLine = boll[1][records.length - 1]
        var downLine = boll[2][records.length - 1]
        //       var ClosePrice3 = records[records.length - 1].Close // 收盘价格
        //       //        var HighPrice3 = records[records.length - 2].High // 最高价
        //       //        var LowPrice3 = records[records.length - 2].Low // 最低价
        //       var OpenPrice3 = records[records.length - 1].Open // 最低价
        if (isOpenmore) {
            var conditions = (upLine + midLine) / 2;

            if (currrentPrice > conditions) {
                return false
            } else {
                Log('checkBool防止连续开多')
                return true;
            }
        } else {
            var conditions = (midLine + downLine) / 2;

            if (currrentPrice < conditions) {
                return false
            } else {
                Log('checkBool防止连续开空')
                return true;
            }

        }




    }
    return false;
}

