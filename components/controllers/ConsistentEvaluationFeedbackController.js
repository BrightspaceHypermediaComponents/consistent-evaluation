import 'd2l-polymer-siren-behaviors/store/entity-store.js';

export const FeedbackControllerErrors = {
	INVALID_BASE_HREF: 'baseHref was not defined when initializing FeedbackController',
	INVALID_TYPE_BASE_HREF: 'baseHref must be a string when initializing FeedbackController',
	INVALID_TOKEN: 'token was not defined when initializing FeedbackController',
	INVALID_TYPE_TOKEN: 'token must be a string when initializing FeedbackController',
	REQUEST_FAILED: 'request for feedback failed',
	ENTITY_NOT_FOUND_REQUEST_FEEDBACK: 'entity not found for requestFeedback',
	INVALID_FEEDBACK_TEXT: 'feedback text must be a string (empty string permitted) to update feedback text.',
	FEEDBACK_MUST_HAVE_ENTITY: 'entity must be provided with the feedback to update feedback.',
	NO_SAVE_FEEDBACK_ACTION: 'Could not find the SaveFeedback action from entity.',
	FIELD_IN_ACTION_NOT_FOUND: (actionName, fieldName) => `Expected the ${actionName} action to have a ${fieldName} field.`
};

export class ConsistentEvaluationFeedbackController {
	constructor(baseHref, token) {
		if (!baseHref) {
			throw new Error(FeedbackControllerErrors.INVALID_BASE_HREF);
		}

		if (typeof baseHref !== 'string') {
			throw new Error(FeedbackControllerErrors.INVALID_TYPE_BASE_HREF);
		}

		if (!token) {
			throw new Error(FeedbackControllerErrors.INVALID_TOKEN);
		}

		if (typeof token !== 'string') {
			throw new Error(FeedbackControllerErrors.INVALID_TYPE_TOKEN);
		}
		this.baseHref = baseHref;
		this.token = token;
	}

	async requestFeedbackEntity() {
		const response = await window.D2L.Siren.EntityStore.fetch(this.baseHref, this.token);

		if (!response) {
			throw new Error(FeedbackControllerErrors.REQUEST_FAILED);
		}
		if (!response.entity) {
			throw new Error(FeedbackControllerErrors.ENTITY_NOT_FOUND_REQUEST_FEEDBACK);
		}
		return response.entity.getSubEntityByRel('feedback');
	}
}
