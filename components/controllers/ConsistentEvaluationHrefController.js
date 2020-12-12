import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { actorRel, alignmentsRel, assessmentRel, demonstrationRel, editSpecialAccessApplicationRel, evaluationRel, groupRel, nextRel, previousRel, rubricRel, userProgressOutcomeRel, userRel } from './constants.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';

export const ConsistentEvaluationHrefControllerErrors = {
	INVALID_BASE_HREF: 'baseHref was not defined when initializing ConsistentEvaluationHrefController',
	INVALID_TYPE_BASE_HREF: 'baseHref must be a string when initializing ConsistentEvaluationHrefController'
};

export class ConsistentEvaluationHrefController {
	constructor(baseHref, token) {
		if (!baseHref) {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_BASE_HREF);
		}

		if (typeof baseHref !== 'string') {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_TYPE_BASE_HREF);
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

	_getHrefs(root, rel) {
		if (root.hasLinkByRel(rel)) {
			return root.getLinksByRel(rel).map(x => x.href);
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
		let alignmentsHref = undefined;
		let userHref = undefined;
		let groupHref = undefined;
		let actorHref = undefined;
		let userProgressOutcomeHref = undefined;
		let coaDemonstrationHref = undefined;
		let specialAccessHref = undefined;

		if (root && root.entity) {
			root = root.entity;

			evaluationHref = this._getHref(root, evaluationRel);
			nextHref = this._getHref(root, nextRel);
			previousHref = this._getHref(root, previousRel);
			actorHref = this._getHref(root, actorRel);
			userHref = this._getHref(root, userRel);
			alignmentsHref = this._getHref(root, alignmentsRel);
			groupHref = this._getHref(root, groupRel);
			userProgressOutcomeHref = this._getHref(root, userProgressOutcomeRel);

			if (alignmentsHref) {
				const alignmentsEntity = await this._getEntityFromHref(alignmentsHref, bypassCache);
				if (alignmentsEntity && alignmentsEntity.entity) {
					if (userProgressOutcomeHref) {
						alignmentsHref = undefined;
						const referencedAlignmentEntity = alignmentsEntity.entity.getSubEntityByRel('item');
						if (referencedAlignmentEntity) {
							const alignmentEntity = await this._getEntityFromHref(referencedAlignmentEntity.href, bypassCache);
							if (alignmentEntity && alignmentEntity.entity) {
								const demonstrationLink = alignmentEntity.entity.getLinkByRel(demonstrationRel);
								if (demonstrationLink) {
									coaDemonstrationHref = demonstrationLink.href;
								}
							}
						}
					} else {
						if (alignmentsEntity.entity.entities && alignmentsEntity.entity.entities.length > 0) {
							alignmentsHref = actorHref;
						} else {
							alignmentsHref = undefined;
						}
					}
				}
			}

			if (root.hasSubEntityByRel(editSpecialAccessApplicationRel)) {
				specialAccessHref = root.getSubEntityByRel(editSpecialAccessApplicationRel).properties.path;
			}
		}

		return {
			root,
			evaluationHref,
			nextHref,
			alignmentsHref,
			previousHref,
			userHref,
			groupHref,
			userProgressOutcomeHref,
			coaDemonstrationHref,
			specialAccessHref
		};
	}

	async getSubmissionInfo() {
		let root = await this._getRootEntity(false);
		let submissionList, evaluationState, submissionType;
		let isExempt = false;
		if (root && root.entity) {
			root = root.entity;
			if (root.getSubEntityByClass(Classes.assignments.submissionList)) {
				submissionList = root.getSubEntityByClass(Classes.assignments.submissionList).links;
			}
			if (root.getSubEntityByRel(Rels.evaluation)) {
				evaluationState = root.getSubEntityByRel(Rels.evaluation).properties.state;
			}
			const assignmentHref = this._getHref(root, Rels.assignment);
			if (assignmentHref) {
				const assignmentEntity = await this._getEntityFromHref(assignmentHref, false);
				if (assignmentEntity && assignmentEntity.entity) {
					submissionType = assignmentEntity.entity.properties.submissionType.value.toString();
				}
			}
			const evaluationHref = this._getHref(root, evaluationRel);
			if (evaluationHref) {
				const evaluationEntity = await this._getEntityFromHref(evaluationHref, false);
				if (evaluationEntity && evaluationEntity.entity) {
					isExempt = evaluationEntity.entity.properties.isExempt;
				}
			}
		}
		return {
			submissionList,
			evaluationState,
			submissionType,
			isExempt
		};
	}

	async getGradeItemInfo() {
		const root = await this._getRootEntity(false);
		let evaluationUrl, statsUrl, gradeItemName;
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(Rels.Activities.activityUsage)) {
				const activityUsageLink = root.entity.getLinkByRel(Rels.Activities.activityUsage).href;
				const activityUsageResponse = await this._getEntityFromHref(activityUsageLink, false);

				if (activityUsageResponse && activityUsageResponse.entity && activityUsageResponse.entity.getLinkByRel(Rels.Grades.grade)) {
					const gradeLink = activityUsageResponse.entity.getLinkByRel(Rels.Grades.grade).href;
					const gradeResponse = await this._getEntityFromHref(gradeLink, false);

					if (gradeResponse && gradeResponse.entity && gradeResponse.entity.properties) {
						evaluationUrl = gradeResponse.entity.properties.evaluationUrl;
						statsUrl = gradeResponse.entity.properties.statsUrl;
						gradeItemName = gradeResponse.entity.properties.name;
					}
				}
			}
		}

		return {
			evaluationUrl,
			statsUrl,
			gradeItemName
		};
	}

	async getAssignmentOrganizationName(domainName) {
		let domainRel;

		switch (domainName) {
			case 'assignment':
				domainRel = Rels.assignment;
				break;
			case 'organization':
				domainRel = Rels.organization;
				break;
			default:
				return undefined;
		}
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(domainRel)) {
				const domainLink = root.entity.getLinkByRel(domainRel).href;
				const domainResponse = await this._getEntityFromHref(domainLink, false);

				if (domainResponse && domainResponse.entity) {
					return domainResponse.entity.properties.name;
				}
			}
		}
		return undefined;
	}

	async getUserName() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(Rels.user)) {
				const domainLink = root.entity.getLinkByRel(Rels.user).href;
				const domainResponse = await this._getEntityFromHref(domainLink, false);

				if (domainResponse && domainResponse.entity) {
					const displayEntity = domainResponse.entity.getSubEntityByRel(Rels.displayName);
					return displayEntity && displayEntity.properties && displayEntity.properties.name;
				}
			}
		}
		return undefined;
	}

	async getIteratorInfo(iteratorProperty) {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			switch (iteratorProperty) {
				case 'total':
					return root.entity.properties?.iteratorTotal;
				case 'index':
					return root.entity.properties?.iteratorIndex;
				default:
					break;
			}
		}
		return undefined;
	}

	async getRubricInfos() {
		let rubricInfos = undefined;
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const rubricHrefs = this._getHrefs(root.entity, assessmentRel);
			if (rubricHrefs) {
				rubricInfos = await Promise.all(rubricHrefs.map(async rubricAssessmentHref => {
					const assessmentEntity = await this._getEntityFromHref(rubricAssessmentHref, false);
					if (assessmentEntity && assessmentEntity.entity) {
						const rubricHref = this._getHref(assessmentEntity.entity, rubricRel);
						const rubricEntity = await this._getEntityFromHref(rubricHref, false);
						const rubricTitle = rubricEntity.entity.properties.name;
						const rubricId = rubricEntity.entity.properties.rubricId.toString();
						const rubricOutOf = rubricEntity.entity.properties.outOf;
						const rubricScoringMethod = rubricEntity.entity.properties.scoringMethod;

						return {
							rubricHref,
							rubricAssessmentHref,
							rubricTitle,
							rubricId,
							rubricOutOf,
							rubricScoringMethod
						};
					}
				}));
			}
		}

		return rubricInfos.filter(rubricInfo => rubricInfo !== undefined);
	}
}
