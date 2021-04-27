import { css, html, LitElement } from 'lit-element';
import { fivestarRatingClass, upvoteDownvoteRatingClass, upvoteOnlyRatingClass } from '../../controllers/constants.js';
import { bodyCompactStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeConsistentEvaluation } from '../../../localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

export class ConsistentEvaluationDiscussionPostRating extends RtlMixin(LocalizeConsistentEvaluation(LitElement)) {
	static get properties() {
		return {
			ratingMethod: {
				attribute: 'rating-method',
				type: String
			},
			ratingInformation: {
				attribute: false,
				type: Object
			}
		};
	}

	static get styles() {
		return [ bodyCompactStyles, css`
				.d2l-consistent-evaluation-discussion-evidence-body-rating-text {
					position: relative;
					text-align: right;
				}

				:host([dir="rtl"]) .d2l-consistent-evaluation-discussion-evidence-body-rating-text {
					position: relative;
					text-align: left;
				}
				d2l-icon {
					padding-bottom: 5px;
				}
		`];
	}

	render() {
		switch (this.ratingMethod) {
			case fivestarRatingClass:
				return html`${this._renderFiveStarRating()}`;
			case upvoteDownvoteRatingClass:
				return html`${this._renderUpvoteDownvote()}`;
			case upvoteOnlyRatingClass:
				return html`${this._renderUpvoteOnly()}`;
			default:
				return html``;
		}
	}

	_checkMaxRatingDisplay(num) {
		return (num > 99) ? '99+' : num;
	}

	_renderFiveStarRating() {
		this.ratingInformation.numRatings = 100;
		return html`
			<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-rating-text center">
				${(this.ratingInformation.numRatings <= 0) ? '-' : this.ratingInformation.ratingAverage} / 5
				<d2l-icon icon="tier1:subscribe-filled"></d2l-icon> <br>
				(${this.localize('numRatings', 'num', this._checkMaxRatingDisplay(this.ratingInformation.numRatings))})
			</div>
		`;
	}

	_renderUpvoteDownvote() {
		return html`
			<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-rating-text">
				${this.localize('upVotes', 'numUpVotes', this._checkMaxRatingDisplay(this.ratingInformation.numUpVotes))}<br>
				${this.localize('downVotes', 'numDownVotes', this._checkMaxRatingDisplay(this.ratingInformation.numDownVotes))}
			</div>
		`;
	}

	_renderUpvoteOnly() {
		return html`
			<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-rating-text">
				${this.localize('upVotes', 'numUpVotes', this._checkMaxRatingDisplay(this.ratingInformation.numUpVotes))}
			</div>
		`;
	}

}

customElements.define('d2l-consistent-evaluation-discussion-post-rating', ConsistentEvaluationDiscussionPostRating);
