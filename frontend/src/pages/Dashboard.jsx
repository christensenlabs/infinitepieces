import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useGeminiAction } from '../hooks/useGeminiAction';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AppView from '../components/dashboard/AppView';
import HubContent from '../components/dashboard/HubContent';
import SettingsModal from '../components/dashboard/SettingsModal';
import CopilotModal from '../components/dashboard/CopilotModal';

const COPILOT_SYSTEM_TEXT =
  "You are the central AI Assistant for Infinite Suite OS, an enterprise ABA clinic management platform. Answer the clinic administrator's query professionally, concisely, and accurately.";

export default function Dashboard() {
  const { apiKey, setApiKey, user, notifications, showSettings, openSettings, closeSettings } = useApp();

  const [activeApp, setActiveApp] = useState(null);
  const [aiCommandOpen, setAiCommandOpen] = useState(false);

  const onMissingKey = useCallback(() => openSettings(), [openSettings]);

  const briefing = useGeminiAction(apiKey, { onMissingKey });
  const copilot = useGeminiAction(apiKey, { onMissingKey });
  const surge = useGeminiAction(apiKey, { onMissingKey });

  const handleQuickCommand = useCallback(
    (promptText) => {
      setAiCommandOpen(true);
      copilot.execute(promptText, COPILOT_SYSTEM_TEXT);
    },
    [copilot],
  );

  return (
    <div className="flex h-screen w-full bg-surface font-sans overflow-hidden">
      <Sidebar
        user={user}
        notificationCount={notifications?.unread ?? 0}
        onNavigateHub={() => setActiveApp(null)}
        onOpenSettings={openSettings}
        onOpenApp={setActiveApp}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader user={user} onOpenCopilot={() => setAiCommandOpen(true)} />

        {activeApp ? (
          <AppView appName={activeApp} onClose={() => setActiveApp(null)} />
        ) : (
          <HubContent
            briefing={briefing}
            surge={surge}
            onOpenApp={setActiveApp}
            onQuickCommand={handleQuickCommand}
          />
        )}
      </main>

      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onClose={closeSettings}
        />
      )}

      {aiCommandOpen && (
        <CopilotModal copilot={copilot} onClose={() => setAiCommandOpen(false)} />
      )}
    </div>
  );
}
