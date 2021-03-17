import '@brightspace-ui/core/components/icons/icon.js';
import { bodyCompactStyles, bodySmallStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { linkStyles } from '@brightspace-ui/core/components/link/link.js';
import { LocalizeConsistentEvaluation } from '../../../lang/localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

export class ConsistentEvaluationDiscussionEvidenceBody extends RtlMixin(LocalizeConsistentEvaluation(LitElement)) {
	static get properties() {
		return {
			isReply : {
				attribute: 'is-reply',
				type: Boolean
			},
			repliedToPostName : {
				attribute: 'replied-to-post-name',
				type: String
			},
			postTitle : {
				attribute: 'post-title',
				type: String
			},
			postBody: {
				attribute: 'post-body',
				type: String
			},
			postDate: {
				attribute: 'post-date',
				type: String
			},
			ratingInformation: {
				attribute: false,
				type: Object
			}
		};
	}

	static get styles() {
		return [bodyCompactStyles, bodySmallStyles, linkStyles, css`
			.d2l-consistent-evaluation-discussion-evidence-body-title {
				font-weight: bold;
				margin-bottom: 9px;
			}

			.d2l-consistent-evaluation-reply-to-container {
				display: flex;
				margin-bottom: 9px;
			}

			.d2l-consistent-evaluation-discussion-evidence-body-container {
				margin: 20px 18px;
			}

			.d2l-consistent-evaluation-evidence-body-reply-icon {
				display: inline-block;
				flex-shrink: 0;
			}

			.d2l-consistent-evaluation-evidence-body-reply-to-text {
				flex-shrink: 0;
				margin-left: 4px;
				margin-right: 4px;
			}

			.d2l-consistent-evaluation-discussion-evidence-body-rating-container {
				float: right;
				margin-left: 12px;
			}

			:host([dir="rtl"]) .d2l-consistent-evaluation-discussion-evidence-body-rating-container {
				float: left;
				margin-right: 12px;
			}

			.d2l-consistent-evaluation-discussion-evidence-body-rating-text {
				text-align: right;
			}

			:host([dir="rtl"]) .d2l-consistent-evaluation-discussion-evidence-body-rating-text {
				text-align: left;
			}

			.d2l-consistent-evaluation-discussion-evidence-body-text {
				padding-bottom: 10px;
				padding-top: 20px;
			}

			.d2l-truncate {
				overflow: hidden;
				overflow-wrap: break-word;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		`];
	}

	constructor() {
		super();
		this.isReply = false;
	}

	_renderRepliedTo() {
		return html `<div class="d2l-consistent-evaluation-reply-to-container">
				<d2l-icon class="d2l-consistent-evaluation-evidence-body-reply-icon" icon="d2l-tier1:reply"></d2l-icon>
				<span class="d2l-body-compact d2l-consistent-evaluation-evidence-body-reply-to-text">${this.localize('repliedTo')}</span>
				<span class="d2l-body-compact d2l-link d2l-truncate">${this.repliedToPostName}</span>
			</div>`;
	}

	_renderHeader() {
		if (this.isReply) {
			return html `
				${this._renderRepliedTo()}
				<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-title">${this.postTitle}</div>
			`;
		} else {
			return html `
				<a class="d2l-body-compact d2l-link d2l-consistent-evaluation-discussion-evidence-body-title">${this.postTitle}</a>`;
		}
	}

	_renderDate() {
		return html `<div class="d2l-body-small">${this.postDate}</div>`;
	}

	_renderBody() {
		return html `<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-text">${this.postBody}</div>`;
	}

	_renderRating() {
		return html`<div class="d2l-consistent-evaluation-discussion-evidence-body-rating-container">
				<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-rating-text">${this.localize('upVotes', 'numUpVotes', this.ratingInformation.upVotes)}</div>
				<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-rating-text">${this.localize('downVotes', 'numDownVotes', this.ratingInformation.downVotes)}</div>
			</div>`;
	}

	render() {
		return html`<div class="d2l-consistent-evaluation-discussion-evidence-body-container">
			${this._renderRating()}
			${this._renderHeader()}
			${this._renderDate()}
			${this._renderBody()}
		</div>`;
	}
}

customElements.define('d2l-consistent-evaluation-discussion-evidence-body', ConsistentEvaluationDiscussionEvidenceBody);