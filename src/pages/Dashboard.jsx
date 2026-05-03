import React, { useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGeminiAction } from '../hooks/useGeminiAction';
import { useApiData } from '../hooks/useApiData';
import { fetchCurrentUser } from '../api/user';
import { fetchNotifications } from '../api/notifications';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AppView from '../components/dashboard/AppView';
import HubContent from '../components/dashboard/HubContent';
import SettingsModal from '../components/dashboard/SettingsModal';
import CopilotModal from '../components/dashboard/CopilotModal';

const COPILOT_SYSTEM_TEXT =
  "You are the central AI Assistant for Infinite Suite OS, an enterprise ABA clinic management platform. Answer the clinic administrator's query professionally, concisely, and accurately.";

export default function Dashboard() {
  const [activeApp, setActiveApp] = useState(null);
  const [apiKey, setApiKey] = useLocalStorage('infinity_api_key');
  const [showSettings, setShowSettings] = useState(false);
  const [aiCommandOpen, setAiCommandOpen] = useState(false);

  const onMissingKey = useCallback(() => setShowSettings(true), []);

  const briefing = useGeminiAction(apiKey, { onMissingKey });
  const copilot = useGeminiAction(apiKey, { onMissingKey });
  const surge = useGeminiAction(apiKey, { onMissingKey });

  const { data: user } = useApiData(fetchCurrentUser);
  const { data: notifications } = useApiData(fetchNotifications);

  const handleQuickCommand = useCallback(
    (promptText) => {
      setAiCommandOpen(true);
      copilot.execute(promptText, COPILOT_SYSTEM_TEXT);
    },
    [copilot],
  );

  return (
    <div className="flex h-screen w-full bg-[#F4F7FB] font-sans overflow-hidden">
      <Sidebar
        user={user}
        notificationCount={notifications?.unread ?? 0}
        onNavigateHub={() => setActiveApp(null)}
        onOpenSettings={() => setShowSettings(true)}
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
          onClose={() => setShowSettings(false)}
        />
      )}

      {aiCommandOpen && (
        <CopilotModal copilot={copilot} onClose={() => setAiCommandOpen(false)} />
      )}
    </div>
  );
}
