function getAroon(r) {
    var arron = talib.AROON(r, 14);
    Log(arron[1][r.length - 1] + '===1')

    return arron[0][r.length - 1]
}

function getMACD(r) {
    var macd = talib.MACD(r);
    Log(macd[0][r.length - 1] + 'M===0')
    Log(macd[1][r.length - 1] + 'A===1')
    Log(macd[0][r.length - 1] + 'C===2')
}

function getEMA(r, n) {
    if (typeof(n) == 'undefined') {
        n = 7;
    }
    var ema = talib.EMA(r, n);
    return ema[0][r.length - 1]
}

function FailedSleep(type) {
    Sleep(3)
    Log(type + 'api请求失败,休眠3s')
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

function chatMock() {



}

function getExchangeAccountInfo() {
    var account = exchange.GetAccount()
    if (account) {
        return account.Info;
    } else {
        FailedSleep('账户信息');
    }
    return;
}

function AppendedStatus() {

    var accountTable = {
        type: "table",
        title: "当前信息",
        cols: ["运行时间", '更新时间', '当前价格', 'bisa_7', 'bisa_60', "当前bias_7", "当前bisa_60"],
        rows: []
    };
    runTime = RuningTime();
    var runday = runTime.dayDiff;
    if (runday == 0) {
        runday = 1;
    }
    var currrentPrice = GetTicker().Last; //当前价格
    accountTable.rows.push([
        runTime.str,
        _D(),
        currrentPrice,
        bias_7,
        bias_60,
        current_bias_7,
        current_bias_60,
    ]);
    return '`' + JSON.stringify(accountTable) + '`';

}

function StartTime() {
    var StartTime = _G("StartTime");
    if (StartTime == null) {
        StartTime = _D();
        _G("StartTime", StartTime);
    }
    return StartTime;
}

function initBlance() {
    var initBlance = _G("initBlance");
    if (initBlance == null) {
        initBlance = getExchangeAccountInfo();
        _G("initBlance", initBlance.equity);
    }
    return initBlance;
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
    ret.str = dayDiff + " 天 " + hours + " 小时 " + minutes + " 分钟";
    return ret;
}

function tradingCounter(key, newValue) {
    var value = _G(key);
    if (!value) {
        _G(key, newValue);
    } else {
        _G(key, value + newValue);
    }
}

function accountInfo() {
    var info = getExchangeAccountInfo()
    //    ['账户初始余额', '账户当前余额', '账户可用余额', '当前合约类型', '占用保证金','冻结保证金', '保证金与手续费', '已实现收益', '未实现收益']

    var table = {
        type: 'table',
        title: '账户信息',
        cols: ['初始余额', '当前余额', '可用余额', '合约类型', '占用保证金','冻结保证金', '已实现收益', '未实现收益'],
        rows: []
    };
    table.rows.push([
        initBlance(),
        info.total_avail_balance,
        info.can_withdraw,
        info.underlying ? info.underlying : BTC_USDT ,
        info.margin_frozen ? info.margin_frozen : 0,
        info.margin_for_unfilled ? info.margin_frozen : 0,
        info.realized_pnl ? info.realized_pnl : 0, //做多次数
        info.unrealized_pnl ? info.unrealized_pnl : 0,

    ]);

    LogStatus(AppendedStatus() + '\n' + '`' + JSON.stringify(table) + '`');

}





function getDirection(r) {


    var ma7 = getEMA(r, 7)
    var ma15 = getEMA(r, 15)
    var ma30 = getEMA(r, 30)
    var ma60 = getEMA(r, 60)
    var ma80 = getEMA(r, 80)
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

var mp = 1;

function getBias(r, row) {

    var close_2 = r[r.length - 2].Close
    var ma_7 = talib.MA(r, row)[r.length - 2];
    var bisa_7 = (close_2 - ma_7) / ma_7 * 100;
    return bisa_7;

}

function getCurrentBias(r, row) {

    var close_2 = r[r.length - 1].Close
    var ma_7 = talib.MA(r, row)[r.length - 1];
    var bisa_7 = (close_2 - ma_7) / ma_7 * 100;
    return bisa_7;

}
                             
 var bisaChat = {
     extension: {
         // 不参于分组，单独显示，默认为分组 'group'
         layout: 'single',
         // 指定高度，可以设置为字符串，"300px"，设置数值300会自动替换为"300px"
         height: 300,
         // 指定宽度占的单元值，总值为12
         col: 8
     },
     title: {
         text: '乖离率图表'
     },
     xAxis: {
         type: 'datetime'
     },
     series: [{
         name: '快',
         data: []
     }, {
         name: '慢',
         data: []
     }, {
         name: 'diff',
         data: []
     }]
 }
 var priceChat = {
     extension: {
         // 不参于分组，单独显示，默认为分组 'group'
         layout: 'single',
         // 指定高度，可以设置为字符串，"300px"，设置数值300会自动替换为"300px"
         height: 300,
         // 指定宽度占的单元值，总值为12
         col: 8
     },
     title: {
         text: '价格走势图表'
     },
     xAxis: {
         type: 'datetime'
     },
     series: [{
         name: '当前价格',
         data: []
    }]
 }
                             

var bias_7 = 0
var bias_60 = 0;
var current_bias_7 = 0;
var current_bias_60 = 0;

function trade() {

    var r = getRecords(PERIOD_H1);
    if (!r || r.length < 60) {
        return;
    }
    bias_7 = getBias(r, short);
    bias_60 = getBias(r, long);
    current_bias_7 = getCurrentBias(r, short);
    current_bias_60 = getCurrentBias(r, long);

    var currentPrice = GetTicker().Last

    if (bias_7 > 0 && bias_60 < 0 && current_bias_60 > 0) {
        //开空
        if (mp < 0) {
            mp = 0
            //            Log('平空',currentPrice)
            closeSellAction(currentPrice)
        } else if (mp == 0) {
            mp = 1;
            //            Log('开多',currentPrice)
            openAction("buy", currentPrice, 10)
        }
    }

    if (bias_7 < 0 && bias_60 > 0 &&current_bias_60 < 0) {
        //开多
        if (mp > 0) {
            mp = 0
            //            Log('平多',currentPrice)
            closeBuyAction(currentPrice);
        } else if (mp == 0) {
            mp = -1
            openAction("sell", currentPrice, 10)
            //            Log('开空',currentPrice)
        }
    }

    if ((bias_7 > 3  || (bias_7 < -0.1 )) && mp == 1) {
        mp = 0
        Log('平多', currentPrice)
        closeBuyAction(currentPrice);
    }

    if ((bias_7 < -4.5|| (bias_7 > 0.1)) && mp == -1) {
        mp = 0
        Log('平空', currentPrice)
        closeSellAction(currentPrice)
    }
                             


}
var newchat = Chart([bisaChat,priceChat]);
function main() {

    exchange.SetContractType("quarter")
    exchange.SetMarginLevel(100)
    exchange.IO("currency", "BTC_USDT")
    var account = exchange.GetAccount()
    Log(account);
    newchat.reset()
    var count = 0;
    while (1) {

        if (count > 60) {
            count = 0;
            var nowTime = new Date().getTime()
            newchat.add(0,[nowTime,current_bias_7])
            newchat.add(1,[nowTime,current_bias_60])
            newchat.add(2,[nowTime,current_bias_7 - current_bias_60])

            var currentPrice = GetTicker().Last
            newchat.add(3,[nowTime,currentPrice])

            accountInfo();
        }
        count += 1;
        //            Log(getAroon(r))
        //            getMACD()
        trade()
        Sleep(1000 * 2)
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

