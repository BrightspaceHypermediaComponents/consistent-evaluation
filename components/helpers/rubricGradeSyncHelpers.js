import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { Grade, GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';

export function mapRubricScoreToGrade(rubricInfo, currentGrade, newScore) {
	let score = currentGrade.score;
	let letterGrade = currentGrade.letterGrade;
	let outOf = 100;

	if (rubricInfo.rubricOutOf) {
		outOf = rubricInfo.rubricOutOf;
	}

	if (currentGrade.scoreType === GradeType.Letter && currentGrade.letterGradeOptions) {
		const percentage = (newScore / outOf) * 100;
		const map = currentGrade.letterGradeOptions;
		let currentPercentStart = 0;
		for (const letterGradeOption of Object.values(map)) {
			if (percentage >= letterGradeOption.PercentStart &&
				currentPercentStart <= letterGradeOption.PercentStart &&
				letterGradeOption.PercentStart !== null
			) {
				currentPercentStart = letterGradeOption.PercentStart;
				letterGrade = letterGradeOption.LetterGrade;
			}
		}
	} else {
		score = (newScore / outOf) * currentGrade.outOf;
	}

	return new Grade(
		currentGrade.scoreType,
		score,
		currentGrade.outOf,
		letterGrade,
		currentGrade.letterGradeOptions,
		currentGrade.entity
	);
}

export async function getRubricAssessmentScore(rubricInfo, token) {
	if (rubricInfo && rubricInfo.rubricAssessmentHref) {
		const bypassCache = false;
		const assessment = await window.D2L.Siren.EntityStore.fetch(rubricInfo.rubricAssessmentHref, token, bypassCache);
		if (assessment && assessment.entity) {
			return assessment.entity.properties.score;
		}
	}

	return undefined;
}
