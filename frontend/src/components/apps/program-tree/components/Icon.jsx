import React from "react";
import {
  BrainCircuit, BookOpen, Flag, Sparkles, ShieldCheck, Edit,
  Archive, User, Users, Home, Heart, Clock, Search, Copy, Download,
  Upload, AlertCircle, Lock, Database, Wand2, FileText, Settings, BarChart2,
  Plus, Trash2, UserCircle, Target, Smartphone, RefreshCw, Filter, Star,
  ArrowRight, Lightbulb, GraduationCap, X, Check
} from 'lucide-react';
import { cn } from '../utils';

const ICONS = {
  brain: <BrainCircuit size={18} />,
  library: <BookOpen size={18} />,
  flag: <Flag size={18} />,
  sparkles: <Sparkles size={18} />,
  shield: <ShieldCheck size={18} />,
  edit: <Edit size={18} />,
  check: <Check size={18} />,
  x: <X size={18} />,
  archive: <Archive size={18} />,
  user: <User size={18} />,
  family: <Users size={18} />,
  home: <Home size={18} />,
  heart: <Heart size={18} />,
  clock: <Clock size={18} />,
  search: <Search size={18} />,
  copy: <Copy size={18} />,
  download: <Download size={18} />,
  upload: <Upload size={18} />,
  alert: <AlertCircle size={18} />,
  lock: <Lock size={18} />,
  pool: <Database size={18} />,
  wand: <Wand2 size={18} />,
  note: <FileText size={18} />,
  settings: <Settings size={18} />,
  chart: <BarChart2 size={18} />,
  plus: <Plus size={18} />,
  trash: <Trash2 size={18} />,
  client: <UserCircle size={18} />,
  target: <Target size={18} />,
  phone: <Smartphone size={18} />,
  refresh: <RefreshCw size={18} />,
  filter: <Filter size={18} />,
  star: <Star size={18} />,
  arrow: <ArrowRight size={18} />,
  database: <Database size={18} />,
  lightbulb: <Lightbulb size={18} />,
  graduation: <GraduationCap size={18} />
};

export default function I({ name, className = "" }) {
  return (
    <span className={cn("inline-flex items-center justify-center", className)} aria-hidden="true">
      {ICONS[name] || <span className="w-4 h-4 rounded-full bg-slate-200"></span>}
    </span>
  );
}
