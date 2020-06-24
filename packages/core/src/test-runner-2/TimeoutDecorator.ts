import { RunStatus, DryRunResult, DryRunOptions, MutantRunOptions, MutantRunResult, MutantRunStatus } from '@stryker-mutator/api/test_runner2';
import { getLogger } from 'log4js';
import { ExpirableTask } from '@stryker-mutator/util';

import TestRunnerDecorator from './TestRunnerDecorator';

/**
 * Wraps a test runner and implements the timeout functionality.
 */
export default class TimeoutDecorator extends TestRunnerDecorator {
  private readonly log = getLogger(TimeoutDecorator.name);

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    const result = await this.run(options, () => super.dryRun(options));
    if (result === ExpirableTask.TimeoutExpired) {
      return {
        status: RunStatus.Timeout,
      };
    } else {
      return result;
    }
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    const result = await this.run(options, () => super.mutantRun(options));
    if (result === ExpirableTask.TimeoutExpired) {
      return {
        status: MutantRunStatus.Timeout,
      };
    } else {
      return result;
    }
  }

  private async run<TOptions extends { timeout: number }, TResult>(
    options: TOptions,
    actRun: () => Promise<TResult>
  ): Promise<TResult | typeof ExpirableTask.TimeoutExpired> {
    this.log.debug('Starting timeout timer (%s ms) for a test run', options.timeout);
    const result = await ExpirableTask.timeout(actRun(), options.timeout);
    if (result === ExpirableTask.TimeoutExpired) {
      await this.handleTimeout();
      return result;
    } else {
      return result;
    }
  }

  private async handleTimeout(): Promise<void> {
    this.log.debug('Timeout expired, restarting the process and reporting timeout');
    await this.dispose();
    this.createInnerRunner();
    await this.init();
  }
}