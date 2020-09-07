//{
//    "Info":{
//        "can_withdraw":"648.01539084",//可提现余额
//        "currency":"USDT",//当前交易类型
//        "total_avail_balance":"648.01539084",//当前可用余额
//        "contracts":[
//            {
//                "available_qty":"648.01539084",//当前可用余额
//                "fixed_balance":"19.2384",//保证金+手续费
//                "instrument_id":"BSV-USDT-200925",//当前合约类型
//                "margin_for_unfilled":"0",//冻结保证金
//                "margin_frozen":"19.2",//占用保证金
//                "realized_pnl":"-0.0384",//已实现盈亏
//                "unrealized_pnl":"0.05"//未实现收益
//            }
//        ],
//        "equity":"667.26539084",//当前全部余额
//        "margin_mode":"fixed",//合约类型全仓
//        "auto_margin":"0",//
//        "liqui_mode":"tier"
//    },
//    "Stocks":0,
//    "FrozenStocks":0,
//    "Balance":648.01539084,
//    "FrozenBalance":0
//}

function FailedSleep(type) {
    Sleep(3)
    Log(type+'api请求失败,休眠3s')
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


/// okex
function accountInfo() {
    var info = getExchangeAccountInfo()
//    ['账户初始余额', '账户当前余额', '账户可用余额', '当前合约类型', '占用保证金','冻结保证金', '保证金与手续费', '已实现收益', '未实现收益']
    return '账户初始余额' + info.equity + info.total_avail_balance + info.contracts.instrument_id + info.contracts.margin_frozen + info.contracts.margin_for_unfilled + info.contracts.fixed_balance + info.contracts.realized_pnl + info.contracts.unrealized_pnl;
}

function getRecords(e) {
    if (typeof(e) == 'undefined') {
        e = PERIOD_M1;
    }
    var records = exchange.GetRecords(e);
    if (!records || records.length < 120) {
        FailedSleep('获取Bar失败')
        return;
    }
    return records;
}

function getEMA(r,n) {
    if (typeof(n) == 'undefined') {
           n = 7;
       }
    var ema = talib.EMA(r,n);
    return ema[0][r.length - 1]
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

//葛南维（jogepsb ganvle）教授八大法则中，提到：股价若离移动平均线（ＭＡ）太远，则未来股价会朝移动平均线靠近，此为「磁线」效应；而股价与移动平均线的距离即为乖离。
//公式： P - (T)MA
//(T)MA
//T：代表天数，也就是几日的移动平均线
//P：当天收盘价
//P-(T)MA：为股价与移动平均线的距离，即为乖离。
//若为涨势，乖离是正数，因股价必在移动平均线之上，是为正乖离；同理，若为跌势，乖离是负数，是为负乖离。
//乖离率
//5日BIAS的具体计算方法是：（当日收盘价-5日移动平均线）/5日移动平均线×100
function getBias(r) {
    var close_2 = r[r.length - 2].Close
    var ma_7 = talib.MA(r,7);
    var ma_60 = talib.MA(r,60);
    var bisa_7 = close_2 - ma_7;
    var bisa_60 = close_2 - ma_60;
    Log(('BISA7'+ bisa_7/ma_7) * 100)
    Log(('BISA60' + bisa_60/ma_60) * 100)
    return (bisa_7/ma_7) * 100;

}
