export class ProcessExitCodeError extends Error {
  exitCode: number;

  constructor(code: number) {
    super(`Process exit with code ${code}`);
    this.exitCode = code;
  }
}
