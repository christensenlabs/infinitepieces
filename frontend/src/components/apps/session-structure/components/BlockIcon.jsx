import React from 'react';
import {
  BrainCircuit, Clock, Users, UserPlus, Zap, Brush, Utensils, Map,
} from 'lucide-react';

export default function BlockIcon({ cat }) {
  switch (cat) {
    case 'Group': return <Users className="w-5 h-5 text-emerald-500" />;
    case 'Social': return <UserPlus className="w-5 h-5 text-fuchsia-500" />;
    case 'ABA': return <BrainCircuit className="w-5 h-5 text-rose-500" />;
    case 'Motor': return <Zap className="w-5 h-5 text-orange-500" />;
    case 'Fine Motor': return <Brush className="w-5 h-5 text-teal-500" />;
    case 'Routine': return <Utensils className="w-5 h-5 text-amber-500" />;
    case 'Arrival': return <Map className="w-5 h-5 text-indigo-500" />;
    default: return <Clock className="w-5 h-5 text-slate-400" />;
  }
}
