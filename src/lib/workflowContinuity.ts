import type { TaskSourceBinding, WorkContext } from './contextCompiler.ts';

export interface WorkContextSnapshot {
  originLabel: string;
  originTitle: string;
  audience: string;
  channel: string;
  format: string;
  pillar: string;
  communicationJob: string;
  sourceBindings: TaskSourceBinding[];
  transformationTrail: Array<{ step: string; studio: string }>;
}

export function buildWorkContextSnapshot(params: {
  activeWorkItem?: any;
  fallbackOrigin?: string;
  fallbackTitle?: string;
  audience?: string;
  channel?: string;
  format?: string;
  pillar?: string;
  communicationJob?: string;
  sourceBindings?: TaskSourceBinding[];
  currentStudio: string;
}): WorkContextSnapshot {
  const wi = params.activeWorkItem;
  const wc: Partial<WorkContext> = wi?.workContext || {};

  let originLabel = params.fallbackOrigin || 'Standalone Studio Session';
  if (wi?.calendarItemId || wc.originatingItemType === 'calendar') {
    originLabel = 'Editorial Calendar';
  } else if (wi?.ideaId || wc.originatingItemType === 'idea') {
    originLabel = 'Ideation 2.0 Opportunity';
  } else if (wc.originatingItemType === 'source') {
    originLabel = 'Source Library';
  } else if (wc.originatingItemType === 'reframe' || wi?.reframeLineage) {
    originLabel = 'Reframing Studio';
  } else if (wc.originatingItemType === 'revision') {
    originLabel = 'Revision Studio';
  } else if (wc.origin) {
    originLabel = wc.origin;
  }

  const originTitle =
    wi?.title || wc.originTitle || params.fallbackTitle || 'Active COH Work Item';

  const audience = params.audience || wc.audience || wi?.audience || 'General Public';
  const channel = params.channel || wc.channel || wi?.channel || 'LinkedIn';
  const format = params.format || wc.format || wi?.format || 'Post';
  const pillar = params.pillar || wc.pillar || wi?.pillar || 'Climate Opera as Cultural IP';
  const communicationJob =
    params.communicationJob || wc.communicationJob || wi?.purpose || 'Build cultural authority';

  const sourceBindings =
    params.sourceBindings && params.sourceBindings.length > 0
      ? params.sourceBindings
      : wc.sourceBindings || [];

  const history = Array.isArray(wc.transformationHistory)
    ? wc.transformationHistory.map(h => ({ step: h.step, studio: h.studio }))
    : [];

  if (history.length === 0) {
    if (originLabel !== 'Standalone Studio Session' && originLabel !== params.currentStudio) {
      history.push({ step: 'Origin Handoff', studio: originLabel });
    }
    history.push({ step: 'Active Stage', studio: params.currentStudio });
  } else if (history[history.length - 1]?.studio !== params.currentStudio) {
    history.push({ step: 'Active Stage', studio: params.currentStudio });
  }

  return {
    originLabel,
    originTitle,
    audience,
    channel,
    format,
    pillar,
    communicationJob,
    sourceBindings,
    transformationTrail: history
  };
}
