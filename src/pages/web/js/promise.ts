class Promise {
  private state = '';
  private value = undefined;
  private reason = undefined;

  private onFulfilledCallbacks: any = [];

  constructor(executor) {
    this.state = 'pending';

    this.value = undefined;

    this.reason = undefined;

    try {
      executor(this.resolve, this.reject);
    } catch (err) {
      this.reject(err);
    }
  }

  private resolve(value) {
    if (this.state !== 'pending') return;

    this.state = 'fulfilled';

    this.value = value;
  }

  private reject(reason) {
    if (this.state !== 'pending') return;

    this.state = 'rejected';
    this.reason = reason;
  }

  public then(onFulfilled, onRejected) {
    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    }

    if (this.state === 'rejected') {
      onRejected(this.reason);
    }

    if (this.state === 'pending') {
      this.onFulfilledCallbacks.push(onFulfilled.bind(this));
      this.onFulfilledCallbacks.push(onRejected.bind(this));
    }
  }

  public catch(onRejected) {}
}
