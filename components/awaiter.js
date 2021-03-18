export class Awaiter {
	constructor() {
		this.mutex = Promise.resolve();
	}

	async dispatch(fn) {
		const unlock = await this.lock();
		try {
			return await fn();
		} finally {
			unlock();
		}
	}
	lock() {
		let begin = () => {};

		this.mutex = this.mutex.then(() => {
			return new Promise(begin);
		});

		return new Promise(res => {
			begin = res;
		});
	}

}
