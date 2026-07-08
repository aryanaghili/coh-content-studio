import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { safeLocalStorageGet } from './storage';
import type { CalendarItem, EditorialCycle } from '../components/EditorialCalendarStudio';

const HOOTSUITE_HEADERS = [
  "Scheduled Time",
  "Social Account",
  "Account Name",
  "Organization",
  "Campaign",
  "Content Type",
  "Post Status",
  "Content",
  "Author",
  "Attached Media",
  "Media Links",
  "Link To Published Post",
  "Tags",
  "Instagram Product Tags",
  "Alt Text",
  "Submitted For Approval",
  "Approved By",
  "Approval History",
  "Rejector",
  "Rejection Note",
  "Approved Time",
  "Rejected Time",
  "Tik Tok Privacy Settings",
  "Notes For Publisher",
  "Pinterest Board + Website",
  "Is Boosted",
  "Marked as approved (Yes/no)",
  "Approval Note"
];

const SUPPORTED_CHANNELS = ['LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'X', 'Twitter'];

const SOCIAL_ACCOUNT_MAP: Record<string, string> = {
  'LinkedIn': 'LinkedIn Company',
  'Instagram': 'Instagram Business',
  'Facebook': 'Facebook Page',
  'TikTok': 'Tiktok',
  'X': 'Twitter',
  'Twitter': 'Twitter'
};

const ACCOUNT_NAME_MAP: Record<string, string> = {
  'LinkedIn Company': 'Climate Opera Haus',
  'Instagram Business': 'climateoperahaus',
  'Facebook Page': 'Climate Opera Haus',
  'Tiktok': 'climateoperahaus',
  'Twitter': 'Climateopera'
};

const CONTENT_TYPE_MAP: Record<string, string> = {
  'Instagram Reel': 'Reel',
  'Video': 'Video',
  'Image': 'Image',
  'Carousel': 'Carousel',
  'Post': 'Post'
};

const getSavedContentMap = () => {
  const contentDocs = safeLocalStorageGet('coh_saved_content_v1', []);
  const map: Record<string, any> = {};
  if (Array.isArray(contentDocs)) {
    contentDocs.forEach((doc: any) => {
      if (doc.calendarItemId) {
        map[doc.calendarItemId] = doc;
      }
    });
  }
  return map;
};

const formatHootsuiteDate = (dateStr: string, channel: string): string => {
  if (!dateStr) return '01/01/2024 10:00:00';
  const parts = dateStr.split('-');
  let time = '10:00:00';
  if (channel === 'LinkedIn') time = '08:30:00';
  if (channel === 'Instagram') time = '17:00:00';
  return `${parts[1]}/${parts[2]}/${parts[0]} ${time}`;
};

export const mapItemToHootsuiteRow = (item: CalendarItem, cycle: any, contentMap: Record<string, any>, isFallback: boolean = false) => {
  const accountType = SOCIAL_ACCOUNT_MAP[item.channel] || '';
  const isSupported = SUPPORTED_CHANNELS.includes(item.channel);
  
  const savedContent = contentMap[item.id];
  const finalCopy = savedContent?.finalCopy || savedContent?.text || '';
  
  const hasFinalCopy = finalCopy.trim().length > 0;
  const isReady = ['Ready for Publishing', 'Scheduled', 'Approved'].includes(item.status);

  let statusWarning = '';
  if (!isSupported) statusWarning += 'Unsupported Channel. ';
  if (!hasFinalCopy && !isFallback) statusWarning += 'Missing final copy. ';
  if (!isReady && !isFallback) statusWarning += 'Not approved/scheduled. ';
  if ((item as any).sourceWarning || item.status === 'Needs Source') statusWarning += 'Unresolved source warning. ';

  const isBoosted = 'No';
  const organization = "Aryan Aghili's Organization";
  const campaign = cycle.title || `COH Editorial Calendar - ${cycle.planningMonth}`;
  const contentType = CONTENT_TYPE_MAP[item.format] || '';
  const postStatus = 'Scheduled';
  const content = hasFinalCopy ? finalCopy : (isFallback ? item.editorialThesis : '');
  const author = 'Design Studio';
  const attachedMedia = ['Image', 'Video', 'Carousel'].includes(item.visualDirection) ? item.visualDirection : (item.visualDirection ? 'Image' : '');
  const mediaLinks = item.visualDirection && item.visualDirection.startsWith('http') ? item.visualDirection : '';
  const tiktokPrivacy = item.channel === 'TikTok' ? 'Allow Comments, Allow Duet, Allow Stitch' : '';
  const markedApproved = isReady ? 'Yes' : '';

  let defaultTimeNote = 'Default time used, confirm before scheduling. ';
  
  const notes = `${defaultTimeNote}Generated from COH Content Studio. Calendar ID: ${cycle.id}. Item ID: ${item.id}. Source Basis: ${item.sourceBasis}. Proof Needed: ${item.proofNeeded}. Risk To Avoid: ${item.riskToAvoid}.`;

  return {
    row: {
      "Scheduled Time": formatHootsuiteDate(item.date, item.channel),
      "Social Account": accountType,
      "Account Name": accountType ? ACCOUNT_NAME_MAP[accountType] : '',
      "Organization": organization,
      "Campaign": campaign,
      "Content Type": contentType,
      "Post Status": postStatus,
      "Content": content,
      "Author": author,
      "Attached Media": attachedMedia,
      "Media Links": mediaLinks,
      "Link To Published Post": '',
      "Tags": item.pillar || '',
      "Instagram Product Tags": '',
      "Alt Text": '',
      "Submitted For Approval": '',
      "Approved By": '',
      "Approval History": '',
      "Rejector": '',
      "Rejection Note": '',
      "Approved Time": '',
      "Rejected Time": '',
      "Tik Tok Privacy Settings": tiktokPrivacy,
      "Notes For Publisher": notes,
      "Pinterest Board + Website": '',
      "Is Boosted": isBoosted,
      "Marked as approved (Yes/no)": markedApproved,
      "Approval Note": ''
    },
    isValid: isSupported && hasFinalCopy && isReady && statusWarning === '',
    statusWarning
  };
};

export const executeExport = (format: string, items: CalendarItem[], cycle: any) => {
  const contentMap = getSavedContentMap();
  let filename = `Editorial_Calendar_${cycle.planningMonth}`;

  if (format.endsWith('excel')) {
    const workbook = XLSX.utils.book_new();

    // 1. Overview
    const overviewData = [
      { Parameter: 'Calendar Title', Value: cycle.title || `Editorial Calendar - ${cycle.planningMonth}` },
      { Parameter: 'Primary Focus', Value: cycle.primaryStrategicFocus },
      { Parameter: 'Secondary Focus', Value: cycle.secondaryStrategicFocus },
      { Parameter: 'Avoid Focus', Value: cycle.avoidFocus },
      { Parameter: 'Primary Audience', Value: cycle.primaryAudience },
      { Parameter: 'Publishing Intensity', Value: cycle.intensity },
      { Parameter: 'Total Items', Value: items.length },
      { Parameter: 'Approved Items', Value: items.filter(i => i.status === 'Approved').length }
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(overviewData), "Calendar Overview");

    // 2. Items
    const itemsData = items.map(i => ({
      'Date': i.date, 'Channel': i.channel, 'Format': i.format, 'Type': i.contentUnitType, 'Title': i.title,
      'Audience': i.audience, 'Strategic Focus': i.primaryFocus, 'Secondary Focus': i.secondaryFocus,
      'Editorial Thesis': i.editorialThesis, 'Core Message': i.coreMessage, 'Source Basis': i.sourceBasis,
      'Proof Needed': i.proofNeeded, 'Visual Direction': i.visualDirection, 'Suggested CTA': i.suggestedCTA,
      'Risk to Avoid': i.riskToAvoid, 'Status': i.status
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(itemsData), "Calendar Items");

    if (format === 'hootsuite-excel') {
      filename += '_Hootsuite_Review';
      const hootsuiteRows: any[] = [];
      const excludedRows: any[] = [];
      const warningsRows: any[] = [];

      let hasValidItems = false;
      for (const item of items) {
        const mapped = mapItemToHootsuiteRow(item, cycle, contentMap, false);
        if (mapped.isValid) {
          hootsuiteRows.push(mapped.row);
          hasValidItems = true;
        } else {
          excludedRows.push(item);
          warningsRows.push({
            'Item Title': item.title,
            'Channel': item.channel,
            'Warning': mapped.statusWarning
          });
        }
      }

      if (!hasValidItems && window.confirm('No Hootsuite-ready items found. Complete final copy, approval, scheduled time, and media requirements before exporting. Would you like to export all proposed items as drafts instead?')) {
        for (const item of items) {
          const mapped = mapItemToHootsuiteRow(item, cycle, contentMap, true);
          if (SUPPORTED_CHANNELS.includes(item.channel)) {
            hootsuiteRows.push(mapped.row);
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(hootsuiteRows, { header: HOOTSUITE_HEADERS }), "Hootsuite Ready Items");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(excludedRows), "Excluded From Hootsuite Export");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(warningsRows), "Missing Fields and Warnings");

    } else {
      filename += '_Planning';
    }

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } else if (format.endsWith('csv')) {
    if (format === 'hootsuite-csv') {
      filename += '_Hootsuite';
      let exportItems: any[] = [];
      
      let hasValidItems = false;
      for (const item of items) {
        const mapped = mapItemToHootsuiteRow(item, cycle, contentMap, false);
        if (mapped.isValid) {
          exportItems.push(mapped.row);
          hasValidItems = true;
        }
      }

      if (!hasValidItems) {
        if (window.confirm('No Hootsuite-ready items found. Complete final copy, approval, scheduled time, and media requirements before exporting. Would you like to export all supported items as drafts instead?')) {
          for (const item of items) {
            if (SUPPORTED_CHANNELS.includes(item.channel)) {
              const mapped = mapItemToHootsuiteRow(item, cycle, contentMap, true);
              exportItems.push(mapped.row);
            }
          }
        } else {
          return;
        }
      }

      const csv = Papa.unparse(exportItems, { header: true, columns: HOOTSUITE_HEADERS });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } else {
      filename += '_Planning';
      const itemsData = items.map(i => ({
        'Date': i.date, 'Channel': i.channel, 'Format': i.format, 'Type': i.contentUnitType, 'Title': i.title,
        'Audience': i.audience, 'Strategic Focus': i.primaryFocus, 'Secondary Focus': i.secondaryFocus,
        'Editorial Thesis': i.editorialThesis, 'Core Message': i.coreMessage, 'Source Basis': i.sourceBasis,
        'Proof Needed': i.proofNeeded, 'Visual Direction': i.visualDirection, 'Suggested CTA': i.suggestedCTA,
        'Risk to Avoid': i.riskToAvoid, 'Status': i.status
      }));
      const csv = Papa.unparse(itemsData, { header: true });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
