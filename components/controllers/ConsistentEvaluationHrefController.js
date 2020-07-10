import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { assessmentRel, evaluationRel, nextRel, previousRel, rubricRel } from './constants.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';

export const ConsistentEvaluationHrefControllerErrors = {
	INVALID_BASE_HREF: 'baseHref was not defined when initializing ConsistentEvaluationHrefController',
	INVALID_TYPE_BASE_HREF: 'baseHref must be a string when initializing ConsistentEvaluationHrefController',
	INVALID_TOKEN: 'token was not defined when initializing ConsistentEvaluationHrefController',
	INVALID_TYPE_TOKEN: 'token must be a string when initializing ConsistentEvaluationHrefController'
};

export class ConsistentEvaluationHrefController {
	constructor(baseHref, token) {
		if (!baseHref) {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_BASE_HREF);
		}

		if (typeof baseHref !== 'string') {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_TYPE_BASE_HREF);
		}

		if (!token) {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_TOKEN);
		}

		if (typeof token !== 'string') {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_TYPE_TOKEN);
		}

		this.baseHref = baseHref;
		this.token = token;
	}
	_getHref(root, rel) {
		if (root.hasLinkByRel(rel)) {
			return root.getLinkByRel(rel).href;
		}
		return undefined;
	}

	// these are in their own methods so that they can easily be stubbed in testing
	async _getRootEntity(bypassCache) {
		return await window.D2L.Siren.EntityStore.fetch(this.baseHref, this.token, bypassCache);
	}

	async _getEntityFromHref(targetHref, bypassCache) {
		return await window.D2L.Siren.EntityStore.fetch(targetHref, this.token, bypassCache);
	}

	async getHrefs(bypassCache = false) {
		let root = await this._getRootEntity(bypassCache);

		let evaluationHref = undefined;
		let nextHref = undefined;
		let previousHref = undefined;
		let rubricAssessmentHref = undefined;
		let rubricHref = undefined;

		if (root && root.entity) {
			root = root.entity;

			evaluationHref = this._getHref(root, evaluationRel);
			nextHref = this._getHref(root, nextRel);
			previousHref = this._getHref(root, previousRel);
			rubricAssessmentHref = this._getHref(root, assessmentRel);

			if (rubricAssessmentHref) {
				const assessmentEntity = await this._getEntityFromHref(rubricAssessmentHref, bypassCache);
				if (assessmentEntity && assessmentEntity.entity) {
					rubricHref = this._getHref(assessmentEntity.entity, rubricRel);
				}
			}
		}

		// we still need the outcomes href

		return {
			root,
			evaluationHref,
			nextHref,
			previousHref,
			rubricAssessmentHref,
			rubricHref
		};
	}

	async getSubmissionInfo() {
		let root = await this._getRootEntity(false);
		let submissionList, evaluationState, submissionType, dueDate;
		if (root && root.entity) {
			root = root.entity;
			if (root.getSubEntityByClass(Classes.assignments.submissionList)) {
				submissionList = root.getSubEntityByClass(Classes.assignments.submissionList).links;
			}
			if (root.getSubEntityByRel(Rels.evaluation)) {
				evaluationState = root.getSubEntityByRel(Rels.evaluation).properties.state;
			}
			if (root.getSubEntityByClass(Classes.dates.dueDate)) {
				dueDate = root.getSubEntityByClass(Classes.dates.dueDate).properties.date;
			}
			const assignmentHref = this._getHref(root, Rels.assignment);
			if (assignmentHref) {
				const assignmentEntity = await this._getEntityFromHref(assignmentHref, false);
				if (assignmentEntity && assignmentEntity.entity) {
					submissionType = assignmentEntity.entity.properties.submissionType.title;
				}
			}
		}
		return {
			submissionList,
			evaluationState,
			submissionType,
			dueDate
		};
	}
}
