
var asset = {
amount: 0,
isOpenmore: true,
openprice: 0,
type:"buy",
currentOrderid:0
}

const BOLLEnum = {
aboveUpline: 'aboveUpline',
abovemidLine: 'abovemidLine',
abovedownLine: 'abovedownLine',
throughUpline: 'throughUpline',//突破上轨
    //throughHighUpline: 'throughHighUpline',////假突破上轨
throughmidLine: 'throughmidLine',//突破中轨
    //throughHighdownLine: 'throughHighdownLine',//假突破中轨
throughdownLine: 'throughdownLine',//突破下轨
underUpline:'underUpline',//上轨之下
undermidLine: 'undermidLine',//中轨之下
underdownLine: 'underdownLine',//下轨之下
    //underLowdownLine: 'underLowdownLine',////假下轨之下
    
}

const MA7Enum = {
above: 'aboveline',
throughup: 'throughupline',//突破上轨
throughdow: 'throughdowline',//突破上轨
under:'underline',//上轨之下
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
    if(records && records.length > 20) {
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
        
        var bollEnum = calcuetLine(OpenPrice3,ClosePrice3,upLine,midLine,downLine);
        var prebollEnum = calcuetLine(OpenPrice,ClosePrice,preupLine,premidLine,predownLine);
        var prebollEnum2 = calcuetLine(OpenPrice2,ClosePrice2,preupLine2,premidLine2,predownLine2);
        return {bollEnum:bollEnum,prebollEnum:prebollEnum,prebollEnum2:prebollEnum2};
    }
    return nil;
}

function calcuetLine(OpenPrice2,ClosePrice2,preupLine2,premidLine2,predownLine2) {
    if (OpenPrice2 > preupLine2 && ClosePrice2 > preupLine2) {
        return BOLLEnum.aboveUpline;
    }
    
    if (OpenPrice2 > preupLine2 && ClosePrice2 < preupLine2) {
        return BOLLEnum.underUpline;
    }
    
    if (OpenPrice2 < preupLine2 && ClosePrice2 > preupLine2) {
        return BOLLEnum.throughUpline;
    }
    
    if (OpenPrice2 > premidLine2 && ClosePrice2 > premidLine2)  {
        return BOLLEnum.abovemidLine;
    }
    
    if (OpenPrice2 > premidLine2 && ClosePrice2 < premidLine2)  {
        return BOLLEnum.undermidLine;
    }
    
    if (OpenPrice2 < premidLine2 && ClosePrice2 > premidLine2)  {
        return BOLLEnum.throughmidLine;
    }
    
    if (OpenPrice2 > predownLine2 && ClosePrice2 > predownLine2)  {
        return BOLLEnum.abovedownLine;
    }
    
    if (OpenPrice2 > predownLine2 && ClosePrice2 < predownLine2)  {
        return BOLLEnum.underdownLine;
    }
    
    if (OpenPrice2 < predownLine2 && ClosePrice2 > predownLine2)  {
        return BOLLEnum.throughdownLine;
    }
    Log(calcuetLine失败)
    return nil;
}

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
        if ((model.d > 0) && (model.m < 0) && (model.c < 0) && (model.m > model.c)) {
            buyCount += 1;
            if (i == 0) {
                firstBuy = true;
            }
            //            if (mcdArray[0].d - mcdArray[1].d < 0.02) {
            //                buyCount = 0;
            //            }
        }
        
        if ((model.d < 0) && (model.m > 0) && (model.c > 0) && (model.m < model.c)) {
            sellCount = sellCount + 1;
            if (i == 0) {
                firstSell = true;
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
        var ma1 = boll[0][records.length - 1]
        var open = records[records.length - 1].Close // 收盘价格
        var close = records[records.length - 1].Open // 最低价
        
        var ma2 = boll[1][records.length - 2]
        var open2 = records[records.length - 2].Close // 收盘价格
        var close2 = records[records.length - 2].Open // 最低价
        
        var ma3 = boll[2][records.length - 3]
        var open3 = records[records.length - 3].Close // 收盘价格
        var close3 = records[records.length - 3].Open // 最低价
        
        
    }
    
    return nil;
    
}

function calcuetma7(ma,open,close) {
    
    if (open <= ma && close <= ma) {
        return MA7Enum.under
    }
    
    if (open >= ma && close <== ma) {
        return MA7Enum.throughdow
    }
    
    if (open <= ma && close <= ma) {
        return MA7Enum.above;
    }
    
    if (open <= ma && close >= ma) {
        return MA7Enum.throughup;
    }
    
    Log(calcuetLine失败)
    return nil;
    
}



function checkAmount() {
    var position = exchange.GetPosition()
    if (position.length > 0) {
        // Log("Amount:", position[0].Amount, "FrozenAmount:", position[0].FrozenAmount, "Price:",
        //  position[0].Price, "Profit:", position[0].Profit, "Type:", position[0].Type,
        // "ContractType:", position[0].ContractType)
        if (position[0].Type == 0) {
            asset.isOpenmore = true;
            
        } else if (position[0].Type == 1) {
            asset.isOpenmore = false;
        }
        asset.openprice = position[0].Price;
        asset.amount = position[0].Amount
        return true;
    }
    asset.amount = 0;
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

function isCanClose() {
    var records = exchange.GetRecords(PERIOD_M1);
    var macd = TA.MACD(records)
    var m = macd[0][records.length - 1];
    var c = macd[1][records.length - 1];
    var d = macd[2][records.length - 1];
    var currrentPrice = GetTicker().Last; //当前价格
    //    var result = BOLLCheck();
    //    if (result) {
    //        return result;
    //    }
    if (asset.isOpenmore) {
        /*
         if (d < -0.12) {
         Log(m,c,d);
         
         Log('开多正常盈利离场', '@');
         
         return true;
         }
         
         
         if (m > 0.12  && d < 0.12) {
         Log(m,c,d);
         
         Log('开多极限盈利离场', '@');
         
         return 2;
         }
         */
        
        
        var diff = (currrentPrice - asset.openprice) / asset.openprice * currrentPrice * asset.amount;
        if (diff >= 2.5) {
            Log('开多盈利离场',diff, '@');
            return 2;
        }
        diff = (asset.openprice - currrentPrice) / asset.openprice * currrentPrice * asset.amount;
        if ((currrentPrice < asset.openprice) && (diff >= (2.2 * asset.amount))) {
            //加仓
//            if (asset.amount < 2) {
//                Log('开多补仓', diff,'@');
//
//                return 1;
//            }
            Log('开多止损离场', diff,'@');
            
            return 2;
        }
        
        
    } else {
        /*
         if (d > 0.12) {
         Log('开空正常离场', '@');
         Log(m,c,d);
         
         return true
         }
         
         
         if (m < -0.12 && d > -0.12) {
         Log(m,c,d);
         Log('开空极限离场', '@');
         
         return 2;
         }
         */
        
        var diff = (asset.openprice - currrentPrice) / asset.openprice * currrentPrice * asset.amount;
        if (diff >= 2.5) {
            Log('开空获利离场', diff,'@');
            return 2;
        }
        diff = (currrentPrice - asset.openprice) / asset.openprice * currrentPrice * asset.amount;
        if ((currrentPrice > asset.openprice) && (diff >= (2.2 * asset.amount))) {
            //加仓
//            if (asset.amount < 2) {
//                Log('开空补仓', diff,'@');
//
//                return 1;
//            }
            Log('开空止损离场',diff,'@');
            
            return 2;
        }
        
    }
    return 0;
}

function closeAction() {
    var currrentPrice = GetTicker().Last; //当前价格
    if (asset.isOpenmore) {
        exchange.SetDirection("closebuy")
        var buyid = exchange.Sell(currrentPrice - 1, asset.amount)
        if (buyid) {
            exchange.CancelOrder(buyid)
        }
    } else {
        exchange.SetDirection("closesell")
        var buyid = exchange.Buy(currrentPrice + 1, asset.amount)
        if (buyid) {
            exchange.CancelOrder(buyid)
        }
    }
    Sleep(1000 * 20);
    
}

function openAction(type) {
    var tick = GetTicker(); //当前价格
    exchange.SetDirection(type)
    if (type == "buy") {
        asset.type = "buy";
        var buyPrice = tick.Buy; //当前价格
        
        if (asset.amount == 0) {
            buyPrice = tick.Last + 1;
        }
        var buyid = exchange.Buy(buyPrice, 1)
        if (buyid) {
            exchange.CancelOrder(buyid)
        }
        
    } else {
        asset.type = "sell";
        var sellPrice = tick.Sell; //当前价格
        
        if (asset.amount == 0) {
            sellPrice = tick.Last - 1;
        }
        var buyid = exchange.Sell(sellPrice, 1)
        if (buyid) {
            exchange.CancelOrder(buyid)
        }
    }
    Sleep(1000);
}

function main() {
    Log(exchange.GetAccount());
    exchange.SetContractType("swap")
    exchange.SetMarginLevel(10)
    exchange.IO("currency", "BSV_USDT")
    
    while (true) {
        //检查当前是否持仓
        
        if (!checkAmount()) {
            
            //确定是否在MACD牛市范围
            var result = MACheck();
            if (result === 1) {
                openAction("buy")
                Log('开多:', '@');
            } else if (result === -1) {
                openAction("sell")
                Log('开空:', '@');
            }
        } else {
            //加仓操作
            if (isCanClose() == 1) {
                openAction(asset.type)
            } else  {
                //平仓操作
                if (isCanClose() == 2) {
                    closeAction()
                }
            }
            
        }
        
        //等待下次查询交易所
        Sleep(1000 * 10);
        
    }
}

