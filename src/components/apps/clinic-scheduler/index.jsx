import React, { useState } from 'react';
import { Plus, Lock } from 'lucide-react';
import { callGemini } from '../../../lib/gemini';
import { useApiData } from '../../../hooks/useApiData';
import { fetchSchedulerConfig } from '../../../api/apps';
import { getToday, formatDate } from './utils';

import AdminLoginModal from './components/AdminLoginModal';
import Sidebar from './components/Sidebar';
import AddSessionModal from './components/AddSessionModal';
import SessionDetailModal from './components/SessionDetailModal';
import ScheduleView from './views/ScheduleView';
import DashboardView from './views/DashboardView';
import DispatchesView from './views/DispatchesView';

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
        <AdminLoginModal
          adminPin={adminPin}
          setAdminPin={setAdminPin}
          adminError={adminError}
          onSubmit={handleAdminPinSubmit}
          onCancel={cancelAdminLogin}
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
        requireAdmin={requireAdmin}
        shifts={shifts}
      />

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
              <ScheduleView
                sessions={sessions}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                calView={calView}
                setCalView={setCalView}
                requireAdmin={requireAdmin}
                setSelectedSession={setSelectedSession}
                isAdminAuthenticated={isAdminAuthenticated}
                isCheckingConflicts={isCheckingConflicts}
                handleCheckConflicts={handleCheckConflicts}
                conflictReport={conflictReport}
                setConflictReport={setConflictReport}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                sessions={sessions}
                shifts={shifts}
                config={config}
                eodReport={eodReport}
                isGeneratingEod={isGeneratingEod}
                handleGenerateEOD={handleGenerateEOD}
              />
            )}

            {activeTab === 'dispatches' && (
              <DispatchesView
                shifts={shifts}
                dispatchToPool={dispatchToPool}
                markResolved={markResolved}
                drafts={drafts}
                setDrafts={setDrafts}
                isDrafting={isDrafting}
                generateDraft={generateDraft}
                makeupSlots={makeupSlots}
                isFindingMakeup={isFindingMakeup}
                handleFindMakeup={handleFindMakeup}
              />
            )}

          </div>
        </main>
      </div>

      {/* MODAL: ADD SESSION */}
      {isAddModalOpen && (
        <AddSessionModal
          newSession={newSession}
          setNewSession={setNewSession}
          onSubmit={handleAddSession}
          onClose={() => setIsAddModalOpen(false)}
          config={config}
          smartInputText={smartInputText}
          setSmartInputText={setSmartInputText}
          isSmartParsing={isSmartParsing}
          onMagicFill={handleMagicFill}
          isMatchingStaff={isMatchingStaff}
          onAutoMatchStaff={handleAutoMatchStaff}
          matchReason={matchReason}
        />
      )}

      {/* MODAL: SESSION DETAILS & OPS ACTIONS */}
      {selectedSession && (
        <SessionDetailModal
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          saveSession={saveSession}
          deleteSession={deleteSession}
          reportException={reportException}
        />
      )}
    </div>
  );
}
