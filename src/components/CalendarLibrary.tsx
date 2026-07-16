import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Copy, Eye, FolderOpen, Archive } from 'lucide-react';
import { Button } from './ui/Button';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/storage';
import { executeExport } from '../utils/exportUtils';

export interface SavedCalendar {
  id: string; // The specific version ID
  calendarId?: string; // The master calendar series ID
  title: string;
  planningMonth: string;
  planningYear: string;
  createdAt: string;
  updatedAt: string;
  generatedDate: string;
  versionNumber: number;
  primaryStrategicFocus: string;
  secondaryStrategicFocus: string;
  avoidFocus: string;
  primaryAudience: string;
  secondaryAudience: string;
  activeChannels: string[];
  channelAudienceMap: Record<string, { primary: string; secondary: string; objective: string }>;
  publishingIntensity: string;
  masterMonthlyArc: any;
  weeklyArcs: string[];
  channelSubArcs: Record<string, string>;
  calendarItems: any[];
  calendarReview: any;
  approvedItemCount: number;
  draftHandoffCount: number;
  draftedItemCount?: number;
  sourceReadinessStatus: string;
  exportStatus?: string;
  status: 'Draft' | 'Needs Improvement' | 'Approved' | 'Archived';
}

interface Props {
  onOpenCalendar: (calendar: SavedCalendar) => void;
}

export const CalendarLibrary: React.FC<Props> = ({ onOpenCalendar }) => {
  const [calendars, setCalendars] = useState<SavedCalendar[]>([]);

  useEffect(() => {
    const loaded = safeLocalStorageGet('coh_saved_calendars_v1', []);
    if (Array.isArray(loaded)) {
      setCalendars(loaded);
    }
  }, []);

  const saveToStorage = (updated: SavedCalendar[]) => {
    setCalendars(updated);
    safeLocalStorageSet('coh_saved_calendars_v1', updated);
  };

  const handleDuplicate = (cal: SavedCalendar) => {
    const duplicate: SavedCalendar = {
      ...cal,
      id: `cal-${Math.random().toString(36).substr(2, 9)}`,
      title: `${cal.title} (Copy)`,
      versionNumber: cal.versionNumber + 1,
      generatedDate: new Date().toISOString(),
      status: 'Draft'
    };
    saveToStorage([duplicate, ...calendars]);
  };

  const handleArchive = (id: string) => {
    saveToStorage(calendars.map(c => c.id === id ? { ...c, status: 'Archived' } : c));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this calendar?')) {
      saveToStorage(calendars.filter(c => c.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      <div className="bg-surface-primary border-b border-border-standard p-6 shrink-0 flex justify-between items-center">
        <div>
          <h2 className="page-title">
            Calendar Library
          </h2>
          <p className="page-subtitle">Manage and load saved editorial calendars across different versions.</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calendars.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-surface-primary border border-dashed border-violet-300 rounded">
              <Calendar size={48} className="text-brand-gold/30 mb-4" />
              <p className="text-text-secondary font-medium">No saved calendars yet.</p>
              <p className="text-xs text-text-muted mt-1">Generate and save calendars in the Studio.</p>
            </div>
          ) : (
            calendars.map(cal => (
              <div key={cal.id} className="bg-surface-primary border border-border-standard p-5 rounded shadow-sm hover:shadow transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-text-primary font-sans text-lg">{cal.title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      cal.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      cal.status === 'Archived' ? 'bg-surface-primary text-text-secondary' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {cal.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-text-secondary mb-4">
                    <p><span className="font-bold text-text-primary">Month:</span> {cal.planningMonth} {cal.planningYear} (v{cal.versionNumber})</p>
                    <p><span className="font-bold text-text-primary">Primary Focus:</span> {cal.primaryStrategicFocus}</p>
                    <p><span className="font-bold text-text-primary">Audience:</span> {cal.primaryAudience}</p>
                    <p><span className="font-bold text-text-primary">Items:</span> {cal.calendarItems.length} ({cal.approvedItemCount} approved)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border-standard">
                  <Button variant="primary" onClick={() => onOpenCalendar(cal)} className="text-xs py-1 px-2 flex-1 flex justify-center">
                    <Eye size={14} className="mr-1" /> Open
                  </Button>
                  <Button variant="outline" onClick={() => handleDuplicate(cal)} className="text-xs py-1 px-2 flex-1 flex justify-center">
                    <Copy size={14} className="mr-1" /> Copy
                  </Button>
                  <Button variant="outline" onClick={() => handleArchive(cal.id)} className="text-xs py-1 px-2 flex-1 flex justify-center">
                    <Archive size={14} className="mr-1" /> Archive
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(cal.id)} className="text-xs py-1 px-2 text-red-600 border-red-200 hover:bg-red-500/10 backdrop-blur-md">
                    <Trash2 size={14} />
                  </Button>
                  <select 
                    className="flex-1 bg-surface-primary border border-border-standard text-text-primary text-[10px] font-semibold px-1 py-1 rounded outline-none cursor-pointer hover:border-violet-300 transition"
                    onChange={(e) => {
                      if (e.target.value) {
                        executeExport(e.target.value, cal.calendarItems, cal);
                        e.target.value = '';
                      }
                    }}
                    value=""
                  >
                    <option value="" disabled>Export...</option>
                    <option value="planning-csv">Planning CSV</option>
                    <option value="planning-excel">Planning Excel</option>
                    <option value="hootsuite-csv">Hootsuite CSV</option>
                    <option value="hootsuite-excel">Hootsuite Review Excel</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
