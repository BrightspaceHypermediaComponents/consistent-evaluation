import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { assessorUserRel, assignmentActivity, assignmentClass,
	checkedClassName, coaActivity, coaClass, demonstrationRel, discussionActivity, discussionClass,
	evidenceRel, nextRel, postClass, previousRel, publishedClassName,
	userProgressAssessmentsRel, userProgressOutcomeRel } from './constants.js';
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

	async getActivityType() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			if (root.entity.hasClass(discussionClass)) {
				return discussionActivity;
			} else if (root.entity.hasClass(assignmentClass)) {
				return assignmentActivity;
			} else if (root.entity.hasClass(coaClass)) {
				return coaActivity;
			}
		}
		return undefined;
	}

	async getAnonymousInfo() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const assignmentHref = this._getHref(root.entity, Rels.assignment);
			if (assignmentHref) {
				const assignmentEntity = await this._getEntityFromHref(assignmentHref);
				if (assignmentEntity.entity.hasSubEntityByRel(Rels.Assignments.anonymousMarking)) {
					const anonymousAssignmentEntity = assignmentEntity.entity.getSubEntityByRel(Rels.Assignments.anonymousMarking);
					const isAnonymous = anonymousAssignmentEntity.hasClass(checkedClassName);
					const assignmentHasPublishedSubmission = anonymousAssignmentEntity.hasClass(publishedClassName);
					return {
						isAnonymous,
						assignmentHasPublishedSubmission
					};
				} else {
					return {
						isAnonymous: false
					};
				}
			}
		}
		return undefined;
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
	async getDiscussionPostsInfo() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const evaluationHref = this._getHref(root.entity, Rels.Activities.evaluation);
			if (evaluationHref) {
				const evaluationEntity = await this._getEntityFromHref(evaluationHref, false);
				if (evaluationEntity && evaluationEntity.entity && evaluationEntity.entity.hasSubEntityByRel(evidenceRel)) {
					const discussionPostsEntity = evaluationEntity.entity.getSubEntityByRel(evidenceRel);
					if (discussionPostsEntity) {
						return discussionPostsEntity.getSubEntitiesByClass(postClass);
					}
				}
			}
		}
		return [];
	}
	async getDiscussionTopicInfo() {
		const root = await this._getRootEntity(false);
		let topicName = undefined;
		let forumName = undefined;
		let calculationType = undefined;
		let topicLink = undefined;

		if (root && root.entity) {
			if (root.entity.hasLinkByRel(Rels.Discussions.topic)) {
				topicLink = root.entity.getLinkByRel(Rels.Discussions.topic).href;
				const topicResponse = await this._getEntityFromHref(topicLink, false);
				if (topicResponse && topicResponse.entity) {
					topicName = topicResponse.entity.properties.name;
					calculationType = topicResponse.entity.properties.scoreCalculationType;
					if (topicResponse.entity.hasLinkByRel(Rels.Discussions.forum)) {
						const forumLink = topicResponse.entity.getLinkByRel(Rels.Discussions.forum);
						const forumResponse = await this._getEntityFromHref(forumLink, false);
						if (forumResponse && forumResponse.entity) {
							forumName = forumResponse.entity.properties.name;
						}
					}
				}
			}
		}
		return {
			topicName,
			forumName,
			calculationType,
			topicLink
		};
	}
	async getEditActivityPath() {
		const root = await this._getRootEntity(false);
		let editActivityPath = undefined;
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(Rels.Activities.activityUsage)) {
				const activityUsageLink = root.entity.getLinkByRel(Rels.Activities.activityUsage).href;
				const activityUsageResponse = await this._getEntityFromHref(activityUsageLink, false);
				if (activityUsageResponse && activityUsageResponse.entity) {
					const editAcitivityEntity = activityUsageResponse.entity.getSubEntityByRel(Rels.Assessments.activityUsageEditApplication);
					editActivityPath = editAcitivityEntity ? editAcitivityEntity.properties.path : undefined;
				}
			}
		}
		return editActivityPath;
	}
	async getEnrolledUser() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const enrolledUserHref = this._getHref(root.entity, Rels.enrolledUser);
			const groupHref = this._getHref(root.entity, Rels.group);
			if (enrolledUserHref) {
				const enrolledUserEntity = await this._getEntityFromHref(enrolledUserHref, false);
				const pagerEntity = enrolledUserEntity.entity.getSubEntityByRel(Rels.pager);
				const emailEntity = enrolledUserEntity.entity.getSubEntityByRel(Rels.email, false);
				const userProfileEntity = enrolledUserEntity.entity.getSubEntityByRel(Rels.userProfile);
				const displayNameEntity = enrolledUserEntity.entity.getSubEntityByRel(Rels.displayName);
				const userProgressEntity = root.entity.getSubEntityByRel(userProgressAssessmentsRel, false);

				let displayName = undefined;
				let pagerPath = undefined;
				let userProgressPath = undefined;
				let emailPath = undefined;
				let userProfilePath = undefined;

				if (displayNameEntity) {
					displayName = displayNameEntity.properties.name;
				}
				if (pagerEntity) {
					pagerPath = pagerEntity.properties.path;
				}
				if (userProgressEntity) {
					userProgressPath = userProgressEntity.properties.path;
				}
				if (emailEntity) {
					emailPath = emailEntity.properties.path;
				}
				if (userProfileEntity) {
					userProfilePath = userProfileEntity.properties.path;
				}
				return {
					displayName,
					enrolledUserHref,
					emailPath,
					pagerPath,
					userProgressPath,
					userProfilePath
				};
			} else if (groupHref) {
				const groupEntity = await this._getEntityFromHref(groupHref, false);
				const pagerEntity = groupEntity.entity.getSubEntityByRel(Rels.pager);
				let pagerPath = undefined;
				if (pagerEntity) {
					pagerPath = pagerEntity.properties.path;
				}
				return {
					groupHref,
					pagerPath
				};
			}

			return undefined;
		}
	}
	async getEvaluationEntity() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {

			const evaluationHref = this._getHref(root.entity, Rels.Activities.evaluation);
			const evaluationEntity = await this._getEntityFromHref(evaluationHref, false);
			return evaluationEntity;
		}
		return undefined;
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

	async getGroupInfo() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const groupHref = this._getHref(root.entity, Rels.group);
			if (groupHref) {
				const groupEntity = await this._getEntityFromHref(groupHref, false);
				const viewMembersEntity = groupEntity.entity.getSubEntityByRel(Rels.viewMembers);
				const viewMembersPath = viewMembersEntity ? viewMembersEntity.properties.path : undefined;

				const pagerEntity = groupEntity.entity.getSubEntityByRel(Rels.pager);
				const pagerPath = pagerEntity ? pagerEntity.properties.path : undefined;

				const emailEntity = groupEntity.entity.getSubEntityByRel(Rels.email);
				const emailPath = emailEntity ? emailEntity.properties.path : undefined;

				return {
					viewMembersPath,
					pagerPath,
					emailPath
				};
			}
			return undefined;
		}
	}
	async getGroupName() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(Rels.group)) {
				const domainLink = root.entity.getLinkByRel(Rels.group).href;
				const domainResponse = await this._getEntityFromHref(domainLink, false);

				if (domainResponse && domainResponse.entity) {
					const displayEntity = domainResponse.entity.getSubEntityByRel(Rels.displayName);
					return displayEntity && displayEntity.properties && displayEntity.properties.name;
				}
			}
		}
		return undefined;
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
		let rubricPopoutLocation = undefined;
		let downloadAllSubmissionLink = undefined;

		if (root && root.entity) {
			root = root.entity;

			evaluationHref = this._getHref(root, Rels.Activities.evaluation);
			nextHref = this._getHref(root, nextRel);
			previousHref = this._getHref(root, previousRel);
			actorHref = this._getHref(root, Rels.Activities.actorActivityUsage);
			userHref = this._getHref(root, Rels.user);
			alignmentsHref = this._getHref(root, Rels.assessment);
			groupHref = this._getHref(root, Rels.group);
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

			if (root.hasSubEntityByRel(Rels.Assignments.editSpecialAccess)) {
				specialAccessHref = root.getSubEntityByRel(Rels.Assignments.editSpecialAccess).properties.path;
			}

			if (root.hasSubEntityByRel(Rels.Assessments.assessRubricApplication)) {
				rubricPopoutLocation = root.getSubEntityByRel(Rels.Assessments.assessRubricApplication).properties.path;
			}

			if (root.hasSubEntityByRel(Rels.Assignments.submissionList)) {
				if (root.getSubEntityByRel(Rels.Assignments.submissionList).properties) {
					downloadAllSubmissionLink = root.getSubEntityByRel(Rels.Assignments.submissionList).properties.downloadAll;
				}
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
			specialAccessHref,
			rubricPopoutLocation,
			downloadAllSubmissionLink
		};
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
	async getRubricInfos(refreshRubric) {
		let rubricInfos = [];
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const rubricHrefs = this._getHrefs(root.entity, Rels.assessment);
			if (rubricHrefs) {
				rubricInfos = await Promise.all(rubricHrefs.map(async rubricAssessmentHref => {
					const assessmentEntity = await this._getEntityFromHref(rubricAssessmentHref, refreshRubric);
					if (refreshRubric) {
						await this._refreshRubricAssessment(assessmentEntity);
					}
					if (assessmentEntity && assessmentEntity.entity) {
						const rubricHref = this._getHref(assessmentEntity.entity, Rels.rubric);
						const rubricEntity = await this._getEntityFromHref(rubricHref, false);
						const rubricTitle = rubricEntity.entity.properties.name;
						const rubricId = rubricEntity.entity.properties.rubricId.toString();
						const rubricOutOf = rubricEntity.entity.properties.outOf;
						const rubricScoringMethod = rubricEntity.entity.properties.scoringMethod;

						const hasUnscoredCriteria = assessmentEntity.entity.hasClass('incomplete');

						let assessorDisplayName = null;
						const assessorUserHref = this._getHref(assessmentEntity.entity, assessorUserRel);
						if (assessorUserHref) {
							const assessorUserEntity = await this._getEntityFromHref(assessorUserHref, false);
							assessorDisplayName = assessorUserEntity.entity.getSubEntityByRel(Rels.displayName).properties.name;
						}

						return {
							rubricHref,
							rubricAssessmentHref,
							rubricTitle,
							rubricId,
							rubricOutOf,
							rubricScoringMethod,
							assessorDisplayName,
							hasUnscoredCriteria
						};
					}
				}));
			}
		}

		return rubricInfos.filter(rubricInfo => rubricInfo !== undefined);
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
			const evaluationHref = this._getHref(root, Rels.Activities.evaluation);
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
	async _getEntityFromHref(targetHref, bypassCache) {
		return await window.D2L.Siren.EntityStore.fetch(targetHref, this.token, bypassCache);
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

	async _refreshRubricAssessment(assessmentEntity) {
		if (assessmentEntity && assessmentEntity.entity) {
			const criterion = assessmentEntity.entity.getSubEntitiesByClass('criterion-assessment-links');
			criterion.map(async x => {
				const criterionAssessmentHref = x.getLinkByRel('https://assessments.api.brightspace.com/rels/assessment-criterion');
				if (criterionAssessmentHref) {
					await this._getEntityFromHref(criterionAssessmentHref, true);
				}
			});
		}
	}
}
