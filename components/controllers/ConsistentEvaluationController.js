import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { publishActionName, retractActionName, saveActionName, saveFeedbackActionName, saveFeedbackFieldName, saveGradeActionName, saveGradeFieldName, updateActionName } from './constants.js';
import { Grade } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { performSirenAction } from 'siren-sdk/src/es6/SirenAction.js';

export const ConsistentEvaluationControllerErrors = {
	INVALID_EVALUATION_HREF: 'evaluationHref was not defined when initializing ConsistentEvaluationController',
	INVALID_TYPE_EVALUATION_HREF: 'evaluationHref must be a string when initializing ConsistentEvaluationController',
	INVALID_EVALUATION_ENTITY: 'Invalid entity provided for evaluation',
	INVALID_FEEDBACK_TEXT: 'Feedback text must be a string (empty string permitted) to update feedback text.',
	ERROR_FETCHING_ENTITY: 'Error while fetching evaluation entity.',
	FEEDBACK_ENTITY_NOT_FOUND: 'Evaluation entity must have feedback entity to update feedback.',
	GRADE_ENTITY_NOT_FOUND: 'Evaluation entity must have grade entity to update grade.',
	NO_PROPERTIES_FOR_ENTITY: 'Entity does not have properties attached to it.',
	ACTION_NOT_FOUND: (actionName) => `Could not find the ${actionName} action from the evaluation entity.`,
	FIELD_IN_ACTION_NOT_FOUND: (actionName, fieldName) => `Expected the ${actionName} action to have a ${fieldName} field.`
};

export class ConsistentEvaluationController {
	constructor(evaluationHref, token, coaDemonstrationHref = undefined) {
		if (!evaluationHref) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_HREF);
		}

		if (typeof evaluationHref !== 'string') {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_TYPE_EVALUATION_HREF);
		}

		this.evaluationHref = evaluationHref;
		this.coaDemonstrationHref = coaDemonstrationHref;
		this.token = token;
	}

	async _fetchEvaluationEntity(bypassCache) {
		return await window.D2L.Siren.EntityStore.fetch(this.evaluationHref, this.token, bypassCache);
	}

	async fetchEvaluationEntity(bypassCache = false) {
		const evaluationResource = await this._fetchEvaluationEntity(bypassCache);
		if (!evaluationResource || !evaluationResource.entity) {
			throw new Error(ConsistentEvaluationControllerErrors.ERROR_FETCHING_ENTITY);
		}
		const evaluationEntity = evaluationResource.entity;

		return evaluationEntity;
	}

	async _fetchCoaDemonstrationEntity(bypassCache) {
		return await window.D2L.Siren.EntityStore.fetch(this.coaDemonstrationHref, this.token, bypassCache);
	}

	async fetchCoaDemonstrationEntity(bypassCache = false) {
		const coaDemonstrationResource = await this._fetchCoaDemonstrationEntity(bypassCache);
		if (!coaDemonstrationResource || !coaDemonstrationResource.entity) {
			throw new Error(ConsistentEvaluationControllerErrors.ERROR_FETCHING_ENTITY);
		}
		const coaDemonstrationEntity = coaDemonstrationResource.entity;

		return coaDemonstrationEntity;
	}

	async _performSirenAction(action, field = null) {
		return await performSirenAction(this.token, action, field, true);
	}

	async _performAction(entity, actionName, fieldName = '', fieldValue = null) {
		if (entity.hasActionByName(actionName)) {
			const action = entity.getActionByName(actionName);
			if (fieldName) {
				if (!action.hasFieldByName(fieldName)) {
					throw new Error(ConsistentEvaluationControllerErrors.FIELD_IN_ACTION_NOT_FOUND(action.name, fieldName));
				} else {
					const field = action.getFieldByName(fieldName);
					field.value = fieldValue;
					return await this._performSirenAction(action, [field]);
				}
			} else {
				return await this._performSirenAction(action);
			}
		} else {
			throw new Error(ConsistentEvaluationControllerErrors.ACTION_NOT_FOUND(actionName));
		}
	}

	parseGrade(entity) {
		if (!entity.properties) {
			throw new Error(ConsistentEvaluationControllerErrors.NO_PROPERTIES_FOR_ENTITY);
		}

		return new Grade(
			entity.properties.scoreType,
			entity.properties.score,
			entity.properties.outOf,
			entity.properties.letterGrade,
			entity.properties.letterGradeOptions,
			entity
		);
	}

	async transientSaveFeedback(evaluationEntity, feedbackValue) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}
		if (typeof feedbackValue !== 'string') {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_FEEDBACK_TEXT);
		}
		const targetEntity = evaluationEntity.getSubEntityByRel('feedback');
		if (!targetEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.FEEDBACK_ENTITY_NOT_FOUND);
		}

		return await this._performAction(targetEntity, saveFeedbackActionName, saveFeedbackFieldName, feedbackValue);
	}

	async transientSaveGrade(evaluationEntity, gradeValue) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}
		const targetEntity = evaluationEntity.getSubEntityByRel('grade');
		if (!targetEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.GRADE_ENTITY_NOT_FOUND);
		}

		return await this._performAction(targetEntity, saveGradeActionName, saveGradeFieldName, gradeValue);
	}

	async transientSaveAnnotations(evaluationEntity, annotationsData, fileId) {
		const annotationsEntity = evaluationEntity.getSubEntityByRel('annotations');
		const saveAnnotationsAction = annotationsEntity.getActionByName('SaveAnnotations');

		const encodedAnnotationsData = {
			FileId: fileId,
			AnnotationsData: JSON.stringify(annotationsData)
		};

		const fields = [{
			name: 'value',
			value: JSON.stringify(encodedAnnotationsData)
		}];

		return await performSirenAction(this.token, saveAnnotationsAction, fields, true);
	}

	async save(evaluationEntity) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}

		if (this.coaDemonstrationHref) {
			await this.saveCoaDemonstration();
		}
		return await this._performAction(evaluationEntity, saveActionName);
	}

	async update(evaluationEntity) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}

		if (this.coaDemonstrationHref) {
			await this.saveCoaDemonstration();
		}
		return await this._performAction(evaluationEntity, updateActionName);
	}

	async publish(evaluationEntity) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}

		if (this.coaDemonstrationHref) {
			await this.saveCoaDemonstration();
		}
		return await this._performAction(evaluationEntity, publishActionName);
	}

	async retract(evaluationEntity) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}

		if (this.coaDemonstrationHref) {
			await this.saveCoaDemonstration();
		}
		return await this._performAction(evaluationEntity, retractActionName);
	}

	async saveCoaDemonstration() {
		const coaDemonstrationEntity = await this.fetchCoaDemonstrationEntity(false);
		const publishAction = coaDemonstrationEntity.getActionByName('publish');
		if (publishAction) {
			return await this._performSirenAction(publishAction);
		}
	}
}
