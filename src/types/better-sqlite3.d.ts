declare module "better-sqlite3" {
  interface Database {
    pragma(pragma: string): unknown;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    close(): void;
  }

  interface Statement {
    run(...params: unknown[]): RunResult;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  interface DatabaseConstructor {
    new (filename: string, options?: Record<string, unknown>): Database;
    (filename: string, options?: Record<string, unknown>): Database;
  }

  const Database: DatabaseConstructor;
  export = Database;
}
