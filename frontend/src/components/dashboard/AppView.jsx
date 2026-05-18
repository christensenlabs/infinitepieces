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
import SupervisionCommandCenter from '../apps/supervision-command-center';
import TreatmentIntegrityLab from '../apps/treatment-integrity-lab';
import RiskGovernanceHub from '../apps/risk-governance-hub';
import OutcomesIntelligence from '../apps/outcomes-intelligence';
import GestaltAAC from '../apps/gestalt-aac';
import AuthWarRoom from '../apps/auth-war-room';
import ChartAudit from '../apps/chart-audit';
import IntakeBuilder from '../apps/intake-builder';
import CompetencyCredentialVault from '../apps/credential-vault';
import HIPAATrustCenter from '../apps/trust-center';
import APIIntegrationHub from '../apps/integration-hub';
import DeidentifiedOutcomesRegistry from '../apps/outcomes-registry';
import InfiniteComms from '../apps/infinite-comms';

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
  'Supervision': SupervisionCommandCenter,
  'Treatment Integrity': TreatmentIntegrityLab,
  'Risk & Governance': RiskGovernanceHub,
  'Outcomes Intelligence': OutcomesIntelligence,
  'Gestalt AAC': GestaltAAC,
  'Auth War Room': AuthWarRoom,
  'Chart Audit': ChartAudit,
  'Intake Builder': IntakeBuilder,
  'Credential Vault': CompetencyCredentialVault,
  'Trust Center': HIPAATrustCenter,
  'Integration Hub': APIIntegrationHub,
  'Outcomes Registry': DeidentifiedOutcomesRegistry,
  'Messages': InfiniteComms,
};

export default function AppView({ appName, onClose }) {
  const { apiKey } = useApp();
  const AppComponent = APP_COMPONENTS[appName];

  return (
    <div className="flex flex-col h-full z-20 absolute inset-0 pt-16">
      {/* Back-navigation header — always visible */}
      <div className="h-12 border-b border-white/10 flex items-center px-8 bg-black/40 backdrop-blur-md shrink-0 z-10">
        <button
          onClick={onClose}
          className="text-sm font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          <Icons.ArrowRight className="w-4 h-4 rotate-180" /> Back to Operations Hub
        </button>
        <span className="ml-auto font-black text-white flex items-center gap-2">
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
          <div className="h-full flex items-center justify-center bg-[#040811] p-8">
            <div className="text-center opacity-70 max-w-md mx-auto">
              <div className="w-20 h-20 bg-white/10 border border-white/10 rounded-3xl mx-auto flex items-center justify-center mb-6">
                <Icons.Apps className="w-10 h-10 text-cyan-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">{appName}</h2>
              <p className="text-sm font-bold mt-2 text-slate-400 leading-relaxed">
                This module is not yet connected.
              </p>
              <button
                onClick={onClose}
                className="mt-8 px-8 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
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
