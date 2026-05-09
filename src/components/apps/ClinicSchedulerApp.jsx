import React, { useState } from 'react';
import {
  BarChart2, Calendar, MessageSquare,
  Users, ShieldCheck,
  Plus, ChevronRight, MapPin, CheckCircle, X, AlertTriangle, ChevronLeft,
  Sparkles, Loader2, ClipboardList, Radio, Lock
} from 'lucide-react';
import { callGemini } from '../../lib/gemini';
import { useApiData } from '../../hooks/useApiData';
import { fetchSchedulerConfig } from '../../api/apps';

// --- HELPER: DATES ---
const getToday = () => new Date();
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};
const addDays = (date, days) => new Date(new Date(date).setDate(date.getDate() + days));
const formatDate = (date) => date.toISOString().split('T')[0];

export default function ClinicSchedulerApp({ apiKey }) {
  const { data: config } = useApiData(fetchSchedulerConfig);

  // --- ADMIN SECURITY STATE ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');
  const [pendingAdminAction, setPendingAdminAction] = useState(null);

  // SHARED LOCAL DATA (replaces Firebase collections)
  const [sessions, setSessions] = useState([]);
  const [shifts, setShifts] = useState([]);

  // UI State
  const [activeTab, setActiveTab] = useState('schedule');
  const [calView, setCalView] = useState('week');
  const [currentDate, setCurrentDate] = useState(getToday());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New Session Form State
  const [newSession, setNewSession] = useState({
    category: 'clinical', patientName: '', date: formatDate(getToday()), startTime: '09:00', endTime: '11:00', type: '1:1 Therapy', location: 'Clinic', staffName: ''
  });

  // Gemini Action States
  const [drafts, setDrafts] = useState({});
  const [isDrafting, setIsDrafting] = useState({});
  const [makeupSlots, setMakeupSlots] = useState({});
  const [isFindingMakeup, setIsFindingMakeup] = useState({});

  // Ops & AI Tool States
  const [smartInputText, setSmartInputText] = useState('');
  const [isSmartParsing, setIsSmartParsing] = useState(false);
  const [eodReport, setEodReport] = useState('');
  const [isGeneratingEod, setIsGeneratingEod] = useState(false);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [conflictReport, setConflictReport] = useState('');
  const [isMatchingStaff, setIsMatchingStaff] = useState(false);
  const [matchReason, setMatchReason] = useState('');

  // --- ADMIN SECURITY LOGIC ---
  const requireAdmin = (action) => {
    if (isAdminAuthenticated) {
      action();
    } else {
      setPendingAdminAction(() => action);
      setShowAdminLoginModal(true);
    }
  };

  const handleAdminPinSubmit = (e) => {
    e.preventDefault();
    const pin = config?.adminPin || '000000';
    if (adminPin === pin) {
      setIsAdminAuthenticated(true);
      setShowAdminLoginModal(false);
      setAdminPin('');
      setAdminError('');
      if (pendingAdminAction) {
        pendingAdminAction();
      }
      setPendingAdminAction(null);
    } else {
      setAdminError('Incorrect Access PIN.');
    }
  };

  const cancelAdminLogin = () => {
    setShowAdminLoginModal(false);
    setAdminPin('');
    setAdminError('');
    setPendingAdminAction(null);
  };


  // --- ACTIONS: LOCAL STATE (replaces Firebase writes) ---
  const handleAddSession = (e) => {
    e.preventDefault();
    const sessionId = `sess_${Date.now()}`;
    setSessions(prev => [...prev, {
      id: sessionId,
      ...newSession,
      status: 'scheduled',
      createdAt: Date.now()
    }].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')));
    setIsAddModalOpen(false);
    const defaultSession = config?.defaultSession || {
      category: 'clinical', patientName: '', date: formatDate(getToday()), startTime: '09:00', endTime: '11:00', type: '1:1 Therapy', location: 'Clinic', staffName: ''
    };
    setNewSession({ ...defaultSession, date: formatDate(getToday()) });
    setMatchReason('');
  };

  const saveSession = () => {
    if (!selectedSession) return;
    setSessions(prev => prev.map(s => s.id === selectedSession.id ? selectedSession : s));
    setSelectedSession(null);
  };

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setSelectedSession(null);
  };

  const reportException = (type) => {
    if (!selectedSession) return;
    // Update the session status
    setSessions(prev => prev.map(s =>
      s.id === selectedSession.id
        ? { ...s, status: type, dispatchNote: type === 'staff_callout' ? 'Staff emergency' : 'Parent cancelled' }
        : s
    ));
    // Create a shift entry
    setShifts(prev => [{
      id: `shift_${Date.now()}`,
      clientName: selectedSession.patientName,
      date: selectedSession.date,
      startTime: selectedSession.startTime,
      endTime: selectedSession.endTime,
      location: selectedSession.location,
      status: 'uncovered',
      source: type,
      timestamp: Date.now()
    }, ...prev]);
    setSelectedSession(null);
  };

  const dispatchToPool = (shift) => {
    const bounty = config?.defaultBounty || 35;
    setShifts(prev => prev.map(s =>
      s.id === shift.id ? { ...s, status: 'dispatched', bounty } : s
    ));
  };

  const markResolved = (shiftId) => {
    setShifts(prev => prev.map(s =>
      s.id === shiftId ? { ...s, status: 'resolved' } : s
    ));
  };

  // --- AI HANDLERS ---
  const generateDraft = async (shift, actionType) => {
    setIsDrafting(prev => ({...prev, [shift.id + actionType]: true}));
    let prompt = "";
    const name = shift.clientName || shift.patientName || "Client";
    if (actionType === 'to_pool') prompt = `Draft a short, urgent SMS to an ABA clinic's staff pool for emergency coverage. Patient: ${name} | Loc: ${shift.location || 'Clinic'}. End with "Reply YES to claim". Under 3 sentences.`;
    else if (actionType === 'to_parent') prompt = `Draft a warm, professional text to the parent of ${name}. Acknowledge their cancellation. Ask them to reply with 2 preferred days/times next week to schedule a makeup session. Under 3 sentences.`;
    else if (actionType === 'to_rbt') prompt = `Draft a quick, direct text to ABA technician. Inform them their session with ${name} was just cancelled by the parent. Tell them to check the portal for a replacement session or admin task. Under 2 sentences.`;

    try {
      const result = await callGemini(prompt, apiKey, "You are a professional ABA clinic scheduler composing SMS messages.");
      setDrafts(prev => ({...prev, [shift.id + actionType]: (result || '').trim()}));
    } catch {
      setDrafts(prev => ({...prev, [shift.id + actionType]: "Error generating draft."}));
    } finally {
      setIsDrafting(prev => ({...prev, [shift.id + actionType]: false}));
    }
  };

  const handleFindMakeup = async (shift) => {
    setIsFindingMakeup(prev => ({...prev, [shift.id]: true}));
    try {
      const activeSessions = sessions.filter(s => s.status === 'scheduled').map(s => ({ date: s.date, start: s.startTime, end: s.endTime, staff: s.staffName }));
      const prompt = `A parent cancelled a session for: ${shift.clientName || shift.patientName}. Current active schedule: ${JSON.stringify(activeSessions)}. Today is ${formatDate(getToday())}. Suggest 2 specific dates/times in the next 3 days where there is a gap in the schedule to offer a makeup session. Keep it to 2 short bullet points.`;
      const result = await callGemini(prompt, apiKey, "You are an analytical scheduling assistant optimizing clinic utilization.");
      setMakeupSlots(prev => ({...prev, [shift.id]: (result || '').trim()}));
    } catch {
      setMakeupSlots(prev => ({...prev, [shift.id]: "Error finding makeup slots."}));
    } finally {
      setIsFindingMakeup(prev => ({...prev, [shift.id]: false}));
    }
  };

  const handleMagicFill = async () => {
    if (!smartInputText.trim()) return;
    setIsSmartParsing(true);
    try {
      const prompt = `Extract scheduling details from the following text and return ONLY a valid JSON object. Keys must be exactly: "patientName", "date" (YYYY-MM-DD format), "startTime" (HH:MM format, 24-hour), "endTime" (HH:MM format, 24-hour), "type" (choose from: '1:1 Therapy', 'Group Therapy', or 'Parent Training'), "location", "staffName". Today's date is ${formatDate(getToday())}. Infer missing details logically. Text: "${smartInputText}"`;
      const result = await callGemini(prompt, apiKey, "You are a precise data extraction API. Return raw JSON without markdown formatting.");
      const cleanedJSON = (result || '').replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedJSON);
      setNewSession(prev => ({ ...prev, ...parsedData }));
      setSmartInputText('');
    } catch {
      alert("AI couldn't fully parse that format. Please ensure it contains clear times/dates.");
    } finally {
      setIsSmartParsing(false);
    }
  };

  const handleAutoMatchStaff = async () => {
    setIsMatchingStaff(true);
    setMatchReason('');
    try {
      const staffPool = config?.staffPool || ['Sarah Jenkins', 'David Chen', 'Amanda Rivera'];
      const prompt = `Suggest the best staff member for this new session based on typical clinical profiles. Patient: ${newSession.patientName || 'Unknown Patient'} Service Type: ${newSession.type}. Available Staff Mock Pool: ${staffPool.join(', ')}. Return ONLY a valid JSON object with exactly two keys: "staffName" and "reason" (a 1-sentence explanation).`;
      const result = await callGemini(prompt, apiKey, "You are a precise data extraction API. Return raw JSON without markdown formatting.");
      const cleanedJSON = (result || '').replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedJSON);
      setNewSession(prev => ({ ...prev, staffName: parsedData.staffName }));
      setMatchReason(parsedData.reason);
    } catch {
      setMatchReason("Failed to auto-match. Please select manually.");
    } finally {
      setIsMatchingStaff(false);
    }
  };

  const handleCheckConflicts = async () => {
    setIsCheckingConflicts(true);
    try {
      const dayStr = formatDate(currentDate);
      const daySessions = sessions.filter(s => s.date === dayStr).map(s => ({ patient: s.patientName, staff: s.staffName, start: s.startTime, end: s.endTime, location: s.location }));
      const prompt = `Review this schedule data for today (${dayStr}) to identify ANY double-bookings for staff/patients, or extremely tight travel times between locations. Keep your response to 2-3 concise, actionable bullet points. If there are no conflicts, confidently state "Schedule is clean and optimized." Data: ${JSON.stringify(daySessions)}`;
      const result = await callGemini(prompt, apiKey, "You are an expert ABA Clinic Operations Manager auditing schedules.");
      setConflictReport((result || '').trim());
    } catch {
      setConflictReport("Error analyzing schedule.");
    } finally {
      setIsCheckingConflicts(false);
    }
  };

  const handleGenerateEOD = async () => {
    setIsGeneratingEod(true);
    try {
      const activeCount = sessions.filter(s => s.status === 'scheduled' || s.status === 'completed').length;
      const exceptionCount = shifts.filter(s => s.status === 'uncovered').length;
      const prompt = `Write a highly professional End-of-Day (EOD) Operations Summary. Data: ${activeCount} successful/active sessions, ${exceptionCount} unresolved cancellations/call-outs. Format: Provide exactly 3 short bullet points highlighting operational status, recovered revenue, and priority tasks for tomorrow morning.`;
      const result = await callGemini(prompt, apiKey, "You are an AI assistant to the ABA Schedule Director.");
      setEodReport((result || '').trim());
    } catch {
      setEodReport("Error generating EOD report.");
    } finally {
      setIsGeneratingEod(false);
    }
  };

  // --- CALENDAR RENDERING ---
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (calView === 'day') newDate.setDate(newDate.getDate() - 1);
    if (calView === 'week') newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (calView === 'day') newDate.setDate(newDate.getDate() + 1);
    if (calView === 'week') newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getStatusStyles = (status) => {
    switch(status) {
      case 'staff_callout': return 'bg-red-50 border-red-300 border-l-4 border-l-red-500 hover:bg-red-100';
      case 'parent_cancel': return 'bg-orange-50 border-orange-300 border-l-4 border-l-orange-500 hover:bg-orange-100';
      case 'completed': return 'bg-slate-100 border-slate-200 border-l-4 border-l-slate-400 opacity-60';
      default: return 'bg-white border-slate-200 border-l-4 border-l-blue-500 hover:bg-slate-50';
    }
  };

  const renderCalendar = () => {
    const startWeek = getStartOfWeek(currentDate);
    const days = Array.from({ length: 7 }).map((_, i) => addDays(startWeek, i));
    const clinicalSessions = sessions.filter(s => s.category !== 'admin');

    if (calView === 'day') {
      const dayStr = formatDate(currentDate);
      const daySessions = clinicalSessions.filter(s => s.date === dayStr);
      return (
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto mt-4">
           <h3 className="text-xl font-bold text-slate-800 mb-6">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
           {daySessions.length === 0 ? (
             <div className="text-center py-12 text-slate-400">No clinical sessions scheduled for this day.</div>
           ) : (
             <div className="space-y-3">
               {daySessions.map(session => (
                 <div key={session.id} onClick={() => requireAdmin(() => setSelectedSession(session))} className={`p-4 rounded-lg cursor-pointer transition-colors shadow-sm ${getStatusStyles(session.status)}`}>
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-xs font-bold bg-white/60 px-2 py-1 rounded text-slate-700 shadow-sm">{session.startTime} - {session.endTime}</span>
                       <h4 className="font-bold text-slate-900 text-lg mt-2">{session.patientName}</h4>
                       <p className="text-sm text-slate-600 flex items-center mt-1"><MapPin size={14} className="mr-1"/> {session.location} | <Users size={14} className="ml-2 mr-1"/> Staff: {session.staffName || 'Unassigned'}</p>
                     </div>
                     {session.status === 'staff_callout' && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center"><AlertTriangle size={12} className="mr-1"/> Staff Callout</span>}
                     {session.status === 'parent_cancel' && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center"><AlertTriangle size={12} className="mr-1"/> Parent Cancelled</span>}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      );
    }

    if (calView === 'week') {
      return (
        <div className="grid grid-cols-7 gap-3 flex-1 overflow-y-auto min-h-0 mt-4 custom-scrollbar">
          {days.map((day, i) => {
            const dayStr = formatDate(day);
            const daySessions = clinicalSessions.filter(s => s.date === dayStr);
            const isToday = day.toDateString() === getToday().toDateString();

            return (
              <div key={`col-${i}`} className="flex flex-col h-full min-w-[120px]">
                <div className={`p-3 text-center rounded-t-xl border border-b-0 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <p className={`text-2xl font-light ${isToday ? 'text-blue-700 font-bold' : 'text-slate-800'}`}>{day.getDate()}</p>
                </div>
                <div className={`flex-1 bg-white border border-slate-200 p-2 space-y-2 rounded-b-xl overflow-y-auto custom-scrollbar ${isToday ? 'bg-blue-50/20 border-blue-200' : ''}`}>
                  {daySessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => requireAdmin(() => setSelectedSession(session))}
                      className={`p-2.5 rounded cursor-pointer transition-colors shadow-sm ${getStatusStyles(session.status)}`}
                    >
                      <div className="text-[10px] font-bold text-slate-500 mb-1">{session.startTime}</div>
                      <div className="font-bold text-slate-800 text-sm leading-tight truncate">{session.patientName}</div>
                      <div className="text-[10px] text-slate-600 truncate mt-1">{session.staffName || 'Unassigned'}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const renderDashboard = () => {
    const totalSessions = sessions.length;
    const exceptionCount = shifts.filter(s => s.status === 'uncovered').length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const multiplier = config?.billableHoursMultiplier || 2;
    const billableHours = (totalSessions - exceptionCount) * multiplier;
    const fillRate = totalSessions > 0 ? Math.round(((totalSessions - exceptionCount) / totalSessions) * 100) : 100;

    return (
      <div className="space-y-6 fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">Schedule Fill Rate</h3>
            <p className="text-3xl font-bold text-slate-800">{fillRate}%</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">Total Exceptions</h3>
            <p className="text-3xl font-bold text-red-600">{exceptionCount}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">Completed Sessions</h3>
            <p className="text-3xl font-bold text-slate-800">{completed}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">Est. Billable Hours</h3>
            <p className="text-3xl font-bold text-green-600">{billableHours}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4">Operations Status</h3>
            {totalSessions === 0 ? (
              <p className="text-slate-500 text-sm">No scheduling data available. Add sessions to populate metrics.</p>
            ) : (
              <div className="space-y-4">
                 <p className="text-sm text-slate-700"><strong>Database Active:</strong> Connected to real-time clinical index.</p>
                 <p className="text-sm text-slate-700"><strong>Total Scheduled Events:</strong> {totalSessions}</p>
                 <p className="text-sm text-slate-700"><strong>System Health:</strong> Awaiting action on {exceptionCount} exceptions.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Executive Reporting</h3>
              <button
                onClick={handleGenerateEOD} disabled={isGeneratingEod}
                className="text-xs bg-[#0b132b] text-yellow-400 px-3 py-1.5 rounded-lg font-bold flex items-center hover:bg-[#152243] disabled:opacity-50 transition-colors shadow-sm"
              >
                {isGeneratingEod ? <Loader2 size={14} className="mr-1.5 animate-spin"/> : <Sparkles size={14} className="mr-1.5"/>}
                Generate EOD Summary
              </button>
            </div>
            {eodReport ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap flex-1 leading-relaxed fade-in">{eodReport}</div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50">
                <ClipboardList className="text-slate-300 mb-2" size={24}/>
                <p className="text-sm text-slate-500 text-center px-4">Click to generate an AI-powered End-of-Day summary.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDispatches = () => {
    const activeDispatches = shifts.filter(s => s.status === 'uncovered' || s.status === 'parent_cancel');

    return (
      <div className="fade-in space-y-6 overflow-y-auto flex-1 pb-10 custom-scrollbar">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tri-Channel Dispatch Hub</h2>
            <p className="text-slate-500 text-sm mt-1">Intercepted Parent Cancellations and Staff Exceptions stream here automatically.</p>
          </div>
          <span className={`${activeDispatches.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-bold px-4 py-2 rounded-lg shrink-0`}>
            {activeDispatches.length} Active Alerts
          </span>
        </div>

        {activeDispatches.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 bg-white rounded-xl">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" />
            <p className="text-slate-600 font-medium text-lg">Inbox Zero</p>
            <p className="text-slate-400">All sessions are currently staffed and running smoothly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDispatches.map(dispatch => (
              <div key={dispatch.id} className="bg-white border-l-4 border-l-slate-800 border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center mb-2 flex-wrap gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-orange-100 text-orange-700">Coverage Needed</span>
                      <h3 className="font-bold text-slate-800 text-lg">{dispatch.clientName || dispatch.patientName}</h3>
                    </div>
                    {dispatch.date && <p className="text-sm text-slate-600 flex items-center"><Calendar size={14} className="mr-2"/> {dispatch.date} at {dispatch.startTime}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                     <button onClick={() => dispatchToPool(dispatch)} className="px-4 py-2 bg-[#00E5FF] text-[#0A1220] font-black uppercase tracking-widest rounded-lg text-xs shadow-md hover:bg-cyan-300 transition-colors flex items-center gap-1.5"><Radio size={14} /> Dispatch SubPool</button>
                     <button onClick={() => markResolved(dispatch.id)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-lg text-sm transition-colors whitespace-nowrap shadow-sm">Mark Resolved</button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tri-Channel AI Communications</h4>
                   <div className="flex flex-wrap gap-3">
                       <button onClick={() => generateDraft(dispatch, 'to_parent')} disabled={isDrafting[dispatch.id + 'to_parent']} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center disabled:opacity-50 shadow-sm">{isDrafting[dispatch.id + 'to_parent'] ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Text Parent</button>
                       <button onClick={() => handleFindMakeup(dispatch)} disabled={isFindingMakeup[dispatch.id]} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 flex items-center disabled:opacity-50 shadow-sm">{isFindingMakeup[dispatch.id] ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Find Makeup Slots</button>
                       <button onClick={() => generateDraft(dispatch, 'to_rbt')} disabled={isDrafting[dispatch.id + 'to_rbt']} className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 flex items-center disabled:opacity-50 shadow-sm">{isDrafting[dispatch.id + 'to_rbt'] ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Notify RBT</button>
                   </div>
                   {(drafts[dispatch.id + 'to_parent'] || drafts[dispatch.id + 'to_rbt']) && (
                     <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm fade-in">
                       <div className="space-y-3">
                         {['to_parent', 'to_rbt'].map(type => {
                           if (!drafts[dispatch.id + type]) return null;
                           return (
                             <div key={type} className="border border-slate-100 bg-slate-50 rounded p-3">
                               <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{type === 'to_parent' ? 'To Parents:' : 'To Assigned RBT:'}</span>
                               <textarea className="w-full text-sm text-slate-800 bg-transparent outline-none resize-none font-medium" rows={2} value={drafts[dispatch.id + type]} onChange={(e) => setDrafts(prev => ({...prev, [dispatch.id + type]: e.target.value}))}/>
                             </div>
                           )
                         })}
                       </div>
                     </div>
                   )}
                   {makeupSlots[dispatch.id] && (
                     <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm fade-in">
                        <p className="text-xs font-bold text-emerald-800 mb-2 uppercase flex items-center"><Sparkles size={12} className="mr-1"/> AI Makeup Slot Suggestions</p>
                        <p className="text-sm text-emerald-900 whitespace-pre-wrap">{makeupSlots[dispatch.id]}</p>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#f3f4f6]">
      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .zoom-in-95 { animation: zoomIn 0.2s ease-out forwards; }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* --- ADMIN LOGIN MODAL --- */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[100] p-4 backdrop-blur-md fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden zoom-in-95">
            <div className="bg-[#0b132b] p-6 text-center text-white relative">
              <Lock className="w-10 h-10 mx-auto text-yellow-400 mb-3" />
              <h2 className="text-xl font-bold">Admin Verification</h2>
              <p className="text-xs text-slate-300 mt-1">Enter your operations PIN to access this feature.</p>
              <button onClick={cancelAdminLogin} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdminPinSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider text-center">Secure PIN</label>
                <input
                  type="password"
                  autoFocus
                  maxLength={6}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full text-center text-2xl tracking-[0.5em] border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0b132b] font-mono"
                  placeholder="••••••"
                />
              </div>
              {adminError && <p className="text-red-500 text-xs text-center font-bold mb-4 bg-red-50 p-2 rounded">{adminError}</p>}
              <button type="submit" className="w-full bg-[#0b132b] text-white font-bold py-3 rounded-xl hover:bg-[#152243] transition-all shadow-md">
                Unlock Operations
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 w-[260px] bg-[#0b132b] text-slate-300 flex flex-col shadow-2xl z-30 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <button className="flex-1 flex items-center justify-between text-sm bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors mr-2">
            <div className="flex flex-col text-left">
              <span className="font-bold">Enterprise Admin</span>
              <span className="text-xs text-slate-400 mt-0.5">Primary Clinic</span>
            </div>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X size={24} /></button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto custom-scrollbar">
          {[
            { id: 'schedule', icon: Calendar, label: 'Master Schedule', requiresAdmin: false },
            { id: 'dispatches', icon: MessageSquare, label: 'Dispatches', requiresAdmin: true, badge: shifts.filter(s => s.status === 'uncovered' || s.status === 'parent_cancel').length || null },
            { id: 'dashboard', icon: BarChart2, label: 'Ops Dashboard', requiresAdmin: true },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.requiresAdmin) {
                  requireAdmin(() => { setActiveTab(item.id); setIsSidebarOpen(false); });
                } else {
                  setActiveTab(item.id); setIsSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                activeTab === item.id
                ? 'bg-[#152243] text-yellow-400 border-l-4 border-yellow-400 shadow-md'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-4">
                <item.icon size={20} />
                <span className={activeTab === item.id ? 'font-bold' : ''}>
                  {item.label}
                  {item.requiresAdmin && !isAdminAuthenticated && <Lock size={12} className="inline ml-2 opacity-50 mb-1"/>}
                </span>
              </div>
              {item.badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#080d1e] flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden flex-shrink-0 border-2 border-slate-700">
             <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-indigo-600">
               {isAdminAuthenticated ? 'AD' : 'UI'}
             </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{isAdminAuthenticated ? 'Operations Admin' : 'Viewer Mode'}</p>
            <p className="text-[10px] text-green-400 flex items-center"><span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span> {isAdminAuthenticated ? 'Unlocked' : 'Read-Only'}</p>
          </div>
          {isAdminAuthenticated && (
             <button onClick={() => {setIsAdminAuthenticated(false); setActiveTab('schedule');}} className="text-slate-500 hover:text-red-400" title="Lock Session">
               <Lock size={16} />
             </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-600 hover:text-slate-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-[#0b132b] tracking-tight">Scheduling Operations</h2>
          </div>
          <div className="flex items-center space-x-5">
            <button
              onClick={() => requireAdmin(() => setIsAddModalOpen(true))}
              className="bg-[#0b132b] text-yellow-400 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center hover:bg-[#152243] shadow-md transition-colors"
            >
              {!isAdminAuthenticated && <Lock size={12} className="mr-1.5 opacity-70" />}
              <Plus size={16} className="sm:mr-2"/> <span className="hidden sm:inline">New Session</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc] flex flex-col custom-scrollbar">
          <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col space-y-6 min-h-0">

            {activeTab === 'schedule' && (
              <>
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0">
                  <div className="flex flex-wrap items-center gap-4">
                    <button onClick={() => setCurrentDate(getToday())} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">Today</button>
                    <div className="flex items-center space-x-1 border border-slate-300 rounded-lg p-1">
                      <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><ChevronLeft size={18} /></button>
                      <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><ChevronRight size={18} /></button>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0b132b]">
                      {calView === 'week' ? `Week of ${getStartOfWeek(currentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => requireAdmin(handleCheckConflicts)}
                      disabled={isCheckingConflicts || sessions.length === 0}
                      className="flex items-center px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
                    >
                      {isCheckingConflicts ? <Loader2 size={16} className="animate-spin mr-2"/> : <ShieldCheck size={16} className="mr-2"/>}
                      Audit Schedule
                    </button>

                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 w-full sm:w-auto">
                      {['day', 'week'].map(v => (
                        <button
                          key={v} onClick={() => setCalView(v)}
                          className={`flex-1 sm:px-6 py-1.5 text-sm font-bold rounded-md capitalize transition-colors ${calView === v ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {conflictReport && (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start shadow-sm shrink-0 fade-in">
                    <ShieldCheck className="text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-1">AI Schedule Audit Report</h4>
                      <p className="text-sm text-rose-900 whitespace-pre-wrap">{conflictReport}</p>
                      <button onClick={() => setConflictReport('')} className="mt-2 text-xs font-bold text-rose-600 hover:underline">Dismiss</button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col flex-1 overflow-hidden min-h-0 relative">
                  {!isAdminAuthenticated && (
                     <div className="absolute top-2 right-2 z-10 bg-slate-800/80 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center shadow-md backdrop-blur-sm pointer-events-none">
                       <Lock size={10} className="mr-1.5" /> Read Only Mode
                     </div>
                  )}
                  {renderCalendar()}
                </div>
              </>
            )}

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'dispatches' && renderDispatches()}

          </div>
        </main>
      </div>

      {/* MODAL: ADD SESSION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#0b132b]/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-8 zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0b132b]">Create Session</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-[#0b132b]"><X size={24}/></button>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex bg-slate-100 rounded-lg p-1 mb-6 border border-slate-200">
                <button type="button" onClick={() => setNewSession({...newSession, category: 'clinical'})} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-colors ${newSession.category !== 'admin' ? 'bg-white shadow-sm text-[#0b132b]' : 'text-slate-500 hover:text-slate-700'}`}>Clinical (Billable)</button>
                <button type="button" onClick={() => setNewSession({...newSession, category: 'admin'})} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-colors ${newSession.category === 'admin' ? 'bg-white shadow-sm text-[#0b132b]' : 'text-slate-500 hover:text-slate-700'}`}>Admin / Non-Billable</button>
              </div>

              {newSession.category === 'clinical' && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <label className="block text-xs font-bold text-blue-800 mb-2 uppercase tracking-wider flex items-center"><Sparkles size={12} className="mr-1"/> AI Magic Fill</label>
                  <div className="flex space-x-2">
                    <input
                      type="text" value={smartInputText} onChange={(e) => setSmartInputText(e.target.value)}
                      placeholder='e.g., "Leo needs 1:1 tmrw at 2pm"'
                      className="flex-1 bg-white border border-blue-300 focus:border-blue-500 p-2 rounded-lg text-sm outline-none w-full"
                    />
                    <button
                      type="button" onClick={handleMagicFill} disabled={isSmartParsing || !smartInputText}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center shrink-0"
                    >
                      {isSmartParsing ? <Loader2 size={16} className="animate-spin" /> : 'Parse'}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddSession} className="space-y-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-1.5">{newSession.category === 'admin' ? 'Task / Event Name' : 'Patient Name'}</label><input required type="text" value={newSession.patientName} onChange={e=>setNewSession({...newSession, patientName: e.target.value})} className="w-full border border-slate-300 focus:border-[#0b132b] p-2.5 rounded-lg text-sm outline-none transition-all"/></div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">Assigned Staff {newSession.category === 'clinical' && '(Optional)'}</label>
                    {newSession.category === 'clinical' && (
                      <button type="button" onClick={handleAutoMatchStaff} disabled={isMatchingStaff} className="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center disabled:opacity-50">
                        {isMatchingStaff ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Sparkles size={12} className="mr-1" />}
                        Auto-Match Fit
                      </button>
                    )}
                  </div>
                  <input type="text" value={newSession.staffName} onChange={e=>setNewSession({...newSession, staffName: e.target.value})} className="w-full border border-slate-300 focus:border-[#0b132b] p-2.5 rounded-lg text-sm outline-none transition-all"/>
                  {matchReason && newSession.category === 'clinical' && <p className="text-xs text-blue-700 mt-2 bg-blue-50 p-2 rounded border border-blue-100 flex items-start"><Sparkles size={12} className="mr-1.5 mt-0.5 flex-shrink-0"/> {matchReason}</p>}
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1.5">Date</label><input required type="date" value={newSession.date} onChange={e=>setNewSession({...newSession, date: e.target.value})} className="w-full border border-slate-300 focus:border-[#0b132b] p-2.5 rounded-lg text-sm outline-none"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-slate-700 mb-1.5">Start Time</label><input required type="time" value={newSession.startTime} onChange={e=>setNewSession({...newSession, startTime: e.target.value})} className="w-full border border-slate-300 focus:border-[#0b132b] p-2.5 rounded-lg text-sm outline-none"/></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1.5">End Time</label><input required type="time" value={newSession.endTime} onChange={e=>setNewSession({...newSession, endTime: e.target.value})} className="w-full border border-slate-300 focus:border-[#0b132b] p-2.5 rounded-lg text-sm outline-none"/></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {newSession.category !== 'admin' ? (
                    <div><label className="block text-sm font-bold text-slate-700 mb-1.5">Service Type</label><select value={newSession.type} onChange={e=>setNewSession({...newSession, type: e.target.value})} className="w-full border border-slate-300 focus:border-[#0b132b] p-2.5 rounded-lg text-sm outline-none bg-white">{(config?.sessionTypes?.clinical || ['1:1 Therapy', 'Group Therapy', 'Parent Training']).map(t => <option key={t}>{t}</option>)}</select></div>
                  ) : (
                    <div><label className="block text-sm font-bold text-slate-700 mb-1.5">Work Type</label><select value={newSession.type} onChange={e=>setNewSession({...newSession, type: e.target.value})} className="w-full border border-slate-300 focus:border-[#0b132b] p-2.5 rounded-lg text-sm outline-none bg-white">{(config?.sessionTypes?.admin || ['Prep / Planning', 'Drive Time', 'Meeting', 'Other Non-Billable']).map(t => <option key={t}>{t}</option>)}</select></div>
                  )}
                  <div><label className="block text-sm font-bold text-slate-700 mb-1.5">Location</label><input required type="text" value={newSession.location} onChange={e=>setNewSession({...newSession, location: e.target.value})} className="w-full border border-slate-300 focus:border-[#0b132b] p-2.5 rounded-lg text-sm outline-none"/></div>
                </div>
                <button type="submit" className="w-full bg-[#0b132b] text-white font-bold py-3.5 rounded-xl mt-8 hover:bg-[#152243] transition-all text-sm shadow-md">{newSession.category === 'admin' ? 'Book Admin Work' : 'Book onto Master Grid'}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SESSION DETAILS & OPS ACTIONS */}
      {selectedSession && (
        <div className="fixed inset-0 bg-[#0b132b]/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col zoom-in-95 max-h-[90vh]">
            <div className={`bg-[#0b132b] text-white px-6 py-5 flex items-center justify-between border-b-[4px] ${selectedSession.category === 'admin' ? 'border-slate-500' : 'border-yellow-500'} shrink-0`}>
              <div>
                <h2 className="text-xl font-bold">{selectedSession.patientName}</h2>
                <p className="text-slate-300 text-xs mt-1">{selectedSession.date} | {selectedSession.startTime} - {selectedSession.endTime}</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">

              {selectedSession.category !== 'admin' && (
                <div className="mb-6 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Report Exception to Dispatch</h3>
                  <p className="text-xs text-slate-600 mb-3">If this session cannot be completed as scheduled, report it below to route it to the Action Queue.</p>
                  <div className="flex gap-3">
                    <button onClick={() => reportException('staff_callout')} className="flex-1 bg-white border border-red-200 text-red-600 font-bold py-2 rounded-lg hover:bg-red-50 text-xs sm:text-sm shadow-sm transition-colors">
                      Staff Call-out
                    </button>
                    <button onClick={() => reportException('parent_cancel')} className="flex-1 bg-white border border-orange-200 text-orange-600 font-bold py-2 rounded-lg hover:bg-orange-50 text-xs sm:text-sm shadow-sm transition-colors">
                      Parent Cancelled
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Edit Scheduling Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">Date</label><input type="date" value={selectedSession.date} onChange={e => setSelectedSession({...selectedSession, date: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0b132b]" /></div>
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">Staff Assigned</label><input type="text" value={selectedSession.staffName} onChange={e => setSelectedSession({...selectedSession, staffName: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0b132b]" /></div>
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">Start Time</label><input type="time" value={selectedSession.startTime} onChange={e => setSelectedSession({...selectedSession, startTime: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0b132b]" /></div>
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">End Time</label><input type="time" value={selectedSession.endTime} onChange={e => setSelectedSession({...selectedSession, endTime: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0b132b]" /></div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1">Status Override</label>
                   <select value={selectedSession.status} onChange={e => setSelectedSession({...selectedSession, status: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0b132b] bg-white">
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                   </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button onClick={() => deleteSession(selectedSession.id)} className="text-red-500 text-xs font-bold hover:underline">Delete</button>
              <div className="flex space-x-3">
                <button onClick={() => setSelectedSession(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded-lg transition-colors">Cancel</button>
                <button onClick={saveSession} className="bg-[#0b132b] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#152243] transition-colors">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
