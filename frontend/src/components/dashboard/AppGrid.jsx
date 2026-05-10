import React from 'react';
import { Icons } from '../Icons';
import AppIconBtn from '../AppIconBtn';
import { mockApps } from '../../api/mock/data';

export default function AppGrid({ onOpenApp }) {
  return (
    <section>
      <h3 className="text-sm font-black text-brand mb-4">
        Infinite Suite Bookcases (Click to Open)
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {mockApps.map((app) => {
          const IconComponent = Icons[app.icon];
          return (
            <AppIconBtn
              key={app.key}
              title={app.title}
              icon={IconComponent ? <IconComponent className="w-6 h-6" /> : null}
              onClick={() => onOpenApp(app.appName)}
            />
          );
        })}
      </div>
    </section>
  );
}
