import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  List,
  CheckCircle,
  AlertCircle,
  Mail,
  Users,
  Clock,
  Loader2,
  Calendar,
  MapPin,
  DollarSign,
  Utensils,
  UserPlus,
} from "lucide-react";

function renderFormat(format: string | string[]): JSX.Element | null {
  if (!format || (Array.isArray(format) && format.length === 0)) return null;

  return (
    <div className="space-y-2">
      <div className="font-semibold">Format</div>
      {Array.isArray(format) ? (
        <ul className="list-disc pl-6 space-y-1">
          {(format as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{format as string}</p>
      )}
    </div>
  );
}

/* =========================
   Types
========================= */

type FieldType = "text" | "email" | "select" | "radio" | "textarea" | "checkbox";

interface FieldConfig {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

interface EventConfig {
  id: string;
  name: string;
  description: string;
  location: string;
  format: string | string[];
  cost: string;
  maxRegistrations: number;
  registrationOpenTime?: string;
  registrationCloseTime?: string;
  fields: FieldConfig[];
  ui: {
    title: string;
    subtitle: string;
    theme: { primary: string; secondary: string };
  };
  notifications: {
    requireEmailVerification: boolean;
    confirmationEmail: boolean;
  };
  rules: {
    requireMembership?: boolean;
    allowDuplicates?: boolean;
    waitingListEnabled?: boolean;
  };
}

interface Member {
  name: string;
  member_id?: string;
}

interface RegistrationData {
  timestamp: string;
  event_id: string;
  event_name: string;
  player_name: string;
  email: string;
  phone?: string;
  division?: string;
  wall?: string;
  comments?: string;
  extra_json: Record<string, any>;
  registration_number: number;
  is_waiting_list: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
  fallback?: boolean;
  count?: number;
  golferCount?: number;
  totalGolfers?: number;
  registrations?: any[];
  registrationCount?: number;
  confirmedGolfers?: number;
  waitingListGolfers?: number;
  dinnerSelections?: Record<string, number>;
  members?: Member[];
  isDuplicate?: boolean;
  [key: string]: any;
}

/* =========================
   Theme helper
========================= */

type ThemeClasses = {
  bg: string;
  bgHover: string;
  bgLight: string;
  border: string;
  text: string;
  textLight: string;
  ring: string;
  gradient: string;
};

const colorMap: Record<string, ThemeClasses> = {
  blue: {
    bg: "bg-blue-600",
    bgHover: "hover:bg-blue-700",
    bgLight: "bg-blue-50",
    border: "border-blue-500",
    text: "text-blue-600",
    textLight: "text-blue-700",
    ring: "focus:ring-blue-500",
    gradient: "from-blue-600 to-indigo-600",
  },
  green: {
    bg: "bg-green-600",
    bgHover: "hover:bg-green-700",
    bgLight: "bg-green-50",
    border: "border-green-500",
    text: "text-green-600",
    textLight: "text-green-700",
    ring: "focus:ring-green-500",
    gradient: "from-green-600 to-emerald-600",
  },
  purple: {
    bg: "bg-purple-600",
    bgHover: "hover:bg-purple-700",
    bgLight: "bg-purple-50",
    border: "border-purple-500",
    text: "text-purple-600",
    textLight: "text-purple-700",
    ring: "focus:ring-purple-500",
    gradient: "from-purple-600 to-violet-600",
  },
  red: {
    bg: "bg-red-600",
    bgHover: "hover:bg-red-700",
    bgLight: "bg-red-50",
    border: "border-red-500",
    text: "text-red-600",
    textLight: "text-red-700",
    ring: "focus:ring-red-500",
    gradient: "from-red-600 to-pink-600",
  },
  indigo: {
    bg: "bg-indigo-600",
    bgHover: "hover:bg-indigo-700",
    bgLight: "bg-indigo-50",
    border: "border-indigo-500",
    text: "text-indigo-600",
    textLight: "text-indigo-700",
    ring: "focus:ring-indigo-500",
    gradient: "from-indigo-600 to-purple-600",
  },
  orange: {
    bg: "bg-orange-600",
    bgHover: "hover:bg-orange-700",
    bgLight: "bg-orange-50",
    border: "border-orange-500",
    text: "text-orange-600",
    textLight: "text-orange-700",
    ring: "focus:ring-orange-500",
    gradient: "from-orange-600 to-red-600",
  },
};

const getThemeClasses = (primary: string = "blue"): ThemeClasses =>
  colorMap[primary] || colorMap.blue;

/* =========================
   Event configs
========================= */

const EVENT_CONFIGS: Record<string, EventConfig> = {
  "golf-tournament-2025": {
    id: "golf-tournament-2025",
    name: "Golf Tournament 2025",
    description: "",
    location: "Brookfield Golf Course",
    format: ["2 person scramble", "Tee times start a 12 noon", 
      "Steak Dinner at 7pm: We are assuming that you're staying for dinner unless we hear from you", 
      "Each participant must bring a prize worth $30 or more to the prize table", "Prizes for Closest to the Hole", 
      "Longest Drive", "Hole in One", "Straightest Drive"],
    cost: "$125 + hst",
    maxRegistrations: 40,
    registrationOpenTime: "2025-08-25T09:00:00-05:00",
    registrationCloseTime: "", 
    fields: [
        { name: "player_name", type: "text", label: "Golfer 1 Name", required: true, placeholder: "Golfer 1 (you)" },
        { name: "email", type: "email", label: "Golfer 1 Email", required: true, placeholder: "your.email@example.com" },
        { name: "group_size", type: "select", label: "How many golfers in your group?", required: true, options: ["1", "2", "3", "4"] },
        { name: "additional_player_1", type: "text", label: "Golfer 2 Name", required: false, placeholder: "Golfer 2" },
        { name: "additional_player_2", type: "text", label: "Golfer 3 Name", required: false, placeholder: "Golfer 3" },
        { name: "additional_player_3", type: "text", label: "Golfer 4 Name", required: false, placeholder: "Golfer 4" },
        { name: "comments", type: "textarea", label: "Comments (Optional)", required: false, placeholder: "Any additional comments or special requests..." },
      ],
      ui: {
        title: "Golf Tournament 2025",
        subtitle: "Register for tournament and dinner",
        theme: { primary: "green", secondary: "emerald" },
      },
      notifications: { requireEmailVerification: false, confirmationEmail: false },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
    },

    "fall-pdl-8.0-2025": {
      id: "fall-pdl-8.0-2025",
      name: "KWRC Fall PDL 8.0",
      description: "",
      location: "Played on the Best Doubles Court in the World",
      format: ["5 teams of 5 positions", 
        "Teams/Positions will be selected based on your level of play", 
        "Sign up individually and you will be place with a doubles partner and team", 
        "First 50 players signed up get in.  Everyone else goes on the waiting/spare list", 
        "If this web form crashes, text or email Jeff and you will be placed in registration order based on timestamp", 
        "Pos. 5 - Mondays at 7 or 8pm", "Pos. 4 - Tuesdays at 6 or 7pm", 
        "Pos. 3 - Tuesdays at 8 or 9pm", "Pos. 2 - Wednesdays at 6 or 7pm", 
        "Pos. 1 - Wednesdays at 8 or 9pm"],
      cost: "$60 + hst",
      maxRegistrations: 50,
      registrationOpenTime: "2025-09-08T10:00:00-04:00",
      registrationCloseTime: "",
      
      fields: [
        {
          name: "player_name",
          type: "text",
          label: "Player Name",
          required: true,
          placeholder: "Start typing your name",
        },
        {
          name: "email",
          type: "email",
          label: "Email Address",
          required: true,
          placeholder: "your.email@example.com",
        },
        {
          name: "wall",
          type: "radio",
          label: "Wall Preference",
          required: true,
          options: ["Left Wall", "Right Wall", "Either Wall"],
        },
        {
          name: "comments",
          type: "textarea",
          label: "Comments (Optional)",
          required: false,
          placeholder: "Any additional comments or preferences...",
        },
      ],
      ui: {
        title: "KWRC Fall PDL 8.0 Registration",
        subtitle: "10-week Doubles League from Sep. 29th - Dec. 5th, 2025",
        theme: { primary: "blue", secondary: "indigo" },
      },
      notifications: { requireEmailVerification: true, confirmationEmail: true },
      rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true },
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
    rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: false }
  },

  "squash-survivor": {
    id: "squash-survivor",
    name: "Squash Survivor",
    description: "Weekly elimination squash competition",
    location: "Squash Courts",
    format: ["Weekly knockout style competition", "Players eliminated each week until one survivor remains", "Sign up for individual weeks"],
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
    rules: { requireMembership: true, allowDuplicates: false, waitingListEnabled: true }
  },

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
    rules: { requireMembership: true, allowDuplicates: true, waitingListEnabled: false }
  }
};

/* =========================
   Utilities
========================= */

const isDate = (value: unknown): value is Date =>
  Object.prototype.toString.call(value) === "[object Date]" && !Number.isNaN((value as Date).getTime());

// Format timestamp in condensed format: "Feb. 17 11:28am"
const formatCondensedTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const monthNames = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${month} ${day} ${displayHours}:${displayMinutes}${ampm}`;
};

// Configuration for clinic schedule management
const CLINIC_SCHEDULE_CONFIG = {
  excludedDates: [
    '2025-12-25', // Christmas Day
    '2025-01-01', // New Year's Day  
    '2025-11-28', // Thanksgiving 2025
    '2025-12-31', // New Year's Eve
  ],
  
  coachUnavailable: [
    '2025-02-14', // Coach vacation
    '2025-03-21', // Coach at tournament
  ],
  
  facilityClosed: [
    '2025-06-15', // Facility maintenance
  ]
};

// Generate weekly options for Sunday events
const generateWeeklyOptions = (weeksAhead: number = 4): string[] => {
  const options: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const allExcludedDates = [
    CLINIC_SCHEDULE_CONFIG.excludedDates,
    CLINIC_SCHEDULE_CONFIG.coachUnavailable,
    CLINIC_SCHEDULE_CONFIG.facilityClosed
  ].flat();
  
  let nextSunday = new Date(today);
  const dayOfWeek = today.getDay();
  
  if (dayOfWeek === 0) {
    const todayForComparison = today.toISOString().split('T')[0];
    const isTodayExcluded = allExcludedDates.includes(todayForComparison);
    
    if (!isTodayExcluded) {
      nextSunday = new Date(today);
    } else {
      nextSunday.setDate(today.getDate() + 7);
    }
  } else {
    const daysUntilSunday = 7 - dayOfWeek;
    nextSunday.setDate(today.getDate() + daysUntilSunday);
  }
  
  let weeksGenerated = 0;
  let currentWeek = 0;
  
  while (weeksGenerated < weeksAhead && currentWeek < 20) {
    const clinicDate = new Date(nextSunday);
    clinicDate.setDate(nextSunday.getDate() + (currentWeek * 7));
    
    if (clinicDate < today) {
      currentWeek++;
      continue;
    }
    
    const dateForComparison = clinicDate.toISOString().split('T')[0];
    
    if (allExcludedDates.includes(dateForComparison)) {
      currentWeek++;
      continue;
    }
    
    const dateString = clinicDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    options.push(`Sunday, ${dateString}`);
    weeksGenerated++;
    currentWeek++;
  }
  
  return options;
};

const jsonpCall = (url: string, params: Record<string, any> = {}): Promise<any> =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const callbackName = "jsonp_cb_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    let settled = false;

    const entries = Object.entries({ ...params, callback: callbackName }).map(
      ([k, v]): [string, string] => {
        if (v == null) return [k, ""];
        if (isDate(v)) return [k, v.toISOString()];
        if (typeof v === "object") return [k, JSON.stringify(v)];
        return [k, String(v)];
      }
    );
    const qs = new URLSearchParams(entries).toString();

    (window as any)[callbackName] = (data: any) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(data);
    };

    function cleanup() {
      try {
        delete (window as any)[callbackName];
      } catch {}
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      (window as any)[callbackName] = () => {};
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error("JSONP timeout"));
    }, 30000);

    script.src = `${url}${url.includes("?") ? "&" : "?"}${qs}`;
    script.async = true;
    script.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();
      reject(new Error("JSONP network error"));
    };

    document.head.appendChild(script);
  });

const safeParseJSON = (val: unknown): any => {
  if (val == null) return null;
  if (typeof val === "object") return val as any;
  if (typeof val === "string") {
    try {
      const first = JSON.parse(val);
      if (typeof first === "string") {
        try { return JSON.parse(first); } catch { return first; }
      }
      return first;
    } catch {
      return null;
    }
  }
  return null;
};

const getExtra = (r: any): any => {
  if (r?.extra_json != null) {
    const v = r.extra_json;
    if (typeof v === "object") return v;
    if (typeof v === "string") {
      const s = v.trim();
      if (s.startsWith("{") || s.startsWith("[")) {
        const parsed = safeParseJSON(s);
        if (parsed && typeof parsed === "object") return parsed;
      }
    }
  }

  for (const k of ["extraJson", "extra", "extras", "metadata", "data"]) {
    const v = r?.[k];
    if (v == null) continue;
    if (typeof v === "object") return v;
    if (typeof v === "string") {
      const s = v.trim();
      if (s.startsWith("{") || s.startsWith("[")) {
        const parsed = safeParseJSON(s);
        if (parsed && typeof parsed === "object") return parsed;
      }
      return s;
    }
  }

  return null;
};

type TeamInfo = {
  names: string[];
  dinners?: boolean[];
  teamSize: number;
  isGolf: boolean;
  dinnerCount?: number;
};

const extractTeamInfo = (r: any): TeamInfo => {
  const extra = getExtra(r) ?? {};

  // Golf tournament specific extraction
  if (r?.event_id === "golf-tournament-2025") {
    console.log("Processing golf registration:", {
      player_name: r?.player_name,
      extra_json: extra,
      raw_extra: r?.extra_json
    });

    if (Array.isArray(extra.golfers) && extra.golfers.length > 0) {
      const names = extra.golfers
        .map((g: any) => (typeof g === "string" ? g : g?.name || "").trim())
        .filter(Boolean);
      const dinners = extra.golfers.map((g: any) => {
        const d = typeof g === "object" ? g?.dinner : false;
        return d === true || d === "true" || d === 1;
      });

      console.log("Using structured golfers array:", { names, dinners });
      
      return {
        names: names.length ? names : (r?.player_name ? [r.player_name.trim()] : []),
        dinners,
        teamSize: names.length || 1,
        isGolf: true,
        dinnerCount: dinners.filter(Boolean).length,
      };
    }

    // Fallback: Extract from flat additional_player_* fields
    const names: string[] = [];
    const dinners: boolean[] = [];

    if (r?.player_name && r.player_name.trim()) {
      names.push(r.player_name.trim());
      dinners.push(Boolean(extra?.dinner_golfer_1 || r?.dinner_golfer_1));
    }

    const additionalPlayers = [
      extra?.additional_player_1 || r?.additional_player_1,
      extra?.additional_player_2 || r?.additional_player_2,
      extra?.additional_player_3 || r?.additional_player_3,
    ];
    
    const additionalDinners = [
      Boolean(extra?.dinner_golfer_2 || r?.dinner_golfer_2),
      Boolean(extra?.dinner_golfer_3 || r?.dinner_golfer_3),
      Boolean(extra?.dinner_golfer_4 || r?.dinner_golfer_4),
    ];

    additionalPlayers.forEach((player, index) => {
      if (player && typeof player === 'string' && player.trim()) {
        names.push(player.trim());
        dinners.push(additionalDinners[index]);
      }
    });

    console.log("Golf extraction result:", {
      names,
      dinners, 
      teamSize: names.length,
      dinnerCount: dinners.filter(Boolean).length
    });

    return {
      names: names.length > 0 ? names : ["Registrant"],
      dinners,
      teamSize: names.length || 1,
      isGolf: true,
      dinnerCount: dinners.filter(Boolean).length,
    };
  }
  
  // Non-golf events
  const names = [];
  
  if (r?.player_name) {
    names.push(r.player_name.trim());
  }
  
  const additionalPlayers = [
    extra?.additional_player_1 || r?.additional_player_1,
    extra?.additional_player_2 || r?.additional_player_2,
    extra?.additional_player_3 || r?.additional_player_3,
    extra?.player2 || r?.player2,
    extra?.partner || r?.partner,
    extra?.partner_name || r?.partner_name,
    extra?.teammate || r?.teammate,
    extra?.teammate_name || r?.teammate_name,
  ];
  
  additionalPlayers.forEach(player => {
    if (player && typeof player === 'string' && player.trim()) {
      names.push(player.trim());
    }
  });
  
  if (Array.isArray(extra?.players)) {
    extra.players.forEach((p: any) => {
      const name = typeof p === 'string' ? p : p?.name;
      if (name && typeof name === 'string' && name.trim()) {
        names.push(name.trim());
      }
    });
  }
  
  const uniqueNames = Array.from(new Set(names));
  
  return {
    names: uniqueNames.length ? uniqueNames : ["Registrant"],
    teamSize: uniqueNames.length || 1,
    isGolf: false,
    dinnerCount: 0
  };
};

const getFallbackData = (action: string, params: Record<string, any> = {}): ApiResponse => {
  switch (action) {
    case "getMembers":
      return { success: true, members: [], fallback: true };
    case "getRegistrationCount":
      return { success: true, count: 0, golferCount: 0, totalGolfers: 0, fallback: true };
    case "getRegistrationStats":
      return { 
        success: true, 
        registrationCount: 0,
        totalGolfers: 0,
        confirmedGolfers: 0,
        waitingListGolfers: 0,
        dinnerSelections: {},
        fallback: true 
      };
    case "getRegistrations":
      return { success: true, registrations: [] as any[], fallback: true };
    case "checkDuplicate":
      return { success: true, isDuplicate: false, fallback: true };
    case "register":
      return { success: true, message: `Registration successful for ${params.player_name || "group"}`, fallback: true };
    case "sendVerification":
      return { success: true, message: "Verification email sent", fallback: true };
    default:
      return { success: false, error: "Unknown action", fallback: true };
  }
};

/* =========================
   Main component
========================= */

const MultiEventRegistration: React.FC = () => {
  // Get event ID from URL path
  const getEventIdFromPath = (): string => {
    const path = window.location.pathname;
    if (path.includes('/golf-tournament')) return 'golf-tournament-2025';
    if (path.includes('/fall-pdl')) return 'fall-pdl-8.0-2025';
    if (path.includes('/club-champs')) return 'club-champs';
    return 'golf-tournament-2025'; // default
  };

  const [currentEventId, setCurrentEventId] = useState<string>(getEventIdFromPath());
  
  // Get event config and dynamically populate weekly recurring events
  const getEventConfig = (eventId: string): EventConfig => {
  const config = EVENT_CONFIGS[eventId];
  
  // Handle weekly recurring events
  if ((eventId === "sunday-squash-clinic" || eventId === "squash-survivor") && config) {
    const updatedConfig = { ...config };
    const weekField = updatedConfig.fields.find(field => 
      field.name === "clinic_week" || field.name === "survivor_week"
    );
    
    if (weekField) {
      const weekOptions = generateWeeklyOptions(4);
      weekField.options = weekOptions;
      
      // Set default value to first week if available
      if (weekOptions.length > 0 && !weekField.defaultValue) {
        weekField.defaultValue = weekOptions[0];
      }
    }
    return updatedConfig;
  }
  return config;
};

  const eventConfig = getEventConfig(currentEventId);

  // Update URL when event changes
  const changeEvent = (eventId: string) => {
  console.log('=== CHANGING EVENT ===');
  console.log('From:', currentEventId, 'To:', eventId);
  
  setCurrentEventId(eventId);
  const eventPaths: Record<string, string> = {
    'golf-tournament-2025': '/golf-tournament',
    'fall-pdl-8.0-2025': '/fall-pdl',
    'club-champs': '/club-champs',
  };
  const newPath = eventPaths[eventId] || '/';
  window.history.pushState({}, '', newPath);
  reset();
  setIsVerified(!(EVENT_CONFIGS[eventId].notifications.requireEmailVerification));
  setCodeSent(false);
  setSubmitError("");
  
  // Reset ALL timing states immediately when changing events
  console.log('Resetting all timing states...');
  setIsInitializing(true);
  setIsRegistrationOpen(false);
  setRegistrationOpenDate(null);
  setTimeUntilOpen("");
  
  console.log('=== EVENT CHANGE COMPLETE ===');
  };

  const themeClasses = useMemo(
    () => getThemeClasses(eventConfig?.ui?.theme?.primary ?? "green"),
    [eventConfig?.ui?.theme?.primary]
  );

  const GAS_URL = process.env.REACT_APP_GAS_URL || "https://script.google.com/macros/s/AKfycbwOS6MfU9iWj-Nb1MnbwiK-L4v3th8-Sw9Njg7S2XVgGzNX9Gq6I7CHWQGYZ60TjCu6/exec";

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

  // Enhanced state for golfer counting
  const [registrationCount, setRegistrationCount] = useState(0);
  const [totalGolfers, setTotalGolfers] = useState(0);
  const [totalDinners, setTotalDinners] = useState(0);
  const [registrationStats, setRegistrationStats] = useState<any>(null);
  const [registeredMembers, setRegisteredMembers] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Recurring event state (for clinic weeks)
  const [selectedClinicWeek, setSelectedClinicWeek] = useState<string>("");
  const [weeklyStats, setWeeklyStats] = useState<Record<string, { count: number; participants: number }>>({});

  // Registration timing state
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [registrationOpenDate, setRegistrationOpenDate] = useState<Date | null>(null);
  const [timeUntilOpen, setTimeUntilOpen] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Other state
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPartners, setFilteredPartners] = useState<Member[]>([]);
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);
  const [existingPartnerRegistration, setExistingPartnerRegistration] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Email verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verificationExpiry, setVerificationExpiry] = useState<Date | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const watchedPlayerName: string = watch("player_name", "");
  const watchedClinicWeek: string = watch("clinic_week", "");
  const watchedSurvivorWeek: string = watch("survivor_week", "");
  const watchedEventTypesSingles: boolean = watch("event_types", false);
  const watchedEventTypesDoubles: boolean = watch("event_types_doubles", false);
  const watchedDoublesPartner: string = watch("doubles_partner", "");
  
  // Get the current selected week for recurring events
  const getCurrentSelectedWeek = () => {
    if (currentEventId === "sunday-squash-clinic") {
      return watchedClinicWeek;
    } else if (currentEventId === "squash-survivor") {
      return watchedSurvivorWeek;
    }
    return "";
  };

  const currentSelectedWeek = getCurrentSelectedWeek();

  // Registration timing utility functions
  const checkRegistrationTiming = React.useCallback(() => {
  console.log('=== TIMING CHECK START ===');
  console.log('Current Event ID:', currentEventId);
  console.log('Event Config:', eventConfig);
  
  if (!eventConfig) {
    console.log('No event config, setting initializing to true');
    setIsInitializing(true);
    return;
  }
  
  console.log('Registration Open Time:', eventConfig.registrationOpenTime);
  console.log('Registration Close Time:', eventConfig.registrationCloseTime);
  
  const now = new Date();
  const openTime = eventConfig.registrationOpenTime ? new Date(eventConfig.registrationOpenTime) : null;
  const closeTime = eventConfig.registrationCloseTime ? new Date(eventConfig.registrationCloseTime) : null;
  
  console.log('Current time:', now.toISOString());
  console.log('Open time:', openTime?.toISOString());
  console.log('Close time:', closeTime?.toISOString());
  
  const isOpen = !openTime || now >= openTime;
  const isClosed = closeTime && now > closeTime;
  
  console.log('Is open (no time restriction or past open time):', isOpen);
  console.log('Is closed (past close time):', isClosed);
  console.log('Final registration open status:', isOpen && !isClosed);
  
  setIsRegistrationOpen(isOpen && !isClosed);
  
  setRegistrationOpenDate(!isOpen && openTime ? openTime : null);
  
  if (!isOpen && openTime) {
    const timeDiff = openTime.getTime() - now.getTime();
    
    if (timeDiff > 0) {
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeUntilOpen(`${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`);
      } else if (hours > 0) {
        setTimeUntilOpen(`${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`);
      } else if (minutes > 0) {
        setTimeUntilOpen(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      } else {
        setTimeUntilOpen('Less than a minute');
      }
    } else {
      setTimeUntilOpen('');
    }
  } else {
    setTimeUntilOpen('');
  }
  
  console.log('=== TIMING CHECK END ===');
  
  setIsInitializing(false);
}, [eventConfig]);

useEffect(() => {
  if (!isInitializing) {
    checkRegistrationTiming();
  }
}, [checkRegistrationTiming, isInitializing]);

useEffect(() => {
  checkRegistrationTiming();
}, [checkRegistrationTiming]);

useEffect(() => {
  if ((currentEventId === "sunday-squash-clinic" || currentEventId === "squash-survivor") && eventConfig) {
    const weekField = eventConfig.fields.find(field => 
      field.name === "clinic_week" || field.name === "survivor_week"
    );
    
    if (weekField && weekField.options && weekField.options.length > 0) {
      const fieldName = weekField.name;
      const currentValue = watch(fieldName);
      
      // Only set default if no value exists
      if (!currentValue) {
        const firstWeek = weekField.options[0];
        setValue(fieldName, firstWeek);
        setSelectedClinicWeek(firstWeek);
      }
    }
  }
}, [currentEventId]);

useEffect(() => {
  const interval = setInterval(checkRegistrationTiming, 60000);
  return () => clearInterval(interval);
}, [checkRegistrationTiming]);

  // ---- Email verification persistence helpers ----
  const normalizedEmail = (watch("email") || "").trim().toLowerCase();
  const CODE_KEY = React.useMemo(
    () => `verify:${currentEventId}:${normalizedEmail}`,
    [currentEventId, normalizedEmail]
  );

  function saveCodeToStorage(code: string, expiry: Date) {
    try {
      sessionStorage.setItem(CODE_KEY, JSON.stringify({ code, exp: expiry.toISOString() }));
    } catch (e) {
      console.warn("Could not save to sessionStorage:", e);
    }
  }
  
  function readCodeFromStorage(): { code: string; exp: Date } | null {
    try {
      const raw = sessionStorage.getItem(CODE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj?.code || !obj?.exp) return null;
      return { code: String(obj.code), exp: new Date(obj.exp) };
    } catch (e) {
      console.warn("Could not read from sessionStorage:", e);
      return null;
    }
  }
  
  function clearStoredCode() {
    try { 
      sessionStorage.removeItem(CODE_KEY); 
    } catch (e) {
      console.warn("Could not clear sessionStorage:", e);
    }
  }

  // Update selected week when form changes for recurring events
  useEffect(() => {
    if (currentEventId === "sunday-squash-clinic" && watchedClinicWeek) {
      setSelectedClinicWeek(watchedClinicWeek);
    } else if (currentEventId === "squash-survivor" && watchedSurvivorWeek) {
      setSelectedClinicWeek(watchedSurvivorWeek);
    }
  }, [watchedClinicWeek, watchedSurvivorWeek, currentEventId]);

  useEffect(() => {
    if (eventConfig?.notifications?.requireEmailVerification) {
      setIsVerified(false);
      setVerificationToken(null);
      setCodeSent(false);
      setUserEnteredCode("");
      setVerificationExpiry(null);
      setSubmitError("");
    } else {
      setIsVerified(true);
    }
  }, [watch("email"), currentEventId, eventConfig?.notifications?.requireEmailVerification]);

  useEffect(() => {
  const saved = readCodeFromStorage();
  if (saved) {
    if (new Date() < saved.exp) {
      setVerificationCode(saved.code);
      setVerificationExpiry(saved.exp);
      setCodeSent(true);
    } else {
      clearStoredCode();
      setVerificationCode("");
      setVerificationExpiry(null);
      setCodeSent(false);
    }
  } else {
    setVerificationCode("");
    setVerificationExpiry(null);
    setCodeSent(false);
  }
}, [CODE_KEY]);

  const apiCall = async (action: string, params: Record<string, any> = {}): Promise<ApiResponse> => {
    try {
      if (!GAS_URL || GAS_URL.includes("YOUR_GOOGLE_APPS_SCRIPT_URL")) {
        return getFallbackData(action, params);
      }
      const data = await jsonpCall(GAS_URL, { action, event_id: currentEventId, ...params });
      return data;
    } catch (err) {
      console.error("API call failed:", err);
      return getFallbackData(action, params);
    }
  };

const loadRegistrationData = async () => {
  if (!eventConfig) return;

  setIsLoadingStats(true);
  try {
    // Clear previous data immediately when loading new event data
    setRegisteredMembers([]);
    setTotalGolfers(0);
    setTotalDinners(0);
    setRegistrationStats(null);
    
    // For recurring events like Sunday Clinic and Squash Survivor, we need week-specific data
    const isRecurringEvent = currentEventId === "sunday-squash-clinic" || currentEventId === "squash-survivor";
    
    const [countResult, statsResult, registrationsResult] = await Promise.all([
      apiCall("getRegistrationCount", { 
        event_id: currentEventId,
        ...(isRecurringEvent && { recurring: true })
      }),
      apiCall("getRegistrationStats", { 
        event_id: currentEventId,
        ...(isRecurringEvent && { recurring: true })
      }),
      apiCall("getRegistrations", { 
        event_id: currentEventId,
        ...(isRecurringEvent && { recurring: true })
      }),
    ]);

let computedGolferTotal = 0;
let computedDinnerTotal = 0;

const regs: any[] = (registrationsResult?.registrations ?? []) as any[];
const filteredRegs = regs.filter(reg => reg.event_id === currentEventId);

if (Array.isArray(filteredRegs)) {
  setRegisteredMembers(filteredRegs);

  computedGolferTotal = filteredRegs.reduce((total, reg) => {
    const team = extractTeamInfo(reg);
    return total + (team.teamSize || 1);
  }, 0);

  computedDinnerTotal = filteredRegs.reduce((sum, reg) => {
    const team = extractTeamInfo(reg);
    return sum + (team.dinnerCount || 0);
  }, 0);
} else {
  setRegisteredMembers([]);
}

setTotalGolfers(computedGolferTotal);
setTotalDinners(computedDinnerTotal);

if (statsResult && statsResult.success) {
  setRegistrationStats(statsResult);
} else {
  setRegistrationStats(null);
}

if (countResult && countResult.success) {
  setRegistrationCount(countResult.count ?? 0);
}

  } catch (error) {
    console.error("Error loading registration data:", error);
    setRegisteredMembers([]);
    setTotalGolfers(0);
    setTotalDinners(0);
    setRegistrationStats(null);
  } finally {
    setIsLoadingStats(false);
  }
};

  const loadMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const res = await apiCall("getMembers");
      if (res.success && Array.isArray(res.members)) {
        setMembers(res.members);
        setUsingFallbackData(!!res.fallback);
      } else {
        setMembers([]);
        setUsingFallbackData(true);
      }
    } catch {
      setMembers([]);
      setUsingFallbackData(true);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Get event-specific terminology
  const getEventTerminology = (eventId: string) => {
    if (eventId === "golf-tournament-2025") {
      return {
        participant: "golfer",
        participants: "golfers",
        Participant: "Golfer",
        Participants: "Golfers",
        group: "golf group"
      };
    } else {
      return {
        participant: "player",
        participants: "players", 
        Participant: "Player",
        Participants: "Players",
        group: "team"
      };
    }
  };

  const terminology = getEventTerminology(currentEventId);

  // Helper function to calculate week-specific stats for recurring events
  const getWeekSpecificStats = (selectedWeek: string, allRegistrations: any[]): { weekParticipants: number; weekSpotsRemaining: number } => {
    if ((currentEventId !== "sunday-squash-clinic" && currentEventId !== "squash-survivor") || !selectedWeek) {
      return { weekParticipants: totalGolfers, weekSpotsRemaining: spotsRemaining };
    }
    
    // Filter registrations for the selected week
    const weekRegistrations = allRegistrations.filter(reg => {
      const regWeek = reg.clinic_week || reg.survivor_week || reg.extra_json?.clinic_week || reg.extra_json?.survivor_week;
      return regWeek === selectedWeek;
    });
    
    const weekParticipants = weekRegistrations.reduce((total, reg) => {
      const team = extractTeamInfo(reg);
      return total + (team.teamSize || 1);
    }, 0);
    
    const weekSpotsRemaining = Math.max(0, (eventConfig.maxRegistrations || 0) - weekParticipants);
    
    return { weekParticipants, weekSpotsRemaining };
  };

  // Enhanced spots calculation for different event types
  const calculateSpotsRemaining = (): number => {
    if ((currentEventId === "sunday-squash-clinic" || currentEventId === "squash-survivor") && selectedClinicWeek) {
      const { weekSpotsRemaining }: { weekSpotsRemaining: number } = getWeekSpecificStats(selectedClinicWeek, registeredMembers);
      return weekSpotsRemaining;
    }
    
    if (currentEventId === "golf-tournament-2025") {
      return Math.max(0, (eventConfig.maxRegistrations || 0) - totalGolfers);
    } else {
      return Math.max(0, (eventConfig.maxRegistrations || 0) - totalGolfers);
    }
  };

  const spotsRemaining: number = calculateSpotsRemaining();
  const isWaitingList = Boolean(eventConfig?.rules?.waitingListEnabled && spotsRemaining <= 0);

  // Get current week participants for display
  const getCurrentWeekParticipants = (): number => {
    if ((currentEventId === "sunday-squash-clinic" || currentEventId === "squash-survivor") && selectedClinicWeek) {
      const { weekParticipants }: { weekParticipants: number } = getWeekSpecificStats(selectedClinicWeek, registeredMembers);
      return weekParticipants;
    }
    return totalGolfers;
  };

  const dinnersDisplay = React.useMemo(() => {
    const fromServer = registrationStats?.dinnerSelections
      ? Object.values(registrationStats.dinnerSelections as Record<string, number>)
          .reduce((a: number, b: number) => a + b, 0)
      : 0;

    return Math.max(fromServer || 0, totalDinners || 0);
  }, [registrationStats?.dinnerSelections, totalDinners]);

type Foursome = {
  names: string[];
  dinners: boolean[];
  reg: any;
  teamSize: number;
};

const golfFoursomes: Foursome[] = useMemo(() => {
  if (currentEventId !== "golf-tournament-2025") return [];

  return registeredMembers.map((reg: any) => {
    const team = extractTeamInfo(reg);
    const names = Array.isArray(team.names) ? [...team.names] : [];
    const dinners = Array.isArray(team.dinners) ? [...team.dinners] : [];

    while (names.length < 4) names.push("");
    while (dinners.length < 4) dinners.push(false);

    return {
      names,
      dinners,
      reg,
      teamSize: team.teamSize ?? names.filter(Boolean).length,
    };
  });
}, [currentEventId, registeredMembers]);

  useEffect(() => {
    if (eventConfig?.rules?.requireMembership) {
      loadMembers();
    } else {
      setMembers([]);
    }
    loadRegistrationData();
  }, [currentEventId, eventConfig?.rules?.requireMembership]);

  useEffect(() => {
    if (eventConfig?.rules?.requireMembership && watchedPlayerName) {
      const filtered = members.filter((m) =>
        m.name.toLowerCase().includes(watchedPlayerName.toLowerCase())
      );
      setFilteredMembers(filtered);
      setShowSuggestions(filtered.length > 0 && watchedPlayerName !== filtered[0]?.name);
    } else {
      setFilteredMembers([]);
      setShowSuggestions(false);
    }
  }, [watchedPlayerName, members, eventConfig?.rules?.requireMembership]);

  // Filter partner suggestions for Club Championships
  useEffect(() => {
    if (currentEventId === "club-champs" && watchedDoublesPartner) {
      const filtered = members.filter((m) =>
        m.name.toLowerCase().includes(watchedDoublesPartner.toLowerCase())
      );
      setFilteredPartners(filtered);
      setShowPartnerSuggestions(filtered.length > 0 && watchedDoublesPartner !== filtered[0]?.name);
    } else {
      setFilteredPartners([]);
      setShowPartnerSuggestions(false);
    }
  }, [watchedDoublesPartner, members, currentEventId]);

  // Check if current player is already registered as a partner in someone else's doubles registration
  useEffect(() => {
    if (currentEventId === "club-champs" && watchedPlayerName && watchedPlayerName.trim() !== "") {
      const partnerReg = registeredMembers.find(reg => {
        const extra = reg.extra_json || {};
        const partner = extra.doubles_partner;
        const eventTypes = extra.event_types || {};
        
        return eventTypes.doubles && 
               partner && 
               partner.toLowerCase().trim() === watchedPlayerName.toLowerCase().trim();
      });
      
      setExistingPartnerRegistration(partnerReg);
    } else {
      setExistingPartnerRegistration(null);
    }
  }, [watchedPlayerName, registeredMembers, currentEventId]);

  const sendVerificationEmail = async (email: string, playerName: string) => {
    setIsSendingEmail(true);
    try {
      const res = await apiCall("send_code", { 
        email: email.trim().toLowerCase(), 
        playerName,
        idempotency_key: `${currentEventId}:${email}:${Date.now()}`
      });
      
      if (!res?.success) {
        setSubmitError(res?.error || "Failed to send verification email");
        return;
      }

      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      setVerificationExpiry(expiry);
      setCodeSent(true);
      setSubmitError("");
      
      saveCodeToStorage("pending", expiry);
      
      alert("Verification email sent. Please check your email for the 6-digit code.");
    } catch (error) {
      console.error("Send verification error:", error);
      setSubmitError("Failed to send verification email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

    const verifyCode = async () => {
    if (!verificationExpiry || new Date() > verificationExpiry) {
      setSubmitError("Verification code has expired. Please request a new one.");
      return;
    }

    const email = watch("email")?.trim().toLowerCase();
    if (!email) {
      setSubmitError("Please enter your email first.");
      return;
    }

    if (userEnteredCode.length !== 6) {
      setSubmitError("Please enter a 6-digit code.");
      return;
    }

    try {
      const res = await apiCall("verify_code", {
        email,
        code: userEnteredCode.trim(),
      });

      if (res?.success && res?.verification_token) {
        setIsVerified(true);
        setVerificationToken(res.verification_token);
        setSubmitError("");

        setUserEnteredCode("");
        setVerificationCode("");
        setVerificationExpiry(null);
        setCodeSent(false);
        clearStoredCode();
        
        alert("Email verified successfully!");
      } else {
        setSubmitError(res?.error || "Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setSubmitError("Verification failed. Please try again.");
    }
  };

  const selectMember = (name: string) => {
    setValue("player_name", name);
    setShowSuggestions(false);
  };

  const selectPartner = (name: string) => {
    setValue("doubles_partner", name);
    setShowPartnerSuggestions(false);
  };

  // Enhanced registration display
  const renderRegistrationRow = (member: any, index: number) => {
    const teamInfo = extractTeamInfo(member);

    if (teamInfo.teamSize > 1) {
      return (
        <div key={index} className="p-3 bg-gray-50 rounded border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                {teamInfo.isGolf ? 
                  `Golf Group (${teamInfo.teamSize} ${terminology.participants})` :
                  `Team (${teamInfo.teamSize} ${terminology.participants})`
                }
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {teamInfo.isGolf && (teamInfo.dinnerCount || 0) > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Utensils className="w-3 h-3" />
                  <span>{teamInfo.dinnerCount} dinner{teamInfo.dinnerCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            {teamInfo.names.map((name: string, nameIndex: number) => (
              <div key={nameIndex} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">
                  {nameIndex === 0 ? '🌟 ' : (teamInfo.isGolf ? '⛳ ' : '🎾 ')}{name}
                </span>
                {teamInfo.dinners && teamInfo.dinners[nameIndex] && (
                  <Utensils className="w-3 h-3 text-green-600" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {formatCondensedTimestamp(member.timestamp)}
          </div>
        </div>
      );
    }

    // Single participant display - with clinic week for Sunday Squash Clinic and survivor week for Squash Survivor
    const clinicWeek = member.clinic_week || member.extra_json?.clinic_week;
    const survivorWeek = member.survivor_week || member.extra_json?.survivor_week;
    const weekDisplay = clinicWeek || survivorWeek;
    
    return (
      <div key={index} className="p-3 bg-gray-50 rounded border">
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0 truncate text-sm text-gray-800">
            {teamInfo.names[0] || "Registrant"}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
            {formatCondensedTimestamp(member.timestamp)}
          </div>
        </div>
        {weekDisplay && (member.event_id === "sunday-squash-clinic" || member.event_id === "squash-survivor") && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${
            member.event_id === "sunday-squash-clinic" ? "text-blue-600" : "text-orange-600"
          }`}>
            <Calendar className="w-3 h-3" />
            <span>{weekDisplay}</span>
          </div>
        )}
        <div className="text-xs text-gray-400 mt-1">
          {new Date(member.timestamp).toLocaleDateString()}
        </div>
      </div>
    );
  };

  // Enhanced submission logic
  const onSubmit = async (data: any) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      if (eventConfig?.rules?.requireMembership) {
        const isValidMember = members.some(
          (m) => m.name.toLowerCase() === String(data.player_name || "").toLowerCase().trim()
        );
        if (!isValidMember) {
          setSubmitError("Player must be a valid member to register");
          setIsSubmitting(false);
          return;
        }
      }

      if (eventConfig?.notifications?.requireEmailVerification && !isVerified) {
        setSubmitError("Please verify your email address");
        setIsSubmitting(false);
        return;
      }

      if (!eventConfig?.rules?.allowDuplicates) {
        // For recurring events like Sunday Clinic and Squash Survivor, check duplicates per week
        if (currentEventId === "sunday-squash-clinic" || currentEventId === "squash-survivor") {
          const selectedWeek = data.clinic_week || data.survivor_week;
          if (selectedWeek) {
            const weekRegistrations = registeredMembers.filter(reg => {
              const regWeek = reg.clinic_week || reg.survivor_week || reg.extra_json?.clinic_week || reg.extra_json?.survivor_week;
              return regWeek === selectedWeek;
            });
            
            const isDuplicateForWeek = weekRegistrations.some(reg => 
              reg.player_name?.toLowerCase().trim() === data.player_name?.toLowerCase().trim()
            );
            
            if (isDuplicateForWeek) {
              setSubmitError(`This player is already registered for ${selectedWeek}`);
              setIsSubmitting(false);
              return;
            }
          }
        } else {
          // For non-recurring events, check duplicates across entire event
          const dup = await apiCall("checkDuplicate", { playerName: data.player_name });
          if (dup.success && dup.isDuplicate) {
            setSubmitError("This player is already registered");
            setIsSubmitting(false);
            return;
          }
        }
      }

      if (currentEventId === "golf-tournament-2025") {
        const groupSize = parseInt(data.group_size) || 1;
        
        const golfers: { name: string; email?: string; dinner: boolean }[] = [
          { name: data.player_name, email: data.email, dinner: !!data.dinner_golfer_1 }
        ];
        
        if (groupSize >= 2 && data.additional_player_1) {
          golfers.push({ name: data.additional_player_1, email: undefined, dinner: !!data.dinner_golfer_2 });
        }
        if (groupSize >= 3 && data.additional_player_2) {
          golfers.push({ name: data.additional_player_2, email: undefined, dinner: !!data.dinner_golfer_3 });
        }
        if (groupSize >= 4 && data.additional_player_3) {
          golfers.push({ name: data.additional_player_3, email: undefined, dinner: !!data.dinner_golfer_4 });
        }

        const registrationData = {
          timestamp: new Date().toISOString(),
          event_id: currentEventId,
          event_name: eventConfig.name,
          player_name: data.player_name,
          email: data.email,
          comments: data.comments,
          extra_json: {
            group_size: groupSize,
            golfers,
            dinner_count: golfers.filter(g => g.dinner).length,
            additional_player_1: data.additional_player_1 || null,
            additional_player_2: data.additional_player_2 || null,
            additional_player_3: data.additional_player_3 || null,
            dinner_golfer_1: !!data.dinner_golfer_1,
            dinner_golfer_2: !!data.dinner_golfer_2,
            dinner_golfer_3: !!data.dinner_golfer_3,
            dinner_golfer_4: !!data.dinner_golfer_4,
          },
          registration_number: registrationCount + 1,
          is_waiting_list: isWaitingList,
          verification_token: verificationToken || undefined,
           skip_verification: !eventConfig?.notifications?.requireEmailVerification,
        };

        const result = await apiCall("submit_registration", registrationData);

        if (result.success) {
          const groupSize = golfers.length;
          const dinnerCount = golfers.filter(g => g.dinner).length;
          
          let message = `Successfully registered ${groupSize} golfer${groupSize > 1 ? 's' : ''}`;
          if (dinnerCount > 0) {
            message += ` with ${dinnerCount} dinner${dinnerCount > 1 ? 's' : ''}`;
          }
          if (isWaitingList) {
            message += ' (added to waiting list)';
          }
          
          setSuccessMessage(message);
          setSubmitSuccess(true);
          loadRegistrationData();
          reset();
          setIsVerified(!(eventConfig?.notifications?.requireEmailVerification));
          
          setTimeout(() => {
            setSubmitSuccess(false);
            setSuccessMessage("");
          }, 5000);
        } else {
          setSubmitError(result.error || "Registration failed");
        }
      } else if (currentEventId === "club-champs") {
        // Handle Club Championships - Singles and/or Doubles
        const { player_name, email, event_types, event_types_doubles, singles_division, doubles_division, doubles_partner, comments, ...extraFields } = data;

        // Validate that at least one event type is selected
        if (!event_types && !event_types_doubles) {
          setSubmitError("Please select at least one event type (Singles or Doubles)");
          setIsSubmitting(false);
          return;
        }

        // Validate division selection for selected event types
        if (event_types && !singles_division) {
          setSubmitError("Please select a division for Singles");
          setIsSubmitting(false);
          return;
        }

        if (event_types_doubles && !doubles_division) {
          setSubmitError("Please select a division for Doubles");
          setIsSubmitting(false);
          return;
        }

        // Validate that partner is specified and is a member if doubles is selected
        if (event_types_doubles) {
          if (!doubles_partner || doubles_partner.trim() === "") {
            setSubmitError("Please enter your doubles partner name");
            setIsSubmitting(false);
            return;
          }
          
          const isPartnerValidMember = members.some(
            (m) => m.name.toLowerCase() === doubles_partner.toLowerCase().trim()
          );
          if (!isPartnerValidMember) {
            setSubmitError("Doubles partner must be a valid club member. Please select from the suggestions.");
            setIsSubmitting(false);
            return;
          }
        }

        // Check for duplicate registrations - prevent registering for same event type twice
        const existingRegistrations = registeredMembers.filter(reg => 
          reg.player_name?.toLowerCase().trim() === player_name?.toLowerCase().trim()
        );

        for (const reg of existingRegistrations) {
          const extra = reg.extra_json || {};
          const existingEventTypes = extra.event_types || {};
          
          if (event_types && existingEventTypes.singles) {
            setSubmitError(`${player_name} is already registered for Singles`);
            setIsSubmitting(false);
            return;
          }
          
          if (event_types_doubles && existingEventTypes.doubles) {
            setSubmitError(`${player_name} is already registered for Doubles`);
            setIsSubmitting(false);
            return;
          }
        }

        // Also check if player is already registered as a partner in someone else's doubles registration
        if (event_types_doubles && existingPartnerRegistration) {
          setSubmitError(`${player_name} is already registered for Doubles with ${existingPartnerRegistration.player_name}`);
          setIsSubmitting(false);
          return;
        }

        const events = [];
        if (event_types) events.push(`Singles (${singles_division})`);
        if (event_types_doubles) events.push(`Doubles (${doubles_division})`);

        const registrationData = {
          timestamp: new Date().toISOString(),
          event_id: currentEventId,
          event_name: eventConfig.name,
          player_name: player_name || "",
          email: email || "",
          comments,
          extra_json: {
            ...extraFields,
            event_types: {
              singles: event_types || false,
              doubles: event_types_doubles || false
            },
            singles_division: event_types ? singles_division : null,
            doubles_division: event_types_doubles ? doubles_division : null,
            doubles_partner: event_types_doubles ? (doubles_partner || "TBD") : null,
            events_summary: events.join(", ")
          },
          registration_number: registrationCount + 1,
          is_waiting_list: isWaitingList,
          verification_token: verificationToken || undefined,
        };

        const result = await apiCall("submit_registration", registrationData);

        if (result.success) {
          let message = `Successfully registered ${data.player_name} for ${events.join(" and ")}`;
          if (isWaitingList) {
            message += ' (added to waiting list)';
          }
          
          setSuccessMessage(message);
          setSubmitSuccess(true);
          setRegistrationCount(prev => prev + 1);
          setTotalGolfers(prev => prev + 1);
          loadRegistrationData();
          reset();
          setIsVerified(!(eventConfig?.notifications?.requireEmailVerification));
          
          setTimeout(() => {
            setSubmitSuccess(false);
            setSuccessMessage("");
          }, 5000);
        } else {
          setSubmitError(result.error || "Registration failed");
        }
      } else {
        // Handle other event types including Sunday Squash Clinic and Squash Survivor
        const { player_name, email, phone, division, wall, comments, clinic_week, survivor_week, ...extraFields } = data;

        const registrationData = {
          timestamp: new Date().toISOString(),
          event_id: currentEventId,
          event_name: eventConfig.name,
          player_name: player_name || "",
          email: email || "",
          phone,
          division,
          wall,
          comments,

          // Optional top-level (handy for display/filters):
          ...(currentEventId === "sunday-squash-clinic" && clinic_week ? { clinic_week } : {}),
          ...(currentEventId === "squash-survivor" && survivor_week ? { survivor_week } : {}),

          // Store in extra_json where the backend persists it
          extra_json: {
            ...extraFields,
            ...(currentEventId === "sunday-squash-clinic" && clinic_week ? { clinic_week } : {}),
            ...(currentEventId === "squash-survivor" && survivor_week ? { survivor_week } : {}),
          },

          registration_number: registrationCount + 1,
          is_waiting_list: isWaitingList,
          verification_token: verificationToken || undefined,
        };

        const result = await apiCall("submit_registration", registrationData);

        
        if (result.success) {
          let message = `Successfully registered ${data.player_name}`;
          if (currentEventId === "sunday-squash-clinic" && data.clinic_week) {
            message += ` for ${data.clinic_week}`;
          } else if (currentEventId === "squash-survivor" && data.survivor_week) {
            message += ` for ${data.survivor_week}`;
          }
          if (isWaitingList) {
            message += ' (added to waiting list)';
          }
          
          setSuccessMessage(message);
          setSubmitSuccess(true);
          setRegistrationCount(prev => prev + 1);
          setTotalGolfers(prev => prev + 1);
          loadRegistrationData();
          reset();
          setIsVerified(!(eventConfig?.notifications?.requireEmailVerification));
          
          setTimeout(() => {
            setSubmitSuccess(false);
            setSuccessMessage("");
          }, 5000);
        } else {
          setSubmitError(result.error || "Registration failed");
        }
      }
    } catch (error) {
      setSubmitError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!eventConfig) {
    return <div className="min-h-screen flex items-center justify-center">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-6 px-4">
      <div className="max-w-screen-2xl mx-auto">
        {/* Event Selector */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Select Event:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(EVENT_CONFIGS).map((id) => (
                <button
                  key={id}
                  onClick={() => changeEvent(id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentEventId === id ? `${themeClasses.bg} text-white` : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {EVENT_CONFIGS[id].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Four Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Sidebar - Event Details and Rules */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Event Details
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-800">{eventConfig.name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-700">{eventConfig.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <List className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-700">{renderFormat(eventConfig.format)}
                  </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-800">{eventConfig.cost}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-700">
                      Max: {eventConfig.maxRegistrations} {currentEventId === 'golf-tournament-2025' ? terminology.participants : 'participants'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Rules */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Registration Rules</h3>
              <div className="space-y-3 text-sm text-gray-600">
                {eventConfig.notifications.confirmationEmail && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Confirmation email sent upon registration</span>
                  </div>
                )}
                {eventConfig.rules?.waitingListEnabled && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Waiting list available when event is full</span>
                  </div>
                )}
                {!eventConfig.rules?.allowDuplicates && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>One registration per person</span>
                  </div>
                )}
                {eventConfig.rules?.requireMembership && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Club membership required</span>
                  </div>
                )}
                {eventConfig.notifications.requireEmailVerification && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>Email verification required</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center - Registration Form (Double Width) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${themeClasses.gradient} px-6 py-8 text-white`}>
                <h1 className="text-3xl font-bold mb-2">{eventConfig.name}</h1>
                <p className="text-green-100">{eventConfig.ui.subtitle}</p>
              </div>

               {/* Enhanced Stats Bar - Updated for Weekly Recurring Events */}
              <div className="px-6 py-4 bg-gray-50 border-b">
                {(currentEventId === "sunday-squash-clinic" || currentEventId === "squash-survivor") ? (
                  // Special layout for recurring events
                  <div className="space-y-3">
                    {selectedClinicWeek && (
                      <div className="text-center">
                        <div className={`text-sm font-medium mb-1 ${currentEventId === "sunday-squash-clinic" ? "text-blue-600" : "text-orange-600"}`}>Selected Week</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedClinicWeek}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <UserPlus className="w-4 h-4" />
                          <span className="font-medium">
                            {selectedClinicWeek ? "This Week" : "Total"} {terminology.Participants}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {isLoadingStats ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            getCurrentWeekParticipants()
                          )}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Spots Left</span>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            spotsRemaining > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isLoadingStats ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : isWaitingList ? (
                            "Wait List"
                          ) : (
                            spotsRemaining
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Standard layout for non-recurring events
                  <div className={`grid ${currentEventId === "golf-tournament-2025" ? 'grid-cols-3' : 'grid-cols-2'} gap-4 text-sm`}>
                    {/* Total Players */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <UserPlus className="w-4 h-4" />
                        <span className="font-medium">Total {terminology.Participants}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {isLoadingStats ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          totalGolfers
                        )}
                      </div>
                    </div>

                    {/* Dinners (only for golf tournament) */}
                    {currentEventId === "golf-tournament-2025" && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                          <Utensils className="w-4 h-4" />
                          <span className="font-medium">Dinners</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {isLoadingStats ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            dinnersDisplay
                          )}
                        </div>
                      </div>
                    )}

                    {/* Spots Remaining */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Spots Left</span>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          spotsRemaining > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isLoadingStats ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : isWaitingList ? (
                          "Wait List"
                        ) : (
                          spotsRemaining
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Form */}
              <div className="p-6">
                {/* Loading State */}
                {(isInitializing || isLoadingStats) && (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <div className="mb-6">
                        <Loader2 className="w-16 h-16 mx-auto text-gray-400 animate-spin mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Loading Event Information
                        </h3>
                        <p className="text-gray-600">
                          Please wait while we load the registration details...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Not Open Yet */}
                {!isInitializing && !isLoadingStats && !isRegistrationOpen && registrationOpenDate && (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <div className="mb-6">
                        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Registration Opens Soon
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Registration for this event will open on:
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="text-lg font-semibold text-gray-900">
                            {registrationOpenDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-600">
                            at {registrationOpenDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              timeZoneName: 'short'
                            })}
                          </div>
                        </div>
                        {timeUntilOpen && (
                          <div className="text-sm text-gray-500">
                            Opens in: <span className="font-medium">{timeUntilOpen}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Check back when registration opens to secure your spot!
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Closed */}
                {!isInitializing && !isLoadingStats && eventConfig.registrationCloseTime && new Date() > new Date(eventConfig.registrationCloseTime) && (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <div className="mb-6">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Registration Closed
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Registration for this event closed on:
                        </p>
                        <div className="bg-red-50 rounded-lg p-4 mb-4">
                          <div className="text-lg font-semibold text-red-900">
                            {new Date(eventConfig.registrationCloseTime).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-red-600">
                            at {new Date(eventConfig.registrationCloseTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              timeZoneName: 'short'
                            })}
                          </div>
                        </div>
                        <div className="text-sm text-red-600">
                          Registration is no longer available for this event.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show Registration Form Only When Open and Data Loaded */}
                {!isInitializing && !isLoadingStats && isRegistrationOpen && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Golf Tournament Fields */}
                  {currentEventId === "golf-tournament-2025" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Primary Golfer</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Golfer 1 Name *
                          </label>
                          {/* Golfer 1 Name (with member suggestions) */}
                            <div className="relative">
                              <input
                                {...register("player_name", { required: "Golfer name is required" })}
                                type="text"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
                                  (errors as any)?.player_name ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Golfer 1 (you)"
                                onChange={(e) => setValue("player_name", e.target.value)}
                              />

                              {showSuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                  {isLoadingMembers ? (
                                    <div className="p-3 text-center text-gray-500">
                                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                      Loading members...
                                    </div>
                                  ) : filteredMembers.length > 0 ? (
                                    filteredMembers.map((m, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => selectMember(m.name)}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                      >
                                        {m.name}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">No matching members found</div>
                  )}
                </div>
              )}
            </div>
            {errMsg && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errMsg}</span>
              </p>
            )}
          </div>
        );
      }

      // Regular player_name field (non-membership events)
      if (field.name === "player_name") {
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && "*"}
            </label>
            <input
              {...register(field.name, {
                required: field.required ? `${field.label} is required` : false,
              })}
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
                errMsg ? "border-red-500" : "border-gray-300"
              } ${codeSent ? "bg-gray-100 text-gray-600" : ""}`}
              placeholder={field.placeholder}
              disabled={codeSent} // Disable after verification code is sent
            />
            {errMsg && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errMsg}</span>
              </p>
            )}
          </div>
        );
      }

      // Special handling for email field with verification
      if (field.name === "email" && eventConfig?.notifications?.requireEmailVerification) {
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && "*"}
            </label>
            <div className="flex gap-2">
              <input
                {...register(field.name, {
                  required: field.required ? `${field.label} is required` : false,
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" },
                })}
                type="email"
                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
                  errMsg ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={field.placeholder}
                disabled={isVerified || codeSent}

              />
              {!isVerified && (
                <button
                  type="button"
                  onClick={() => {
                    const email = watch("email");
                    const playerName = watch("player_name") || "";
                    if (email) sendVerificationEmail(email, playerName);
                  }}
                  disabled={isSendingEmail || !watch("email")}
                  className={`px-4 py-3 ${themeClasses.bg} text-white rounded-lg ${themeClasses.bgHover} disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap`}
                >
                  {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Code
                </button>
              )}
              {isVerified && (
                <div className="px-4 py-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </div>
              )}
            </div>
            {errMsg && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errMsg}</span>
              </p>
            )}
          </div>
        );
      }

      // Regular field rendering based on type
      switch (field.type) {
        case "text":
        case "email":
          return (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && "*"}
              </label>
              <input
                {...register(field.name, {
                  required: field.required ? `${field.label} is required` : false,
                  pattern: field.validation?.pattern
                    ? { value: new RegExp(field.validation.pattern), message: `Please enter a valid ${field.label.toLowerCase()}` }
                    : field.type === "email" 
                    ? { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" }
                    : undefined,
                })}
                type={field.type}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
                  errMsg ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={field.placeholder}
              />
              {errMsg && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errMsg}</span>
                </p>
              )}
            </div>
          );

        case "select":
          return (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && "*"}
              </label>
              <select
                {...register(field.name, {
                  required: field.required ? `${field.label} is required` : false,
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
                  errMsg ? "border-red-500" : "border-gray-300"
                }`}
                
              >
                <option value="" disabled>
                  Select {field.label}
                </option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errMsg && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errMsg}</span>
                </p>
              )}
            </div>
          );

        case "radio":
          return (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && "*"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {field.options?.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-colors cursor-pointer ${
                      watch(field.name) === opt
                        ? `${themeClasses.border} ${themeClasses.bgLight} ${themeClasses.textLight}`
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      {...register(field.name, { required: field.required ? `${field.label} is required` : false })}
                      type="radio"
                      value={opt}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
              {errMsg && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errMsg}</span>
                </p>
              )}
            </div>
          );

        case "textarea":
          return (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && "*"}
              </label>
              <textarea
                {...register(field.name, {
                  required: field.required ? `${field.label} is required` : false,
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent resize-none ${
                  errMsg ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={field.placeholder}
                rows={3}
              />
              {errMsg && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errMsg}</span>
                </p>
              )}
            </div>
          );

        case "checkbox":
          return (
            <div key={field.name}>
              <label className="flex items-center p-3 border rounded-lg transition-colors cursor-pointer hover:bg-gray-50 border-gray-300">
                <input
                  {...register(field.name)}
                  type="checkbox"
                  className={`w-4 h-4 ${themeClasses.text} border-gray-300 rounded focus:ring-2 ${themeClasses.ring}`}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {field.label} {field.required && "*"}
                </span>
              </label>
              {errMsg && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errMsg}</span>
                </p>
              )}
            </div>
          );

        default:
          return null;
      }
    })}
  </div>
)}

{/* Club Championships Fields */}
{currentEventId === "club-champs" && (
  <div className="space-y-6">
    {/* Player Name with member suggestions */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Player Name *
      </label>
      <div className="relative">
        <input
          {...register("player_name", { required: "Player name is required" })}
          type="text"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
            (errors as any)?.player_name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Start typing your name"
          onChange={(e) => setValue("player_name", e.target.value)}
        />
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {isLoadingMembers ? (
              <div className="p-3 text-center text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Loading members...
              </div>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectMember(m.name)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {m.name}
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500">No matching members found</div>
            )}
          </div>
        )}
      </div>
      {(errors as any)?.player_name && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          <span>{(errors as any).player_name.message}</span>
        </p>
      )}
    </div>

    {/* Email */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email Address *
      </label>
      <input
        {...register("email", {
          required: "Email is required",
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" }
        })}
        type="email"
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
          (errors as any)?.email ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="your.email@example.com"
      />
      {(errors as any)?.email && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          <span>{(errors as any).email.message}</span>
        </p>
      )}
    </div>

    {/* Existing Partner Registration Notification */}
    {existingPartnerRegistration && (
      <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Already Registered for Doubles</h4>
            <p className="text-sm text-blue-800 mt-1">
              You are already registered for Doubles (
              {existingPartnerRegistration.extra_json?.doubles_division || "Division TBD"}) 
              with <strong>{existingPartnerRegistration.player_name}</strong>
            </p>
            <p className="text-xs text-blue-700 mt-2">
              You can still register for Singles if you'd like to compete in both events.
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Event Type Selection */}
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="text-md font-semibold text-gray-900 mb-3">Select Event Type(s) *</h3>
      <div className="space-y-3">
        {/* Singles Checkbox */}
        <div className="flex items-start gap-3">
          <input
            {...register("event_types")}
            type="checkbox"
            id="event_types_singles"
            className={`mt-1 w-5 h-5 ${themeClasses.text} border-gray-300 rounded focus:ring-2 ${themeClasses.ring}`}
          />
          <label htmlFor="event_types_singles" className="flex-1">
            <span className="font-medium text-gray-900">Singles</span>
            <p className="text-sm text-gray-600">Compete individually in your division</p>
          </label>
        </div>

        {/* Singles Division (conditional) */}
        {watchedEventTypesSingles && (
          <div className="ml-8 mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Singles Division *
            </label>
            <select
              {...register("singles_division")}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
                (errors as any)?.singles_division ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Division</option>
              <option value="A">A Division</option>
              <option value="B">B Division</option>
              <option value="C">C Division</option>
              <option value="D">D Division</option>
              <option value="60+">60+ Division</option>
            </select>
          </div>
        )}

        {/* Doubles Checkbox */}
        <div className="flex items-start gap-3">
          <input
            {...register("event_types_doubles")}
            type="checkbox"
            id="event_types_doubles"
            disabled={!!existingPartnerRegistration}
            className={`mt-1 w-5 h-5 ${themeClasses.text} border-gray-300 rounded focus:ring-2 ${themeClasses.ring} ${existingPartnerRegistration ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <label htmlFor="event_types_doubles" className={`flex-1 ${existingPartnerRegistration ? 'opacity-50' : ''}`}>
            <span className="font-medium text-gray-900">Doubles</span>
            <p className="text-sm text-gray-600">
              {existingPartnerRegistration 
                ? "Already registered (see above)" 
                : "Compete with a partner in your division"}
            </p>
          </label>
        </div>

        {/* Doubles Division and Partner (conditional) */}
        {watchedEventTypesDoubles && (
          <div className="ml-8 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doubles Division *
              </label>
              <select
                {...register("doubles_division")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
                  (errors as any)?.doubles_division ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Division</option>
                <option value="A">A Division</option>
                <option value="B">B Division</option>
                <option value="C">C Division</option>
                <option value="D">D Division</option>
                <option value="60+">60+ Division</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doubles Partner *
              </label>
              <div className="relative">
                <input
                  {...register("doubles_partner")}
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent border-gray-300`}
                  placeholder="Start typing partner name"
                  onChange={(e) => setValue("doubles_partner", e.target.value)}
                />
                {showPartnerSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {isLoadingMembers ? (
                      <div className="p-3 text-center text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Loading members...
                      </div>
                    ) : filteredPartners.length > 0 ? (
                      filteredPartners.map((m, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectPartner(m.name)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          {m.name}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500">No matching members found</div>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Both players must be club members. Select from the suggestions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Comments */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Comments (Optional)
      </label>
      <textarea
        {...register("comments")}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent resize-none border-gray-300`}
        placeholder="Any additional comments or requests..."
        rows={3}
      />
    </div>
  </div>
)}

                  {/* Success Message */}
                  {submitSuccess && successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Registration Successful!</p>
                          <p className="text-sm text-green-700">{successMessage}</p>
                          {eventConfig.notifications.confirmationEmail && (
                            <p className="text-xs text-green-600 mt-1">
                              You should receive a confirmation email shortly.
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSubmitSuccess(false);
                            setSuccessMessage("");
                          }}
                          className="ml-auto text-green-400 hover:text-green-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Email Verification - Only show if required and not verified */}
                  {eventConfig?.notifications?.requireEmailVerification && !isVerified && (
                    isVerifying ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying code…
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium text-blue-900">Email Verification Required</h3>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">
                          Enter the 6-digit code sent to {watch("email") || "your email"}:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={userEnteredCode}
                            onChange={(e) => setUserEnteredCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="flex-1 px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                          />
                          <button
                            type="button"
                            onClick={verifyCode}
                            disabled={userEnteredCode.length !== 6 || isVerifying}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {isVerifying ? "Verifying…" : "Verify"}
                          </button>
                        </div>
                        {verificationExpiry && (
                          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires in 10 minutes
                          </p>
                        )}
                      </div>
                    )
                  )}

                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {submitError}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full ${themeClasses.bg} text-white py-4 px-6 rounded-lg font-medium text-lg ${themeClasses.bgHover} focus:outline-none focus:ring-2 ${themeClasses.ring} focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isWaitingList ? "Joining Waiting List..." : "Registering..."}
                      </>
                    ) : (
                      <>{isWaitingList ? "Join Waiting List" : 
                        (currentEventId === "golf-tournament-2025" ? 
                          `Register Golf Group` : 
                          `Register for ${eventConfig.name}`)
                      }</>
                    )}
                  </button>

                  {usingFallbackData && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        Demo mode - configure Google Apps Script for full functionality
                      </p>
                    </div>
                  )}
                </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Recent Registrations */}
          <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {(currentEventId === "sunday-squash-clinic" || currentEventId === "squash-survivor") ? "Weekly Registrations" : "Registrations"}
            </h3>

            {isLoadingStats ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              </div>
            ) : registeredMembers.length > 0 ? (
              <div className="flex-1 space-y-2 overflow-y-auto">
                {(currentEventId === "sunday-squash-clinic" || currentEventId === "squash-survivor") ? (
                  // Group by week for recurring events
                  (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Calculate date boundaries: 4 weeks ago to 4 weeks from now
                    const fourWeeksAgo = new Date(today);
                    fourWeeksAgo.setDate(today.getDate() - (4 * 7));
                    
                    const fourWeeksFromNow = new Date(today);
                    fourWeeksFromNow.setDate(today.getDate() + (4 * 7));
                    
                    // Group registrations by week (clinic_week or survivor_week)
                    const weeklyGroups = registeredMembers.reduce((groups: Record<string, any[]>, member) => {
                      const week = member.clinic_week || member.survivor_week || member.extra_json?.clinic_week || member.extra_json?.survivor_week || "Unknown Week";
                      if (!groups[week]) groups[week] = [];
                      groups[week].push(member);
                      return groups;
                    }, {});

                    // Filter to show only weeks within the 8-week window (4 weeks back + 4 weeks forward)
                    const filteredWeeks = Object.keys(weeklyGroups).filter(week => {
                      if (week === "Unknown Week") return true; // Keep unknown weeks
                      
                      try {
                        // Parse the week string "Sunday, January 15, 2025" to compare with boundaries
                        const weekDate = new Date(week.replace('Sunday, ', ''));
                        return weekDate >= fourWeeksAgo && weekDate <= fourWeeksFromNow;
                      } catch {
                        return true; // Keep weeks we can't parse
                      }
                    });

                    // Sort weeks chronologically
                    const sortedWeeks = filteredWeeks.sort((a, b) => {
                      if (a === "Unknown Week") return 1;
                      if (b === "Unknown Week") return -1;
                      try {
                        const dateA = new Date(a.replace('Sunday, ', ''));
                        const dateB = new Date(b.replace('Sunday, ', ''));
                        return dateA.getTime() - dateB.getTime();
                      } catch {
                        return 0;
                      }
                    });

                    return sortedWeeks.map(week => {
                      const isPast = (() => {
                        try {
                          const weekDate = new Date(week.replace('Sunday, ', ''));
                          return weekDate < today;
                        } catch {
                          return false;
                        }
                      })();

                      return (
                        <div key={week} className="mb-4">
                          <div className="text-sm mb-2 flex items-center justify-between">
                            <span className={`font-bold ${isPast ? "text-gray-500" : "text-gray-700"}`}>{week}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              isPast 
                                ? "bg-gray-100 text-gray-500" 
                                : currentEventId === "sunday-squash-clinic"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-orange-100 text-orange-600"
                            }`}>
                              {weeklyGroups[week].length}/{eventConfig.maxRegistrations}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {weeklyGroups[week].slice(0, 10).map((member, idx) => (
                              <div key={idx} className={`text-sm px-2 py-1 bg-gray-50 rounded ${
                                isPast ? "text-gray-500" : "text-gray-600"
                              }`}>
                                {member.player_name || "Registrant"}
                              </div>
                            ))}
                            {weeklyGroups[week].length > 10 && (
                              <div className="text-xs text-gray-400 px-2">
                                +{weeklyGroups[week].length - 10} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : currentEventId === "golf-tournament-2025" ? (
                    // Golf foursomes display
                    golfFoursomes.length === 0 ? (
                      <div className="text-sm text-gray-500">No registrations yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-3">
    {golfFoursomes.map((fs: Foursome, idx: number) => (
      <div key={idx} className="p-3 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Foursome {idx + 1}</span>
        </div>

          <div className="mt-2 space-y-2">
            {fs.names.map((name: string, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className={`${name ? "text-gray-800" : "text-gray-400 italic"} whitespace-nowrap pr-2`}>
                  {name || "Open spot"}
                </span>
                {fs.dinners[i] && <Utensils className="w-3 h-3 text-orange-600" />}
              </div>
            ))}
          </div>

                            <div className="mt-2 text-xs text-gray-400">
                              {new Date(fs.reg.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
) : currentEventId === "club-champs" ? (
  (() => {
    // Group Club Championships registrations by event type and division
    const singlesGroups: Record<string, any[]> = { A: [], B: [], C: [], D: [], "60+": [] };
    const doublesGroups: Record<string, any[]> = { A: [], B: [], C: [], D: [], "60+": [] };

    registeredMembers.forEach((member: any) => {
      const extra = member.extra_json || {};
      const eventTypes = extra.event_types || {};
      
      if (eventTypes.singles && extra.singles_division) {
        const div = extra.singles_division;
        if (singlesGroups[div]) {
          singlesGroups[div].push({ ...member, type: 'singles' });
        }
      }
      
      if (eventTypes.doubles && extra.doubles_division) {
        const div = extra.doubles_division;
        if (doublesGroups[div]) {
          doublesGroups[div].push({ 
            ...member, 
            type: 'doubles',
            partner: extra.doubles_partner || "TBD"
          });
        }
      }
    });

    const divisions = ["A", "B", "C", "D", "60+"];

    return (
      <div className="space-y-6">
        {/* Singles Section */}
        {Object.values(singlesGroups).some((g: any[]) => g.length > 0) && (
          <div>
            <h4 className="text-md font-bold text-indigo-700 mb-3 flex items-center gap-2 border-b pb-2">
              <Users className="w-4 h-4" />
              Singles
            </h4>
            <div className="space-y-4">
              {divisions.map(div => {
                const players = singlesGroups[div];
                if (players.length === 0) return null;
                
                return (
                  <div key={`singles-${div}`}>
                    <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                      <span>Division {div}</span>
                      <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-600">
                        {players.length} player{players.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-1 ml-2">
                      {players.map((player: any, idx: number) => (
                        <div key={idx} className="text-sm px-3 py-2 bg-indigo-50 rounded border border-indigo-100 flex items-center justify-between">
                          <span className="text-gray-800">{player.player_name}</span>
                          <span className="text-xs text-gray-500">{formatCondensedTimestamp(player.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Doubles Section */}
        {Object.values(doublesGroups).some((g: any[]) => g.length > 0) && (
          <div>
            <h4 className="text-md font-bold text-purple-700 mb-3 flex items-center gap-2 border-b pb-2">
              <Users className="w-4 h-4" />
              Doubles
            </h4>
            <div className="space-y-4">
              {divisions.map(div => {
                const teams = doublesGroups[div];
                if (teams.length === 0) return null;
                
                return (
                  <div key={`doubles-${div}`}>
                    <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                      <span>Division {div}</span>
                      <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-600">
                        {teams.length} team{teams.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-1 ml-2">
                      {teams.map((team: any, idx: number) => (
                        <div key={idx} className="text-sm px-3 py-2 bg-purple-50 rounded border border-purple-100 flex items-center justify-between">
                          <span className="text-gray-800">
                            {team.player_name} / {team.partner}
                          </span>
                          <span className="text-xs text-gray-500">{formatCondensedTimestamp(team.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No registrations message */}
        {Object.values(singlesGroups).every((g: any[]) => g.length === 0) && 
         Object.values(doublesGroups).every((g: any[]) => g.length === 0) && (
          <div className="text-sm text-gray-500 text-center py-8">
            No registrations yet
          </div>
        )}
      </div>
    );
  })()
) : (
  (() => {
// Group by status for other events (PDL, etc.)
const confirmedRegistrations = registeredMembers
  .filter((member: any) => !member.is_waiting_list)
  .sort((a: any, b: any) => {
    // Sort Fall PDL by timestamp ascending (oldest first), others by descending (newest first)
    if (currentEventId === 'fall-pdl-8.0-2025') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  })
  .slice(0, 50);

const waitingListRegistrations = registeredMembers
  .filter((member: any) => member.is_waiting_list)
  .sort((a: any, b: any) => {
    // Sort Fall PDL by timestamp ascending (oldest first), others by descending (newest first)
    if (currentEventId === 'fall-pdl-8.0-2025') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  })
  .slice(0, 20);
    return (
      <>
        {/* Confirmed */}
        {confirmedRegistrations.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Confirmed ({confirmedRegistrations.length})
            </h4>
            <div className="space-y-2">
              {confirmedRegistrations.map((member: any, index: number) => (
                <div
                  key={`confirmed-${index}`}
                  className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200"
                >
                  <div className="min-w-0 truncate text-sm text-green-800">
                    {member.player_name || "Registrant"}
                  </div>
                  <div className="flex-shrink-0 text-xs text-green-600">
                    <span>{formatCondensedTimestamp(member.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waiting List */}
        {waitingListRegistrations.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Waiting List ({waitingListRegistrations.length})
            </h4>
            <div className="space-y-2">
              {waitingListRegistrations.map((member: any, index: number) => (
                <div
                  key={`waiting-${index}`}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200"
                >
                  <div className="min-w-0 truncate text-sm text-orange-800">
                    {member.player_name || "Registrant"}
                  </div>
                  <div className="flex-shrink-0 text-xs text-orange-600">
                    <span>{formatCondensedTimestamp(member.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  })()
)}

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No registrations yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiEventRegistration;