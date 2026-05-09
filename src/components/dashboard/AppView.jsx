import React from 'react';
import { Icons } from '../Icons';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useApp } from '../../context/AppContext';
import ClinicSchedulerApp from '../apps/clinic-scheduler';
import SubPoolMarketPlace from '../apps/sub-pool-marketplace';
import ComplianceSentinelApp from '../apps/compliance-sentinel';
import DataFlowProApp from '../apps/data-flow-pro';
import ABAPocketRBTMentor from '../apps/aba-pocket-rbt';
import BCBAPocket from '../apps/bcba-pocket';
import MaterialMakerApp from '../apps/material-maker';
import ProgramTreeApp from '../apps/program-tree';
import SessionStructureApp from '../apps/session-structure';
import CaregiverPortalApp from '../apps/caregiver-portal';
import ZoneMateApp from '../apps/zone-mate';

const APP_COMPONENTS = {
  'Scheduling': ClinicSchedulerApp,
  'SubPool Market': SubPoolMarketPlace,
  'Compliance': ComplianceSentinelApp,
  'Data Flow': DataFlowProApp,
  'Provider Assistant': ABAPocketRBTMentor,
  'BCBA Assistant': BCBAPocket,
  'Material Maker': MaterialMakerApp,
  'Program Hub': ProgramTreeApp,
  'Session Maker': SessionStructureApp,
  'Caregiver Portal': CaregiverPortalApp,
  'ZoneMate': ZoneMateApp,
};

export default function AppView({ appName, onClose }) {
  const { apiKey } = useApp();
  const AppComponent = APP_COMPONENTS[appName];

  return (
    <div className="flex flex-col h-full bg-slate-100 z-20 absolute inset-0 pt-16">
      {/* Back-navigation header — always visible */}
      <div className="h-12 border-b border-slate-200 flex items-center px-8 bg-white shrink-0 shadow-sm">
        <button
          onClick={onClose}
          className="text-sm font-bold text-slate-500 hover:text-[#12214A] flex items-center gap-2 transition-colors"
        >
          <Icons.ArrowRight className="w-4 h-4 rotate-180" /> Back to Operations Hub
        </button>
        <span className="ml-auto font-black text-[#12214A] flex items-center gap-2">
          <Icons.Apps className="w-4 h-4 text-cyan-500" /> {appName}
        </span>
      </div>

      {/* App content */}
      <div className="flex-1 overflow-auto">
        {AppComponent ? (
          <ErrorBoundary>
            <AppComponent apiKey={apiKey} onClose={onClose} />
          </ErrorBoundary>
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-50 p-8">
            <div className="text-center opacity-70 max-w-md">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm">
                <Icons.Apps className="w-10 h-10 text-cyan-500" />
              </div>
              <h2 className="text-3xl font-black text-[#0B132B] mb-2">{appName}</h2>
              <p className="text-sm font-bold mt-2 text-slate-500 leading-relaxed">
                This module is not yet connected.
              </p>
              <button
                onClick={onClose}
                className="mt-8 bg-[#12214A] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-900 transition-colors"
              >
                Close App
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
