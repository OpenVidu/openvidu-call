/**
 * Retry is used for OpenVidu Enterprise High Availability for reconnecting purposes
 * to allow fault tolerance
 * This class is used to retry the connection to OpenVidu Server when it is not available
 */
export class RetryOptions {
    private _retries: number;
    private _incrementSleepOnRetry: number;
    private _maxRetries: number;
    private _msRetrySleep: number;
    private _multiplier: number;

    constructor(retries = 1, incrementSleepOnRetry = 10,  maxRetries = 30, msRetrySleep = 150, multiplier = 1.2) {
        if(retries < 0 || incrementSleepOnRetry < 0 || maxRetries < 0 || msRetrySleep < 0 || multiplier < 0){
            throw new Error("Parameters cannot be negative.");
        }
        this._retries = retries;
        this._incrementSleepOnRetry = incrementSleepOnRetry;
        this._maxRetries = maxRetries;
        this._msRetrySleep = msRetrySleep;
        this._multiplier = multiplier;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public canRetry(): boolean {
        return this._retries < this._maxRetries;
    }

    public async retrySleep(): Promise<void> {
        await this.sleep(this._msRetrySleep);
        this._retries++;
        if (this._retries > this._incrementSleepOnRetry) {
            this._msRetrySleep *= this._multiplier;
        }
    }

    get retries(): number {
        return this._retries;
    }

    get incrementSleepOnRetry(): number {
        return this._incrementSleepOnRetry;
    }

    get maxRetries(): number {
        return this._maxRetries;
    }

    get msRetrySleep(): number {
        return this._msRetrySleep;
    }

    get multiplier(): number {
        return this._multiplier;
    }
}