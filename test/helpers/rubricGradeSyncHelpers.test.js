import { getRubricAssessmentScore, mapRubricScoreToGrade} from '../../components/helpers/rubricGradeSyncHelpers.js';
import { assert } from '@open-wc/testing';
import { GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import sinon from 'sinon';

describe('rubricGradeSyncHelpers', () => {
	describe('mapRubricScoreToGrade', () => {
		const defaultSchemeRange = {
			'A': 70,
			'B': 40,
			'C': 0,
		};

		const testCases = [
			{
				name:'Letter grade - expected A',
				rubricInfo : {
					rubricOutOf: 10
				},
				currentGrade : {
					score: null,
					letterGrade: null,
					scoreType: GradeType.Letter,
					outOf: null,
					letterGradeOptions : ['A'],
					entity: {
						properties: {
							letterGradeSchemeRanges : defaultSchemeRange
						}
					}
				},
				newScore: 8,
				expectedScore: null,
				expectedLetterGrade: 'A'
			},
			{
				name:'Letter grade - expected C',
				rubricInfo : {
					rubricOutOf: 10
				},
				currentGrade : {
					score: null,
					letterGrade: null,
					scoreType: GradeType.Letter,
					outOf: null,
					letterGradeOptions : ['C'],
					entity: {
						properties: {
							letterGradeSchemeRanges : defaultSchemeRange
						}
					}
				},
				newScore: 1,
				expectedScore: null,
				expectedLetterGrade: 'C'
			},
			{
				name:'Decimal score 0',
				rubricInfo : {
					rubricOutOf: 100
				},
				currentGrade : {
					score: null,
					letterGrade: null,
					scoreType: GradeType.Number,
					outOf: 10,
					entity: {
						properties: {
							letterGradeSchemeRanges : null
						}
					}
				},
				newScore: 0,
				expectedScore: 0,
				expectedLetterGrade: null
			},
			{
				name:'Decimal score 15',
				rubricInfo : {
					rubricOutOf: 50
				},
				currentGrade : {
					score: null,
					letterGrade: null,
					scoreType: GradeType.Number,
					outOf: 30,
					entity: {
						properties: {
							letterGradeSchemeRanges : null
						}
					}
				},
				newScore: 25,
				expectedScore: 15,
				expectedLetterGrade: null
			},
			{
				name:'Decimal score 90',
				rubricInfo : {
					rubricOutOf: 10
				},
				currentGrade : {
					score: null,
					letterGrade: null,
					scoreType: GradeType.Number,
					outOf: 100,
					entity: {
						properties: {
							letterGradeSchemeRanges : null
						}
					}
				},
				newScore: 9,
				expectedScore: 90,
				expectedLetterGrade: null
			},
			{
				name:'Decimal score no rubric outOf, use 100',
				rubricInfo : {
					rubricOutOf: null
				},
				currentGrade : {
					score: null,
					letterGrade: null,
					scoreType: GradeType.Number,
					outOf: 10,
					entity: {
						properties: {
							letterGradeSchemeRanges : null
						}
					}
				},
				newScore: 70,
				expectedScore: 7,
				expectedLetterGrade: null
			}
		];

		testCases.forEach(test => {
			it(test.name, () => {
				const actualResult = mapRubricScoreToGrade(test.rubricInfo, test.currentGrade, test.newScore);
				assert.equal(actualResult.score, test.expectedScore);
				assert.equal(actualResult.letterGrade, test.expectedLetterGrade);
			});
		});
	});

	describe('getRubricAssessmentScore', () => {
		const rubricInfo = {
			rubricAssessmentHref : '/assessment/href/1'
		};

		it('returns undefined given bad params', async() => {
			const actualResult = await getRubricAssessmentScore(null, 'token');
			assert.equal(actualResult, undefined);
		});

		it('returns undefined given unexpected api response', async() => {
			const badResponse = {};
			sinon.stub(window.D2L.Siren.EntityStore, 'fetch').returns(badResponse);
			const actualResult = await getRubricAssessmentScore(rubricInfo, 'token');
			assert.equal(actualResult, undefined);
			window.D2L.Siren.EntityStore.fetch.restore();
		});

		it('returns the score from the api', async() => {
			const goodResponse = {
				entity : {
					properties:{
						score : 10
					}
				}
			};
			sinon.stub(window.D2L.Siren.EntityStore, 'fetch').returns(goodResponse);
			const actualResult = await getRubricAssessmentScore(rubricInfo, 'token');
			assert.equal(actualResult, 10);
			window.D2L.Siren.EntityStore.fetch.restore();
		});
	});
});
