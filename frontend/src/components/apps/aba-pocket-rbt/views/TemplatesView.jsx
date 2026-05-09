import React from 'react';

export default function TemplatesView({ behaviorTemplates, setQuickIntForm, onTabChange }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <p className="text-slate-600 mb-6 text-sm font-medium">Select a topography to pre-fill the Quick Intervention tool with clinical starting points.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {behaviorTemplates.map((template, idx) => (
          <div key={idx} onClick={() => {
              setQuickIntForm({ behavior: template.name, function: template.function });
              onTabChange('quick');
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-400 hover:ring-1 hover:ring-indigo-400 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{template.name}</h3>
            </div>
            <span className="inline-block mb-3 text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">{template.function}</span>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{template.context}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
