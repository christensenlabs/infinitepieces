import React from 'react';
import { Icons } from '../Icons';

/**
 * Data-driven widget card. Renders based on a config object + live data.
 *
 * @param {Object} config - from widgetConfigs.js
 * @param {Object|null} data - API data for this widget's key
 * @param {Function} onQuickCommand - fires a Gemini quick command
 * @param {Function} onOpenApp - opens the named app
 */
export default function WidgetCard({ config, data, onQuickCommand, onOpenApp }) {
  const { theme, icon: IconComponent } = config;
  const items = config.formatItems(data);

  return (
    <div
      className={`${theme.bg} rounded-3xl p-6 shadow-sm border relative overflow-hidden flex flex-col`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 w-full h-1 ${theme.topColor}`} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-10 h-10 ${theme.iconBg} rounded-full flex items-center justify-center text-white`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-brand">
            {config.title}
            {config.badge && (
              <span
                className={`text-[8px] ${config.badge.className} px-1 py-0.5 rounded ml-1 uppercase`}
              >
                {config.badge.text}
              </span>
            )}
          </h4>
          <p className="text-[10px] text-slate-500">{config.subtitle}</p>
        </div>
      </div>

      {/* Section label */}
      <p className="text-xs font-bold text-slate-800 mb-3">{config.sectionLabel}</p>

      {/* Items */}
      <div className="space-y-3 mb-6 flex-1">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-sm text-slate-600 ${config.itemOpacity ? 'opacity-60' : ''}`}
          >
            <ItemIcon config={config} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 w-full mt-auto">
        <button
          onClick={() => onQuickCommand(config.quickPrompt)}
          className={`flex-1 ${theme.primaryBtn} py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1`}
        >
          <Icons.Sparkles className="w-3 h-3" /> {config.primaryLabel}
        </button>
        <button
          onClick={() => onOpenApp(config.appName)}
          className={`flex-1 ${theme.secondaryBtn} py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1`}
        >
          Open App <Icons.ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function ItemIcon({ config }) {
  if (config.itemIcon) {
    const Icon = config.itemIcon;
    return <Icon className={config.itemIconClass ?? 'w-4 h-4'} />;
  }
  if (config.itemIconFallback) {
    return <span className="w-4 text-center">{config.itemIconFallback}</span>;
  }
  return null;
}
