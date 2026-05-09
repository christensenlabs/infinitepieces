import React from 'react';
import {
  ShieldCheck, AlertTriangle, Shield as UserShield, FileText as FileSearch,
  Activity, Lock, Clock, CheckCircle, XCircle, Eye, Download, Scale as Filter,
  Mail, Zap, Banknote, BadgeCheck as BadgeIcon, Network, Brain, Server,
  RefreshCw, Link, Plus, Trash2
} from 'lucide-react';

const ICONS = {
  shieldCheck: <ShieldCheck size={18} />, alertTriangle: <AlertTriangle size={18} />, userShield: <UserShield size={18} />, fileSearch: <FileSearch size={18} />,
  activity: <Activity size={18} />, lock: <Lock size={18} />, clock: <Clock size={18} />, checkCircle: <CheckCircle size={18} />, xCircle: <XCircle size={18} />,
  eye: <Eye size={18} />, download: <Download size={18} />, filter: <Filter size={18} />, mail: <Mail size={18} />, zap: <Zap size={18} />,
  banknote: <Banknote size={18} />, badge: <BadgeIcon size={18} />, network: <Network size={18} />, brain: <Brain size={18} />, server: <Server size={18} />,
  refresh: <RefreshCw size={18} />, link: <Link size={18} />, plus: <Plus size={18} />, trash: <Trash2 size={18} />
};

export default function Icon({ name, className = "" }) {
  return <span className={`inline-flex items-center justify-center ${className}`}>{ICONS[name] || <div className="w-4 h-4 rounded-full bg-slate-200"></div>}</span>;
}
