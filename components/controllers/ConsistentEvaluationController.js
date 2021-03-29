import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { appId, publishActionName, removeFeedbackAttachmentActionName, retractActionName, saveActionName, saveFeedbackActionName, saveFeedbackAttachmentAFieldName, saveFeedbackAttachmentFileActionName, saveFeedbackAttachmentLinkActionName, saveFeedbackFieldName, saveGradeActionName, saveGradeFieldName, saveScoreActionName, updateActionName } from './constants.js';
import { createClient } from '@brightspace-ui/logging';
import { Grade } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { performSirenAction } from 'siren-sdk/src/es6/SirenAction.js';

export const ConsistentEvaluationControllerErrors = {
	INVALID_EVALUATION_HREF: 'evaluationHref was not defined when initializing ConsistentEvaluationController',
	INVALID_TYPE_EVALUATION_HREF: 'evaluationHref must be a string when initializing ConsistentEvaluationController',
	INVALID_EVALUATION_ENTITY: 'Invalid entity provided for evaluation',
	INVALID_EVALUATION_POST_ENTITY: 'Invalid entity provided for post evaluation',
	INVALID_FEEDBACK_TEXT: 'Feedback text must be a string (empty string permitted) to update feedback text.',
	ERROR_FETCHING_ENTITY: 'Error while fetching evaluation entity.',
	ERROR_FETCHING_ATTACHMENTS_ENTITY: 'Error while fetching evaluation attachments entity.',
	FEEDBACK_ENTITY_NOT_FOUND: 'Evaluation entity must have feedback entity to update feedback.',
	GRADE_ENTITY_NOT_FOUND: 'Evaluation entity must have grade entity to update grade.',
	NO_PROPERTIES_FOR_ENTITY: 'Entity does not have properties attached to it.',
	ACTIVE_SCORING_RUBRIC_NOT_FOUND: 'Evaluation entity must have active scoring rubric entity to update active scoring rubric',
	ACTION_NOT_FOUND: (actionName) => `Could not find the ${actionName} action from the evaluation entity.`,
	FIELD_IN_ACTION_NOT_FOUND: (actionName, fieldName) => `Expected the ${actionName} action to have a ${fieldName} field.`
};

export class ConsistentEvaluationController {
	constructor(evaluationHref, token) {
		this.logger = createClient(appId);

		if (!evaluationHref) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_HREF);
		}

		if (typeof evaluationHref !== 'string') {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_TYPE_EVALUATION_HREF);
		}

		this.evaluationHref = evaluationHref;
		this.token = token;
	}

	async update(evaluationEntity) {
		return this._performActionHelper(evaluationEntity, updateActionName);
	}
	async fetchAttachments(evaluationEntity) {
		const attachmentsEntity = await this.fetchAttachmentsEntity(evaluationEntity);
		if (!attachmentsEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.ERROR_FETCHING_ATTACHMENTS_ENTITY);
		}

		const canAddFeedbackFile = attachmentsEntity.hasActionByName('add-file');
		const canRecordFeedbackVideo = attachmentsEntity.hasActionByName('add-video-note');
		const canRecordFeedbackAudio = attachmentsEntity.hasActionByName('add-audio-note');
		const attachments = [];
		if (attachmentsEntity.entities) {
			attachmentsEntity.entities.forEach(a => {
				const id = a.properties && a.properties.id;
				const name = a.properties && a.properties.name;
				const href = a.hasLinkByRel('alternate') && a.getLinkByRel('alternate').href;
				const canDeleteAttachment = a.hasActionByName('delete');

				const attachment = {
					id: id,
					name: name,
					url: href,
					canDeleteAttachment: canDeleteAttachment
				};
				attachments.push(attachment);
			});
		}

		return {
			canAddFeedbackFile,
			canRecordFeedbackVideo,
			canRecordFeedbackAudio,
			attachments
		};
	}
	async fetchAttachmentsEntity(evaluationEntity) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.ERROR_FETCHING_ENTITY);
		}
		const attachmentsEntity = evaluationEntity.getSubEntityByRel('attachments');

		return attachmentsEntity;
	}
	async fetchEvaluationEntity(bypassCache = false) {
		const evaluationResource = await this._fetchEvaluationEntity(bypassCache);
		if (!evaluationResource || !evaluationResource.entity) {
			throw new Error(ConsistentEvaluationControllerErrors.ERROR_FETCHING_ENTITY);
		}
		const evaluationEntity = evaluationResource.entity;

		return evaluationEntity;
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
	async publish(evaluationEntity) {
		return this._performActionHelper(evaluationEntity, publishActionName);
	}
	async retract(evaluationEntity) {
		return this._performActionHelper(evaluationEntity, retractActionName);
	}
	async save(evaluationEntity) {
		return this._performActionHelper(evaluationEntity, saveActionName);
	}
	async transientAddFeedbackAttachment(evaluationEntity, files) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}

		let updatedEntity = evaluationEntity;
		for (const attachment of files) {
			const targetEntity = updatedEntity.getSubEntityByRel('attachments');
			if (!targetEntity) {
				throw new Error(ConsistentEvaluationControllerErrors.ERROR_FETCHING_ATTACHMENTS_ENTITY);
			}

			if (attachment.GetFileSystemType) {
				updatedEntity = await this._performAction(
					targetEntity,
					saveFeedbackAttachmentFileActionName,
					saveFeedbackAttachmentAFieldName,
					JSON.stringify({
						FileId: attachment.GetId(),
						FileSystemType: attachment.GetFileSystemType(),
					}));
			} else if (attachment.GetLocation) {
				updatedEntity = await this._performAction(
					targetEntity,
					saveFeedbackAttachmentLinkActionName,
					saveFeedbackAttachmentAFieldName,
					JSON.stringify({
						LinkId: attachment.GetId(),
						Name: attachment.GetName(),
						Url: attachment.GetLocation(),
						Urn: attachment.GetUrn(),
					}));
			}
		}

		return updatedEntity;
	}
	async transientDiscardAnnotations(evaluationEntity) {
		const annotationsEntity = evaluationEntity.getSubEntityByRel('annotations');
		if (!annotationsEntity) {
			console.warn('Could not find annotations entity to discard');
			return;
		}

		// explicitly send `value` as empty string to avoid 400 missing param
		return await this._performAction(annotationsEntity, 'RemoveAnnotations', 'value', '');
	}
	async transientRemoveFeedbackAttachment(evaluationEntity, fileIdentifier) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}

		const targetEntity = evaluationEntity.getSubEntityByRel('attachments');
		if (!targetEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.ERROR_FETCHING_ATTACHMENTS_ENTITY);
		}

		if (targetEntity.entities) {
			for (let i = 0; targetEntity.entities.length > i; i++) {
				const id = targetEntity.entities[i].properties && targetEntity.entities[i].properties.id;
				if (id === fileIdentifier) {
					return await this._performAction(targetEntity.entities[i], removeFeedbackAttachmentActionName);
				}
			}
		}
	}
	async transientSaveActiveScoringRubric(evaluationEntity, rubricId) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}
		const targetEntity = evaluationEntity.getSubEntityByRel('active-scoring-rubric');
		if (!targetEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.ACTIVE_SCORING_RUBRIC_NOT_FOUND);
		}

		if (!rubricId) {
			//API requires a value
			rubricId = '';
		}

		return await this._performAction(targetEntity, 'SetActiveScoringRubric', 'value', rubricId);
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
	async transientSaveDiscussionPostScore(evaluationPostEntity, gradeValue) {
		if (!evaluationPostEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_POST_ENTITY);
		}

		return await this._performAction(evaluationPostEntity, saveScoreActionName, saveGradeFieldName, gradeValue);
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
	async _fetchEvaluationEntity(bypassCache) {
		return await window.D2L.Siren.EntityStore.fetch(this.evaluationHref, this.token, bypassCache);
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

	async _performActionHelper(evaluationEntity, actionName) {
		if (!evaluationEntity) {
			throw new Error(ConsistentEvaluationControllerErrors.INVALID_EVALUATION_ENTITY);
		}

		return await this._performAction(evaluationEntity, actionName);
	}
	async _performSirenAction(action, field = null) {
		let newEvaluationEntity;
		try {
			newEvaluationEntity = await performSirenAction(this.token, action, field, true);
		} catch (e) {
			this.logger.error(e, `HTTP Status Code: "${e.json.properties.code} ${e.json.properties.status}" Message: "${e.message}"`);
		}
		return newEvaluationEntity;
	}

}
