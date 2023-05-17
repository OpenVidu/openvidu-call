/**
 * Retry is used for OpenVidu Enterprise High Availability for reconnecting purposes
 * to allow fault tolerance
 * This class is used to retry the connection to OpenVidu Server when it is not available
 */
export class RetryOptions {
    private retries: number;
    private incrementSleepOnRetry: number;
    private maxRetries: number;
    private msRetrySleep: number;
    private multiplier: number;

    constructor(retries = 1, incrementSleepOnRetry = 10,  maxRetries = 30, msRetrySleep = 150, multiplier = 1.2) {
        this.retries = retries;
        this.incrementSleepOnRetry = incrementSleepOnRetry;
        this.maxRetries = maxRetries;
        this.msRetrySleep = msRetrySleep;
        this.multiplier = multiplier;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public canRetry(): boolean {
        return this.retries < this.maxRetries;
    }

    public async retrySleep(): Promise<void> {
        await this.sleep(this.msRetrySleep);
        this.retries += 1;
        if (this.retries > this.incrementSleepOnRetry) {
            this.msRetrySleep *= this.multiplier;
        }
    }
}