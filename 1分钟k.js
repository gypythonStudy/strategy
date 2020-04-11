
var asset = {
amount: 0,
close: true,
openprice: 0,
openHigh:0,
type:"buy",
currentOrderid:0
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

function BOLLCheck() {
    
    var records = exchange.GetRecords(PERIOD_M1)
    if(records && records.length > 20) {
        var boll = TA.BOLL(records, 20, 2)
        var upLine = boll[0][records.length - 1]
        var midLine = boll[1][records.length - 1]
        var downLine = boll[2][records.length - 1]
        var currrentPrice = GetTicker().Last; //当前价格
        if (asset.close) {
            if (currrentPrice >= upLine) {
                return true;
            }
        } else {
            
            if (currrentPrice <= downLine) {
                return true;
            }
        }
        
        return false;
    }
    
    
}

function MACheck() {
    var records = exchange.GetRecords(PERIOD_M1);
    //var ma = TA.EMA(records, EMATime);
    if (!records) {
        return 0;
    }
    var macd = TA.MACD(records)
    //Log(macd[0][records.length-1], macd[1][records.length-1], macd[2][records.length-1]);
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
            if (mcdArray[0].d - mcdArray[1].d < 0.02) {
                buyCount = 0;
            }
        }
        
        if ((model.d < 0) && (model.m > 0) && (model.c > 0) && (model.m < model.c)) {
            sellCount = sellCount + 1;
            if (i == 0) {
                firstSell = true;
            }
            if (mcdArray[0].d - mcdArray[1].d < -0.02) {
                sellCount = 0;
            }
        }
        
        
    }
    
    //Log(buyCount, sellCount)
    //开多
    if (buyCount >= 2 && firstBuy && checkBuyPrice(true)) {
        
        return 1;
    }
    
    if (sellCount >= 2 && firstSell && checkBuyPrice(false)) {
        return -1;
    }
    
    return 0;
    
}

function ma7Checke() {
    var records = exchange.GetRecords(PERIOD_M1)
    // K线bar数量满足指标计算周期
    if (records && records.length > 7) {
        var ma = TA.MA(records, 7)
        Log(ma)
        return ma;
    }
    return 0;
    
    
    
}

function checkAmount() {
    var position = exchange.GetPosition()
    if (position.length > 0) {
        // Log("Amount:", position[0].Amount, "FrozenAmount:", position[0].FrozenAmount, "Price:",
        //  position[0].Price, "Profit:", position[0].Profit, "Type:", position[0].Type,
        // "ContractType:", position[0].ContractType)
        if (position[0].Type == 0) {
            asset.close = true;
            asset.openHigh = 1;
            
        } else if (position[0].Type == 1) {
            asset.close = false;
            asset.openHigh = 2;
        }
        asset.openprice = position[0].Price;
        asset.amount = position[0].Amount
        asset.profit = position[0].Profit * 10;
        return true;
    }
    asset.amount = 0;
    return false
}

//价格取样 防止利润回吐
function checkBuyPrice(close) {
    
    var records = exchange.GetRecords(PERIOD_M1);
    var priceArr = new Array()
    for (var i = 0;i < 4; i++) {
        var model = records[records.length - 1 -i];
        priceArr.push(model.Close)
    }
    var currrentPrice = GetTicker().Last; //当前价格
    
    //for (var i = 0;i < priceArr.length; i++) {
    if (!close) {
        if (((priceArr[0] <= priceArr[1]) || (priceArr[1] <= priceArr[2])) && asset.openprice <  currrentPrice) {
            return true;
        }
    } else {
        if (((priceArr[0] >= priceArr[1]) || (priceArr[1] >= priceArr[2])) &&  asset.openprice > currrentPrice) {
            return true;
        }
    }
    // }
    return false;
    
}

//价格取样 防止利润回吐
function checkPrice() {
    
    var records = exchange.GetRecords(PERIOD_M1);
    var priceArr = new Array()
    for (var i = 0;i < 4; i++) {
        var model = records[records.length - 1 -i];
        priceArr.push(model.Close)
    }
    var currrentPrice = GetTicker().Last; //当前价格
    
    //for (var i = 0;i < priceArr.length; i++) {
    if (asset.close) {
        if (((priceArr[0] <= priceArr[1]) || (priceArr[1] <= priceArr[2])) && asset.openprice <  currrentPrice) {
            return true;
        }
    } else {
        if (((priceArr[0] >= priceArr[1]) || (priceArr[1] >= priceArr[2])) &&  asset.openprice > currrentPrice) {
            return true;
        }
    }
    // }
    return false;
    
}

function isCanClose() {
    var records = exchange.GetRecords(PERIOD_M1);
    //var ma = TA.EMA(records, EMATime);
    var macd = TA.MACD(records)
    //Log(macd[0][records.length-1], macd[1][records.length-1], macd[2][records.length-1]);
    var m = macd[0][records.length - 1];
    var c = macd[1][records.length - 1];
    var d = macd[2][records.length - 1];
    var currrentPrice = GetTicker().Last; //当前价格
    var result = BOLLCheck();
    if (result) {
        return result;
    }
    if (asset.close) {
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
        
        
        /*
         if (asset.profit >= 2.5) {
         Log('开多盈利离场',asset.profit, '@');
         return true;
         }
         
         if (asset.profit <= -3) {
         Log('开多止损离场',asset.profit, '@');
         return true;
         }
         */
        
        var diff = (currrentPrice - asset.openprice) / asset.openprice * currrentPrice * asset.amount;
        if (diff >= 2.5) {
            Log('开多盈利离场',diff, '@');
            return 2;
        }
        diff = (asset.openprice - currrentPrice) / asset.openprice * currrentPrice * asset.amount;
        if ((currrentPrice < asset.openprice) && (diff >= (2.2 * asset.amount))) {
            asset.openHigh = 0;
            //加仓
            if (asset.amount < 2) {
                Log('开多补仓', diff,'@');
                
                return 1;
            }
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
        
        /*
         if (asset.profit >= 2.5) {
         Log('开空盈利离场',asset.profit, '@');
         return true;
         }
         
         if (asset.profit <= -3) {
         Log('开空止损离场',asset.profit, '@');
         return true;
         }
         */
        
        var diff = (asset.openprice - currrentPrice) / asset.openprice * currrentPrice * asset.amount;
        if (diff >= 2.5) {
            Log('开空获利离场', diff,'@');
            return 2;
        }
        diff = (currrentPrice - asset.openprice) / asset.openprice * currrentPrice * asset.amount;
        if ((currrentPrice > asset.openprice) && (diff >= (2.2 * asset.amount))) {
            asset.openHigh = 0;
            //加仓
            if (asset.amount < 2) {
                Log('开空补仓', diff,'@');
                
                return 1;
            }
            Log('开空止损离场',diff,'@');
            
            return 2;
        }
        
    }
    return 0;
}

function closeAction() {
    var currrentPrice = GetTicker().Last; //当前价格
    if (asset.close) {
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
            if (result === 1 && asset.openHigh != 1) {
                // NiuShi_Do();
                // printProfit()
                // isBuy = true;
                // loginfoAccount();
                openAction("buy")
                Log('开多');
                Log('开多:', '@');
            } else if (result === -1&& asset.openHigh != 2) {
                // XiongShi_Do();
                //printProfit()
                //isBuy = true;
                //loginfoAccount();
                openAction("sell")
                Log('开空');
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
            
            ///Log(asset.profit)
            /*
             var currrentPrice = GetTicker().Last; //当前价格
             
             if (asset.close) {
             //Log((asset.openprice - currrentPrice),asset.openprice,currrentPrice)
             var diff = (currrentPrice - asset.openprice) / asset.openprice * currrentPrice  * asset.amount;
             
             Log('多获利', diff)
             } else {
             
             var diff = (asset.openprice - currrentPrice ) / asset.openprice * currrentPrice * asset.amount;
             Log('空获利', diff)
             
             }
             */
            
        }
        // BOLLCheck();
        
        //等待下次查询交易所
        Sleep(1000);
        
    }
}

