import React from 'react';
import { useApiData } from '../../hooks/useApiData';
import { fetchMetrics } from '../../api/metrics';
import { fetchShifts } from '../../api/shifts';
import { fetchWidgetData } from '../../api/widgets';
import KPICard from '../KPICard';
import MorningBriefing from './MorningBriefing';
import SubPoolSection from './SubPoolSection';
import AppGrid from './AppGrid';
import WidgetCard from './WidgetCard';
import { WIDGET_CONFIGS } from './widgetConfigs';

const KPI_LAYOUT = [
  { key: 'sessionRecovery', title: 'Session Recovery', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { key: 'staffUtilization', title: 'Staff Utilization', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { key: 'retentionLift', title: 'Retention Lift', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { key: 'familyEngagement', title: 'Family Engagement', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
];

/**
 * @param {Object} props
 * @param {Object} props.briefing - useGeminiAction hook
 * @param {Object} props.surge - useGeminiAction hook
 * @param {Function} props.onOpenApp
 * @param {Function} props.onQuickCommand - (promptText) => void
 */
export default function HubContent({ briefing, surge, onOpenApp, onQuickCommand }) {
  const { data: metrics } = useApiData(fetchMetrics);
  const { data: shifts } = useApiData(fetchShifts);
  const { data: widgetData } = useApiData(fetchWidgetData);

  return (
    <div className="flex-1 overflow-y-auto p-8 pb-20 space-y-8">
      <MorningBriefing briefing={briefing} />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {KPI_LAYOUT.map((kpi) => (
          <KPICard
            key={kpi.key}
            title={kpi.title}
            metric={metrics?.[kpi.key] ?? null}
            iconBg={kpi.iconBg}
            iconColor={kpi.iconColor}
          />
        ))}
      </div>

      <SubPoolSection shifts={shifts} surge={surge} />

      <AppGrid onOpenApp={onOpenApp} />

      {/* Bottom widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {WIDGET_CONFIGS.map((config) => (
          <WidgetCard
            key={config.key}
            config={config}
            data={widgetData?.[config.key] ?? null}
            onQuickCommand={onQuickCommand}
            onOpenApp={onOpenApp}
          />
        ))}
      </section>
    </div>
  );
}
