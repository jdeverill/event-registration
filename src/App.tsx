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
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Lock,
} from "lucide-react";

/* =========================
   Admin Password Configuration
========================= */
const ADMIN_PASSWORD = "admin123"; // TODO: Change this to a secure password!

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
  isRecurring?: boolean;
  recurringDay?: number; // 0=Sunday, 1=Monday, etc.
  recurringDayName?: string;
  excludedDates?: string[];
}

interface Member {
  name: string;
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
  configs?: Record<string, EventConfig>;
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
   Default Event configs (Fallback)
========================= */

const DEFAULT_EVENT_CONFIGS: Record<string, EventConfig> = {
  "sample-event": {
    id: "sample-event",
    name: "Sample Event",
    description: "This is a sample event",
    location: "Sample Location",
    format: ["Sample format"],
    cost: "Free",
    maxRegistrations: 20,
    registrationOpenTime: "",
    registrationCloseTime: "",
    fields: [
      { name: "player_name", type: "text", label: "Name", required: true, placeholder: "Your name" },
      { name: "email", type: "email", label: "Email", required: true, placeholder: "your@email.com" },
    ],
    ui: {
      title: "Sample Event",
      subtitle: "Register for this event",
      theme: { primary: "blue", secondary: "indigo" },
    },
    notifications: { requireEmailVerification: false, confirmationEmail: false },
    rules: { requireMembership: false, allowDuplicates: false, waitingListEnabled: false },
    isRecurring: false,
    excludedDates: [],
  },
};

/* =========================
   Utilities
========================= */

const isDate = (value: unknown): value is Date =>
  Object.prototype.toString.call(value) === "[object Date]" && !Number.isNaN((value as Date).getTime());

const CLINIC_SCHEDULE_CONFIG = {
  excludedDates: [
    '2025-12-25',
    '2025-01-01',
    '2025-11-28',
    '2025-12-31',
  ],
  coachUnavailable: [
    '2025-02-14',
    '2025-03-21',
    '2025-09-28',
  ],
  facilityClosed: [
    '2025-06-15',
  ]
};

const generateWeeklyOptions = (weeksAhead: number = 4, targetDay: number = 0, dayName: string = 'Sunday', customExcludedDates: string[] = []): string[] => {
  const options: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Combine global excluded dates with event-specific excluded dates
  const allExcludedDates = [
    ...CLINIC_SCHEDULE_CONFIG.excludedDates,
    ...CLINIC_SCHEDULE_CONFIG.coachUnavailable,
    ...CLINIC_SCHEDULE_CONFIG.facilityClosed,
    ...customExcludedDates
  ];
  
  let nextTargetDay = new Date(today);
  const currentDayOfWeek = today.getDay();
  
  if (currentDayOfWeek === targetDay) {
    const todayForComparison = today.toISOString().split('T')[0];
    const isTodayExcluded = allExcludedDates.includes(todayForComparison);
    
    if (!isTodayExcluded) {
      nextTargetDay = new Date(today);
    } else {
      nextTargetDay.setDate(today.getDate() + 7);
    }
  } else {
    let daysUntilTargetDay = targetDay - currentDayOfWeek;
    if (daysUntilTargetDay <= 0) {
      daysUntilTargetDay += 7;
    }
    nextTargetDay.setDate(today.getDate() + daysUntilTargetDay);
  }
  
  let weeksGenerated = 0;
  let currentWeek = 0;
  
  while (weeksGenerated < weeksAhead && currentWeek < 20) {
    const eventDate = new Date(nextTargetDay);
    eventDate.setDate(nextTargetDay.getDate() + (currentWeek * 7));
    
    if (eventDate < today) {
      currentWeek++;
      continue;
    }
    
    const dateForComparison = eventDate.toISOString().split('T')[0];
    
    if (allExcludedDates.includes(dateForComparison)) {
      currentWeek++;
      continue;
    }
    
    const dateString = eventDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    options.push(`${dayName}, ${dateString}`);
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

  if (r?.event_id === "golf-tournament-2025") {
    if (Array.isArray(extra.golfers) && extra.golfers.length > 0) {
      const names = extra.golfers
        .map((g: any) => (typeof g === "string" ? g : g?.name || "").trim())
        .filter(Boolean);
      const dinners = extra.golfers.map((g: any) => {
        const d = typeof g === "object" ? g?.dinner : false;
        return d === true || d === "true" || d === 1;
      });

      return {
        names: names.length ? names : (r?.player_name ? [r.player_name.trim()] : []),
        dinners,
        teamSize: names.length || 1,
        isGolf: true,
        dinnerCount: dinners.filter(Boolean).length,
      };
    }

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

    return {
      names: names.length > 0 ? names : ["Registrant"],
      dinners,
      teamSize: names.length || 1,
      isGolf: true,
      dinnerCount: dinners.filter(Boolean).length,
    };
  }
  
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
    case "getEventConfigs":
      return { success: true, configs: DEFAULT_EVENT_CONFIGS, fallback: true };
    case "saveEventConfig":
      return { success: true, message: "Event configuration saved", fallback: true };
    case "deleteEventConfig":
      return { success: true, message: "Event configuration deleted", fallback: true };
    default:
      return { success: false, error: "Unknown action", fallback: true };
  }
};

/* =========================
   Admin Components
========================= */

const AdminLogin: React.FC<{
  onLogin: () => void;
  onClose: () => void;
}> = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      onLogin();
      onClose();
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter admin password"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

const EventConfigForm: React.FC<{
  eventConfig: EventConfig | null;
  onSave: (config: EventConfig) => void;
  onCancel: () => void;
}> = ({ eventConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState<EventConfig>(
    eventConfig || {
      id: "",
      name: "",
      description: "",
      location: "",
      format: [],
      cost: "",
      maxRegistrations: 20,
      registrationOpenTime: "",
      registrationCloseTime: "",
      fields: [],
      ui: {
        title: "",
        subtitle: "",
        theme: { primary: "blue", secondary: "indigo" },
      },
      notifications: {
        requireEmailVerification: false,
        confirmationEmail: false,
      },
      rules: {
        requireMembership: false,
        allowDuplicates: false,
        waitingListEnabled: false,
      },
      isRecurring: false,
      recurringDay: 0,
      recurringDayName: "Sunday",
      excludedDates: [],
    }
  );

  const [formatInput, setFormatInput] = useState("");
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [fieldForm, setFieldForm] = useState<FieldConfig>({
    name: "",
    type: "text",
    label: "",
    required: true,
    placeholder: "",
    options: [],
  });
  const [optionInput, setOptionInput] = useState("");
  const [excludeDateInput, setExcludeDateInput] = useState("");

  const handleAddFormat = () => {
    if (formatInput.trim()) {
      const currentFormat = Array.isArray(config.format) ? config.format : [];
      setConfig({
        ...config,
        format: [...currentFormat, formatInput.trim()],
      });
      setFormatInput("");
    }
  };

  const handleRemoveFormat = (index: number) => {
    if (Array.isArray(config.format)) {
      setConfig({
        ...config,
        format: config.format.filter((_, i) => i !== index),
      });
    }
  };

  const handleAddField = () => {
    if (!fieldForm.name || !fieldForm.label) {
      alert("Field name and label are required");
      return;
    }

    const newField = { ...fieldForm };
    if (editingFieldIndex !== null) {
      const updatedFields = [...config.fields];
      updatedFields[editingFieldIndex] = newField;
      setConfig({ ...config, fields: updatedFields });
      setEditingFieldIndex(null);
    } else {
      setConfig({ ...config, fields: [...config.fields, newField] });
    }

    setFieldForm({
      name: "",
      type: "text",
      label: "",
      required: true,
      placeholder: "",
      options: [],
    });
    setOptionInput("");
  };

  const handleEditField = (index: number) => {
    setFieldForm({ ...config.fields[index] });
    setEditingFieldIndex(index);
  };

  const handleDeleteField = (index: number) => {
    setConfig({
      ...config,
      fields: config.fields.filter((_, i) => i !== index),
    });
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setFieldForm({
        ...fieldForm,
        options: [...(fieldForm.options || []), optionInput.trim()],
      });
      setOptionInput("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setFieldForm({
      ...fieldForm,
      options: (fieldForm.options || []).filter((_, i) => i !== index),
    });
  };

  const handleAddExcludedDate = () => {
    if (excludeDateInput) {
      const currentExcluded = config.excludedDates || [];
      if (!currentExcluded.includes(excludeDateInput)) {
        setConfig({
          ...config,
          excludedDates: [...currentExcluded, excludeDateInput].sort(),
        });
      }
      setExcludeDateInput("");
    }
  };

  const handleRemoveExcludedDate = (date: string) => {
    setConfig({
      ...config,
      excludedDates: (config.excludedDates || []).filter(d => d !== date),
    });
  };

  const handleSave = () => {
    // Generate ID from name if creating new event
    if (!config.id) {
      const id = config.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      onSave({ ...config, id, ui: { ...config.ui, title: config.name } });
    } else {
      onSave(config);
    }
  };

  const dayOptions = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {eventConfig ? "Edit Event" : "Create New Event"}
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={config.location}
                  onChange={(e) => setConfig({ ...config, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost *
                </label>
                <input
                  type="text"
                  value={config.cost}
                  onChange={(e) => setConfig({ ...config, cost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., $50, Free"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Registrations *
                </label>
                <input
                  type="number"
                  value={config.maxRegistrations}
                  onChange={(e) => setConfig({ ...config, maxRegistrations: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Color
                </label>
                <select
                  value={config.ui.theme.primary}
                  onChange={(e) => setConfig({
                    ...config,
                    ui: { ...config.ui, theme: { ...config.ui.theme, primary: e.target.value } }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                  <option value="indigo">Indigo</option>
                  <option value="orange">Orange</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={config.ui.subtitle}
                  onChange={(e) => setConfig({
                    ...config,
                    ui: { ...config.ui, subtitle: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description"
                />
              </div>
            </div>

            {/* Format Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format Items
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={formatInput}
                  onChange={(e) => setFormatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFormat())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add format item and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddFormat}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {Array.isArray(config.format) && config.format.length > 0 && (
                <div className="space-y-1">
                  {config.format.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1 text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFormat(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Registration Timing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Registration Timing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Opens
                </label>
                <input
                  type="datetime-local"
                  value={config.registrationOpenTime || ""}
                  onChange={(e) => setConfig({ ...config, registrationOpenTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for immediate opening</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Closes
                </label>
                <input
                  type="datetime-local"
                  value={config.registrationCloseTime || ""}
                  onChange={(e) => setConfig({ ...config, registrationCloseTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no closing date</p>
              </div>
            </div>
          </div>

          {/* Event Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Event Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recurring Event */}
              <div className="col-span-2">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={config.isRecurring || false}
                    onChange={(e) => setConfig({ ...config, isRecurring: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Recurring Weekly Event
                  </span>
                </label>
                {config.isRecurring && (
                  <div className="mt-4 ml-7 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of Week
                      </label>
                      <select
                        value={config.recurringDay || 0}
                        onChange={(e) => {
                          const day = parseInt(e.target.value);
                          const dayName = dayOptions.find(d => d.value === day)?.label || "Sunday";
                          setConfig({
                            ...config,
                            recurringDay: day,
                            recurringDayName: dayName,
                          });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        {dayOptions.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Excluded Dates Manager */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exclude Specific Dates
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Add dates you want to skip (holidays, vacations, etc.)
                      </p>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="date"
                          value={excludeDateInput}
                          onChange={(e) => setExcludeDateInput(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddExcludedDate}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Exclude
                        </button>
                      </div>
                      {config.excludedDates && config.excludedDates.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Excluded Dates:</div>
                          {config.excludedDates.map((date, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                              <span className="text-sm text-red-900">
                                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExcludedDate(date)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Other Features */}
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.rules.requireMembership || false}
                  onChange={(e) => setConfig({
                    ...config,
                    rules: { ...config.rules, requireMembership: e.target.checked }
                  })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Require Club Membership
                </span>
              </label>

              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.rules.waitingListEnabled || false}
                  onChange={(e) => setConfig({
                    ...config,
                    rules: { ...config.rules, waitingListEnabled: e.target.checked }
                  })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Enable Waiting List
                </span>
              </label>

              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.notifications.requireEmailVerification || false}
                  onChange={(e) => setConfig({
                    ...config,
                    notifications: { ...config.notifications, requireEmailVerification: e.target.checked }
                  })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Require Email Verification
                </span>
              </label>

              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.notifications.confirmationEmail || false}
                  onChange={(e) => setConfig({
                    ...config,
                    notifications: { ...config.notifications, confirmationEmail: e.target.checked }
                  })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Send Confirmation Email
                </span>
              </label>

              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.rules.allowDuplicates || false}
                  onChange={(e) => setConfig({
                    ...config,
                    rules: { ...config.rules, allowDuplicates: e.target.checked }
                  })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Allow Duplicate Registrations
                </span>
              </label>
            </div>
          </div>

          {/* Form Fields Builder */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Registration Form Fields</h3>
            
            {/* Current Fields List */}
            {config.fields.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-700">Current Fields:</h4>
                {config.fields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{field.label}</div>
                      <div className="text-xs text-gray-500">
                        Type: {field.type} • Name: {field.name} • {field.required ? 'Required' : 'Optional'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditField(index)}
                        className="text-indigo-600 hover:text-indigo-700 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteField(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Field Builder Form */}
            <div className="border border-gray-300 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                {editingFieldIndex !== null ? 'Edit Field' : 'Add New Field'}
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Field Name (internal key) *
                  </label>
                  <input
                    type="text"
                    value={fieldForm.name}
                    onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value.replace(/[^a-z0-9_]/g, '_').toLowerCase() })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., player_name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Field Type *
                  </label>
                  <select
                    value={fieldForm.type}
                    onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value as FieldType })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Dropdown</option>
                    <option value="radio">Radio Buttons</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Label (shown to users) *
                  </label>
                  <input
                    type="text"
                    value={fieldForm.label}
                    onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Player Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={fieldForm.placeholder || ""}
                    onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={fieldForm.required}
                    onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 mr-2"
                  />
                  Required field
                </label>
              </div>

              {/* Options for select/radio types */}
              {(fieldForm.type === "select" || fieldForm.type === "radio") && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Options
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add an option"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {fieldForm.options && fieldForm.options.length > 0 && (
                    <div className="space-y-1">
                      {fieldForm.options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="flex-1">{option}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddField}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingFieldIndex !== null ? 'Update Field' : 'Add Field'}
                </button>
                {editingFieldIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFieldIndex(null);
                      setFieldForm({
                        name: "",
                        type: "text",
                        label: "",
                        required: true,
                        placeholder: "",
                        options: [],
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel: React.FC<{
  eventConfigs: Record<string, EventConfig>;
  onConfigChange: (configs: Record<string, EventConfig>) => void;
  onClose: () => void;
  apiCall: (action: string, params?: Record<string, any>) => Promise<ApiResponse>;
}> = ({ eventConfigs, onConfigChange, onClose, apiCall }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ eventId: string; eventName: string } | null>(null);

  const handleSaveConfig = async (config: EventConfig) => {
    setIsSaving(true);
    try {
      const result = await apiCall("saveEventConfig", { 
        config: JSON.stringify(config)
      });
      
      if (result.success) {
        // Reload all configs from backend to ensure consistency
        const configsResult = await apiCall("getEventConfigs");
        if (configsResult.success && configsResult.configs) {
          onConfigChange(configsResult.configs);
        } else {
          // Fallback: update locally
          const updatedConfigs = {
            ...eventConfigs,
            [config.id]: config,
          };
          onConfigChange(updatedConfigs);
        }
        
        setIsCreating(false);
        setEditingEvent(null);
        alert("Event configuration saved successfully!");
      } else {
        console.error('Save failed:', result);
        alert(result.error || "Failed to save event configuration");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save event configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async (eventId: string) => {
    setDeleteConfirmation({ eventId, eventName: eventConfigs[eventId].name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    const { eventId } = deleteConfirmation;

    try {
      const result = await apiCall("deleteEventConfig", { eventId });
      
      if (result.success) {
        const updatedConfigs = { ...eventConfigs };
        delete updatedConfigs[eventId];
        onConfigChange(updatedConfigs);
        alert("Event deleted successfully!");
      } else {
        alert(result.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting config:", error);
      alert("Failed to delete event");
    } finally {
      setDeleteConfirmation(null);
    }
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the event <strong>"{deleteConfirmation.eventName}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Event Administration</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                Create New Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(eventConfigs).map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfig(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Max: {event.maxRegistrations}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{event.cost}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {event.isRecurring && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          Recurring ({event.recurringDayName})
                        </span>
                      )}
                      {event.rules.requireMembership && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          Members Only
                        </span>
                      )}
                      {event.rules.waitingListEnabled && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          Waiting List
                        </span>
                      )}
                      {event.notifications.requireEmailVerification && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          Email Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(isCreating || editingEvent) && (
        <EventConfigForm
          eventConfig={editingEvent}
          onSave={handleSaveConfig}
          onCancel={() => {
            setIsCreating(false);
            setEditingEvent(null);
          }}
        />
      )}
    </>
  );
};

/* =========================
   Main component
========================= */

const MultiEventRegistration: React.FC = () => {
  // Admin state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [eventConfigs, setEventConfigs] = useState<Record<string, EventConfig>>(DEFAULT_EVENT_CONFIGS);
  
  // Get event ID from URL path
  const getEventIdFromPath = (): string => {
    const path = window.location.pathname;
    const configIds = Object.keys(eventConfigs);
    
    for (const id of configIds) {
      if (path.includes(`/${id}`) || path.includes(`/${id.replace(/-/g, '')}`)) {
        return id;
      }
    }
    
    return configIds[0] || 'sample-event';
  };

  const [currentEventId, setCurrentEventId] = useState<string>(getEventIdFromPath());
  
  // Get event config and dynamically populate weekly recurring events
  const getEventConfig = (eventId: string): EventConfig => {
    const config = eventConfigs[eventId];
    
    if (!config) return DEFAULT_EVENT_CONFIGS['sample-event'];
    
    // Handle weekly recurring events
    if (config.isRecurring && config.fields) {
      const updatedConfig = { ...config };
      const weekField = updatedConfig.fields.find(field => 
        field.name === "clinic_week" || field.name === "survivor_week" || field.name === "week"
      );
      
      if (weekField) {
        const weekOptions = generateWeeklyOptions(
          4,
          config.recurringDay || 0,
          config.recurringDayName || 'Sunday',
          config.excludedDates || []
        );
        
        weekField.options = weekOptions;
        
        if (weekOptions.length > 0 && !weekField.defaultValue) {
          weekField.defaultValue = weekOptions[0];
        }
      }
      
      return updatedConfig;
    }
    
    return config;
  };

  const eventConfig = getEventConfig(currentEventId);

  const changeEvent = (eventId: string) => {
    setCurrentEventId(eventId);
    const newPath = `/${eventId}`;
    window.history.pushState({}, '', newPath);
    reset();
    setIsVerified(!(eventConfigs[eventId]?.notifications?.requireEmailVerification));
    setCodeSent(false);
    setSubmitError("");
    setIsInitializing(true);
    setIsRegistrationOpen(false);
    setRegistrationOpenDate(null);
    setTimeUntilOpen("");
  };

  const themeClasses = useMemo(
    () => getThemeClasses(eventConfig?.ui?.theme?.primary ?? "green"),
    [eventConfig?.ui?.theme?.primary]
  );

  const GAS_URL = process.env.REACT_APP_GAS_URL || "https://script.google.com/macros/s/AKfycbwayR6CzmaI-nwg48TrDPV04xnDvw55ejDXexGRB76gzyQAjzGf4A-IXuGmoV-yPhak/exec";

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

  const [registrationCount, setRegistrationCount] = useState(0);
  const [totalGolfers, setTotalGolfers] = useState(0);
  const [totalDinners, setTotalDinners] = useState(0);
  const [registrationStats, setRegistrationStats] = useState<any>(null);
  const [registeredMembers, setRegisteredMembers] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [selectedClinicWeek, setSelectedClinicWeek] = useState<string>("");
  const [weeklyStats, setWeeklyStats] = useState<Record<string, { count: number; participants: number }>>({});

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [registrationOpenDate, setRegistrationOpenDate] = useState<Date | null>(null);
  const [timeUntilOpen, setTimeUntilOpen] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

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
  
  const getCurrentSelectedWeek = () => {
    if (currentEventId === "sunday-squash-clinic") {
      return watchedClinicWeek;
    } else if (currentEventId === "squash-survivor") {
      return watchedSurvivorWeek;
    }
    return "";
  };

  const currentSelectedWeek = getCurrentSelectedWeek();

  const checkRegistrationTiming = React.useCallback(() => {
    if (!eventConfig) {
      setIsInitializing(true);
      return;
    }
    
    const now = new Date();
    const openTime = eventConfig.registrationOpenTime ? new Date(eventConfig.registrationOpenTime) : null;
    const closeTime = eventConfig.registrationCloseTime ? new Date(eventConfig.registrationCloseTime) : null;
    
    const isOpen = !openTime || now >= openTime;
    const isClosed = closeTime && now > closeTime;
    
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

  // Load event configs from backend
  useEffect(() => {
    const loadEventConfigs = async () => {
      console.log('Loading event configs from backend...');
      try {
        const result = await apiCall("getEventConfigs");
        console.log('Event configs response:', result);
        
        if (result.success && result.configs) {
          // Check if configs object has any events
          const configKeys = Object.keys(result.configs);
          console.log('Found configs:', configKeys);
          
          if (configKeys.length > 0) {
            setEventConfigs(result.configs);
            
            // Update current event if it doesn't exist in loaded configs
            if (!result.configs[currentEventId]) {
              const firstEventId = configKeys[0];
              console.log('Switching to first available event:', firstEventId);
              setCurrentEventId(firstEventId);
            }
          } else {
            console.warn('No event configs found, using defaults');
            setEventConfigs(DEFAULT_EVENT_CONFIGS);
          }
        } else {
          console.warn('Failed to load configs, using defaults:', result.error);
          setEventConfigs(DEFAULT_EVENT_CONFIGS);
        }
      } catch (error) {
        console.error("Error loading event configs:", error);
        setEventConfigs(DEFAULT_EVENT_CONFIGS);
      }
    };
    
    loadEventConfigs();
  }, []);

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
      setRegisteredMembers([]);
      setTotalGolfers(0);
      setTotalDinners(0);
      setRegistrationStats(null);
      
      const isRecurringEvent = eventConfig.isRecurring;
      
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

  const getWeekSpecificStats = (selectedWeek: string, allRegistrations: any[]): { weekParticipants: number; weekSpotsRemaining: number } => {
    if (!eventConfig?.isRecurring || !selectedWeek) {
      return { weekParticipants: totalGolfers, weekSpotsRemaining: spotsRemaining };
    }
    
    const weekRegistrations = allRegistrations.filter(reg => {
      const regWeek = reg.clinic_week || reg.survivor_week || reg.week || reg.extra_json?.clinic_week || reg.extra_json?.survivor_week || reg.extra_json?.week;
      return regWeek === selectedWeek;
    });
    
    const weekParticipants = weekRegistrations.reduce((total, reg) => {
      const team = extractTeamInfo(reg);
      return total + (team.teamSize || 1);
    }, 0);
    
    const weekSpotsRemaining = Math.max(0, (eventConfig.maxRegistrations || 0) - weekParticipants);
    
    return { weekParticipants, weekSpotsRemaining };
  };

  const calculateSpotsRemaining = (): number => {
    if (eventConfig?.isRecurring && selectedClinicWeek) {
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

  const getCurrentWeekParticipants = (): number => {
    if (eventConfig?.isRecurring && selectedClinicWeek) {
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
            #{member.registration_number} • {new Date(member.timestamp).toLocaleDateString()}
          </div>
        </div>
      );
    }

    const clinicWeek = member.clinic_week || member.week || member.extra_json?.clinic_week || member.extra_json?.week;
    const survivorWeek = member.survivor_week || member.extra_json?.survivor_week;
    const weekDisplay = clinicWeek || survivorWeek;
    
    return (
      <div key={index} className="p-3 bg-gray-50 rounded border">
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0 truncate text-sm text-gray-800">
            {teamInfo.names[0] || "Registrant"}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
            #{member.registration_number}
          </div>
        </div>
        {weekDisplay && eventConfig?.isRecurring && (
          <div className="text-xs mt-1 flex items-center gap-1 text-blue-600">
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
        if (eventConfig?.isRecurring) {
          const selectedWeek = data.clinic_week || data.survivor_week || data.week;
          if (selectedWeek) {
            const weekRegistrations = registeredMembers.filter(reg => {
              const regWeek = reg.clinic_week || reg.survivor_week || reg.week || reg.extra_json?.clinic_week || reg.extra_json?.survivor_week || reg.extra_json?.week;
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
      } else {
        const { player_name, email, phone, division, wall, comments, clinic_week, survivor_week, week, ...extraFields } = data;

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

          ...(eventConfig?.isRecurring && (clinic_week || survivor_week || week) ? { 
            [clinic_week ? 'clinic_week' : survivor_week ? 'survivor_week' : 'week']: clinic_week || survivor_week || week 
          } : {}),

          extra_json: {
            ...extraFields,
            ...(eventConfig?.isRecurring && (clinic_week || survivor_week || week) ? { 
              [clinic_week ? 'clinic_week' : survivor_week ? 'survivor_week' : 'week']: clinic_week || survivor_week || week 
            } : {}),
          },

          registration_number: registrationCount + 1,
          is_waiting_list: isWaitingList,
          verification_token: verificationToken || undefined,
        };

        const result = await apiCall("submit_registration", registrationData);

        if (result.success) {
          let message = `Successfully registered ${data.player_name}`;
          if (eventConfig?.isRecurring && (data.clinic_week || data.survivor_week || data.week)) {
            message += ` for ${data.clinic_week || data.survivor_week || data.week}`;
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
      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onLogin={() => setIsAdminMode(true)}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && isAdminMode && (
        <AdminPanel
          eventConfigs={eventConfigs}
          onConfigChange={setEventConfigs}
          onClose={() => setShowAdminPanel(false)}
          apiCall={apiCall}
        />
      )}

      <div className="max-w-screen-2xl mx-auto">
        {/* Admin Button (Fixed Position) */}
        {isAdminMode ? (
          <button
            onClick={() => setShowAdminPanel(true)}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 z-40 flex items-center gap-2"
          >
            <Settings className="w-6 h-6" />
            <span className="hidden md:inline">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAdminLogin(true)}
            className="fixed bottom-6 right-6 bg-gray-600 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 z-40"
            title="Admin Login"
          >
            <Lock className="w-6 h-6" />
          </button>
        )}

        {/* Event Selector */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Select Event:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(eventConfigs).filter((id) => {
                const config = eventConfigs[id];
                
                if (!config.registrationCloseTime || config.registrationCloseTime === "") {
                  return true;
                }
                
                const now = new Date();
                const closeTime = new Date(config.registrationCloseTime);
                const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
                
                return closeTime > sevenDaysFromNow;
              }).map((id) => (
                <button
                  key={id}
                  onClick={() => changeEvent(id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentEventId === id ? `${themeClasses.bg} text-white` : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {eventConfigs[id].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Four Column Layout */}
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
                    <div className="text-gray-700">{renderFormat(eventConfig.format)}</div>
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
                <h1 className="text-3xl font-bold mb-2">{eventConfig.ui.title}</h1>
                <p className="text-green-100">{eventConfig.ui.subtitle}</p>
              </div>

              {/* Enhanced Stats Bar */}
              <div className="px-6 py-4 bg-gray-50 border-b">
                {eventConfig?.isRecurring ? (
                  <div className="space-y-3">
                    {selectedClinicWeek && (
                      <div className="text-center">
                        <div className={`text-sm font-medium mb-1 ${themeClasses.text}`}>Selected Week</div>
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
                  <div className={`grid ${currentEventId === "golf-tournament-2025" ? 'grid-cols-3' : 'grid-cols-2'} gap-4 text-sm`}>
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
                    </div>
                  </div>
                )}

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
                      </div>
                    </div>
                  </div>
                )}

                {!isInitializing && !isLoadingStats && isRegistrationOpen && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-6">
                      {/* Render form fields based on event config */}
                      {eventConfig.fields.map((field) => {
                        const errMsg = (errors as any)?.[field.name]?.message;

                        if (field.name === "player_name" && eventConfig?.rules?.requireMembership) {
                          return (
                            <div key={field.name}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {field.label} {field.required && "*"}
                              </label>
                              <div className="relative">
                                <input
                                  {...register("player_name", { 
                                    required: field.required ? `${field.label} is required` : false 
                                  })}
                                  type="text"
                                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${themeClasses.ring} focus:border-transparent ${
                                    errMsg ? "border-red-500" : "border-gray-300"
                                  }`}
                                  placeholder={field.placeholder}
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
                                    pattern: field.type === "email" 
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
                                  defaultValue={field.defaultValue || ""}
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

                    {submitSuccess && successMessage && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Registration Successful!</p>
                            <p className="text-sm text-green-700">{successMessage}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSubmitSuccess(false);
                              setSuccessMessage("");
                            }}
                            className="ml-auto text-green-400 hover:text-green-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {eventConfig?.notifications?.requireEmailVerification && !isVerified && codeSent && (
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
                        <>{isWaitingList ? "Join Waiting List" : `Register for ${eventConfig.name}`}</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Recent Registrations */}
          <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {eventConfig?.isRecurring ? "Weekly Registrations" : "Registrations"}
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
                {eventConfig?.isRecurring ? (
                  (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const fourWeeksFromNow = new Date(today);
                    fourWeeksFromNow.setDate(today.getDate() + (4 * 7));
                    
                    const weeklyGroups = registeredMembers.reduce((groups: Record<string, any[]>, member) => {
                      const week = member.clinic_week || member.survivor_week || member.week || member.extra_json?.clinic_week || member.extra_json?.survivor_week || member.extra_json?.week || "Unknown Week";
                      if (!groups[week]) groups[week] = [];
                      groups[week].push(member);
                      return groups;
                    }, {});

                    const filteredWeeks = Object.keys(weeklyGroups).filter(week => {
                      if (week === "Unknown Week") return true;
                      
                      try {
                        const dayName = eventConfig.recurringDayName || "Sunday";
                        const weekDate = new Date(week.replace(dayName + ", ", ''));
                        return weekDate >= today;
                      } catch {
                        return true;
                      }
                    });

                    const sortedWeeks = filteredWeeks.sort((a, b) => {
                      if (a === "Unknown Week") return 1;
                      if (b === "Unknown Week") return -1;
                      try {
                        const dayName = eventConfig.recurringDayName || "Sunday";
                        const dateA = new Date(a.replace(dayName + ", ", ''));
                        const dateB = new Date(b.replace(dayName + ", ", ''));
                        return dateA.getTime() - dateB.getTime();
                      } catch {
                        return 0;
                      }
                    });

                    if (sortedWeeks.length === 0) {
                      return (
                        <div className="text-center text-gray-500 py-8">
                          <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No upcoming sessions</p>
                        </div>
                      );
                    }

                    return sortedWeeks.map(week => {
                      return (
                        <div key={week} className="mb-4">
                          <div className="text-sm mb-2 flex items-center justify-between">
                            <span className="font-bold text-gray-700">{week}</span>
                            <span className={`text-xs px-2 py-1 rounded ${themeClasses.bgLight} ${themeClasses.text}`}>
                              {weeklyGroups[week].length}/{eventConfig.maxRegistrations}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {weeklyGroups[week].slice(0, 10).map((member, idx) => (
                              <div key={idx} className="text-sm px-2 py-1 bg-gray-50 rounded text-gray-600">
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
                  golfFoursomes.length === 0 ? (
                    <div className="text-sm text-gray-500">No registrations yet.</div>
                  ) : (
                    <div className="space-y-3">
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
                ) : (
                  (() => {
                    const confirmedRegistrations = registeredMembers
                      .filter((member: any) => !member.is_waiting_list)
                      .sort((a: any, b: any) => {
                        if (currentEventId === 'fall-pdl-8.0-2025') {
                          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                        }
                        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                      })
                      .slice(0, 50);

                    const waitingListRegistrations = registeredMembers
                      .filter((member: any) => member.is_waiting_list)
                      .sort((a: any, b: any) => {
                        if (currentEventId === 'fall-pdl-8.0-2025') {
                          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                        }
                        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                      })
                      .slice(0, 20);

                    return (
                      <>
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
                                  <div className="flex flex-col items-end gap-1 flex-shrink-0 text-xs text-green-600">
                                    <span>#{member.registration_number}</span>
                                    <span>{new Date(member.timestamp).toLocaleDateString()} at {new Date(member.timestamp).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

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
                                  <div className="flex flex-col items-end gap-1 flex-shrink-0 text-xs text-orange-600">
                                    <span>#{member.registration_number}</span>
                                    <span>{new Date(member.timestamp).toLocaleDateString()} at {new Date(member.timestamp).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}</span>
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