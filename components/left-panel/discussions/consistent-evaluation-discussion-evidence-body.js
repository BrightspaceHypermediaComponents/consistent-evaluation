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
				<span class="d2l-body-compact d2l-link d2l-truncate">Hannah Beiley's post</span>
			</div>`;
	}

	_renderHeader() {
		if (this.isReply) {
			return html `
				${this._renderRepliedTo()}
				<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-title">Agreed. Some other evidences are emerging too.</div>
			`;
		} else {
			return html `
				<a class="d2l-body-compact d2l-link d2l-consistent-evaluation-discussion-evidence-body-title">
					The Mid-Atlantic Ridge may play a more active role in plate tectonics than thought
				</a>`;
		}
	}

	_renderDate() {
		return html `<div class="d2l-body-small">Jan 28, 2020 1:24PM</div>`;
	}

	_renderBody() {
		return html `<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis non tincidunt nibh. Integer eu rhoncus enim. Morbi vitae rhoncus est, vel ornare nulla. Quisque scelerisque, sapien vel pellentesque porttitor, tortor odio pulvinar nisi, a consectetur augue nulla a tellus. In purus eros, convallis a lacinia vitae, interdum molestie nunc. Donec in magna accumsan, rhoncus massa a, blandit dui. Phasellus accumsan scelerisque ipsum, quis pulvinar ante rhoncus pharetra. Fusce nec magna nisi. In ut lacus pharetra nibh mattis aliquam. Aenean viverra consequat nibh et malesuada.</div>`;
	}

	_renderRating() {
		return html`<div class="d2l-consistent-evaluation-discussion-evidence-body-rating-container">
				<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-rating-text">${this.localize('upVotes', 'numUpVotes', 12)}</div>
				<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-rating-text">${this.localize('downVotes', 'numDownVotes', 0)}</div>
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
