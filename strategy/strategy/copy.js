

function getAroon(r) {
    var arron = talib.AROON(r,14);
    Log(arron[1][r.length - 1] + '===1')

    return arron[0][r.length - 1]
}

function getMACD(r) {
    var macd = talib.MACD(r);
    Log(macd[0][r.length - 1] + 'M===0')
    Log(macd[1][r.length - 1] + 'A===1')
    Log(macd[0][r.length - 1] + 'C===2')
}

function getEMA(r,n) {
    if (typeof(n) == 'undefined') {
           n = 7;
       }
    var ema = talib.EMA(r,n);
    return ema[0][r.length - 1]
}

function FailedSleep(type) {
    Sleep(3)
    Log(type+'api请求失败,休眠3s')
}
//
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


function getDirection(r) {
    
    
    var ma7 = getEMA(r,7)
    var ma15 = getEMA(r,15)
    var ma30 = getEMA(r,30)
    var ma60 = getEMA(r,60)
    var ma80 = getEMA(r,80)
    
    var currentPrice = GetTicker().Last
    

}

function getRecords(e) {
    if (typeof(e) == 'undefined') {
        e = PERIOD_M1;
    }
    var records = exchange.GetRecords(e);
    if (!records || records.length < 70) {
        FailedSleep('获取Bar失败')
        return;
    }
    return records;
}


function closeSellAction(currrentPrice) {
    exchange.SetDirection("closesell")
    var buyid = exchange.Buy(currrentPrice, 10)
       
}

function closeBuyAction(currrentPrice) {
    exchange.SetDirection("closebuy")
    var buyid = exchange.Sell(currrentPrice, 10)

}

function openAction(type, price, count) {
    var tick = GetTicker(); //当前价格
    exchange.SetDirection(type)
    if (type == "buy") {
        // tradingCounter("buyNumber", 1);
        //容错防止一直开仓导致爆仓
            exchange.Buy(price, _N(count, 2))
    } else {
        //tradingCounter("sellNumber", 1);
            exchange.Sell(price, _N(count, 2))
    }
    Sleep(1000 * 60);
}

var mp = 0 ;

function getBias(r,row) {
    
    var close_2 = r[r.length - 2].Close
    var ma_7 = talib.MA(r,row)[r.length - 2];
    var bisa_7 = (close_2 - ma_7)/ma_7 * 100;
    return bisa_7;
                      
}


function trade() {
    
    var r = getRecords(PERIOD_H1);
    if (!r || r.length < 60) {
        return;
    }
    var bias_7 = getBias(r,7);
    var bias_60 = getBias(r,60);
    var currentPrice = GetTicker().Last

    if (bias_7 > 0 && bias_60 < 0) {
        //开空
        if (mp < 0) {
            mp = 0
//            Log('平空',currentPrice)
            closeSellAction(currentPrice)
        } else if (mp == 0) {
            mp = 1;
//            Log('开多',currentPrice)
            openAction("buy",currentPrice,10)
        }
    }
    
    if (bias_7 < 0 && bias_60 > 0) {
        //开多
        if (mp > 0) {
            mp = 0
//            Log('平多',currentPrice)
            closeBuyAction(currentPrice);
        } else if (mp == 0) {
            mp = -1
            openAction("sell",currentPrice,10)
//            Log('开空',currentPrice)
        }
    }
    
       if (bias_7 > 3 && mp == 1) {
            mp = 0
            Log('平多',currentPrice)
            closeBuyAction(currentPrice);
        }
                       
       if (bias_7 < -4.5 && mp == -1) {
               mp = 0
               Log('平空',currentPrice)
               closeSellAction(currentPrice)
        }

    
}

function main() {
    
    exchange.SetContractType("quarter")
    exchange.SetMarginLevel(100)
    exchange.IO("currency", "BTC_USDT")
    var account = exchange.GetAccount()
    Log(account);
        
        while (1) {
         
            
            
//            Log(getAroon(r))
//            getMACD()
            trade()
            Sleep(1000 * 60)
        }
   
}



//function getBias(r,row) {
//    var close_2 = r[r.length - 2].Close
//    var ma_7 = talib.MA(r,7)[r.length - 2];
//    var ma_60 = talib.MA(r,60)[r.length - 2];
//    var bisa_7 = (close_2 - ma_7)/ma_7 * 100;
//    var bisa_60 = (close_2 - ma_60)/ma_60 * 100;
//    Log('BISA7=='+ bisa_7)
//    Log('BISA60==' + bisa_60)
//    return (bisa_7/ma_7) * 100;
//
//}



