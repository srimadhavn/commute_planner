import { PriorityType } from '../types/api';

export interface PlanParams {
  from: string;
  to: string;
  priority: PriorityType;
  parking: number;
}

export function useUrlState() {
  const getParams = (): PlanParams => {
    if (typeof window === 'undefined') {
      return { from: '', to: '', priority: 'balanced', parking: 10 };
    }
    const params = new URLSearchParams(window.location.search);
    const priorityParam = params.get('priority');
    const priority: PriorityType =
      priorityParam === 'fastest' ||
      priorityParam === 'cheapest' ||
      priorityParam === 'greenest' ||
      priorityParam === 'balanced'
        ? priorityParam
        : 'balanced';

    const parkingParam = params.get('parking');
    const parking = parkingParam !== null && !isNaN(Number(parkingParam))
      ? Math.min(Math.max(Number(parkingParam), 0), 100)
      : 10;

    return {
      from: params.get('from') || '',
      to: params.get('to') || '',
      priority,
      parking,
    };
  };

  const updateUrl = (newParams: Partial<PlanParams>) => {
    if (typeof window === 'undefined') return;
    const current = new URLSearchParams(window.location.search);

    if (newParams.from !== undefined) {
      if (newParams.from) current.set('from', newParams.from);
      else current.delete('from');
    }

    if (newParams.to !== undefined) {
      if (newParams.to) current.set('to', newParams.to);
      else current.delete('to');
    }

    if (newParams.priority !== undefined) {
      if (newParams.priority !== 'balanced') current.set('priority', newParams.priority);
      else current.delete('priority');
    }

    if (newParams.parking !== undefined) {
      if (newParams.parking !== 10) current.set('parking', newParams.parking.toString());
      else current.delete('parking');
    }

    const newQuery = current.toString();
    const newRelativePathQuery = window.location.pathname + (newQuery ? `?${newQuery}` : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  };

  return { getParams, updateUrl };
}
