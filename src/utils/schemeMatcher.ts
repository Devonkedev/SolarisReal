import subsidySchemes, { SubsidyScheme, ConsumerSegment } from '../data/subsidySchemes';

export interface SubsidyUserProfile {
  state: string;
  consumerSegment: ConsumerSegment;
  ownsProperty: boolean;
  annualConsumptionKWh?: number;
  monthlyBillUnits?: number;
  roofAreaSqm?: number;
  isGridConnected?: boolean;
}

export interface MatchedScheme {
  scheme: SubsidyScheme;
  matchScore: number;
  reasons: string[];
}

export type SchemeCoverage = SubsidyScheme['coverage'];

export interface SchemeFilters {
  coverage?: SchemeCoverage[];
  states?: string[];
  consumerSegments?: ConsumerSegment[];
  subsidyTypes?: string[];
  tags?: string[];
  requiresOwnership?: boolean;
  gridConnection?: 'grid' | 'off-grid';
}

export interface MatchOptions {
  limit?: number;
  minimumScore?: number;
  filters?: SchemeFilters;
}

export interface SchemeFilterOptions {
  coverage: SchemeCoverage[];
  states: string[];
  consumerSegments: ConsumerSegment[];
  subsidyTypes: string[];
  tags: string[];
}

const NORMALIZED_STATE_OVERRIDES: Record<string, string> = {
  'nct of delhi': 'delhi',
  'new delhi': 'delhi',
  'delhi ncr': 'delhi',
  'maharastra': 'maharashtra',
  'maharastra state': 'maharashtra',
  'rajastan': 'rajasthan',
  'uttar pradesh': 'uttar pradesh',
  'andhra pradesh': 'andhra pradesh',
};

function normalizeState(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return '';
  return NORMALIZED_STATE_OVERRIDES[trimmed] || trimmed;
}

function normalizeConsumerSegment(segment: ConsumerSegment | string): ConsumerSegment {
  const s = segment.toLowerCase();
  if (s.startsWith('agri')) return 'agricultural';
  if (s.startsWith('comm')) return 'community';
  return 'residential';
}

function baseScoreForCoverage(scheme: SubsidyScheme, userState: string): { score: number; reason?: string } {
  if (scheme.states.includes('all')) {
    return { score: 2, reason: 'Pan-India coverage' };
  }

  if (scheme.states.includes(userState)) {
    return { score: 4, reason: `Covers ${userState[0]?.toUpperCase()}${userState.slice(1)}` };
  }

  // Allow partial match for states mentioned in tags (e.g., rural)
  if (scheme.states.some(state => userState.includes(state))) {
    return { score: 3, reason: `Matches region (${scheme.states.join(', ')})` };
  }

  return { score: 0 };
}

function passesFilters(scheme: SubsidyScheme, filters?: SchemeFilters): boolean {
  if (!filters) return true;

  if (filters.coverage?.length && !filters.coverage.includes(scheme.coverage)) {
    return false;
  }

  if (filters.consumerSegments?.length && !scheme.consumerSegments.some(segment => filters.consumerSegments?.includes(segment))) {
    return false;
  }

  if (filters.subsidyTypes?.length) {
    const typeMatches = filters.subsidyTypes.some(type => scheme.subsidyType.toLowerCase().includes(type.toLowerCase()));
    if (!typeMatches) return false;
  }

  if (filters.states?.length) {
    const schemeStates = scheme.states.map(s => s.toLowerCase());
    const matchesState = filters.states.some(state => {
      const normalized = normalizeState(state);
      return schemeStates.includes(normalized) || schemeStates.includes('all');
    });
    if (!matchesState) return false;
  }

  if (filters.tags?.length) {
    const schemeTags = scheme.tags ?? [];
    const matchesTag = schemeTags.some(tag => filters.tags?.includes(tag));
    if (!matchesTag) return false;
  }

  if (filters.requiresOwnership !== undefined) {
    if ((scheme.requiresOwnership ?? false) !== filters.requiresOwnership) {
      return false;
    }
  }

  if (filters.gridConnection) {
    if (filters.gridConnection === 'grid' && scheme.requiresGridConnection === false) {
      return false;
    }
    if (filters.gridConnection === 'off-grid' && scheme.requiresGridConnection !== false) {
      return false;
    }
  }

  return true;
}

export function matchSubsidySchemes(user: SubsidyUserProfile, options?: number | MatchOptions): MatchedScheme[] {
  const limit = typeof options === 'number' ? options : options?.limit ?? 3;
  const minimumScore = typeof options === 'number' ? 0 : options?.minimumScore ?? 0;
  const filters = typeof options === 'number' ? undefined : options?.filters;

  const normalizedState = normalizeState(user.state);
  const consumerSegment = normalizeConsumerSegment(user.consumerSegment);
  const monthlyUnits =
    typeof user.monthlyBillUnits === 'number'
      ? user.monthlyBillUnits
      : typeof user.annualConsumptionKWh === 'number'
      ? user.annualConsumptionKWh / 12
      : undefined;

  const results: MatchedScheme[] = [];

  subsidySchemes.forEach(scheme => {
    if (!passesFilters(scheme, filters)) {
      return;
    }

    const reasons: string[] = [];
    let score = 0;

    if (scheme.consumerSegments.includes(consumerSegment)) {
      score += 3;
      reasons.push('Matches your consumer segment');
    } else {
      // If consumer segment does not align, skip early to avoid irrelevant schemes.
      return;
    }

    const coverageBoost = baseScoreForCoverage(scheme, normalizedState);
    score += coverageBoost.score;
    if (coverageBoost.reason) reasons.push(coverageBoost.reason);

    if (scheme.requiresOwnership && !user.ownsProperty) {
      // If ownership required but user is tenant, skip.
      return;
    }
    if (scheme.requiresOwnership) {
      reasons.push('Requires property ownership (matched)');
      score += 1.5;
    }

    if (scheme.requiresGridConnection !== undefined) {
      const hasGrid = Boolean(user.isGridConnected ?? true);
      if (scheme.requiresGridConnection && !hasGrid) {
        return;
      }
      if (!scheme.requiresGridConnection && hasGrid) {
        // scheme targeted to off-grid but user grid-connected; reduce relevance
        score -= 1;
        reasons.push('Designed for off-grid users (may be less relevant)');
      } else {
        reasons.push(scheme.requiresGridConnection ? 'Needs grid connection (matched)' : 'Suited for off-grid users');
        score += 1;
      }
    }

    if (scheme.minRoofAreaSqm && user.roofAreaSqm !== undefined) {
      if (user.roofAreaSqm < scheme.minRoofAreaSqm) {
        // insufficient roof area
        return;
      }
      reasons.push(`Minimum roof area requirement met (≥ ${scheme.minRoofAreaSqm} sq.m)`);
      score += 1;
    }

    if (scheme.maxMonthlyConsumptionUnits && monthlyUnits !== undefined) {
      if (monthlyUnits <= scheme.maxMonthlyConsumptionUnits) {
        reasons.push(`Eligible for low-consumption cap (≤ ${scheme.maxMonthlyConsumptionUnits} units/month)`);
        score += 1;
      } else {
        // still keep but lower score significantly to prioritize actual fits
        score -= 2;
        reasons.push(`Monthly usage above ${scheme.maxMonthlyConsumptionUnits} units (may be ineligible)`);
      }
    }

    // Additional tag alignment
    if (scheme.tags?.includes(consumerSegment)) {
      score += 0.5;
    }
    if (normalizedState && scheme.tags?.includes(normalizedState)) {
      score += 0.5;
    }

    if (score >= minimumScore) {
      results.push({
        scheme,
        matchScore: Number(score.toFixed(2)),
        reasons,
      });
    }
  });

  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function getAllSchemes(): SubsidyScheme[] {
  return subsidySchemes;
}

export function getSchemeFilterOptions(schemes: SubsidyScheme[] = subsidySchemes): SchemeFilterOptions {
  const coverage = new Set<SchemeCoverage>();
  const states = new Set<string>();
  const consumerSegments = new Set<ConsumerSegment>();
  const subsidyTypes = new Set<string>();
  const tags = new Set<string>();

  schemes.forEach(scheme => {
    coverage.add(scheme.coverage);
    scheme.states.forEach(state => {
      if (state !== 'all') {
        states.add(state);
      }
    });
    scheme.consumerSegments.forEach(segment => consumerSegments.add(segment));
    subsidyTypes.add(scheme.subsidyType);
    scheme.tags?.forEach(tag => tags.add(tag));
  });

  return {
    coverage: Array.from(coverage),
    states: Array.from(states),
    consumerSegments: Array.from(consumerSegments),
    subsidyTypes: Array.from(subsidyTypes),
    tags: Array.from(tags),
  };
}

export function filterSchemes(filters: SchemeFilters, schemes: SubsidyScheme[] = subsidySchemes): SubsidyScheme[] {
  return schemes.filter(scheme => passesFilters(scheme, filters));
}

