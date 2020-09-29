// import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { assessmentRel, evaluationRel, nextRel, previousRel, rubricRel } from '../components/controllers/constants.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';
import { ConsistentEvaluationHrefController, ConsistentEvaluationHrefControllerErrors } from '../components/controllers/ConsistentEvaluationHrefController';
import { assert } from '@open-wc/testing';
import sinon from 'sinon';

describe('ConsistentEvaluationHrefController', () => {
	describe('instantiates properly and throws the correct errors', () => {
		it('accepts a proper href and token string', () => {
			assert.doesNotThrow(() => {
				new ConsistentEvaluationHrefController('href', 'token');
			});
		});

		it('throws an error when empty string given for href', () => {
			assert.throws(() => {
				new ConsistentEvaluationHrefController('', 'token');
			}, ConsistentEvaluationHrefControllerErrors.INVALID_BASE_HREF);
		});

		it('throws an error when empty string given for token', () => {
			assert.throws(() => {
				new ConsistentEvaluationHrefController('href', '');
			}, ConsistentEvaluationHrefControllerErrors.INVALID_TOKEN);
		});

		it('throws an error for null href', () => {
			assert.throws(() => {
				new ConsistentEvaluationHrefController(null, 'token');
			}, ConsistentEvaluationHrefControllerErrors.INVALID_BASE_HREF);
		});

		it('throws an error for null token', () => {
			assert.throws(() => {
				new ConsistentEvaluationHrefController('href', null);
			}, ConsistentEvaluationHrefControllerErrors.INVALID_TOKEN);
		});

		it('throws an error for non string href', () => {
			assert.throws(() => {
				new ConsistentEvaluationHrefController(20, 'token');
			}, ConsistentEvaluationHrefControllerErrors.INVALID_TYPE_BASE_HREF);
		});

		it('throws an error for non string token', () => {
			assert.throws(() => {
				new ConsistentEvaluationHrefController('href', 20);
			}, ConsistentEvaluationHrefControllerErrors.INVALID_TYPE_TOKEN);
		});
	});

	describe('getHrefs works properly and will set the correct hrefs', () => {
		const relations = [
			{ key: 'evaluationHref', rel: evaluationRel },
			{ key: 'nextHref', rel: nextRel },
			{ key: 'previousHref', rel: previousRel },
		];

		// testing that each href is solely set
		relations.forEach(({ key, rel }) => {
			it(`sets only the ${key} properly`, async() => {

				const controller = new ConsistentEvaluationHrefController('href', 'token');
				const href = 'the_href_to_find';

				sinon.stub(controller, '_getRootEntity').returns({
					entity: {
						hasLinkByRel: (r) => r === rel,
						getLinkByRel: (r) => (r === rel ? { href } : undefined)
					}
				});

				const hrefs = await controller.getHrefs(true);

				// make sure that only the current key is assigned an href
				relations.forEach(relation => {
					assert.equal(hrefs[relation.key], relation.key === key ? href : undefined);
				});

				controller._getRootEntity.restore();
			});
		});

		it('sets only the rubric assessment href properly', async() => {
			const expectedAssessmentHref = 'the_assessment_href_to_find';

			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === assessmentRel,
					getLinkByRel: (r) => (r === assessmentRel ? { href: expectedAssessmentHref } : undefined)
				}
			});
			sinon.stub(controller, '_getEntityFromHref').returns(undefined);

			const hrefs = await controller.getHrefs(true);

			assert.equal(hrefs.rubricAssessmentHref, expectedAssessmentHref);

			controller._getRootEntity.restore();
			controller._getEntityFromHref.restore();
		});

		it('sets the rubric href and the rubric assessment href  properly', async() => {
			const expectedAssessmentHref = 'the_assessment_href_to_find';
			const expectedRubricHref = 'the_rubric_href_to_find';

			const controller = new ConsistentEvaluationHrefController('href', 'token');
			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === assessmentRel,
					getLinkByRel: (r) => (r === assessmentRel ? { href: expectedAssessmentHref } : undefined)
				}
			});
			sinon.stub(controller, '_getEntityFromHref').returns({
				entity: {
					hasLinkByRel: (r) => r === rubricRel,
					getLinkByRel: (r) => (r === rubricRel ? { href: expectedRubricHref } : undefined)
				}
			});

			const hrefs = await controller.getHrefs(true);

			assert.equal(hrefs.rubricAssessmentHref, expectedAssessmentHref);
			assert.equal(hrefs.rubricHref, expectedRubricHref);

			controller._getRootEntity.restore();
			controller._getEntityFromHref.restore();
		});

	});

	describe('getSubmissionInfo works', () => {
		it('sets the submission info', async() => {
			const assignmentHref = 'expected_assignment_href';
			const expectedSubmissions = ['link1', 'link2'];
			const expectedEvaluationState = 'Draft';
			const expectedSubmissionType = 'File Submission';

			const controller = new ConsistentEvaluationHrefController('href', 'token');
			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.assignment,
					getLinkByRel: (r) => (r === Rels.assignment ? { href: assignmentHref } : undefined),
					getSubEntityByClass: (r) => (r === Classes.assignments.submissionList ? { links: expectedSubmissions } : undefined),
					getSubEntityByRel: (r) => (r === Rels.evaluation ? { properties: {state: expectedEvaluationState}} : undefined)
				}
			});
			sinon.stub(controller, '_getEntityFromHref').returns({
				entity: {
					properties: {submissionType: {title: expectedSubmissionType}}
				}
			});
			const submissionInfo = await controller.getSubmissionInfo();
			assert.equal(submissionInfo.submissionList, expectedSubmissions);
			assert.equal(submissionInfo.evaluationState, expectedEvaluationState);
			assert.equal(submissionInfo.submissionType, expectedSubmissionType);
		});
	});

	describe('getGradeItemInfo gets correct grade item info', () => {
		it('sets the gradeItem info', async() => {
			const activityUsageHref = 'expected_activity_usage_href';
			const gradeHref = 'expected_grade_href';
			const evaluationUrl = 'expectedEvaluationUrl';
			const statsUrl = 'expectedStatsUrl';
			const gradeItemName = 'expectedGradeItemName';

			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.Activities.activityUsage,
					getLinkByRel: (r) => (r === Rels.Activities.activityUsage ? { href: activityUsageHref } : undefined)
				}
			});

			const getHrefStub = sinon.stub(controller, '_getEntityFromHref');

			getHrefStub.withArgs(activityUsageHref, false).returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.Grades.grade,
					getLinkByRel: (r) => (r === Rels.Grades.grade ? { href: gradeHref } : undefined)
				}
			});

			getHrefStub.withArgs(gradeHref, false).returns({
				entity: {
					properties: {
						evaluationUrl: evaluationUrl,
						statsUrl: statsUrl,
						name: gradeItemName
					}
				}
			});

			const gradeItemInfo = await controller.getGradeItemInfo();
			assert.equal(gradeItemInfo.evaluationUrl, evaluationUrl);
			assert.equal(gradeItemInfo.statsUrl, statsUrl);
			assert.equal(gradeItemInfo.gradeItemName, gradeItemName);
		});
	});

	describe('getAssignmentOrganizationName gets correct info', () => {
		it('sets the assignment name', async() => {
			const assignmentHref = 'expected_assignment_href';
			const expectedAssignmentName = 'expectedAssignmentName';

			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.assignment,
					getLinkByRel: (r) => (r === Rels.assignment ? { href: assignmentHref } : undefined)
				}
			});

			const getHrefStub = sinon.stub(controller, '_getEntityFromHref');

			getHrefStub.withArgs(assignmentHref, false).returns({
				entity: {
					properties: {
						name: expectedAssignmentName
					}
				}
			});

			const actualAssignmentName = await controller.getAssignmentOrganizationName('assignment');
			assert.equal(actualAssignmentName, expectedAssignmentName);
		});

		it('sets the organization name', async() => {
			const organizationHref = 'expected_organization_href';
			const expectedOrganizationName = 'expectedOrganizationName';

			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.organization,
					getLinkByRel: (r) => (r === Rels.organization ? { href: organizationHref } : undefined)
				}
			});

			const getHrefStub = sinon.stub(controller, '_getEntityFromHref');

			getHrefStub.withArgs(organizationHref, false).returns({
				entity: {
					properties: {
						name: expectedOrganizationName
					}
				}
			});

			const actualOrganizationName = await controller.getAssignmentOrganizationName('organization');
			assert.equal(actualOrganizationName, expectedOrganizationName);
		});
	});
});
