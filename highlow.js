
var asset = []
var quantity = 0;
var stopLoss = 0.015;
var buyP = 0;
var sellP = 0;
var mid = 0;
var isOpen = false;

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

function getBlance() {
 var account = exchange.GetAccount();
 return account.Balance;
}

function closeBuyAction(price,count) {
        exchange.SetDirection("closebuy")
        cancleOrders(ORDER_TYPE_SELL)
        var buyid = exchange.Sell(price , count)
        if (buyid) {
            exchange.CancelOrder(buyid)
        }

    
}

function closeSellAction(price,count) {
        exchange.SetDirection("closesell")
        cancleOrders(ORDER_TYPE_BUY)
        var buyid = exchange.Buy(price ,count )
        if (buyid) {
            exchange.CancelOrder(buyid)
        }
}

function startBuyGrids(price,amount) {
    exchange.SetDirection("closebuy")
    //取消当前closeBuy订单 重新排版
    exchange.Sell(price, amount)

}

function startSellGrids(price,amount) {
    //取消当前closesell订单 重新排版
    //    cancleOrders(ORDER_TYPE_BUY)
    exchange.SetDirection("closesell")
    exchange.Buy(price, amount)
     
}

function checkAmount(isMore) {
    var position = exchange.GetPosition()
    counts += 1
    if (position && position.length > 0) {
        // Log("Amount:", position[0].Amount, "FrozenAmount:", position[0].FrozenAmount, "Price:",
        //  position[0].Price, "Profit:", position[0].Profit, "Type:", position[0].Type,
        // "ContractType:", position[0].ContractType)
        for (var i = 0; i < position.length; i++) {
            if (position[i].Type == 0) {
                if (  position[i].Price - currrentPrice > (currrentPrice * stopLoss)) {
                    Log('开多止损')
                    cancleOrders(ORDER_TYPE_SELL)
                    closeBuyAction(currrentPrice - 1,position[i].Amount)
                }
                if (position[i].Amount != position[i].FrozenAmount) {
                    cancleOrders(ORDER_TYPE_SELL)
                    var AM = position[i].Amount;
                    for (var i = 0;i < AM;i++) {
                        var p = position[i].Price + 0.2
                    startBuyGrids(parseFloat(p + (Math.random() * 0.25)),1)
                    }
                }
            } else if (position[i].Type == 1) {
                if ( currrentPrice - position[i].Price  > (currrentPrice * stopLoss)) {
                    Log('开空止损')
                    cancleOrders(ORDER_TYPE_BUY)
                    closeSellAction(currrentPrice + 1,position[i].Amount)
                }
                if (position[i].Amount != position[i].FrozenAmount) {
                    cancleOrders(ORDER_TYPE_BUY)
                    var AM = position[i].Amount;
                    var p = position[i].Price - 0.2
                                             for (var i = 0;i < AM;i++) {
                                             startSellGrids(parseFloat(p - (Math.random() * 0.25)),1);

                                            }
                }

            }
        }
        return true;
    }
    blance_ = getBlance()
    if (blance_ < 800) {
        onexit();
        Log(aaaa)
    }
    if (counts > 100) {
        LogProfit(blance_ - 900)
        counts = 0;
    }
                                                         isOpen = false;
    return false
}
var counts = 0;


function main() {
     exchange.SetContractType("swap")
     exchange.SetMarginLevel(20)
    exchange.IO("currency", "BSV_USDT")
     var account = exchange.GetAccount();
     blance_ = account.Balance;

 while (true) {
    var records = exchange.GetRecords(PERIOD_M1)
    currrentPrice = GetTicker().Last; //当前价格

    if (!records || records.length < 7 || currrentPrice <= 0) {
        continue
    }
     checkAmount(true)
    var model = asset[asset.length - 1];
    var time = (new Date()).getTime()
    if (model== null || (model.time - time > 30 * 1000 * 60)) {
        var lowPrice = TA.Lowest(records, 30, 'Low');
        var hightPrice = TA.Highest(records, 14, 'High');
        asset.push({high:hightPrice,low:lowPrice,time:time})
    }
     model = asset[asset.length - 1];
    buyP = model.low
    sellP = model.high
    if (asset.length >= 2) {
        buyP = _N((asset[asset.length - 1].high + asset[asset.length - 2].high)/2,2)
        sellP = _N((asset[asset.length - 1].low + asset[asset.length - 2].low)/2,2)
    }
    //买单排版
    mid = (buyP + sellP)/2
    //资金的十分之一
    quantity = _N(((blance_ * 20) * 0.1)/currrentPrice,0)
                  quantity = 5;
    if (currrentPrice < mid && !isOpen) {
                  Log(model.high,model.low)
        //清空空单
        isOpen = true;
                  cancleaddAction(ORDER_TYPE_SELL, true)
                  cancleaddAction(ORDER_TYPE_BUY, true)

      for (var i = 0;i < quantity;i++) {
       openAction("buy",buyP + (Math.random() * 0.2),1)
      }
        
    }
//    if (currrentPrice)
    
    //卖单排版
    if (currrentPrice > mid && !isOpen) {
                   //清空多单
                  Log(model.high,model.low)
                  cancleaddAction(ORDER_TYPE_SELL, true)
                  cancleaddAction(ORDER_TYPE_BUY, true)

                  isOpen = true;
          for (var i = 0;i < quantity;i++) {
                openAction("sell",sellP - (Math.random() * 0.2),1)
          }
   
    }
                  Sleep(1000 * 2)

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
function openAction(type, price,count) {
  var tick = GetTicker(); //当前价格
  exchange.SetDirection(type)
  if (type == "buy") {
//          tradingCounter("buyNumber", 1);
      //容错防止一直开仓导致爆仓
          exchange.Buy(price, count)

  } else {
//        tradingCounter("sellNumber", 1);
        exchange.Sell(price, count)
  }
  Sleep(1000);
}
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


