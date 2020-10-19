import { assert } from '@open-wc/testing';
import { Awaiter } from '../components/awaiter.js';

describe('Awaiter', () => {
	it('should do nothing when there is only one lock', async() => {
		const awaiter = new Awaiter();
		const unlock = await awaiter.lock();
		await unlock();
	});

	it('should lock and unlock properly', async() => {
		const awaiter = new Awaiter();
		let num = 1;
		const addOne = async() => {
			const unlock = await awaiter.lock();
			num++;
			await unlock();
		};

		const unlock = await awaiter.lock();
		const promise = addOne();
		assert.equal(num, 1);
		await unlock();
		await promise;
		assert.equal(num, 2);
	});

	it('should dispatch', async() => {
		const awaiter = new Awaiter();
		let num = 1;

		await awaiter.dispatch(() => {
			num++;
		});
		assert.equal(num, 2);
	});
	it('should dispatch and return', async() => {
		const awaiter = new Awaiter();
		const val = 1;
		const ret = await awaiter.dispatch(() => {
			return val;
		});
		assert.equal(ret, val);
	});
	it('should dispatch multiple', async() => {
		const awaiter = new Awaiter();
		let num = 1;
		const addOne = awaiter.dispatch(() => {
			num++;
		});
		const addOneAgain = awaiter.dispatch(() => {
			num++;
		});
		assert.equal(num, 1);
		await addOne;
		assert.equal(num, 2);
		await addOneAgain;
		assert.equal(num, 3);
	});
	it('dispatch should unlock when exception is thrown', async() => {
		const awaiter = new Awaiter();
		let num = 1;
		const error = new Error('oops');
		const throwError = awaiter.dispatch(() => {
			throw error;
		});
		const addOne = awaiter.dispatch(() => {
			num++;
		});

		try {
			await throwError;
		} catch (e) {
			assert.equal(error, e);
		}
		assert.equal(num, 1);
		await addOne;
		assert.equal(num, 2);
	});
});
