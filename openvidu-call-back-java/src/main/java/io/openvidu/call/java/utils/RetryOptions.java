package io.openvidu.call.java.utils;

/**
 * Retry is used for OpenVidu Enterprise High Availability for reconnecting
 * purposes to allow fault tolerance This class is used to retry the connection
 * to OpenVidu Server when it is not available
 */
public class RetryOptions {
	private int retries = 1;
	private int incrementSleepOnRetry = 10;
	private int maxRetries = 30;
	private int msRetrySleep = 150;
	private float multiplier = 1.2f;

	public RetryOptions() {
	}

	public RetryOptions(int retries, int incrementSleepOnRetry, int maxRetries, int msRetrySleep, float multiplier) {
		if (retries < 0 || incrementSleepOnRetry < 0 || maxRetries < 0 || msRetrySleep < 0 || multiplier < 0) {
			throw new IllegalArgumentException("Parameters cannot be negative.");
		}
		this.retries = retries;
		this.incrementSleepOnRetry = incrementSleepOnRetry;
		this.maxRetries = maxRetries;
		this.msRetrySleep = msRetrySleep;
		this.multiplier = multiplier;
	}

	private void sleep(int ms) throws InterruptedException {
		Thread.sleep(ms);
	}

	public boolean canRetry() {
		return this.retries < this.maxRetries;
	}

	public void retrySleep() throws InterruptedException {
		this.sleep(this.msRetrySleep);
		this.retries++;
		if (this.retries > this.incrementSleepOnRetry) {
			this.msRetrySleep = (int) (this.msRetrySleep * this.multiplier);
		}
	}

	public int getRetries() {
		return retries;
	}

	public int getIncrementSleepOnRetry() {
		return incrementSleepOnRetry;
	}

	public int getMaxRetries() {
		return maxRetries;
	}

	public int getMsRetrySleep() {
		return msRetrySleep;
	}

	public float getMultiplier() {
		return multiplier;
	}

	@Override
	public String toString() {
		return "RetryOptions [retries=" + retries + ", incrementSleepOnRetry=" + incrementSleepOnRetry + ", maxRetries="
				+ maxRetries + ", msRetrySleep=" + msRetrySleep + ", multiplier=" + multiplier + "]";
	}
}