// Optimized Google Apps Script for Multi-Event Registration System with Admin Panel
// Deploy as Web App: "Execute as me", "Anyone"
// Synced with React src/App.tsx and src/event_registration.js event config fallbacks

// ===== Config =====
const CONFIG = {
  SHEET_ID: '1kvHk40tEMW3ucDauhWi6FbD3_qxJ1RDW3wtVdNlbBY0',
  REGISTRATIONS_SHEET: 'Registrations',
  MEMBERS_SHEET: 'Members',
  // Source for monthly Members refresh (CurrentMembershipReport)
  MEMBERSHIP_SOURCE_SHEET_ID: '12kOkGiXBlHwggShex3N3cDSXgXAMWaEIbOOlyuAUmHo',
  MEMBERSHIP_SOURCE_TAB: 'CurrentMembershipReport',
  EMAIL_FROM_NAME: 'Jeff ',
  EMAIL_FROM_ADDR: 'no-reply@yourclub.ca',
  CORS_ORIGINS: ['http://localhost:3000', 'https://stunning-mochi-d4f069.netlify.app'],
  CACHE_MEMBERS_TTL: 300,
  CACHE_STATS_TTL: 30,
  CACHE_COUNT_TTL: 60,
  MAX_ROWS_BATCH: 1000,
  ENABLE_PARALLEL_PROCESSING: true
};

// ===== Optimized Utilities =====
const cache = CacheService.getScriptCache();
const properties = PropertiesService.getScriptProperties();

let sheetsCache = {};
function getSheet(sheetName) {
  if (!sheetsCache[sheetName]) {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    sheetsCache[sheetName] = spreadsheet.getSheetByName(sheetName);
  }
  return sheetsCache[sheetName];
}

/* =========================
   Default Event Configs - Synced with React DEFAULT_EVENT_CONFIGS and EVENT_CONFIGS
   Run initializeDefaultConfigs() once to seed; run add* functions to merge new events
========================= */

function addWinterPDL() {
  const winterConfig = {
    "winter-pdl-9.0-2026": {
      id: "winter-pdl-9.0-2026",
      name: "KWRC Winter PDL 9.0",
      description: "Premier Doubles League - Winter 2026 Season",
      location: "Played on the Best Doubles Court in the World",
      format: [
        "5 teams of 5 positions",
        "Teams/Positions will be selected based on your level of play",
        "Sign up individually and you will be placed with a doubles partner and team",
        "First 50 players signed up get in. Everyone else goes on the waiting/spare list",
        "Pos. 5 - Mondays at 7 or 8pm",
        "Pos. 4 - Tuesdays at 6 or 7pm",
        "Pos. 3 - Tuesdays at 8 or 9pm",
        "Pos. 2 - Wednesdays at 6 or 7pm",
        "Pos. 1 - Wednesdays at 8 or 9pm"
      ],
      cost: "$60 + hst",
      maxRegistrations: 50,
      registrationOpenTime: "",
      registrationCloseTime: "",
      showInHeader: true,
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "email", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com" },
        { name: "wall", type: "radio", label: "Wall Preference", required: true, options: ["Left Wall", "Right Wall", "Either Wall"] },
        { name: "preferred_partner", type: "text", label: "Preferred Partner (Optional)", required: false, placeholder: "Enter partner's name if you have a preference" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or preferences..." }
      ],
      ui: {
        title: "KWRC Winter PDL 9.0 Registration",
        subtitle: "10-week Premier Doubles League",
        theme: { primary: "blue", secondary: "indigo" }
      },
      notifications: { requireEmailVerification: true, confirmationEmail: true },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
      isRecurring: false,
      excludedDates: []
    }
  };
  const configsJson = properties.getProperty('EVENT_CONFIGS');
  const configs = configsJson ? JSON.parse(configsJson) : {};
  const updated = { ...configs, ...winterConfig };
  properties.setProperty('EVENT_CONFIGS', JSON.stringify(updated));
  console.log('Winter PDL 9.0 added successfully');
  return { success: true, configs: updated };
}

/** Fall PDL 10.0 2026 — renamed from winter-pdl-9.0-2026-2; hidden from public header selector. */
function addFallPDL10() {
  const fallConfig = {
    "fall-pdl-10.0_2026": {
      id: "fall-pdl-10.0_2026",
      name: "KWRC Fall PDL 10.0",
      description: "Premier Doubles League - Winter 2026 Season",
      location: "Played on the Best Doubles Court in the World",
      format: [
        "5 teams of 5 positions",
        "Teams/Positions will be selected based on your level of play",
        "Sign up individually and you will be placed with a doubles partner and team",
        "First 50 players signed up get in. Everyone else goes on the waiting/spare list",
        "Pos. 5 - Mondays at 7 or 8pm",
        "Pos. 4 - Tuesdays at 6 or 7pm",
        "Pos. 3 - Tuesdays at 8 or 9pm",
        "Pos. 2 - Wednesdays at 6 or 7pm",
        "Pos. 1 - Wednesdays at 8 or 9pm"
      ],
      cost: "$70 + tax",
      maxRegistrations: 50,
      registrationOpenTime: "",
      registrationCloseTime: "",
      showInHeader: false,
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "email", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com" },
        { name: "wall", type: "radio", label: "Wall Preference", required: true, options: ["Left Wall", "Right Wall", "Either Wall"] },
        { name: "preferred_partner", type: "text", label: "Preferred Partner (Optional)", required: false, placeholder: "Enter partner's name if you have a preference" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or preferences..." }
      ],
      ui: {
        title: "KWRC Fall PDL 10.0 Registration",
        subtitle: "10-week Premier Doubles League",
        theme: { primary: "blue", secondary: "indigo" }
      },
      notifications: { requireEmailVerification: true, confirmationEmail: true },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
      isRecurring: false,
      excludedDates: []
    }
  };
  const configsJson = properties.getProperty('EVENT_CONFIGS');
  const configs = configsJson ? JSON.parse(configsJson) : {};
  delete configs['winter-pdl-9.0-2026-2'];
  const updated = { ...configs, ...fallConfig };
  properties.setProperty('EVENT_CONFIGS', JSON.stringify(updated));
  console.log('Fall PDL 10.0 added successfully (hidden from header)');
  return { success: true, configs: updated };
}

/** @deprecated Use addFallPDL10 */
function addWinterPDLCopy() {
  return addFallPDL10();
}

/** Padel Club Championships 2026 — doubles only; partner default, solo optional. */
function addPadelClubChamps2026() {
  const padelConfig = {
    "padel-club-champs-2026": {
      id: "padel-club-champs-2026",
      name: "Padel Club Championships 2026",
      description: "Annual Padel Club Championships - Doubles only",
      location: "KWRC Padel Courts",
      format: [
        "Padel is doubles only",
        "Sign up with a doubles partner by default, or register solo and we'll help find you a partner",
        "Divisions: A, B, C, D, and 60+",
        "Players can register in multiple divisions"
      ],
      cost: "$40 per event",
      maxRegistrations: 100,
      registrationOpenTime: "",
      registrationCloseTime: "",
      showInHeader: true,
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "email", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com" },
        { name: "event_types", type: "checkbox", label: "Doubles", required: false },
        { name: "doubles_division", type: "select", label: "Doubles Division", required: false, options: ["A", "B", "C", "D", "60+"] },
        { name: "doubles_partner", type: "text", label: "Doubles Partner", required: false, placeholder: "Start typing partner name" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or requests..." }
      ],
      ui: {
        title: "Padel Club Championships 2026",
        subtitle: "Doubles with a partner by default · Solo optional",
        theme: { primary: "green", secondary: "teal" }
      },
      notifications: { requireEmailVerification: false, confirmationEmail: true },
      rules: { requireMembership: true, allowDuplicates: true, waitingListEnabled: false },
      isRecurring: false,
      excludedDates: []
    }
  };
  const configsJson = properties.getProperty('EVENT_CONFIGS');
  const configs = configsJson ? JSON.parse(configsJson) : {};
  const updated = { ...configs, ...padelConfig };
  properties.setProperty('EVENT_CONFIGS', JSON.stringify(updated));
  console.log('Padel Club Championships 2026 added successfully');
  return { success: true, configs: updated };
}

function addGolfTournament2026() {
  const golfConfig = {
    "golf-tournament-2026": {
      id: "golf-tournament-2026",
      name: "KWRC Golf Tournament 2026",
      description: "",
      location: "Brookfield Golf Course",
      format: [
        "Friday, September 25, 2026",
        "Tee times 12:00pm – 2:00pm",
        "2 person scramble",
        "Steak dinner available after golf ($30)",
        "Each participant must bring a prize worth $30 or more to the prize table",
        "Prizes for Closest to the Hole, Longest Drive, Hole in One, Straightest Drive"
      ],
      cost: "$110 golf (incl. cart); $30 steak dinner (optional)",
      maxRegistrations: 40,
      registrationOpenTime: "",
      registrationCloseTime: "",
      showInHeader: true,
      fields: [
        { name: "player_name", type: "text", label: "Golfer 1 Name", required: true, placeholder: "Golfer 1 (you)" },
        { name: "email", type: "email", label: "Golfer 1 Email", required: true, placeholder: "your.email@example.com" },
        { name: "group_size", type: "select", label: "How many golfers in your group?", required: true, options: ["1", "2", "3", "4"] },
        { name: "additional_player_1", type: "text", label: "Golfer 2 Name", required: false, placeholder: "Golfer 2" },
        { name: "additional_player_2", type: "text", label: "Golfer 3 Name", required: false, placeholder: "Golfer 3" },
        { name: "additional_player_3", type: "text", label: "Golfer 4 Name", required: false, placeholder: "Golfer 4" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or special requests..." }
      ],
      ui: {
        title: "KWRC Golf Tournament 2026",
        subtitle: "Friday, September 25 · Brookfield Golf Course · Register for golf and dinner",
        theme: { primary: "green", secondary: "emerald" }
      },
      notifications: { requireEmailVerification: false, confirmationEmail: false },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
      isRecurring: false,
      excludedDates: []
    }
  };
  const configsJson = properties.getProperty('EVENT_CONFIGS');
  const configs = configsJson ? JSON.parse(configsJson) : {};
  if (configs['golf-tournament-2025']) {
    configs['golf-tournament-2025'].showInHeader = false;
  }
  const updated = { ...configs, ...golfConfig };
  properties.setProperty('EVENT_CONFIGS', JSON.stringify(updated));
  console.log('Golf Tournament 2026 added successfully');
  return { success: true, configs: updated };
}

function addSundayClinic() {
  const config = {
    "sunday-squash-clinic": {
      id: "sunday-squash-clinic",
      name: "Sunday Squash Clinic 2-3:30pm",
      description: "",
      location: "Barney Lawrence and Sandy Morgan Courts",
      format: ["Learn the important principles of squash including proper technique efficient movement and positioning on court"],
      cost: "Free",
      maxRegistrations: 6,
      registrationOpenTime: "",
      registrationCloseTime: "",
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "clinic_week", type: "select", label: "Week", required: true, options: [], defaultValue: "" }
      ],
      ui: {
        title: "Sunday Squash Clinic 2-3:30pm",
        subtitle: "Sign up to learn good technique, footwork, and tactics",
        theme: { primary: "blue", secondary: "indigo" }
      },
      notifications: { requireEmailVerification: false, confirmationEmail: false },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: false },
      isRecurring: true,
      recurringDay: 0,
      recurringDayName: "Sunday",
      excludedDates: []
    }
  };
  // MERGE with existing configs (do not overwrite)
  const configsJson = properties.getProperty('EVENT_CONFIGS');
  const configs = configsJson ? JSON.parse(configsJson) : {};
  const updated = { ...configs, ...config };
  properties.setProperty('EVENT_CONFIGS', JSON.stringify(updated));
  return { success: true, configs: updated };
}

// Batch operations helper
function batchOperation(items, batchSize, processor) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    results.push(...processor(batch));
  }
  return results;
}

function parseJsonFast(x) {
  if (!x || typeof x !== 'string') return {};
  try {
    const parsed = JSON.parse(x);
    return typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

function parseJsonLoose(x) {
  if (!x) return {};
  if (typeof x === 'object') return x;
  if (typeof x === 'string') {
    try {
      return JSON.parse(x);
    } catch {
      return {};
    }
  }
  return {};
}

function getCacheCompressed(key) {
  const compressed = cache.get(key + ':gz');
  if (!compressed) return null;
  try {
    const gzBytes = Utilities.base64Decode(compressed);
    const ungz = Utilities.ungzip(Utilities.newBlob(gzBytes)).getDataAsString();
    return JSON.parse(ungz);
  } catch (e) {
    return null;
  }
}

function setCacheCompressed(key, data, ttl) {
  if (key.length > 200) {
    console.warn('Cache key too long, truncating:', key.substring(0, 50) + '...');
    key = key.substring(0, 200);
  }
  try {
    const json = JSON.stringify(data);
    if (json.length > 90000) {
      console.warn('Cache payload too large, skipping cache');
      return false;
    }
    const compressed = Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(json)).getBytes());
    cache.put(key + ':gz', compressed, ttl);
  } catch (e) {
    console.warn('Cache compression failed:', e);
    try {
      const json = JSON.stringify(data);
      if (json.length < 90000) {
        cache.put(key, json, ttl);
      }
    } catch (e2) {
      console.error('Cache storage failed entirely:', e2);
      return false;
    }
  }
  return true;
}

function buildPlayerIndex(data, headers) {
  var eventCol = headers.indexOf('event_id');
  var nameCol = headers.indexOf('player_name');
  var extraCol = headers.indexOf('extra_json');
  var index = {};
  if (eventCol === -1 || nameCol === -1) return index;
  for (var i = 1; i < data.length; i++) {
    var eventId = String(data[i][eventCol]);
    var primaryName = String(data[i][nameCol] || '').toLowerCase().trim();
    if (primaryName) index[eventId + ':' + primaryName] = true;
    if (extraCol !== -1 && data[i][extraCol]) {
      try {
        var extra = JSON.parse(data[i][extraCol]);
        if (Array.isArray(extra.team_members)) {
          extra.team_members.forEach(function(n) {
            var name = (typeof n === 'string' ? n : (n && n.name) || '').trim().toLowerCase();
            if (name) index[eventId + ':' + name] = true;
          });
        }
      } catch (e) {}
    }
  }
  return index;
}

// ===== Core Optimizations =====
function readRequest(e) {
  let p = e?.parameter ? { ...e.parameter } : {};
  try {
    if (e?.postData?.contents && e.postData.type?.toLowerCase().includes('application/json')) {
      const body = JSON.parse(e.postData.contents);
      p = { ...p, ...body };
    }
  } catch (err) {
    console.error('JSON parse error:', err);
  }
  return p;
}

function toBool(v) {
  return v === true || v === 'true' || v === 1 || v === '1';
}

function json(obj) {
  // TextOutput has no setResponseCode; GAS web apps always return HTTP 200.
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkRateLimit(key, limit, windowSec) {
  const now = Date.now();
  const windowStart = now - (windowSec * 1000);
  const requestKey = `rl:${key}`;
  let requests = [];
  try {
    const cached = cache.get(requestKey);
    requests = cached ? JSON.parse(cached) : [];
  } catch { requests = []; }
  requests = requests.filter(function(time) { return time > windowStart; });
  requests.push(now);
  const allowed = requests.length <= limit;
  if (allowed) {
    cache.put(requestKey, JSON.stringify(requests), windowSec);
  }
  return allowed;
}

function seen(idemp) {
  if (!idemp) return false;
  if (cache.get('idem:' + idemp)) return true;
  cache.put('idem:' + idemp, '1', 300);
  return false;
}

// ===== Optimized Sheet Operations =====
function getRegistrationsSheet() {
  var sheet = getSheet(CONFIG.REGISTRATIONS_SHEET);
  if (!sheet) {
    var spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    sheet = spreadsheet.insertSheet(CONFIG.REGISTRATIONS_SHEET);
    var headers = [
      'timestamp', 'event_id', 'event_name', 'player_name', 'email',
      'phone', 'division', 'wall', 'comments', 'extra_json',
      'registration_number', 'is_waiting_list'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheetsCache[CONFIG.REGISTRATIONS_SHEET] = sheet;
  }
  return sheet;
}

function getSheetData(sheetName, maxRows) {
  maxRows = maxRows || null;
  var sheet = getSheet(sheetName);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var numRows = maxRows ? Math.min(maxRows, lastRow) : lastRow;
  var lastCol = sheet.getLastColumn();
  return sheet.getRange(1, 1, numRows, lastCol).getValues();
}

// ===== Enhanced Handlers =====
function doGet(e) { return doPost(e); }

function doPost(e) {
  var startTime = Date.now();
  try {
    var p = readRequest(e);
    p.is_waiting_list = toBool(p.is_waiting_list || p.isWaitingList);
    if (p.registration_number !== undefined && p.registration_number !== '') {
      p.registration_number = Number(p.registration_number);
    }
    p.extra_json = parseJsonFast(p.extra_json);
    var action = p.action;
    var callback = p.callback;
    var result;
    switch (action) {
      case 'getMembers': result = getMembersOptimized(); break;
      case 'getRegistrationCount': result = getRegistrationCountOptimized(p); break;
      case 'getRegistrationStats': result = getRegistrationStatsOptimized(p); break;
      case 'getRegistrations': result = getRegistrationsOptimized(p); break;
      case 'checkDuplicate': result = checkDuplicateOptimized(p); break;
      case 'send_code': result = handleSendCode(p); break;
      case 'verify_code':
      case 'verifyCode': result = handleVerifyCode(p); break;
      case 'submit_registration':
      case 'register': result = handleSubmitOptimized(p); break;
      case 'sendVerification': result = handleSendCode(p); break;
      case 'getEventConfigs': result = getEventConfigs(); break;
      case 'saveEventConfig': result = saveEventConfig(p); break;
      case 'deleteEventConfig': result = deleteEventConfig(p); break;
      default: result = { success: false, error: 'Unknown action: ' + action };
    }
    if (p.debug) {
      result._performance = { executionTime: Date.now() - startTime };
    }
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return json(result);
  } catch (err) {
    console.error('doPost error:', err);
    var cb = e && e.parameter && e.parameter.callback;
    var errorResult = { success: false, error: String(err) };
    if (cb) {
      return ContentService.createTextOutput(cb + '(' + JSON.stringify(errorResult) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return json(errorResult);
  }
}

// ===== Optimized Core Functions =====
function getMembersOptimized() {
  var cacheKey = 'members:v3';
  var cached = getCacheCompressed(cacheKey);
  if (cached) return cached;
  try {
    var data = getSheetData(CONFIG.MEMBERS_SHEET);
    var result;
    if (data.length <= 1) {
      result = { success: true, members: [] };
      setCacheCompressed(cacheKey, result, CONFIG.CACHE_MEMBERS_TTL);
      return result;
    }
    var headers = data[0].map(function(h) { return String(h).toLowerCase().trim(); });
    var nameCol = findHeaderIndex_(headers, [
      'member name', 'name', 'player name', 'full name'
    ]);
    if (nameCol === -1) nameCol = 0;
    var idCol = findHeaderIndex_(headers, [
      'member_id', 'member id', 'memberid', 'id', 'membership id', 'membership_id'
    ]);
    var members = data.slice(1)
      .filter(function(r) { return r[nameCol] && String(r[nameCol]).trim(); })
      .map(function(r) {
        var member = { name: String(r[nameCol]).trim() };
        if (idCol !== -1 && r[idCol] !== '' && r[idCol] != null) {
          member.member_id = String(r[idCol]).trim();
        }
        return member;
      })
      .sort(function(a, b) { return a.name.localeCompare(b.name); });
    result = { success: true, members: members };
    setCacheCompressed(cacheKey, result, CONFIG.CACHE_MEMBERS_TTL);
    return result;
  } catch (err) {
    console.error('getMembersOptimized error:', err);
    return { success: true, members: [] };
  }
}

function getRegistrationCountOptimized(params) {
  var eventId = params.event_id;
  if (!eventId) return { success: false, error: 'Event ID is required' };
  var cacheKey = 'count:' + eventId + ':v2';
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);
  try {
    var data = getSheetData(CONFIG.REGISTRATIONS_SHEET);
    if (data.length <= 1) {
      var result = { success: true, count: 0, golferCount: 0, totalGolfers: 0 };
      cache.put(cacheKey, JSON.stringify(result), CONFIG.CACHE_COUNT_TTL);
      return result;
    }
    var headers = data[0];
    var eventCol = headers.indexOf('event_id');
    var extraCol = headers.indexOf('extra_json');
    if (eventCol === -1) {
      result = { success: true, count: 0, golferCount: 0, totalGolfers: 0 };
      cache.put(cacheKey, JSON.stringify(result), CONFIG.CACHE_COUNT_TTL);
      return result;
    }
    var registrationCount = 0;
    var totalParticipants = 0;
    for (var i = 1; i < data.length; i++) {
      if (data[i][eventCol] !== eventId) continue;
      registrationCount++;
      var participants = 1;
      if (extraCol !== -1 && data[i][extraCol]) {
        try {
          var extra = JSON.parse(data[i][extraCol]);
          if (Array.isArray(extra.team_members)) {
            participants = extra.team_members.filter(function(n) {
              return n && String(typeof n === 'string' ? n : (n.name || n) || '').trim();
            }).length;
          } else if (Array.isArray(extra.golfers)) {
            participants = extra.golfers.filter(function(g) {
              return g && String(g.name || g || '').trim();
            }).length;
          } else {
            ['golfer2', 'golfer3', 'golfer4', 'additional_player_1', 'additional_player_2', 'additional_player_3', 'partner', 'partner_name', 'doubles_partner', 'teammate', 'teammate_name'].forEach(function(key) {
              if (extra[key] && String(extra[key]).trim()) participants++;
            });
          }
        } catch (e) {
          console.warn('JSON parse error in counting:', e);
        }
      }
      totalParticipants += participants;
    }
    result = {
      success: true,
      count: registrationCount,
      golferCount: totalParticipants,
      totalGolfers: totalParticipants
    };
    cache.put(cacheKey, JSON.stringify(result), CONFIG.CACHE_COUNT_TTL);
    return result;
  } catch (err) {
    console.error('getRegistrationCountOptimized error:', err);
    return { success: false, error: 'Failed to get registration count' };
  }
}

function checkDuplicateOptimized(params) {
  var eventId = params.event_id;
  var playerName = params.playerName;
  if (!eventId || !playerName) {
    return { success: false, error: 'Event ID and player name are required' };
  }
  var cacheKey = 'd:' + eventId;
  var playerIndex = cache.get(cacheKey);
  if (!playerIndex) {
    try {
      var data = getSheetData(CONFIG.REGISTRATIONS_SHEET);
      if (data.length <= 1) return { success: true, isDuplicate: false };
      var indexObj = buildPlayerIndex(data, data[0]);
      var keysJson = JSON.stringify(Object.keys(indexObj));
      if (keysJson.length < 90000) {
        cache.put(cacheKey, keysJson, CONFIG.CACHE_COUNT_TTL);
      } else {
        var searchKey = eventId + ':' + playerName.toLowerCase().trim();
        return { success: true, isDuplicate: !!indexObj[searchKey] };
      }
      playerIndex = keysJson;
    } catch (err) {
      console.error('checkDuplicateOptimized error:', err);
      return { success: false, error: 'Failed to check duplicate registration' };
    }
  }
  try {
    var keys = JSON.parse(playerIndex);
    var indexObj = {};
    keys.forEach(function(k) { indexObj[k] = true; });
    var searchKey = eventId + ':' + playerName.toLowerCase().trim();
    return { success: true, isDuplicate: !!indexObj[searchKey] };
  } catch (e) {
    console.error('Error parsing cached player index:', e);
    return { success: false, error: 'Cache error, please try again' };
  }
}

function getRegistrationStatsOptimized(params) {
  var eventId = params.event_id;
  if (!eventId) return { success: false, error: 'Event ID is required' };
  var cacheKey = 's:' + eventId;
  var cached = getCacheCompressed(cacheKey);
  if (cached) return cached;
  try {
    var data = getSheetData(CONFIG.REGISTRATIONS_SHEET);
    if (data.length <= 1) {
      var result = {
        success: true, registrations: 0, totalGolfers: 0,
        confirmedGolfers: 0, waitingListGolfers: 0, dinnerSelections: {}
      };
      setCacheCompressed(cacheKey, result, CONFIG.CACHE_STATS_TTL);
      return result;
    }
    var headers = data[0];
    var eventCol = headers.indexOf('event_id');
    var extraCol = headers.indexOf('extra_json');
    var waitCol = headers.indexOf('is_waiting_list');
    if (eventCol === -1) return { success: false, error: 'Event data not found' };
    var registrationCount = 0;
    var totalParticipants = 0;
    var confirmedParticipants = 0;
    var waitingListParticipants = 0;
    var dinnerSelections = {};
    for (var i = 1; i < data.length; i++) {
      if (data[i][eventCol] !== eventId) continue;
      registrationCount++;
      var isWaitingList = waitCol !== -1 ? toBool(data[i][waitCol]) : false;
      var participants = 1;
      if (extraCol !== -1 && data[i][extraCol]) {
        try {
          var extra = JSON.parse(data[i][extraCol]);
          if (Array.isArray(extra.team_members)) {
            participants = extra.team_members.filter(function(n) {
              return n && String(typeof n === 'string' ? n : (n.name || n) || '').trim();
            }).length;
          } else if (Array.isArray(extra.golfers)) {
            participants = extra.golfers.filter(function(g) {
              return g && String(g.name || g || '').trim();
            }).length;
            extra.golfers.forEach(function(g) {
              if (g && g.dinner) dinnerSelections['Yes'] = (dinnerSelections['Yes'] || 0) + 1;
            });
          } else {
            ['golfer2', 'golfer3', 'golfer4', 'additional_player_1', 'additional_player_2', 'additional_player_3', 'partner', 'partner_name', 'doubles_partner', 'teammate', 'teammate_name'].forEach(function(key) {
              if (extra[key] && String(extra[key]).trim()) participants++;
            });
          }
          if (extra.dinnerSelection) {
            dinnerSelections[extra.dinnerSelection] = (dinnerSelections[extra.dinnerSelection] || 0) + participants;
          }
        } catch (e) {
          console.warn('Stats JSON parse error:', e);
        }
      }
      totalParticipants += participants;
      if (isWaitingList) {
        waitingListParticipants += participants;
      } else {
        confirmedParticipants += participants;
      }
    }
    result = {
      success: true,
      registrations: registrationCount,
      totalGolfers: totalParticipants,
      confirmedGolfers: confirmedParticipants,
      waitingListGolfers: waitingListParticipants,
      dinnerSelections: dinnerSelections
    };
    setCacheCompressed(cacheKey, result, CONFIG.CACHE_STATS_TTL);
    return result;
  } catch (err) {
    console.error('getRegistrationStatsOptimized error:', err);
    return { success: false, error: 'Failed to get registration statistics' };
  }
}

function getRegistrationsOptimized(params) {
  var eventId = params.event_id;
  if (!eventId) return { success: false, error: 'Event ID is required' };
  var cacheKey = 'r:' + eventId;
  var cached = getCacheCompressed(cacheKey);
  if (cached) return cached;
  try {
    var data = getSheetData(CONFIG.REGISTRATIONS_SHEET);
    if (data.length <= 1) {
      var result = { success: true, registrations: [] };
      setCacheCompressed(cacheKey, result, CONFIG.CACHE_STATS_TTL);
      return result;
    }
    var headers = data[0];
    var columnMap = {};
    ['event_id', 'event_name', 'player_name', 'email', 'phone', 'division', 'wall',
      'comments', 'extra_json', 'timestamp', 'registration_number', 'is_waiting_list'].forEach(function(col) {
      columnMap[col] = headers.indexOf(col);
    });
    if (columnMap.event_id === -1 || columnMap.player_name === -1) {
      return { success: true, registrations: [] };
    }
    var registrations = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][columnMap.event_id] !== eventId) continue;
      var row = data[i];
      registrations.push({
        event_id: row[columnMap.event_id] || '',
        event_name: row[columnMap.event_name] || '',
        player_name: row[columnMap.player_name] || '',
        email: row[columnMap.email] || '',
        phone: row[columnMap.phone] || '',
        division: row[columnMap.division] || '',
        wall: row[columnMap.wall] || '',
        comments: row[columnMap.comments] || '',
        extra_json: parseJsonFast(row[columnMap.extra_json]),
        timestamp: row[columnMap.timestamp] || '',
        registration_number: row[columnMap.registration_number] || 0,
        is_waiting_list: toBool(row[columnMap.is_waiting_list])
      });
    }
    registrations.sort(function(a, b) { return new Date(a.timestamp) - new Date(b.timestamp); });
    result = { success: true, registrations: registrations };
    setCacheCompressed(cacheKey, result, CONFIG.CACHE_STATS_TTL);
    return result;
  } catch (err) {
    console.error('getRegistrationsOptimized error:', err);
    return { success: false, error: 'Failed to get registrations' };
  }
}

function backfillRegistrationNumbers() {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var sh = ss.getSheetByName(CONFIG.REGISTRATIONS_SHEET);
  var values = sh.getDataRange().getValues();
  if (!values.length) return;
  var headers = values[0];
  var cEvent = headers.indexOf('event_id');
  var cRegNo = headers.indexOf('registration_number');
  var cTime = headers.indexOf('timestamp');
  if (cEvent === -1 || cRegNo === -1) throw new Error('Missing event_id or registration_number column');
  var rows = values.slice(1).map(function(r, i) {
    return {
      idx: i + 2,
      event: String(r[cEvent] || '').trim().toLowerCase(),
      ts: new Date(r[cTime] || 0) || new Date(0),
      row: r
    };
  });
  var groups = {};
  rows.forEach(function(r) {
    if (!r.event) return;
    if (!groups[r.event]) groups[r.event] = [];
    groups[r.event].push(r);
  });
  var sp = PropertiesService.getScriptProperties();
  var updates = [];
  for (var ev in groups) {
    var arr = groups[ev].sort(function(a, b) { return a.ts - b.ts; });
    var n = 0;
    arr.forEach(function(r) {
      n++;
      updates.push({ rowIdx: r.idx, value: n });
    });
    sp.setProperty('seq:' + ev, String(n));
  }
  if (updates.length) {
    var numDataRows = sh.getLastRow() - 1;
    if (numDataRows < 1) return;
    var rng = sh.getRange(2, cRegNo + 1, numDataRows, 1);
    var col = rng.getValues();
    updates.forEach(function(u) {
      col[u.rowIdx - 2][0] = u.value;
    });
    rng.setValues(col);
  }
}

// ===== Email and Verification =====
function sendEmail(to, subject, textBody) {
  var apiKey = properties.getProperty('SENDGRID_API_KEY');
  if (apiKey) {
    try {
      var payload = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: CONFIG.EMAIL_FROM_ADDR, name: CONFIG.EMAIL_FROM_NAME },
        subject: subject,
        content: [{ type: 'text/plain', value: textBody }]
      };
      var res = UrlFetchApp.fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + apiKey },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      if (res.getResponseCode() >= 300) {
        console.warn('SendGrid failed, falling back to Gmail');
        GmailApp.sendEmail(to, subject, textBody);
      }
    } catch (e) {
      console.warn('SendGrid error, falling back to Gmail:', e);
      GmailApp.sendEmail(to, subject, textBody);
    }
  } else {
    GmailApp.sendEmail(to, subject, textBody);
  }
}

function handleSendCode(p) {
  var email = (p.email || '').trim().toLowerCase();
  if (!email) return { success: false, error: 'email required' };
  if (seen(p.idempotency_key)) return { success: true, dedup: true };
  if (!checkRateLimit('send:' + email, 5, 60)) {
    return { success: false, error: 'Too many requests, please wait a minute' };
  }
  var code = String(Math.floor(100000 + Math.random() * 900000));
  cache.put('code:' + email, code, 600);
  var body = 'Your verification code is: ' + code + '\n\nThis code expires in 10 minutes.\n\n— ' + CONFIG.EMAIL_FROM_NAME;
  try {
    sendEmail(email, 'Email Verification Code', body);
  } catch (e) {
    console.error('send_code email error', e);
    return { success: false, error: 'Failed to send verification email' };
  }
  return { success: true };
}

function handleVerifyCode(p) {
  var email = (p.email || '').trim().toLowerCase();
  var code = (p.code || '').trim();
  if (!email || !code) return { success: false, error: 'email and code required' };
  var saved = cache.get('code:' + email);
  if (!saved || saved !== code) return { success: false, error: 'Invalid or expired code' };
  var token = Utilities.base64EncodeWebSafe(JSON.stringify({
    email: email,
    exp: Date.now() + 600000,
    sig: Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email + Date.now())
  }));
  cache.put('token:' + token, email, 600);
  return { success: true, verification_token: token, exp: Date.now() + 600000 };
}

function handleSubmitOptimized(p) {
  if (seen(p.idempotency_key)) return { success: true, dedup: true };
  var email = (p.email || '').trim().toLowerCase();
  var token = p.verification_token || '';
  if (token) {
    var cachedEmail = cache.get('token:' + token);
    if (!cachedEmail || cachedEmail !== email) {
      return { success: false, error: 'Invalid verification token' };
    }
  }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { success: false, error: 'System busy, please retry' };
  }
  var regNo;
  try {
    var current = Number(properties.getProperty('REG_SEQ') || '0') + 1;
    properties.setProperty('REG_SEQ', String(current));
    regNo = current;
  } finally {
    lock.releaseLock();
  }
  try {
    var sheet = getRegistrationsSheet();
    var extraObj = (typeof p.extra_json === 'object') ? p.extra_json : parseJsonLoose(p.extra_json);
    if (p.clinic_week && !extraObj.clinic_week) extraObj.clinic_week = p.clinic_week;
    if (p.survivor_week && !extraObj.survivor_week) extraObj.survivor_week = p.survivor_week;
    if (p.week && !extraObj.week) extraObj.week = p.week;
    var extraText = JSON.stringify(extraObj);
    var row = [
      p.timestamp || new Date().toISOString(),
      p.event_id || '',
      p.event_name || '',
      p.player_name || '',
      email,
      p.phone || '',
      p.division || '',
      p.wall || '',
      p.comments || '',
      extraText,
      regNo,
      toBool(p.is_waiting_list)
    ];
    sheet.appendRow(row);
    var eventId = p.event_id;
    if (eventId) {
      ['count:', 's:', 'r:', 'd:'].forEach(function(prefix) {
        cache.remove(prefix + eventId);
        cache.remove(prefix + eventId + ':v1');
        cache.remove(prefix + eventId + ':v2');
      });
    }
    if (email) {
      try {
        var subject = 'Registration Confirmation - ' + (p.event_name || 'Event');
        var body = 'Hi ' + (p.player_name || '') + ',\n\nYour registration is confirmed.\n\nRegistration #' + regNo + '\n\nThank you!';
        sendEmail(email, subject, body);
      } catch (e) {
        console.error('Confirmation email error:', e);
      }
    }
    if (token) cache.remove('token:' + token);
    return {
      success: true,
      registrationNumber: regNo,
      isWaitingList: toBool(p.is_waiting_list)
    };
  } catch (err) {
    console.error('handleSubmitOptimized error:', err);
    return { success: false, error: 'Failed to submit registration' };
  }
}

// ===== Event Configuration Management =====
function getEventConfigs() {
  try {
    var configsJson = properties.getProperty('EVENT_CONFIGS');
    var configs = configsJson ? JSON.parse(configsJson) : {};
    return { success: true, configs: configs };
  } catch (err) {
    console.error('getEventConfigs error:', err);
    return { success: false, error: 'Failed to load event configurations' };
  }
}

function saveEventConfig(params) {
  var config = params.config;
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config);
    } catch (e) {
      console.error('Failed to parse config:', e);
      return { success: false, error: 'Invalid configuration format' };
    }
  }
  if (!config || !config.id) {
    return { success: false, error: 'Valid event configuration required' };
  }
  if (!config.name || config.maxRegistrations === undefined) {
    return { success: false, error: 'Missing required fields: name, maxRegistrations' };
  }
  if (!config.location) config.location = '';
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { success: false, error: 'System busy, please retry' };
  }
  try {
    var configsJson = properties.getProperty('EVENT_CONFIGS');
    var configs = configsJson ? JSON.parse(configsJson) : {};
    if (!config.fields) config.fields = [];
    configs[config.id] = config;
    properties.setProperty('EVENT_CONFIGS', JSON.stringify(configs));
    cache.remove('configs:all');
    return {
      success: true,
      message: 'Event "' + config.name + '" saved successfully',
      config: config
    };
  } catch (err) {
    console.error('saveEventConfig error:', err);
    return { success: false, error: 'Failed to save event configuration: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function deleteEventConfig(params) {
  if (!params.eventId) {
    return { success: false, error: 'Event ID required' };
  }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { success: false, error: 'System busy, please retry' };
  }
  try {
    var configsJson = properties.getProperty('EVENT_CONFIGS');
    var configs = configsJson ? JSON.parse(configsJson) : {};
    if (!configs[params.eventId]) {
      return { success: false, error: 'Event not found' };
    }
    var eventName = configs[params.eventId].name;
    delete configs[params.eventId];
    properties.setProperty('EVENT_CONFIGS', JSON.stringify(configs));
    cache.remove('configs:all');
    ['count:', 's:', 'r:', 'd:'].forEach(function(prefix) {
      cache.remove(prefix + params.eventId);
      cache.remove(prefix + params.eventId + ':v1');
      cache.remove(prefix + params.eventId + ':v2');
    });
    return { success: true, message: 'Event "' + eventName + '" deleted successfully' };
  } catch (err) {
    console.error('deleteEventConfig error:', err);
    return { success: false, error: 'Failed to delete event configuration' };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Initialize with ALL default event configs - synced with React event_registration.js + App.tsx
 * Run once manually to seed the backend with all fallback configs
 */
function initializeDefaultConfigs() {
  var defaultConfigs = {
    "club-champs": {
      id: "club-champs",
      name: "Club Championships",
      description: "Annual Club Championships - Singles and Doubles",
      location: "KWRC Squash Courts",
      format: [
        "Sign up for Singles, Doubles, or Both",
        "Divisions: A, B, C, D, and 60+",
        "Players can register for multiple events",
        "For doubles: Partner can be selected later or specified now"
      ],
      cost: "$40 per event",
      maxRegistrations: 100,
      registrationOpenTime: "",
      registrationCloseTime: "",
      showInHeader: true,
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "email", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com" },
        { name: "event_types", type: "checkbox", label: "Singles", required: false },
        { name: "event_types_doubles", type: "checkbox", label: "Doubles", required: false },
        { name: "singles_division", type: "select", label: "Singles Division", required: false, options: ["A", "B", "C", "D", "60+"] },
        { name: "doubles_division", type: "select", label: "Doubles Division", required: false, options: ["A", "B", "C", "D", "60+"] },
        { name: "doubles_partner", type: "text", label: "Doubles Partner", required: false, placeholder: "Start typing partner name" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or requests..." }
      ],
      ui: {
        title: "Club Championships Registration",
        subtitle: "Sign up for Singles and/or Doubles - Multiple divisions available",
        theme: { primary: "indigo", secondary: "purple" }
      },
      notifications: { requireEmailVerification: false, confirmationEmail: true },
      rules: { requireMembership: true, allowDuplicates: true, waitingListEnabled: false },
      isRecurring: false,
      excludedDates: []
    },
    "padel-club-champs-2026": {
      id: "padel-club-champs-2026",
      name: "Padel Club Championships 2026",
      description: "Annual Padel Club Championships - Doubles only",
      location: "KWRC Padel Courts",
      format: [
        "Padel is doubles only",
        "Sign up with a doubles partner by default, or register solo and we'll help find you a partner",
        "Divisions: A, B, C, D, and 60+",
        "Players can register in multiple divisions"
      ],
      cost: "$40 per event",
      maxRegistrations: 100,
      registrationOpenTime: "",
      registrationCloseTime: "",
      showInHeader: true,
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "email", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com" },
        { name: "event_types", type: "checkbox", label: "Doubles", required: false },
        { name: "doubles_division", type: "select", label: "Doubles Division", required: false, options: ["A", "B", "C", "D", "60+"] },
        { name: "doubles_partner", type: "text", label: "Doubles Partner", required: false, placeholder: "Start typing partner name" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or requests..." }
      ],
      ui: {
        title: "Padel Club Championships 2026",
        subtitle: "Doubles with a partner by default · Solo optional",
        theme: { primary: "green", secondary: "teal" }
      },
      notifications: { requireEmailVerification: false, confirmationEmail: true },
      rules: { requireMembership: true, allowDuplicates: true, waitingListEnabled: false },
      isRecurring: false,
      excludedDates: []
    },
    "golf-tournament-2025": {
      id: "golf-tournament-2025",
      name: "Golf Tournament 2025",
      description: "",
      location: "Brookfield Golf Course",
      format: [
        "2 person scramble",
        "Tee times start at 12 noon",
        "Steak Dinner at 7pm: We are assuming that you're staying for dinner unless we hear from you",
        "Each participant must bring a prize worth $30 or more to the prize table",
        "Prizes for Closest to the Hole, Longest Drive, Hole in One, Straightest Drive"
      ],
      cost: "$125 + hst",
      maxRegistrations: 40,
      registrationOpenTime: "2025-08-25T09:00:00-05:00",
      registrationCloseTime: "",
      showInHeader: false,
      fields: [
        { name: "player_name", type: "text", label: "Golfer 1 Name", required: true, placeholder: "Golfer 1 (you)" },
        { name: "email", type: "email", label: "Golfer 1 Email", required: true, placeholder: "your.email@example.com" },
        { name: "group_size", type: "select", label: "How many golfers in your group?", required: true, options: ["1", "2", "3", "4"] },
        { name: "additional_player_1", type: "text", label: "Golfer 2 Name", required: false, placeholder: "Golfer 2" },
        { name: "additional_player_2", type: "text", label: "Golfer 3 Name", required: false, placeholder: "Golfer 3" },
        { name: "additional_player_3", type: "text", label: "Golfer 4 Name", required: false, placeholder: "Golfer 4" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or special requests..." }
      ],
      ui: {
        title: "Golf Tournament 2025",
        subtitle: "Register for tournament and dinner",
        theme: { primary: "green", secondary: "emerald" }
      },
      notifications: { requireEmailVerification: false, confirmationEmail: false },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
      isRecurring: false,
      excludedDates: []
    },
    "golf-tournament-2026": {
      id: "golf-tournament-2026",
      name: "KWRC Golf Tournament 2026",
      description: "",
      location: "Brookfield Golf Course",
      format: [
        "Friday, September 25, 2026",
        "Tee times 12:00pm – 2:00pm",
        "2 person scramble",
        "Steak dinner available after golf ($30)",
        "Each participant must bring a prize worth $30 or more to the prize table",
        "Prizes for Closest to the Hole, Longest Drive, Hole in One, Straightest Drive"
      ],
      cost: "$110 golf (incl. cart); $30 steak dinner (optional)",
      maxRegistrations: 40,
      registrationOpenTime: "",
      registrationCloseTime: "",
      showInHeader: true,
      fields: [
        { name: "player_name", type: "text", label: "Golfer 1 Name", required: true, placeholder: "Golfer 1 (you)" },
        { name: "email", type: "email", label: "Golfer 1 Email", required: true, placeholder: "your.email@example.com" },
        { name: "group_size", type: "select", label: "How many golfers in your group?", required: true, options: ["1", "2", "3", "4"] },
        { name: "additional_player_1", type: "text", label: "Golfer 2 Name", required: false, placeholder: "Golfer 2" },
        { name: "additional_player_2", type: "text", label: "Golfer 3 Name", required: false, placeholder: "Golfer 3" },
        { name: "additional_player_3", type: "text", label: "Golfer 4 Name", required: false, placeholder: "Golfer 4" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or special requests..." }
      ],
      ui: {
        title: "KWRC Golf Tournament 2026",
        subtitle: "Friday, September 25 · Brookfield Golf Course · Register for golf and dinner",
        theme: { primary: "green", secondary: "emerald" }
      },
      notifications: { requireEmailVerification: false, confirmationEmail: false },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
      isRecurring: false,
      excludedDates: []
    },
    "fall-pdl-8.0-2025": {
      id: "fall-pdl-8.0-2025",
      name: "KWRC Fall PDL 8.0",
      description: "",
      location: "Played on the Best Doubles Court in the World",
      format: [
        "5 teams of 5 positions",
        "Teams/Positions will be selected based on your level of play",
        "Sign up individually and you will be placed with a doubles partner and team",
        "First 50 players signed up get in. Everyone else goes on the waiting/spare list",
        "If this web form crashes, text or email Jeff and you will be placed in registration order based on timestamp",
        "Pos. 5 - Mondays at 7 or 8pm",
        "Pos. 4 - Tuesdays at 6 or 7pm",
        "Pos. 3 - Tuesdays at 8 or 9pm",
        "Pos. 2 - Wednesdays at 6 or 7pm",
        "Pos. 1 - Wednesdays at 8 or 9pm"
      ],
      cost: "$60 + hst",
      maxRegistrations: 50,
      registrationOpenTime: "2025-09-08T10:00:00-04:00",
      registrationCloseTime: "",
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "email", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com" },
        { name: "wall", type: "radio", label: "Wall Preference", required: true, options: ["Left Wall", "Right Wall", "Either Wall"] },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or preferences..." }
      ],
      ui: {
        title: "KWRC Fall PDL 8.0 Registration",
        subtitle: "10-week Doubles League from Sep. 29th - Dec. 5th, 2025",
        theme: { primary: "blue", secondary: "indigo" }
      },
      notifications: { requireEmailVerification: true, confirmationEmail: true },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
      isRecurring: false,
      excludedDates: []
    },
    "winter-pdl-9.0-2026": {
      id: "winter-pdl-9.0-2026",
      name: "KWRC Winter PDL 9.0",
      description: "Premier Doubles League - Winter 2026 Season",
      location: "Played on the Best Doubles Court in the World",
      format: [
        "5 teams of 5 positions",
        "Teams/Positions will be selected based on your level of play",
        "Sign up individually and you will be placed with a doubles partner and team",
        "First 50 players signed up get in. Everyone else goes on the waiting/spare list",
        "Pos. 5 - Mondays at 7 or 8pm",
        "Pos. 4 - Tuesdays at 6 or 7pm",
        "Pos. 3 - Tuesdays at 8 or 9pm",
        "Pos. 2 - Wednesdays at 6 or 7pm",
        "Pos. 1 - Wednesdays at 8 or 9pm"
      ],
      cost: "$60 + hst",
      maxRegistrations: 50,
      registrationOpenTime: "",
      registrationCloseTime: "",
      showInHeader: true,
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "email", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com" },
        { name: "wall", type: "radio", label: "Wall Preference", required: true, options: ["Left Wall", "Right Wall", "Either Wall"] },
        { name: "preferred_partner", type: "text", label: "Preferred Partner (Optional)", required: false, placeholder: "Enter partner's name if you have a preference" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or preferences..." }
      ],
      ui: {
        title: "KWRC Winter PDL 9.0 Registration",
        subtitle: "10-week Premier Doubles League",
        theme: { primary: "blue", secondary: "indigo" }
      },
      notifications: { requireEmailVerification: true, confirmationEmail: true },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
      isRecurring: false,
      excludedDates: []
    },
    "winter-pdl-9.0-2026-2": {
      id: "winter-pdl-9.0-2026-2",
      name: "KWRC Winter PDL 9.0",
      description: "Premier Doubles League - Winter 2026 Season",
      location: "Played on the Best Doubles Court in the World",
      format: [
        "5 teams of 5 positions",
        "Teams/Positions will be selected based on your level of play",
        "Sign up individually and you will be placed with a doubles partner and team",
        "First 50 players signed up get in. Everyone else goes on the waiting/spare list",
        "Pos. 5 - Mondays at 7 or 8pm",
        "Pos. 4 - Tuesdays at 6 or 7pm",
        "Pos. 3 - Tuesdays at 8 or 9pm",
        "Pos. 2 - Wednesdays at 6 or 7pm",
        "Pos. 1 - Wednesdays at 8 or 9pm"
      ],
      cost: "$60 + hst",
      maxRegistrations: 50,
      registrationOpenTime: "",
      registrationCloseTime: "",
      showInHeader: false,
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "email", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com" },
        { name: "wall", type: "radio", label: "Wall Preference", required: true, options: ["Left Wall", "Right Wall", "Either Wall"] },
        { name: "preferred_partner", type: "text", label: "Preferred Partner (Optional)", required: false, placeholder: "Enter partner's name if you have a preference" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or preferences..." }
      ],
      ui: {
        title: "KWRC Winter PDL 9.0 Registration",
        subtitle: "10-week Premier Doubles League",
        theme: { primary: "blue", secondary: "indigo" }
      },
      notifications: { requireEmailVerification: true, confirmationEmail: true },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
      isRecurring: false,
      excludedDates: []
    },
    "sunday-squash-clinic": {
      id: "sunday-squash-clinic",
      name: "Sunday Squash Clinic 2-3:30pm",
      description: "",
      location: "Barney Lawrence and Sandy Morgan Courts",
      format: ["Learn the important principles of squash including proper technique efficient movement and positioning on court"],
      cost: "Free",
      maxRegistrations: 6,
      registrationOpenTime: "",
      registrationCloseTime: "",
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name" },
        { name: "clinic_week", type: "select", label: "Week", required: true, options: [], defaultValue: "" }
      ],
      ui: {
        title: "Sunday Squash Clinic 2-3:30pm",
        subtitle: "Sign up to learn good technique, footwork, and tactics",
        theme: { primary: "blue", secondary: "indigo" }
      },
      notifications: { requireEmailVerification: false, confirmationEmail: false },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: false },
      isRecurring: true,
      recurringDay: 0,
      recurringDayName: "Sunday",
      excludedDates: []
    },
    "squash-survivor": {
      id: "squash-survivor",
      name: "Squash Survivor",
      description: "Weekly elimination squash competition",
      location: "Squash Courts",
      format: [
        "Weekly knockout style competition",
        "Players eliminated each week until one survivor remains",
        "Sign up for individual weeks"
      ],
      cost: "Free",
      maxRegistrations: 10,
      registrationOpenTime: "",
      registrationCloseTime: "",
      fields: [
        { name: "player_name", type: "text", label: "Player Name", required: true, placeholder: "Start typing your name…" },
        { name: "survivor_week", type: "select", label: "Week", required: true, options: [], defaultValue: "" }
      ],
      ui: {
        title: "Squash Survivor",
        subtitle: "Sign up for weekly elimination competition",
        theme: { primary: "orange", secondary: "red" }
      },
      notifications: { requireEmailVerification: false, confirmationEmail: false },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
      isRecurring: true,
      recurringDay: 0,
      recurringDayName: "Sunday",
      excludedDates: []
    }
  };
  properties.setProperty('EVENT_CONFIGS', JSON.stringify(defaultConfigs));
  console.log('Default configs initialized with: club-champs, padel-club-champs-2026, golf-tournament-2025, golf-tournament-2026, fall-pdl-8.0-2025, winter-pdl-9.0-2026, winter-pdl-9.0-2026-2, sunday-squash-clinic, squash-survivor');
  return { success: true, configs: defaultConfigs };
}

// ===== Members Sync (from CurrentMembershipReport) =====
/**
 * Sync mapping (source → destination Members sheet):
 *   "full name"  → "Member Name"
 *   "Member #"   → "member_id"
 * Run manually once to verify, then installMonthlyMembersSyncTrigger().
 */
function updateMembersFromMembershipReport() {
  try {
    var sourceSs = SpreadsheetApp.openById(CONFIG.MEMBERSHIP_SOURCE_SHEET_ID);
    var sourceSheet = sourceSs.getSheetByName(CONFIG.MEMBERSHIP_SOURCE_TAB);
    if (!sourceSheet) {
      throw new Error('Source tab not found: ' + CONFIG.MEMBERSHIP_SOURCE_TAB);
    }

    var lastRow = sourceSheet.getLastRow();
    var lastCol = sourceSheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) {
      throw new Error('CurrentMembershipReport has no data rows');
    }

    var data = sourceSheet.getRange(1, 1, lastRow, lastCol).getValues();
    var headers = data[0].map(function(h) { return String(h || '').toLowerCase().trim(); });

    // Source columns (normalized headers are lowercase)
    var nameCol = findHeaderIndex_(headers, ['full name']);
    var memberIdCol = findHeaderIndex_(headers, ['member #', 'member#']);

    console.log('Membership headers:', headers);
    console.log('Resolved columns — full name:', nameCol, 'Member #:', memberIdCol);

    if (nameCol === -1) {
      throw new Error('Source sheet missing "full name" column. Headers: ' + headers.join(', '));
    }
    if (memberIdCol === -1) {
      throw new Error('Source sheet missing "Member #" column. Headers: ' + headers.join(', '));
    }

    // Include all rows with name + Member # (active, expired, etc.)
    var seenKeys = {};
    var members = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var name = String(row[nameCol] != null ? row[nameCol] : '').trim().replace(/\s+/g, ' ');
      var memberId = String(row[memberIdCol] != null ? row[memberIdCol] : '').trim();
      if (!name || !memberId) continue;
      var key = memberId.toLowerCase();
      if (seenKeys[key]) continue;
      seenKeys[key] = true;
      members.push({ name: name, member_id: memberId });
    }

    members.sort(function(a, b) { return a.name.localeCompare(b.name); });

    var destSs = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var membersSheet = destSs.getSheetByName(CONFIG.MEMBERS_SHEET);
    if (!membersSheet) {
      membersSheet = destSs.insertSheet(CONFIG.MEMBERS_SHEET);
    }

    // Destination headers: Member Name + member_id
    membersSheet.clearContents();
    membersSheet.getRange(1, 1, 1, 2).setValues([['Member Name', 'member_id']]);
    membersSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    membersSheet.setFrozenRows(1);
    if (members.length > 0) {
      var values = members.map(function(m) { return [m.name, m.member_id]; });
      // Sheet.getRange(row, column, numRows, numColumns) — 3rd/4th args are counts
      membersSheet.getRange(2, 1, values.length, 2).setValues(values);
    }

    // Invalidate members cache used by getMembersOptimized
    try { cache.remove('members:v2'); } catch (_) {}
    try { cache.remove('members:v3'); } catch (_) {}

    var result = {
      success: true,
      count: members.length,
      mapping: { 'full name': 'Member Name', 'Member #': 'member_id' },
      columns: ['Member Name', 'member_id'],
      source: CONFIG.MEMBERSHIP_SOURCE_TAB,
      updatedAt: new Date().toISOString()
    };
    console.log('Members sync complete:', result);
    properties.setProperty('LAST_MEMBERS_SYNC', JSON.stringify(result));
    return result;
  } catch (err) {
    console.error('updateMembersFromMembershipReport error:', err);
    throw err;
  }
}

function findHeaderIndex_(headers, candidates) {
  for (var i = 0; i < headers.length; i++) {
    if (candidates.indexOf(headers[i]) !== -1) return i;
  }
  return -1;
}

/**
 * Installs a monthly time-based trigger (1st of each month ~6am script timezone).
 * Run once from the Apps Script editor after authorizing sheet access.
 */
function installMonthlyMembersSyncTrigger() {
  uninstallMonthlyMembersSyncTrigger();
  ScriptApp.newTrigger('updateMembersFromMembershipReport')
    .timeBased()
    .onMonthDay(1)
    .atHour(6)
    .create();
  console.log('Installed monthly trigger for updateMembersFromMembershipReport (day 1, ~6am)');
  return { success: true, functionName: 'updateMembersFromMembershipReport', day: 1, hour: 6 };
}

/** Removes all triggers for updateMembersFromMembershipReport. */
function uninstallMonthlyMembersSyncTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'updateMembersFromMembershipReport') {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }
  console.log('Removed ' + removed + ' members-sync trigger(s)');
  return { success: true, removed: removed };
}

// ===== Setup Functions =====
function setupSpreadsheet() {
  try {
    var ss;
    try {
      ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    } catch (_) {
      throw new Error('Please set CONFIG.SHEET_ID to a valid Google Sheet ID');
    }
    getRegistrationsSheet();
    var membersSheet = ss.getSheetByName(CONFIG.MEMBERS_SHEET);
    if (!membersSheet) {
      membersSheet = ss.insertSheet(CONFIG.MEMBERS_SHEET);
      membersSheet.getRange(1, 1, 1, 2).setValues([['Member Name', 'member_id']]);
      membersSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
      membersSheet.setFrozenRows(1);
      var samples = [['John Doe', '1001'], ['Jane Smith', '1002'], ['Mike Johnson', '1003']];
      membersSheet.getRange(2, 1, samples.length, 2).setValues(samples);
    }
    console.log('Setup complete. Sheet:', ss.getUrl());
    return { success: true, url: ss.getUrl() };
  } catch (e) {
    console.error('setupSpreadsheet error:', e);
    throw e;
  }
}

function testSetup() {
  console.log('Testing optimized endpoints...');
  var testEvent = 'test-event';
  console.log('getMembers:', getMembersOptimized());
  console.log('getRegistrationCount:', getRegistrationCountOptimized({ event_id: testEvent }));
  console.log('getRegistrations:', getRegistrationsOptimized({ event_id: 'golf-tournament-2025' }));
  console.log('checkDuplicate:', checkDuplicateOptimized({ event_id: testEvent, playerName: 'Test Player' }));
  console.log('Performance test completed.');
}

function testConfigEndpoints() {
  console.log('Testing event config management...');
  console.log('Get configs:', getEventConfigs());
  var testConfig = {
    id: "test-event-123",
    name: "Test Event",
    location: "Test Location",
    cost: "$10",
    maxRegistrations: 50,
    fields: [],
    ui: { title: "Test", subtitle: "Testing", theme: { primary: "blue", secondary: "indigo" } },
    notifications: { requireEmailVerification: false, confirmationEmail: false },
    rules: { requireMembership: false, allowDuplicates: false, waitingListEnabled: true }
  };
  console.log('Save config:', saveEventConfig({ config: testConfig }));
  console.log('Get configs after save:', getEventConfigs());
  console.log('Delete config:', deleteEventConfig({ eventId: "test-event-123" }));
  console.log('Config management tests completed.');
}
