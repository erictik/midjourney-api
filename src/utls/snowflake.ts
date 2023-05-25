export class Snowflake {
  private static readonly EPOCH = 1609459200000;
  private static readonly SEQUENCE_BITS = 12;
  private static readonly WORKER_ID_BITS = 10;
  private static readonly MAX_SEQUENCE = (1 << Snowflake.SEQUENCE_BITS) - 1;
  private static readonly MAX_WORKER_ID = (1 << Snowflake.WORKER_ID_BITS) - 1;

  private sequence: number;
  private lastTimestamp: number;

  constructor(private readonly workerId: number) {
    if (workerId > Snowflake.MAX_WORKER_ID || workerId < 0) {
      throw new Error(
        `worker id must be between 0 and ${Snowflake.MAX_WORKER_ID}`
      );
    }
    this.sequence = 0;
    this.lastTimestamp = -1;
  }

  public nextId(): number {
    let timestamp = Date.now();
    if (timestamp < this.lastTimestamp) {
      throw new Error("Invalid System Clock");
    }
    if (this.lastTimestamp == timestamp) {
      this.sequence++;
      if (this.sequence > Snowflake.MAX_SEQUENCE) {
        while (Date.now() <= timestamp) {
          // Wait for next millisecond
        }
        timestamp = Date.now();
        this.sequence = 0;
      }
    } else {
      this.sequence = 0;
    }
    this.lastTimestamp = timestamp;
    const id =
      ((timestamp - Snowflake.EPOCH) <<
        (Snowflake.SEQUENCE_BITS + Snowflake.WORKER_ID_BITS)) |
      (this.workerId << Snowflake.SEQUENCE_BITS) |
      this.sequence;
    return id;
  }
}
