import { ConsistentEvaluationController, ConsistentEvaluationControllerErrors } from '../components/controllers/ConsistentEvaluationController';
import { publishActionName, retractActionName, saveActionName, saveFeedbackActionName, saveGradeActionName, updateActionName } from '../components/controllers/constants';
import { assert } from '@open-wc/testing';
import sinon from 'sinon';

describe('ConsistentEvaluationController', () => {
	describe('instantiates properly and throws the correct errors', () => {
		it('accepts a proper href and token string', () => {
			assert.doesNotThrow(() => {
				new ConsistentEvaluationController('href', 'token');
			});
		});

		it('throws an error when empty string given for href', () => {
			assert.throws(() => {
				new ConsistentEvaluationController('', 'token');
			}, ConsistentEvaluationControllerErrors.INVALID_EVALUATION_HREF);
		});

		it('throws an error when empty string given for token', () => {
			assert.throws(() => {
				new ConsistentEvaluationController('href', '');
			}, ConsistentEvaluationControllerErrors.INVALID_TOKEN);
		});

		it('throws an error for null href', () => {
			assert.throws(() => {
				new ConsistentEvaluationController(null, 'token');
			}, ConsistentEvaluationControllerErrors.INVALID_EVALUATION_HREF);
		});

		it('throws an error for null token', () => {
			assert.throws(() => {
				new ConsistentEvaluationController('href', null);
			}, ConsistentEvaluationControllerErrors.INVALID_TOKEN);
		});

		it('throws an error for non string href', () => {
			assert.throws(() => {
				new ConsistentEvaluationController(20, 'token');
			}, ConsistentEvaluationControllerErrors.INVALID_TYPE_EVALUATION_HREF);
		});

		it('throws an error for non string token', () => {
			assert.throws(() => {
				new ConsistentEvaluationController('href', 20);
			}, ConsistentEvaluationControllerErrors.INVALID_TYPE_TOKEN);
		});
	});

	describe('transientSaveFeedback and transientSaveGrade', () => {
		const controller = new ConsistentEvaluationController('href', 'token');
		const fakeFeedbackEntity = {
			properties: {
				text: 'aa',
				html: '<h1>ree</h1>'
			},
			hasActionByName: (name) => name === saveFeedbackActionName,
			getActionByName: () => ({
				hasFieldByName: (name) => name === 'feedback',
				getFieldByName: () => ({ value: undefined })
			})
		};
		const fakeGradeEntity = {
			entity: {
				properties: {
					outOf: 100,
					scoreType: 'Numeric',
					score: 90,
					letterGrade: null,
					letterGradeOptions: null
				},
				hasActionByName: (name) => name === saveGradeActionName,
				getActionByName: () => ({
					hasFieldByName: (name) => name === 'score',
					getFieldByName: () => ({ value: undefined })
				})
			}
		};

		const fakeEvaluationEntity = {
			entity: {
				getSubEntityByRel:  function(rel) {
					if (rel === 'feedback') {
						return fakeFeedbackEntity;
					}
					else if (rel === 'grade') {
						return fakeGradeEntity;
					}
				}
			}
		};
		before(() => {
			sinon.stub(window.D2L.Siren.EntityStore, 'fetch').returns(fakeEvaluationEntity);
		});

		after(() => {
			window.D2L.Siren.EntityStore.fetch.restore();
		});
		it('can transient save feedback', async() => {
			const entity = await controller.fetchEvaluationEntity();
			sinon.stub(controller, '_performAction').returns(fakeEvaluationEntity.entity);
			const updatedFeedback = await controller.transientSaveFeedback(fakeEvaluationEntity.entity, 'new feedback');
			controller._performAction.restore();
			assert.deepEqual(updatedFeedback, entity);
		});
		it('can transient save grade', async() => {
			const entity = await controller.fetchEvaluationEntity();
			sinon.stub(controller, '_performAction').returns(fakeEvaluationEntity.entity);
			const updatedGrade = await controller.transientSaveGrade(fakeEvaluationEntity.entity, 9090090);
			controller._performAction.restore();
			assert.deepEqual(updatedGrade, entity);
		});
		it('will throw error when subentity is not present', async() => {
			const fakeEval = {
				entity: {
					getSubEntityByRel: function() { return undefined; }
				}
			};
			try {
				sinon.stub(controller, '_performAction').returns(fakeEval.entity);
				await controller.transientSaveFeedback(fakeEval.entity, 'fail');
				assert.fail();
			} catch (e) {
				assert.equal(e.message, ConsistentEvaluationControllerErrors.FEEDBACK_ENTITY_NOT_FOUND);
			}

		});
	});

	describe('save', () => {
		it('can save when action is present', async() => {
			const controller = new ConsistentEvaluationController('href', 'token');
			sinon.stub(controller, '_performSirenAction').returns(true);

			const result = await controller.save({properties: { state: 'Unevaluated' },
				hasActionByName: (action) => action === saveActionName,
				getActionByName: () => ({ some: 'action' })
			});
			assert.isTrue(result);

			controller._performSirenAction.restore();
		});

		it('will throw error when action is not present', async() => {
			const controller = new ConsistentEvaluationController('href', 'token');
			sinon.stub(controller, '_performSirenAction').returns(true);

			try {
				await controller.save({
					properties: {
						state: 'Published'
					},
					hasActionByName: () => false,
					getActionByName: () => ({ some: 'action' })
				});
				assert.fail();
			} catch (e) {
				assert.equal(e.message, ConsistentEvaluationControllerErrors.ACTION_NOT_FOUND(saveActionName));
			}

			controller._performSirenAction.restore();
		});
	});

	describe('update', () => {
		it('can update when action is present', async() => {
			const controller = new ConsistentEvaluationController('href', 'token');
			sinon.stub(controller, '_performSirenAction').returns(true);

			const result = await controller.update({properties: { state: 'Unevaluated' },
				hasActionByName: (action) => action === updateActionName,
				getActionByName: () => ({ some: 'action' })
			});
			assert.isTrue(result);

			controller._performSirenAction.restore();
		});

		it('will throw error when action is not present', async() => {
			const controller = new ConsistentEvaluationController('href', 'token');
			sinon.stub(controller, '_performSirenAction').returns(true);

			try {
				await controller.update({
					properties: {
						state: 'Published'
					},
					hasActionByName: () => false,
					getActionByName: () => ({ some: 'action' })
				});
				assert.fail();
			} catch (e) {
				assert.equal(e.message, ConsistentEvaluationControllerErrors.ACTION_NOT_FOUND(updateActionName));
			}

			controller._performSirenAction.restore();
		});
	});

	describe('publish', () => {
		it('can publish when action is present', async() => {
			const controller = new ConsistentEvaluationController('href', 'token');
			sinon.stub(controller, '_performSirenAction').returns(true);

			const res = await controller.publish({
				properties: {
					state: 'Unevaluated'
				},
				hasActionByName: (action) => action === publishActionName,
				getActionByName: () => ({ some: 'action' })
			});

			assert.isTrue(res);

			controller._performSirenAction.restore();
		});

		it('will throw error when action is not present', async() => {
			const controller = new ConsistentEvaluationController('href', 'token');
			sinon.stub(controller, '_performSirenAction').returns(true);

			try {
				await controller.publish({
					properties: {
						state: 'Published'
					},
					hasActionByName: () => false,
					getActionByName: () => ({ some: 'action' })
				});
				assert.fail();
			} catch (e) {
				assert.equal(e.message, ConsistentEvaluationControllerErrors.ACTION_NOT_FOUND(publishActionName));
			}

			controller._performSirenAction.restore();
		});
	});

	describe('retract', async() => {
		it('can retract when action is present', async() => {
			const controller = new ConsistentEvaluationController('href', 'token');
			sinon.stub(controller, '_performSirenAction').returns(true);

			const res = await controller.retract({
				properties: {
					state: 'Published'
				},
				hasActionByName: (action) => action === retractActionName,
				getActionByName: () => ({ some: 'action' })
			});

			assert.isTrue(res);

			controller._performSirenAction.restore();
		});

		it('will throw error when action is not present', async() => {
			const controller = new ConsistentEvaluationController('href', 'token');
			sinon.stub(controller, '_performSirenAction').returns(true);

			try {
				await controller.retract({
					properties: {
						state: 'Unevaluated'
					},
					hasActionByName: () => false,
					getActionByName: () => ({ some: 'action' })
				});
				assert.fail();
			} catch (e) {
				assert.equal(e.message, ConsistentEvaluationControllerErrors.ACTION_NOT_FOUND(retractActionName));
			}

			controller._performSirenAction.restore();
		});
	});
});
