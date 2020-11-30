import { assert } from '@open-wc/testing';
import { TransientSaveAwaiter } from '../components/transient-save-awaiter.js';

describe('Awaiter', () => {
	it('should add and await actions properly', async() => {
		const awaiter = new TransientSaveAwaiter();
		const action1 = async() => {
			return 'one';
		};
		const action2 = async() => {
			return 'two';
		};
		const action3 = () => {
			return 'three';
		};

		const promise1 = action1();
		const promise2 = action2();

		const notAPromise1 = action3();
		const notAPromise2 = 'four';

		awaiter.addTransientSave(promise1);
		awaiter.addTransientSave(promise2);
		awaiter.addTransientSave(notAPromise1);
		awaiter.addTransientSave(notAPromise2);

		const resolvedPromises = await awaiter.awaitAllTransientSaves();
		assert.isTrue(resolvedPromises.some((result) => result === 'one'));
		assert.isTrue(resolvedPromises.some((result) => result === 'two'));
		assert.isTrue(resolvedPromises.some((result) => result === 'three'));
		assert.isTrue(resolvedPromises.some((result) => result === 'four'));
	});

	it('should throw an error when a save action errors', async() => {
		const awaiter = new TransientSaveAwaiter();
		const error = new Error('rip');
		const errorAction = async() => {
			throw error;
		};

		const errorPromise = errorAction();
		awaiter.addTransientSave(errorPromise);
		try {
			await awaiter.awaitAllTransientSaves();
			assert.fail();
		} catch (e) {
			assert.equal(e, error);
		}
	});
});
