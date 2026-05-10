import React from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';

export default function Overview({ claimsOnHold, claimsClean, providersAtRisk, supervisionThreshold, auditLogs, alerts, setAlerts }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between">
          <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Icon name="banknote"/> Claims Held</p><p className="text-3xl font-black text-brand-navy mt-2">{claimsOnHold}</p></div>
          <p className="text-xs text-rose-600 font-bold mt-3 bg-rose-50 p-2 rounded-lg">Blocked by Scrubber</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Icon name="checkCircle"/> Clean Claims</p><p className="text-3xl font-black text-brand-navy mt-2">{claimsClean}</p></div>
          <p className="text-xs text-emerald-600 font-bold mt-3 bg-emerald-50 p-2 rounded-lg">Ready for Clearinghouse</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Icon name="userShield"/> {supervisionThreshold}% Rule Fails</p><p className="text-3xl font-black text-brand-navy mt-2">{providersAtRisk}</p></div>
          <p className="text-xs text-amber-600 font-bold mt-3 bg-amber-50 p-2 rounded-lg">RBTs below threshold</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Icon name="network"/> Audit Events</p><p className="text-3xl font-black text-brand-navy mt-2">{auditLogs.length}</p></div>
          <p className="text-xs text-blue-600 font-bold mt-3 bg-blue-50 p-2 rounded-lg">Immutable logs captured</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-black text-brand-navy flex items-center gap-2 mb-6">
          <Icon name="link" className="text-rose-500" /> Active System Alerts
        </h3>
        {alerts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <Icon name="checkCircle" className="text-emerald-400 text-4xl mb-3 block" />
            <p className="font-black text-slate-600 text-lg">No Active Alerts</p>
            <p className="text-sm text-slate-500 mt-1">Run the Live Scrub to generate real alerts based on your data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {alerts.map(alert => (
              <div key={alert.id} className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-[1.5rem] border bg-rose-50/50 border-rose-200">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge tone="red">Scrubber Alert</Badge>
                    <span className="text-[10px] font-bold text-slate-500">{alert.time}</span>
                  </div>
                  <h4 className="font-black text-lg text-rose-900">{alert.title}</h4>
                  <p className="text-sm mt-1 text-rose-700">{alert.desc}</p>
                </div>
                <button onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))} className="w-full sm:w-auto bg-white border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-rose-50 shadow-sm transition mt-2 sm:mt-0">
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
