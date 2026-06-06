//+------------------------------------------------------------------+
//| TradeJournalRecorder.mq5                                         |
//| Records MT5 trade events and sends them to a Next.js journal API. |
//+------------------------------------------------------------------+
#property strict
#property version   "1.00"
#property description "Trade Journal Recorder. Records trades only; never opens, closes, or modifies trades."

input string          JOURNAL_API_BASE_URL = "http://127.0.0.1:3000";
input string          JOURNAL_UPLOAD_SECRET = "test_journal_secret_123";
input bool            JOURNAL_ENABLED = true;
input bool            DEBUG_MODE = true;
input bool            CAPTURE_SCREENSHOTS = true;
input bool            OPEN_CHART_FOR_SCREENSHOT = true;
input bool            CLOSE_TEMP_CHART_AFTER_SCREENSHOT = true;
input ENUM_TIMEFRAMES JOURNAL_SCREENSHOT_TIMEFRAME = PERIOD_M5;
input int             SCREENSHOT_WIDTH = 1280;
input int             SCREENSHOT_HEIGHT = 720;
input int             SCREENSHOT_DELAY_MS = 1500;

string g_lockName = "";
bool   g_hasLock = false;
long   g_cachedPositionIds[];
string g_cachedPositionSymbols[];
double g_cachedEntryPrices[];
double g_cachedStopLosses[];
double g_cachedTakeProfits[];
string g_cachedTradeTypes[];

//+------------------------------------------------------------------+
//| Expert lifecycle                                                  |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("Trade Journal Recorder EA initialized.");
   Print("API URL: ", NormalizeBaseUrl(JOURNAL_API_BASE_URL));
   Print("This EA records trades only. It does not open, close, or modify trades.");

   if(!JOURNAL_ENABLED)
   {
      Print("Trade Journal Recorder is disabled by JOURNAL_ENABLED=false.");
      return INIT_SUCCEEDED;
   }

   if(StringLen(StringTrimCopy(JOURNAL_UPLOAD_SECRET)) == 0)
   {
      Print("Trade Journal Recorder error: JOURNAL_UPLOAD_SECRET is empty.");
      return INIT_FAILED;
   }

   if(!AcquireSingleInstanceLock())
   {
      Print("Trade Journal Recorder error: attach this EA to one chart only.");
      return INIT_FAILED;
   }

   RefreshPositionLevelCache();
   EventSetTimer(1);

   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
   ReleaseSingleInstanceLock();
   Print("Trade Journal Recorder stopped. Reason: ", reason);
}

void OnTimer()
{
   if(JOURNAL_ENABLED)
      RefreshPositionLevelCache();
}

//+------------------------------------------------------------------+
//| Trade transaction listener                                        |
//+------------------------------------------------------------------+
void OnTradeTransaction(
   const MqlTradeTransaction &trans,
   const MqlTradeRequest &request,
   const MqlTradeResult &result
)
{
   if(!JOURNAL_ENABLED)
      return;

   if(trans.type == TRADE_TRANSACTION_POSITION)
   {
      CacheTransactionPosition(trans);
      return;
   }

   if(trans.type != TRADE_TRANSACTION_DEAL_ADD || trans.deal == 0)
      return;

   if(!HistoryDealSelect(trans.deal))
   {
      HistorySelect(TimeCurrent() - 86400 * 30, TimeCurrent() + 60);
      if(!HistoryDealSelect(trans.deal))
      {
         Print("Trade event detected but HistoryDealSelect failed. Deal: ", (string)trans.deal, ", error: ", GetLastError());
         return;
      }
   }

   string eventType = DetectEventType(trans.deal, trans.order);
   if(eventType == "")
      return;

   string symbol = HistoryDealGetString(trans.deal, DEAL_SYMBOL);
   if(symbol == "")
      symbol = trans.symbol;

   Print("Trade event detected. Event: ", eventType, ", symbol: ", symbol, ", deal: ", (string)trans.deal);

   string jsonBody = BuildTradeEventJson(eventType, trans.deal, symbol);
   if(jsonBody == "")
   {
      Print("Trade event skipped: failed to build payload for deal ", (string)trans.deal);
      return;
   }

   string response = "";
   int statusCode = 0;

   if(HttpPostJson("/api/journal/event", jsonBody, response, statusCode))
   {
      Print("Trade event payload sent. Status code: ", statusCode);
      DebugPrint("Event API response: " + response);
   }
   else
   {
      Print("Trade event upload failed. Status code: ", statusCode, ", response: ", response);
   }

   if(CAPTURE_SCREENSHOTS)
      ProcessScreenshotForDeal(eventType, trans.deal, symbol);
}

//+------------------------------------------------------------------+
//| JSON payload builders                                             |
//+------------------------------------------------------------------+
string BuildTradeEventJson(string eventType, ulong dealTicket, string fallbackSymbol)
{
   string symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
   if(symbol == "")
      symbol = fallbackSymbol;
   if(symbol == "")
      return "";

   ENUM_DEAL_TYPE dealType = (ENUM_DEAL_TYPE)HistoryDealGetInteger(dealTicket, DEAL_TYPE);
   long positionIdLong = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
   long orderTicketLong = HistoryDealGetInteger(dealTicket, DEAL_ORDER);
   double lotSize = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
   double dealPrice = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
   double profit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
   double commission = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
   double swap = HistoryDealGetDouble(dealTicket, DEAL_SWAP);
   long magicNumber = HistoryDealGetInteger(dealTicket, DEAL_MAGIC);
   string comment = HistoryDealGetString(dealTicket, DEAL_COMMENT);
   datetime eventTime = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);

   double entryPrice = 0.0;
   double closePrice = 0.0;
   double stopLoss = 0.0;
   double takeProfit = 0.0;
   string tradeType = GetTradeTypeForDeal(dealTicket, dealType);

   if(eventType == "open" || eventType == "pending_activated")
      entryPrice = dealPrice;
   else
      closePrice = dealPrice;

   FillPositionTradeDetails(positionIdLong, symbol, eventTime, entryPrice, stopLoss, takeProfit, tradeType);

   string accountNumber = (string)AccountInfoInteger(ACCOUNT_LOGIN);
   string broker = GetBrokerName();
   string serverName = GetServerName();
   string positionId = positionIdLong > 0 ? (string)positionIdLong : "";
   string orderTicket = orderTicketLong > 0 ? (string)orderTicketLong : "";
   string dealTicketText = (string)dealTicket;
   string idempotencyKey = BuildIdempotencyKey(accountNumber, broker, serverName, positionId, dealTicketText, eventType);
   string sourceType = magicNumber == 0 ? "manual" : "expert_advisor";
   string entrySource = eventType == "pending_activated" ? "pending_order_activation" : "market_order";
   int digits = DigitsForSymbol(symbol);

   string json = "{";
   json += "\"uploadSecret\":" + JsonString(JOURNAL_UPLOAD_SECRET) + ",";
   json += "\"account\":{";
   json += "\"accountNumber\":" + JsonString(accountNumber) + ",";
   json += "\"broker\":" + JsonString(broker) + ",";
   json += "\"serverName\":" + JsonString(serverName) + ",";
   json += "\"balance\":" + DoubleToJson(AccountInfoDouble(ACCOUNT_BALANCE), 2) + ",";
   json += "\"equity\":" + DoubleToJson(AccountInfoDouble(ACCOUNT_EQUITY), 2) + ",";
   json += "\"freeMargin\":" + DoubleToJson(AccountInfoDouble(ACCOUNT_MARGIN_FREE), 2) + ",";
   json += "\"currency\":" + JsonString(GetAccountCurrency());
   json += "},";
   json += "\"event\":{";
   json += "\"eventType\":" + JsonString(eventType) + ",";
   json += "\"idempotencyKey\":" + JsonString(idempotencyKey) + ",";
   json += "\"ticket\":" + JsonString(dealTicketText) + ",";
   json += "\"positionId\":" + JsonString(positionId) + ",";
   json += "\"orderTicket\":" + JsonString(orderTicket) + ",";
   json += "\"dealTicket\":" + JsonString(dealTicketText) + ",";
   json += "\"symbol\":" + JsonString(symbol) + ",";
   json += "\"tradeType\":" + JsonString(tradeType) + ",";
   json += "\"lotSize\":" + DoubleToJson(lotSize, 2) + ",";

   if(entryPrice > 0.0)
      json += "\"entryPrice\":" + DoubleToJson(entryPrice, digits) + ",";
   else
      json += "\"entryPrice\":null,";

   if(eventType == "close" || eventType == "partial_close")
      json += "\"closePrice\":" + DoubleToJson(closePrice, digits) + ",";
   else
      json += "\"closePrice\":null,";

   json += "\"stopLoss\":" + NullablePriceToJson(stopLoss, digits) + ",";
   json += "\"takeProfit\":" + NullablePriceToJson(takeProfit, digits) + ",";

   if(eventType == "close" || eventType == "partial_close")
      json += "\"profit\":" + DoubleToJson(profit, 2) + ",";
   else
      json += "\"profit\":null,";

   json += "\"commission\":" + DoubleToJson(commission, 2) + ",";
   json += "\"swap\":" + DoubleToJson(swap, 2) + ",";
   json += "\"magicNumber\":" + (string)magicNumber + ",";
   json += "\"comment\":" + JsonString(comment) + ",";
   json += "\"sourceType\":" + JsonString(sourceType) + ",";
   json += "\"entrySource\":" + JsonString(entrySource) + ",";
   json += "\"timeframe\":" + JsonString(TimeframeToString(JOURNAL_SCREENSHOT_TIMEFRAME)) + ",";
   json += "\"spread\":" + (string)GetSpread(symbol) + ",";
   json += "\"atr\":null,";
   json += "\"rsi\":null,";
   json += "\"session\":" + JsonString(GetSession(eventTime)) + ",";
   json += "\"eventTime\":" + JsonString(TimeToIso8601(eventTime));
   json += "}}";

   return json;
}

string BuildScreenshotJson(
   string positionId,
   string dealTicket,
   string type,
   string capturedAt,
   string status,
   string imageBase64
)
{
   string json = "{";
   json += "\"uploadSecret\":" + JsonString(JOURNAL_UPLOAD_SECRET) + ",";
   json += "\"accountNumber\":" + JsonString((string)AccountInfoInteger(ACCOUNT_LOGIN)) + ",";
   json += "\"broker\":" + JsonString(GetBrokerName()) + ",";
   json += "\"serverName\":" + JsonString(GetServerName()) + ",";
   json += "\"positionId\":" + JsonString(positionId) + ",";
   json += "\"dealTicket\":" + JsonString(dealTicket) + ",";
   json += "\"type\":" + JsonString(type) + ",";
   json += "\"capturedAt\":" + JsonString(capturedAt) + ",";
   json += "\"status\":" + JsonString(status) + ",";
   json += "\"imageBase64\":" + JsonString(imageBase64);
   json += "}";
   return json;
}

//+------------------------------------------------------------------+
//| HTTP                                                             |
//+------------------------------------------------------------------+
bool HttpPostJson(string endpoint, string jsonBody, string &response, int &statusCode)
{
   string url = BuildEndpointUrl(endpoint);
   char data[];
   char result[];
   string resultHeaders = "";
   string headers = "Content-Type: application/json\r\nAccept: application/json\r\n";

   StringToCharArray(jsonBody, data, 0, WHOLE_ARRAY, CP_UTF8);
   if(ArraySize(data) > 0)
      ArrayResize(data, ArraySize(data) - 1);

   ResetLastError();
   statusCode = WebRequest("POST", url, headers, 15000, data, result, resultHeaders);
   int errorCode = GetLastError();
   response = CharArrayToString(result, 0, -1, CP_UTF8);

   Print("Response status code: ", statusCode);

   if(statusCode >= 200 && statusCode < 300)
      return true;

   Print("WebRequest error. URL: ", url, ", MT5 error: ", errorCode);
   if(errorCode == 4014)
      Print("Allow WebRequest URL in MT5: Tools > Options > Expert Advisors > Allow WebRequest for listed URL.");

   return false;
}

//+------------------------------------------------------------------+
//| Screenshot workflow                                               |
//+------------------------------------------------------------------+
void ProcessScreenshotForDeal(string eventType, ulong dealTicket, string fallbackSymbol)
{
   string screenshotType = "";
   if(eventType == "open" || eventType == "pending_activated")
      screenshotType = "entry";
   else if(eventType == "close" || eventType == "partial_close")
      screenshotType = "exit";
   else
      return;

   string symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
   if(symbol == "")
      symbol = fallbackSymbol;

   long positionIdLong = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
   string positionId = positionIdLong > 0 ? (string)positionIdLong : "";
   if(symbol == "" || positionId == "")
   {
      Print("Screenshot skipped: missing symbol or position id. Deal: ", (string)dealTicket);
      return;
   }

   Print("Screenshot started. Type: ", screenshotType, ", symbol: ", symbol, ", deal: ", (string)dealTicket);

   bool isTemporary = false;
   long chartId = EnsureChartForSymbol(symbol, JOURNAL_SCREENSHOT_TIMEFRAME, isTemporary);
   if(chartId <= 0)
   {
      Print("Screenshot error: could not open/find chart for ", symbol);
      return;
   }

   if(!WaitForChartReady(chartId, symbol, JOURNAL_SCREENSHOT_TIMEFRAME, SCREENSHOT_DELAY_MS + 5000))
   {
      Print("Screenshot error: chart not ready for ", symbol);
      CleanupTemporaryChart(chartId, isTemporary);
      return;
   }

   double entryPrice = 0.0;
   double stopLoss = 0.0;
   double takeProfit = 0.0;
   string tradeType = GetTradeTypeForDeal(dealTicket, (ENUM_DEAL_TYPE)HistoryDealGetInteger(dealTicket, DEAL_TYPE));
   datetime eventTime = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);
   double closePrice = 0.0;

   if(screenshotType == "entry")
      entryPrice = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
   else
      closePrice = HistoryDealGetDouble(dealTicket, DEAL_PRICE);

   FillPositionTradeDetails(positionIdLong, symbol, eventTime, entryPrice, stopLoss, takeProfit, tradeType);
   DrawTradeLevels(chartId, symbol, tradeType, HistoryDealGetDouble(dealTicket, DEAL_VOLUME), entryPrice, stopLoss, takeProfit, closePrice, eventTime);

   datetime capturedAt = TimeCurrent();
   string filename = BuildScreenshotFilename(symbol, positionId, (string)dealTicket, screenshotType, capturedAt);

   if(!CaptureChartScreenshot(chartId, filename))
   {
      Print("Screenshot error: ChartScreenShot failed for ", symbol);
      CleanupTemporaryChart(chartId, isTemporary);
      return;
   }

   string imageBase64 = "";
   if(!ReadFileToBase64(filename, imageBase64))
   {
      Print("Screenshot error: could not read PNG for ", symbol);
      CleanupTemporaryChart(chartId, isTemporary);
      return;
   }

   if(SendScreenshotToApi(positionId, (string)dealTicket, screenshotType, TimeToIso8601(capturedAt), "captured_on_time", imageBase64))
      Print("Screenshot uploaded. Type: ", screenshotType, ", deal: ", (string)dealTicket);
   else
      Print("Screenshot upload failed. Type: ", screenshotType, ", deal: ", (string)dealTicket);

   CleanupTemporaryChart(chartId, isTemporary);
}

long FindChartBySymbolAndTimeframe(string symbol, ENUM_TIMEFRAMES tf)
{
   long chartId = ChartFirst();
   while(chartId >= 0)
   {
      if(ChartSymbol(chartId) == symbol && (ENUM_TIMEFRAMES)ChartPeriod(chartId) == tf)
         return chartId;

      chartId = ChartNext(chartId);
   }

   return -1;
}

long EnsureChartForSymbol(string symbol, ENUM_TIMEFRAMES tf, bool &isTemporary)
{
   isTemporary = false;

   long chartId = FindChartBySymbolAndTimeframe(symbol, tf);
   if(chartId > 0)
      return chartId;

   chartId = FindChartBySymbol(symbol);
   if(chartId > 0)
   {
      Print("Existing chart reused for screenshot. Symbol: ", symbol, ", chart ID: ", (string)chartId);
      return chartId;
   }

   if(!OPEN_CHART_FOR_SCREENSHOT)
      return -1;

   if(!SymbolSelect(symbol, true))
   {
      Print("SymbolSelect failed for ", symbol, ". Error: ", GetLastError());
      return -1;
   }

   chartId = ChartOpen(symbol, tf);
   if(chartId > 0)
   {
      isTemporary = true;
      Print("Temporary chart opened for screenshot. Symbol: ", symbol, ", timeframe: ", TimeframeToString(tf));
   }

   return chartId;
}

long FindChartBySymbol(string symbol)
{
   long chartId = ChartFirst();
   while(chartId >= 0)
   {
      if(ChartSymbol(chartId) == symbol)
         return chartId;

      chartId = ChartNext(chartId);
   }

   return -1;
}

bool WaitForChartReady(long chartId, string symbol, ENUM_TIMEFRAMES tf, int timeoutMs)
{
   int waited = 0;
   int stepMs = 100;

   while(waited <= timeoutMs)
   {
      ChartSetSymbolPeriod(chartId, symbol, tf);
      ChartRedraw(chartId);

      long synchronized = 0;
      if(Bars(symbol, tf) > 0 && SeriesInfoInteger(symbol, tf, SERIES_SYNCHRONIZED, synchronized) && synchronized > 0)
         return true;

      Sleep(stepMs);
      waited += stepMs;
   }

   return false;
}

void DrawTradeLevels(
   long chartId,
   string symbol,
   string tradeType,
   double lotSize,
   double entryPrice,
   double stopLoss,
   double takeProfit,
   double closePrice,
   datetime eventTime
)
{
   string prefix = "TJR_" + SanitizeFilePart(symbol) + "_";
   DrawPriceLine(chartId, prefix + "ENTRY", "ENTRY", entryPrice, clrLimeGreen);
   DrawPriceLine(chartId, prefix + "SL", "SL", stopLoss, clrTomato);
   DrawPriceLine(chartId, prefix + "TP", "TP", takeProfit, clrDodgerBlue);
   DrawPriceLine(chartId, prefix + "CLOSE", "CLOSE", closePrice, clrGold);

   string labelName = prefix + "LABEL";
   if(ObjectFind(chartId, labelName) < 0)
      ObjectCreate(chartId, labelName, OBJ_LABEL, 0, 0, 0);

   string labelText = symbol +
      " | " + tradeType +
      " | lot " + DoubleToString(lotSize, 2) +
      " | entry " + PriceOrDash(entryPrice, symbol) +
      " | SL " + PriceOrDash(stopLoss, symbol) +
      " | TP " + PriceOrDash(takeProfit, symbol);

   if(closePrice > 0.0)
      labelText += " | close " + PriceOrDash(closePrice, symbol);

   labelText += " | " + TimeToString(eventTime, TIME_DATE | TIME_SECONDS);

   ObjectSetInteger(chartId, labelName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetInteger(chartId, labelName, OBJPROP_XDISTANCE, 10);
   ObjectSetInteger(chartId, labelName, OBJPROP_YDISTANCE, 20);
   ObjectSetInteger(chartId, labelName, OBJPROP_COLOR, clrWhite);
   ObjectSetInteger(chartId, labelName, OBJPROP_BACK, false);
   ObjectSetInteger(chartId, labelName, OBJPROP_FONTSIZE, 9);
   ObjectSetString(chartId, labelName, OBJPROP_TEXT, labelText);

   ChartRedraw(chartId);
}

bool CaptureChartScreenshot(long chartId, string filename)
{
   Sleep(MathMax(SCREENSHOT_DELAY_MS, 0));
   ChartRedraw(chartId);
   ResetLastError();

   bool ok = ChartScreenShot(
      chartId,
      filename,
      MathMax(SCREENSHOT_WIDTH, 320),
      MathMax(SCREENSHOT_HEIGHT, 240),
      ALIGN_RIGHT
   );

   if(!ok)
      Print("ChartScreenShot failed. Error: ", GetLastError());

   return ok;
}

bool ReadFileToBase64(string filename, string &base64)
{
   base64 = "";
   ResetLastError();

   int handle = FileOpen(filename, FILE_READ | FILE_BIN);
   if(handle == INVALID_HANDLE)
   {
      Print("FileOpen screenshot failed. File: ", filename, ", error: ", GetLastError());
      return false;
   }

   ulong fileSize = FileSize(handle);
   if(fileSize == 0 || fileSize > 12 * 1024 * 1024)
   {
      FileClose(handle);
      Print("Screenshot file size invalid: ", (string)fileSize);
      return false;
   }

   uchar bytes[];
   ArrayResize(bytes, (int)fileSize);
   uint read = FileReadArray(handle, bytes, 0, (int)fileSize);
   FileClose(handle);

   if(read != (uint)fileSize)
   {
      Print("Screenshot file read incomplete. Read: ", read, ", expected: ", (string)fileSize);
      return false;
   }

   base64 = Base64Encode(bytes);
   return StringLen(base64) > 0;
}

bool SendScreenshotToApi(
   string positionId,
   string dealTicket,
   string type,
   string capturedAt,
   string status,
   string imageBase64
)
{
   string jsonBody = BuildScreenshotJson(positionId, dealTicket, type, capturedAt, status, imageBase64);
   string response = "";
   int statusCode = 0;
   bool ok = HttpPostJson("/api/journal/screenshot", jsonBody, response, statusCode);

   if(ok)
      DebugPrint("Screenshot API response: " + response);
   else
      Print("Screenshot API error. Status code: ", statusCode, ", response: ", response);

   return ok;
}

void CleanupTemporaryChart(long chartId, bool isTemporary)
{
   if(isTemporary && CLOSE_TEMP_CHART_AFTER_SCREENSHOT && chartId > 0)
   {
      ChartClose(chartId);
      Print("Temporary chart closed. Chart ID: ", (string)chartId);
   }
}

//+------------------------------------------------------------------+
//| Account and event helpers                                         |
//+------------------------------------------------------------------+
string BuildIdempotencyKey(string accountNumber, string broker, string serverName, string positionId, string dealTicket, string eventType)
{
   return accountNumber + "-" + broker + "-" + serverName + "-" + positionId + "-" + dealTicket + "-" + eventType;
}

string GetAccountCurrency()
{
   return AccountInfoString(ACCOUNT_CURRENCY);
}

string GetBrokerName()
{
   return AccountInfoString(ACCOUNT_COMPANY);
}

string GetServerName()
{
   return AccountInfoString(ACCOUNT_SERVER);
}

string GetSession()
{
   return GetSession(TimeCurrent());
}

string GetSession(datetime value)
{
   MqlDateTime parts;
   TimeToStruct(value, parts);
   int hour = parts.hour;

   if(hour >= 0 && hour < 7)
      return "Asia";
   if(hour >= 7 && hour < 12)
      return "London";
   if(hour >= 12 && hour < 17)
      return "London/New York";
   if(hour >= 17 && hour < 22)
      return "New York";

   return "After Hours";
}

string TimeframeToString(ENUM_TIMEFRAMES tf)
{
   switch(tf)
   {
      case PERIOD_M1:  return "M1";
      case PERIOD_M2:  return "M2";
      case PERIOD_M3:  return "M3";
      case PERIOD_M4:  return "M4";
      case PERIOD_M5:  return "M5";
      case PERIOD_M6:  return "M6";
      case PERIOD_M10: return "M10";
      case PERIOD_M12: return "M12";
      case PERIOD_M15: return "M15";
      case PERIOD_M20: return "M20";
      case PERIOD_M30: return "M30";
      case PERIOD_H1:  return "H1";
      case PERIOD_H2:  return "H2";
      case PERIOD_H3:  return "H3";
      case PERIOD_H4:  return "H4";
      case PERIOD_H6:  return "H6";
      case PERIOD_H8:  return "H8";
      case PERIOD_H12: return "H12";
      case PERIOD_D1:  return "D1";
      case PERIOD_W1:  return "W1";
      case PERIOD_MN1: return "MN1";
      default:         return EnumToString(tf);
   }
}

string DetectEventType(ulong dealTicket, ulong fallbackOrderTicket)
{
   ENUM_DEAL_TYPE dealType = (ENUM_DEAL_TYPE)HistoryDealGetInteger(dealTicket, DEAL_TYPE);
   if(dealType != DEAL_TYPE_BUY && dealType != DEAL_TYPE_SELL)
      return "";

   ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(dealTicket, DEAL_ENTRY);

   if(entry == DEAL_ENTRY_IN)
      return IsPendingOrderActivation(dealTicket, fallbackOrderTicket) ? "pending_activated" : "open";

   if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_OUT_BY)
      return IsPositionStillOpenAfterDeal(dealTicket) ? "partial_close" : "close";

   if(entry == DEAL_ENTRY_INOUT)
      return "close";

   return "";
}

bool IsPendingOrderActivation(ulong dealTicket, ulong fallbackOrderTicket)
{
   ulong orderTicket = (ulong)HistoryDealGetInteger(dealTicket, DEAL_ORDER);
   if(orderTicket == 0)
      orderTicket = fallbackOrderTicket;
   if(orderTicket == 0 || !HistoryOrderSelect(orderTicket))
      return false;

   ENUM_ORDER_TYPE orderType = (ENUM_ORDER_TYPE)HistoryOrderGetInteger(orderTicket, ORDER_TYPE);
   return orderType == ORDER_TYPE_BUY_LIMIT ||
      orderType == ORDER_TYPE_SELL_LIMIT ||
      orderType == ORDER_TYPE_BUY_STOP ||
      orderType == ORDER_TYPE_SELL_STOP ||
      orderType == ORDER_TYPE_BUY_STOP_LIMIT ||
      orderType == ORDER_TYPE_SELL_STOP_LIMIT;
}

bool IsPositionStillOpenAfterDeal(ulong dealTicket)
{
   long positionId = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
   if(positionId <= 0)
      return false;

   if(PositionSelectByTicket((ulong)positionId))
      return PositionGetDouble(POSITION_VOLUME) > 0.0;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      if(PositionGetInteger(POSITION_IDENTIFIER) == positionId && PositionGetDouble(POSITION_VOLUME) > 0.0)
         return true;
   }

   return false;
}

int FindCachedPositionIndex(long positionId)
{
   for(int i = 0; i < ArraySize(g_cachedPositionIds); i++)
   {
      if(g_cachedPositionIds[i] == positionId)
         return i;
   }

   return -1;
}

void UpsertPositionLevelCache(
   long positionId,
   string symbol,
   double entryPrice,
   double stopLoss,
   double takeProfit,
   string tradeType
)
{
   if(positionId <= 0)
      return;

   int index = FindCachedPositionIndex(positionId);
   if(index < 0)
   {
      index = ArraySize(g_cachedPositionIds);
      ArrayResize(g_cachedPositionIds, index + 1);
      ArrayResize(g_cachedPositionSymbols, index + 1);
      ArrayResize(g_cachedEntryPrices, index + 1);
      ArrayResize(g_cachedStopLosses, index + 1);
      ArrayResize(g_cachedTakeProfits, index + 1);
      ArrayResize(g_cachedTradeTypes, index + 1);
   }

   g_cachedPositionIds[index] = positionId;
   g_cachedPositionSymbols[index] = symbol;
   g_cachedEntryPrices[index] = entryPrice;
   g_cachedStopLosses[index] = stopLoss;
   g_cachedTakeProfits[index] = takeProfit;
   g_cachedTradeTypes[index] = tradeType;
}

void CacheSelectedPosition()
{
   long positionId = PositionGetInteger(POSITION_IDENTIFIER);
   if(positionId <= 0)
      return;

   string symbol = PositionGetString(POSITION_SYMBOL);
   double entryPrice = PositionGetDouble(POSITION_PRICE_OPEN);
   double stopLoss = PositionGetDouble(POSITION_SL);
   double takeProfit = PositionGetDouble(POSITION_TP);
   string tradeType = PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY ? "buy" : "sell";

   UpsertPositionLevelCache(positionId, symbol, entryPrice, stopLoss, takeProfit, tradeType);
}

void CacheTransactionPosition(const MqlTradeTransaction &trans)
{
   if(trans.position <= 0)
      return;

   if(PositionSelectByTicket(trans.position))
      CacheSelectedPosition();
}

void RefreshPositionLevelCache()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      CacheSelectedPosition();
   }
}

bool GetCachedPositionTradeDetails(
   long positionId,
   string symbol,
   double &entryPrice,
   double &stopLoss,
   double &takeProfit,
   string &tradeType
)
{
   int index = FindCachedPositionIndex(positionId);
   if(index < 0)
      return false;

   if(symbol != "" && g_cachedPositionSymbols[index] != "" && g_cachedPositionSymbols[index] != symbol)
      return false;

   if(entryPrice <= 0.0)
      entryPrice = g_cachedEntryPrices[index];

   stopLoss = g_cachedStopLosses[index];
   takeProfit = g_cachedTakeProfits[index];

   if(g_cachedTradeTypes[index] != "")
      tradeType = g_cachedTradeTypes[index];

   return true;
}

void FillPositionTradeDetails(
   long positionId,
   string symbol,
   datetime eventTime,
   double &entryPrice,
   double &stopLoss,
   double &takeProfit,
   string &tradeType
)
{
   if(positionId <= 0)
      return;

   if(PositionSelectByTicket((ulong)positionId))
   {
      if(entryPrice <= 0.0)
         entryPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      stopLoss = PositionGetDouble(POSITION_SL);
      takeProfit = PositionGetDouble(POSITION_TP);
      tradeType = PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY ? "buy" : "sell";
      CacheSelectedPosition();
      return;
   }

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;
      if(PositionGetInteger(POSITION_IDENTIFIER) != positionId)
         continue;

      if(entryPrice <= 0.0)
         entryPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      stopLoss = PositionGetDouble(POSITION_SL);
      takeProfit = PositionGetDouble(POSITION_TP);
      tradeType = PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY ? "buy" : "sell";
      CacheSelectedPosition();
      return;
   }

   if(GetCachedPositionTradeDetails(positionId, symbol, entryPrice, stopLoss, takeProfit, tradeType))
      return;

   datetime from = eventTime - 86400 * 60;
   datetime to = eventTime + 60;
   if(!HistorySelect(from, to))
      return;

   int total = HistoryDealsTotal();
   for(int index = 0; index < total; index++)
   {
      ulong historyDeal = HistoryDealGetTicket(index);
      if(historyDeal == 0)
         continue;
      if(HistoryDealGetInteger(historyDeal, DEAL_POSITION_ID) != positionId)
         continue;
      if(HistoryDealGetString(historyDeal, DEAL_SYMBOL) != symbol)
         continue;

      ENUM_DEAL_ENTRY historyEntry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(historyDeal, DEAL_ENTRY);
      ENUM_DEAL_TYPE historyType = (ENUM_DEAL_TYPE)HistoryDealGetInteger(historyDeal, DEAL_TYPE);
      if(historyEntry == DEAL_ENTRY_IN && (historyType == DEAL_TYPE_BUY || historyType == DEAL_TYPE_SELL))
      {
         if(entryPrice <= 0.0)
            entryPrice = HistoryDealGetDouble(historyDeal, DEAL_PRICE);
         tradeType = historyType == DEAL_TYPE_BUY ? "buy" : "sell";

         ulong orderTicket = (ulong)HistoryDealGetInteger(historyDeal, DEAL_ORDER);
         if(orderTicket > 0 && HistoryOrderSelect(orderTicket))
         {
            stopLoss = HistoryOrderGetDouble(orderTicket, ORDER_SL);
            takeProfit = HistoryOrderGetDouble(orderTicket, ORDER_TP);
         }
         return;
      }
   }
}

string GetTradeTypeForDeal(ulong dealTicket, ENUM_DEAL_TYPE fallbackDealType)
{
   long positionId = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
   datetime eventTime = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);
   string symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
   double entryPrice = 0.0;
   double stopLoss = 0.0;
   double takeProfit = 0.0;
   string tradeType = fallbackDealType == DEAL_TYPE_BUY ? "buy" : "sell";

   FillPositionTradeDetails(positionId, symbol, eventTime, entryPrice, stopLoss, takeProfit, tradeType);
   return tradeType;
}

int GetSpread(string symbol)
{
   long spread = 0;
   if(SymbolInfoInteger(symbol, SYMBOL_SPREAD, spread))
      return (int)spread;

   double ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(symbol, SYMBOL_BID);
   double point = SymbolInfoDouble(symbol, SYMBOL_POINT);

   if(point > 0.0 && ask > 0.0 && bid > 0.0)
      return (int)MathRound((ask - bid) / point);

   return 0;
}

//+------------------------------------------------------------------+
//| Drawing and file helpers                                          |
//+------------------------------------------------------------------+
void DrawPriceLine(long chartId, string objectName, string label, double price, color lineColor)
{
   if(price <= 0.0 || !MathIsValidNumber(price))
      return;

   if(ObjectFind(chartId, objectName) < 0)
      ObjectCreate(chartId, objectName, OBJ_HLINE, 0, 0, price);
   else
      ObjectMove(chartId, objectName, 0, 0, price);

   ObjectSetInteger(chartId, objectName, OBJPROP_COLOR, lineColor);
   ObjectSetInteger(chartId, objectName, OBJPROP_STYLE, STYLE_SOLID);
   ObjectSetInteger(chartId, objectName, OBJPROP_WIDTH, 2);
   ObjectSetInteger(chartId, objectName, OBJPROP_BACK, false);
   ObjectSetString(chartId, objectName, OBJPROP_TEXT, label + " " + DoubleToString(price, DigitsForSymbol(ChartSymbol(chartId))));
}

string BuildScreenshotFilename(string symbol, string positionId, string dealTicket, string type, datetime capturedAt)
{
   return "journal_" +
      SanitizeFilePart(symbol) + "_" +
      SanitizeFilePart(positionId) + "_" +
      SanitizeFilePart(dealTicket) + "_" +
      SanitizeFilePart(type) + "_" +
      IntegerToString((int)capturedAt) +
      ".png";
}

string Base64Encode(const uchar &bytes[])
{
   string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
   string encoded = "";
   int size = ArraySize(bytes);

   for(int i = 0; i < size; i += 3)
   {
      int b0 = bytes[i];
      int b1 = (i + 1 < size) ? bytes[i + 1] : 0;
      int b2 = (i + 2 < size) ? bytes[i + 2] : 0;
      int triple = (b0 << 16) | (b1 << 8) | b2;

      encoded += StringSubstr(alphabet, (triple >> 18) & 0x3F, 1);
      encoded += StringSubstr(alphabet, (triple >> 12) & 0x3F, 1);
      encoded += (i + 1 < size) ? StringSubstr(alphabet, (triple >> 6) & 0x3F, 1) : "=";
      encoded += (i + 2 < size) ? StringSubstr(alphabet, triple & 0x3F, 1) : "=";
   }

   return encoded;
}

//+------------------------------------------------------------------+
//| JSON and formatting helpers                                       |
//+------------------------------------------------------------------+
string JsonEscape(string value)
{
   string escaped = "";

   for(int i = 0; i < StringLen(value); i++)
   {
      ushort ch = StringGetCharacter(value, i);

      if(ch == '\\')
         escaped += "\\\\";
      else if(ch == '"')
         escaped += "\\\"";
      else if(ch == '\n')
         escaped += "\\n";
      else if(ch == '\r')
         escaped += "\\r";
      else if(ch == '\t')
         escaped += "\\t";
      else if(ch < 32)
         escaped += "";
      else
         escaped += ShortToString(ch);
   }

   return escaped;
}

string JsonString(string value)
{
   return "\"" + JsonEscape(value) + "\"";
}

string DoubleToJson(double value, int digits)
{
   if(!MathIsValidNumber(value))
      return "0";

   return DoubleToString(value, MathMax(digits, 0));
}

string NullablePriceToJson(double value, int digits)
{
   if(value <= 0.0 || !MathIsValidNumber(value))
      return "null";

   return DoubleToJson(value, digits);
}

string TimeToIso8601(datetime value)
{
   MqlDateTime parts;
   TimeToStruct(value, parts);

   return StringFormat(
      "%04d-%02d-%02dT%02d:%02d:%02dZ",
      parts.year,
      parts.mon,
      parts.day,
      parts.hour,
      parts.min,
      parts.sec
   );
}

int DigitsForSymbol(string symbol)
{
   long digits = 0;
   if(SymbolInfoInteger(symbol, SYMBOL_DIGITS, digits))
      return (int)digits;

   return _Digits;
}

string PriceOrDash(double price, string symbol)
{
   if(price <= 0.0 || !MathIsValidNumber(price))
      return "-";

   return DoubleToString(price, DigitsForSymbol(symbol));
}

string BuildEndpointUrl(string endpoint)
{
   if(StringFind(endpoint, "http://") == 0 || StringFind(endpoint, "https://") == 0)
      return endpoint;

   return NormalizeBaseUrl(JOURNAL_API_BASE_URL) + endpoint;
}

string NormalizeBaseUrl(string value)
{
   value = StringTrimCopy(value);

   while(StringLen(value) > 0 && StringSubstr(value, StringLen(value) - 1, 1) == "/")
      value = StringSubstr(value, 0, StringLen(value) - 1);

   return value;
}

string StringTrimCopy(string value)
{
   StringTrimLeft(value);
   StringTrimRight(value);
   return value;
}

string SanitizeFilePart(string value)
{
   string result = "";

   for(int i = 0; i < StringLen(value); i++)
   {
      ushort ch = StringGetCharacter(value, i);
      bool allowed =
         (ch >= 'A' && ch <= 'Z') ||
         (ch >= 'a' && ch <= 'z') ||
         (ch >= '0' && ch <= '9') ||
         ch == '_' ||
         ch == '-';

      result += allowed ? ShortToString(ch) : "_";
   }

   return result == "" ? "unknown" : result;
}

void DebugPrint(string message)
{
   if(DEBUG_MODE)
      Print(message);
}

//+------------------------------------------------------------------+
//| Single attachment lock                                            |
//+------------------------------------------------------------------+
bool AcquireSingleInstanceLock()
{
   g_lockName = "TradeJournalRecorder.Lock." + (string)AccountInfoInteger(ACCOUNT_LOGIN);
   long currentChartId = ChartID();

   if(GlobalVariableCheck(g_lockName))
   {
      long existingChartId = (long)GlobalVariableGet(g_lockName);
      if(existingChartId != currentChartId && ChartIdIsOpen(existingChartId))
         return false;
   }

   GlobalVariableSet(g_lockName, (double)currentChartId);
   g_hasLock = true;
   return true;
}

void ReleaseSingleInstanceLock()
{
   if(!g_hasLock || g_lockName == "")
      return;

   if(GlobalVariableCheck(g_lockName))
   {
      long existingChartId = (long)GlobalVariableGet(g_lockName);
      if(existingChartId == ChartID())
         GlobalVariableDel(g_lockName);
   }

   g_hasLock = false;
}

bool ChartIdIsOpen(long chartIdToFind)
{
   long chartId = ChartFirst();
   while(chartId >= 0)
   {
      if(chartId == chartIdToFind)
         return true;

      chartId = ChartNext(chartId);
   }

   return false;
}
