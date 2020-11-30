export class TransientSaveAwaiter {
	constructor() {
		this._pendingTransientSaves = [];
	}

	addTransientSave(transientSave) {
		this._pendingTransientSaves.push(transientSave);
		return this._pendingTransientSaves;
	}

	async awaitAllTransientSaves() {
		let resolvedSaves;
		try {
			resolvedSaves = await Promise.all(this._pendingTransientSaves);
		} catch (err) {
			this._pendingTransientSaves = [];
			throw err;
		}
		this._pendingTransientSaves = [];
		return resolvedSaves;
	}
}
