# 克隆自聚宽文章：https://www.joinquant.com/post/27795
# 标题：期货策略之飞龙在天（低回撤版本）15年100倍
# 作者：曹经纬

# -*- coding:utf-8 -*-

# 导入函数库
from kuanke.wizard import *
from jqdata import *
import numpy as np
import pandas as pd
import talib
import time
import math
import urllib.request
import requests
import json
import uuid

from csv import DictReader
from sys import version_info
from six import StringIO

#----------+----------+----------+----------+----------+----------+----------+----------+
g_auth_code = '6985C4E4-5EA2-401A-A038-E4C6D51028A2-07DD8CBA-C695-4F21-8B52-9B87BE6B2F5F'

g_run_period = '1m' # 1m 1d
g_order_sides = ['long', 'short'] # short long
g_turnover_adjust_rate = 0.35
g_max_hold_days = 10
g_http_url = ['http://47.115.155.199:12301', 'http://47.115.155.199:12302']
g_config_website = 'https://inteliter.github.io'
g_config_symbol_file = '%s/config/futures-chn.csv' % (g_config_website)
g_config_symbol_file_local = 'config/futures-chn.csv'
g_use_remote_config_file = True
g_use_default_contract = True

g_special_symbols = [
    'au', 'ZC', 'jm', 'i', 'FG', 'MA', 'SR', 'OI', 'RM', 'pp', 'a', 'c', 'cs', 'ag', 
    'IF', 'IH', 'IC', 'j', 'TA', 'SF', 'b', 'y', 'm', 'rb', 'hc', 'bu', 'SM', 'p', 
    'CF', 'v', 'l', 'zn', 'al', 'pb', 'ru', 'cu', 'ni', 'CY', 'sn']

g_benchmark_symbol = 'a'
g_exchange = 'XDCE' # XZCE XDCE XSGE CCFX

g_log_path = 'log/RemoteSignalFutures.log'
g_log_signal_path = 'log/RemoteSignalFutures-signal.csv'


#----------+----------+----------+----------+----------+----------+----------+----------+
## 初始化函数，设定基准等等
def initialize(context):
    write_file(g_log_path, '', append=False)
    write_file(g_log_signal_path, 'symbol,type,side,datetime,price,strategy\n', append=False)    
    
    #set_benchmark('000300.XSHG')
    set_benchmark('%s9999.%s' % (g_benchmark_symbol.upper(), g_exchange))
    set_option('use_real_price', True)
    log.info('初始函数开始运行且全局只运行一次')

    ### 期货相关设定 ###
    set_subportfolios([SubPortfolioConfig(cash=context.portfolio.starting_cash, type='index_futures')])
    set_order_cost(OrderCost(open_commission=0.000023, close_commission=0.000023,close_today_commission=0.0023), type='index_futures')
    
    if (g_use_remote_config_file):
        std_symbols = read_remote_csv(g_config_symbol_file)
    else:
        std_symbols = read_csv(g_config_symbol_file_local)
    
    for std_symbol in std_symbols:
        symbol = std_symbol['id']
        margin_rate = float(std_symbol['margin_rate'])

        set_option('futures_margin_rate.%s' % symbol.upper(), margin_rate)
        log.info('set_option futures_margin_rate.%s = %.4f' % (symbol.upper(), margin_rate))

    # 设置期货交易的滑点
    set_slippage(StepRelatedSlippage(2))

def after_code_changed(context):
    unschedule_all()

    run_daily(timer_event, time='09:45')
    run_daily(timer_event, time='10:45')
    run_daily(timer_event, time='13:45')
    run_daily(timer_event, time='14:45')
    run_daily(timer_event, time='21:45')

    g.could_trade = False
    g.risk_control = RiskControl('000300.XSHG')
    initialize_quant_action(context)
        
        
def timer_event(context):
    request = ReqOrderInfo()
    request.action = 'order'
    request.cookie = g.action_manager.cookie
    request.time = datetime_to_string(context.current_dt)
    request.auth = g_auth_code
    orders = g.action_manager.GetOrder_HttpShortConnection(context, request)
    
    for vorder in orders:
        log.info('%s %s %s %s %.3f' % (vorder.time, vorder.symbol, vorder.type, vorder.side, vorder.turnover))
        # symbol,type,side,datetime,price,strategy
        write_signal('%s,%s,%s,%s,%.5f,%s' % (vorder.symbol, vorder.type, vorder.side, vorder.time, vorder.price, vorder.strategy_id))
    
    if len(orders) > 0:
        #g.could_trade = check_for_benchmark(context)
        for action in g.action_manager.actions:
            action.HandleOrderSignal(context, orders)
        
    g.action_manager.ResolveWrongOrder(context)
        
            
def initialize_quant_action(context):
    action_count = 0
    g.action_manager = QActionManager()
    
    if (g_use_remote_config_file):
        std_symbols = read_remote_csv(g_config_symbol_file)
    else:
        std_symbols = read_csv(g_config_symbol_file_local)
    
    for symbol in g_special_symbols:
        found = False
        for std_symbol in std_symbols:
            if std_symbol['id'] == symbol:
                unit = int(std_symbol['unit'])
                exchange = std_symbol['exchange']
                margin_rate = float(std_symbol['margin_rate'])
                found = True
                break

        if not found:
            continue
        
        action = QuantAction(symbol, exchange, unit, margin_rate)
        g.action_manager.AddQuantAction(action)
        log.info('add action %s %s %d %.4f' % (symbol, exchange, unit, margin_rate))

    
def check_for_benchmark(context):
    return g.risk_control.check_for_benchmark(context)    

#----------+----------+----------+----------+----------+----------+----------+----------+
class ContractInfo(object):
    def __init__(self):
        self.contract = ''
        self.year = 0
        self.month = 1
        
class OrderInfo(object):
    def __init__(self):
        self.id = ''
        self.contract = ''
        self.strategy_id = ''
        self.order_id = ''
        self.type = 'buy'
        self.side = 'long'
        self.amount = 0
        
class ReqOrderInfo(object):
    def __init__(self):
        self.action = ''
        self.auth = ''
        self.cookie = ''
        self.time = ''
        
        
class RspOrderInfo(object):
    def __init__(self):
        self.symbol = ''
        self.price_buy = 0.0
        self.price_sell = 0.0
        self.time = ''
        self.contract = ''
        self.strategy_id = ''
        self.order_id = ''
        self.type = 'buy'
        self.side = 'long'
        self.amount = 0
        self.turnover = 0.0
        self.enddate = datetime.date(1990, 1, 1)
       

class QuantAction(object):
    def __init__(self, symbol, exchange, unit, margin_rate):
        self.symbol = symbol
        self.exchange = exchange
        self.unit = unit
        self.margin_rate = margin_rate
        self.last_price = 0.0
        self.main_contract = ContractInfo()
        self.last_order = OrderInfo()
        #self.enddate = datetime.date(1990, 1, 1)
        
    def HandleOrderSignal(self, context, orders):
        contract = self.GetMainContract(g_use_default_contract)
        if (contract is None) or (contract == ''):
            return

        self.last_price = self.GetLastPrice(g_run_period)
        if self.last_price <= 0.0:
            return
        
        enddate = get_security_info(contract).end_date
        
        for vorder in orders:
            if self.symbol.upper() != vorder.symbol.upper():
                continue
            
            vorder.enddate = enddate
            vorder.contract = contract
            self.AdjustPosition(context, vorder)
    
    
    def AdjustPosition(self, context, vorder):
        vbalance = context.portfolio.total_value
        
        if not vorder.side in g_order_sides:
            return
        
        if vorder.type == 'buy':
            self.OpenOrder(context, vorder)
            
        elif vorder.type == 'sell':
            self.CloseOrder(context, vorder)

    
    def OpenOrder(self, context, vorder):
        vbalance = context.portfolio.total_value * vorder.turnover * g_turnover_adjust_rate
        amount = value_to_amount_futures(vbalance / self.margin_rate, self.last_price * self.unit)
        rslt = order_target_value(vorder.contract, vbalance, side=vorder.side)
        if rslt is not None:
            self.last_order.contract = vorder.contract
            self.last_order.amount = amount
            self.last_order.price_buy = self.last_price
            write_log('%s  open  order[%s %s %.2f %.2f%% %d] ok.' % (datetime_to_string(context.current_dt), vorder.contract, vorder.side, self.last_price, vorder.turnover * g_turnover_adjust_rate * 100, amount))
        else:
            write_log('%s  open  order[%s %s %.2f %.2f%% %d] error.' % (datetime_to_string(context.current_dt), vorder.contract, vorder.side, self.last_price, vorder.turnover * g_turnover_adjust_rate * 100, amount))
    
    def CloseOrder(self, context, vorder):
        if vorder.side == 'long':
            for position in list(context.portfolio.long_positions.values()):
                security = position.security
                if self.symbol.upper() == security[:len(self.symbol)].upper():
                    log.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
                    rslt = order_target_value(security, 0, side=position.side)
                    if rslt is not None:
                        write_log('%s  close order[%s %s %.2f %.2f%% %d] ok.' % (datetime_to_string(context.current_dt), self.last_order.contract,
                        vorder.side, self.last_price, vorder.turnover * g_turnover_adjust_rate * 100, self.last_order.amount))
                    else:
                        write_log('%s  close order[%s %s %.2f %.2f%% %d] error.' % (datetime_to_string(context.current_dt),
                            self.last_order.contract, vorder.side, self.last_price, vorder.turnover * g_turnover_adjust_rate * 100, self.last_order.amount))
                    
        elif vorder.side == 'short':        
            for position in list(context.portfolio.short_positions.values()):
                security = position.security
                if self.symbol.upper() == security[:len(self.symbol)].upper():
                    log.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
                    rslt = order_target_value(security, 0, side=position.side)
                    if rslt is not None:
                        write_log('%s  close order[%s %s %.2f %.2f%% %d] ok.' % (datetime_to_string(context.current_dt), symbol, vorder.side, self.last_price,
                            vorder.turnover * g_turnover_adjust_rate * 100, self.last_order.amount))
                    else:
                        write_log('%s  close order[%s %s %.2f %.2f%% %d] error.' % (datetime_to_string(context.current_dt), symbol, vorder.side, self.last_price,
                            vorder.turnover * g_turnover_adjust_rate * 100, self.last_order.amount))
                    
        
        
    def GetLastPrice(self, timeframe):
        #symbol = self.GetMainContract()
        symbol = self.main_contract.contract
        if (symbol != ''):
            vperiod = '1m'
            if (timeframe == 'day'):
                vperiod = '1d'

            df = attribute_history(symbol, 1, vperiod, ['close'])
            if (df['close'] is None) or (len(df['close']) == 0):
                return -1.0

            return df['close'][-1]
        else:
            return -1.0     
        
    def GetMainContract(self, use_default_contract):
        if use_default_contract:
            self.main_contract.contract = get_dominant_future(self.symbol.upper())
            return self.main_contract.contract
            
        # 初始化时，使用平台默认主力合约
        if self.main_contract.contract == '':
            self.main_contract.contract = get_dominant_future(self.symbol.upper())
            
        
        contracts = get_future_contracts(self.symbol)
        if (len(contracts) == 0):
            return ''

        volumes = []
        for item in contracts:
            info = get_current_data()[item]
            
            
            if 'volume' in info.day_meta.keys():
                volume = info.day_meta['volume']
                volumes.append(volume)

        if (len(contracts) != len(volumes)):
            return self.main_contract.contract

        symbol = self.symbol
        vlenghth = len(symbol)

        index = 0
        max_volume = 0
        for volume in volumes:
            max_volume = max(max_volume, volume)

        for contract in contracts:
            if (len(contract) < vlenghth + 4):
                continue
            vdate = contract[vlenghth : vlenghth + 4]
            year = int(vdate[:2])
            month = int(vdate[2:])

            volume = volumes[index]
            if ((volume > max_volume * 0.3) and (year * 12 + month > self.main_contract.year * 12 + self.main_contract.month)):
                could_convert = False

                # 农产品、化工品、铁矿石
                symbols = {'FG', 'MA', 'TA', 'SM', 'SF', 'ZC', 'SR', 'CF', 'CY', 'RS', 'OI', 'RM', 'JR', 'RI', 'LR', 'PM', 'WH', 'AP', 'CJ'
                           'j', 'jm', 'i', 'eg', 'pp', 'v', 'l', 'bb', 'fb', 'p', 'a', 'b', 'y', 'm', 'c', 'cs', 'jd', 'fu', 'sp', 'ru'} 
                for item in symbols:
                    if ((item == symbol) and (month == 1 or month == 5 or month == 9)):
                        could_convert = True
                        break
                
                # 黑色系
                symbols = {'rb', 'wr', 'hc'} 
                for item in symbols:
                    if ((item == symbol) and (month == 1 or month == 5 or month == 10)):
                        could_convert = True
                        break
                
                # 贵金属
                symbols = {'au', 'ag'} 
                for item in symbols:
                    if ((item == symbol) and (month == 6 or month == 12)):
                        could_convert = True
                        break

                # 有色金属、股指
                symbols = {'cu', 'zn', 'ni', 'al', 'pb', 'sn', 'IF', 'IC', 'IH', 'T', 'TF', 'TS'} # 有色金属、金融期货
                for item in symbols:
                    if (item == symbol):
                        could_convert = True
                        break
                
                if (could_convert):
                    self.main_contract.year = year
                    self.main_contract.month = month
                    self.main_contract.contract = contract

            index += 1
        
        #log.info('main contract[%s]' % self.main_contract.contract)
        return self.main_contract.contract   
        
class QActionManager(object):
    def __init__(self):
        self.actions = []
        self.httpclient = requests.session()
        self.cookie = str(uuid.uuid1())

    def AddQuantAction(self, action):
        self.actions.append(action)
        
    def ResolveWrongOrder(self, context):
        # 平掉持仓超过N天的单
        for position in list(context.portfolio.long_positions.values()):
            security = position.security
            diff = context.current_dt.date() - position.init_time.date()
            #log.debug('%s hold days[%d]' % (security, diff.days))
            if diff.days >= g_max_hold_days:
                log.info('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
                order_target_value(security, 0, side=position.side)
                
        for position in list(context.portfolio.short_positions.values()):
            security = position.security
            diff = context.current_dt.date() - position.init_time.date()
            #log.debug('%s hold days[%d]' % (security, diff.days))
            if diff.days >= g_max_hold_days:
                log.info('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
                order_target_value(security, 0, side=position.side)     
        
    def GetOrder_HttpShortConnection(self, context, request):
        orders = []
        for url in g_http_url:
            orders.extend(self.GetOrder_HttpShortConnectionImpl(context, request, url))
        
        return orders
        

    def GetOrder_HttpShortConnectionImpl(self, context, request, url):
        httpclient = requests.session()
        url = '%s?action=order' % url
        vheaders = {'Content-Type': 'application/json'}
        vbody = json.dumps(request.__dict__)
        
        try:
            response = httpclient.post(url, headers=vheaders, data=vbody)
            response_dict_array = response.json()
        except:
            return []
        
        if response_dict_array is None:
            return []

        orders = []
        for response_dict in response_dict_array:
            vorder = RspOrderInfo()
            vorder.__dict__ = response_dict
            orders.append(vorder)
            
        return orders
        
    def GetOrder_HttpLongConnection(self, context, request):
        # TODO ...
        pass
 
#----------+----------+----------+----------+----------+----------+----------+----------+
class RiskControlStatus(Enum):
    RISK_WARNING = 1
    RISK_NORMAL = 2
    
class RiskControl(object):
    def __init__(self, symbol):
        self.symbol = symbol
        self.status = RiskControlStatus.RISK_NORMAL
    
    def check_for_ma_rate(self, period, ma_rate_min, ma_rate_max, show_ma_rate):
        ma_rate = self.compute_ma_rate(period, show_ma_rate) 
        return (ma_rate_min < ma_rate <  ma_rate_max)
        
    def compute_ma_rate(self, period, show_ma_rate):
        #hst = attribute_history(self.symbol, period, '1d', ['close'])
        hst = get_bars(self.symbol, period, '1d', ['close'])
        close_list = hst['close']
        if (len(close_list) == 0):
            return -1.0
 
        if (math.isnan(close_list[0]) or math.isnan(close_list[-1])):
            return -1.0
            
        period = min(period, len(close_list))
        if (period < 2):
            return -1.0
            
        #ma = close_list.sum() / len(close_list)
        ma = talib.MA(close_list, timeperiod=period)[-1] 
        ma_rate = hst['close'][-1] / ma
        if (show_ma_rate):
            record(mar=ma_rate)
            
        return ma_rate
        
    def check_for_rsi(self, period, rsi_min, rsi_max, show_rsi):
        hst = attribute_history(self.symbol, period + 1, '1d', ['close'])
        close = [float(x) for x in hst['close']]
        if (math.isnan(close[0]) or math.isnan(close[-1])):
            return False
        
        rsi = talib.RSI(np.array(close), timeperiod=period)[-1]  
        if (show_rsi):
            record(RSI=max(0,(rsi-50)))  
 
        return (rsi_min < rsi < rsi_max)
    
    def check_for_benchmark_v1(self, context):
        could_trade_ma_rate = self.check_for_ma_rate(10000, 0.75, 1.50, True)
        
        could_trade = False
        if (could_trade_ma_rate):
            could_trade = self.check_for_rsi(90, 35, 99, False)
        else:
            could_trade = self.check_for_rsi(15, 50, 70, False)
            
        return could_trade    

    def check_for_benchmark(self, context):
        ma_rate = self.compute_ma_rate(1000, True)
        if (ma_rate <= 0.0):
            return False
        
        if (self.status == RiskControlStatus.RISK_NORMAL):
            if ((ma_rate > 2.5) or (ma_rate < 0.30)):
                self.status = RiskControlStatus.RISK_WARNING
        elif (self.status == RiskControlStatus.RISK_WARNING):
            if (0.35 <= ma_rate <= 0.7):
                self.status = RiskControlStatus.RISK_NORMAL
        
        could_trade = False
       
        if (self.status == RiskControlStatus.RISK_WARNING):       
            could_trade = self.check_for_rsi(60, 47, 99, False)
            record(status=2.5)
        elif (self.status == RiskControlStatus.RISK_NORMAL):
            could_trade = True
            record(status=0.7)
            
        return could_trade
        
        
    def check_for_usa_intrest_rate(self, context):
        could_trade = True
        '''
                        时间        利率    
        -------------------------------------------------
        美联储利率决议	2017/11/02	01.25
        美联储利率决议	2017/12/14	01.50---+
        美联储利率决议	2018/02/01	01.50   |
        美联储利率决议	2018/03/22	01.75   |
        美联储利率决议	2018/05/03	01.75   |
        美联储利率决议	2018/06/14	02.00   |
        美联储利率决议	2018/08/02	02.00   |
        美联储利率决议	2018/09/27	02.25<--+
        美联储利率决议	2018/11/09	02.25
        '''
        # 美联储利率大于1.5%并继续加息则为大利空
        if (string_to_datetime('2017-12-14 00:00:00') <= context.current_dt <= string_to_datetime('2018-09-27 00:00:00')):
            could_trade = False
            
        return could_trade        
        
#----------+----------+----------+----------+----------+----------+----------+----------+
# 获取金融期货合约到期日
def get_CCFX_end_date(future_code):
    return get_security_info(future_code).end_date
    
#----------+----------+----------+----------+----------+
# 公共函数.资金手数转换
def value_to_amount_stock(value, price):
    amount = int(value / price * 0.01) * 100
    return amount
    
def value_to_amount_futures(value, price):
    amount = int(value / price)
    return amount
    
#----------+----------+----------+----------+----------+
# 公共函数.写日志
def write_log(text, is_append=True):
    write_file(g_log_path, text + '\n', append=is_append)
    
def write_signal(text, is_append=True):
    write_file(g_log_signal_path, text + '\n', append=is_append)    
    
#----------+----------+----------+----------+----------+
# 公共函数.CSV文件读写
def get_remote_file_content(url):
    rsp = urllib.request.urlopen(url)
    text = rsp.read()
    return text

def read_csv(filename):
    try:    
        vdata = read_file(filename)
    except:
        return []

    buffer = StringIO()
    if version_info.major < 3:
        buffer.write(vdata)
    else:
        buffer.write(vdata.decode())

    buffer.seek(0)
    return list(DictReader(buffer))
    
def read_remote_csv(url):
    try:
        vdata = get_remote_file_content(url)
    except:
        return []

    buffer = StringIO()
    if version_info.major < 3:
        buffer.write(vdata)
    else:
        buffer.write(vdata.decode())

    buffer.seek(0)
    return list(DictReader(buffer))  

#----------+----------+----------+----------+----------+
# 公共函数.时间转换
def datetime_to_string(dt):
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def date_to_string(date):
    return date.strftime("%Y-%m-%d")

def datetime_to_datestring(dt):
    return dt.strftime("%Y-%m-%d")


def string_to_datetime(st):
    return datetime.datetime.strptime(st, "%Y-%m-%d %H:%M:%S")


def string_to_timestamp(st):
    return time.mktime(time.strptime(st, "%Y-%m-%d %H:%M:%S"))


def timestamp_to_string(sp):
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(sp))


def datetime_to_timestamp(dt):
    return time.mktime(dt.timetuple())


def timestamp_to_struct(sp):
    return time.localtime(sp)
    
def timestamp_to_datetime(sp):
    return string_to_datetime(timestamp_to_string(sp))

