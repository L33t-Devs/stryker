import { Location, Range } from '../../core';

import MutantStatus from './MutantStatus';

export interface BaseMutantResult {
  id: string;
  sourceFilePath: string;
  mutatorName: string;
  replacement: string;
  originalLines: string;
  mutatedLines: string;
  nrOfTestsRan: number;
  location: Location;
  range: Range;
}

export interface KilledMutantResult extends BaseMutantResult {
  status: MutantStatus.Killed;
  killedBy: string;
}

export interface InvalidMutantResult extends BaseMutantResult {
  status: MutantStatus.RuntimeError | MutantStatus.CompileError;
  errorMessage: string;
}

export interface UndetectedMutantResult extends BaseMutantResult {
  status: MutantStatus.NoCoverage | MutantStatus.Survived;
  testFilter: string[] | undefined;
}

export interface TimeoutMutantResult extends BaseMutantResult {
  status: MutantStatus.TimedOut;
}

export type MutantResult = TimeoutMutantResult | UndetectedMutantResult | InvalidMutantResult | KilledMutantResult;
