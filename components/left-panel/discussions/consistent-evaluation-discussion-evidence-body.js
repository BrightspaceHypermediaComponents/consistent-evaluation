import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/list/list.js';
import '@brightspace-ui/core/components/list/list-item.js';
import './consistent-evaluation-discussion-post-score.js';
import './consistent-evaluation-discussion-post-rating.js';
import { AttachmentTypes, getAttachmentType, getReadableFileSizeString } from '../../helpers/attachmentsHelpers.js';
import { bodyCompactStyles, bodySmallStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { formatDateTime, getLinkIconTypeFromUrl } from '../../helpers/submissionsAndFilesHelpers';
import { getFileIconTypeFromExtension } from '@brightspace-ui/core/components/icons/getFileIconType';
import { linkStyles } from '@brightspace-ui/core/components/link/link.js';
import { LocalizeConsistentEvaluation } from '../../../localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export class ConsistentEvaluationDiscussionEvidenceBody extends RtlMixin(LocalizeConsistentEvaluation(LitElement)) {
	static get properties() {
		return {
			isReply : {
				attribute: 'is-reply',
				type: Boolean
			},
			threadTitle : {
				attribute: 'thread-title',
				type: String
			},
			postHref: {
				attribute: 'post-href',
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
			},
			ratingMethod: {
				attribute: 'rating-method',
				type: String
			},
			wordCount: {
				attribute: 'word-count',
				type: Number
			},
			attachmentsList: {
				attribute: false,
				type: Array
			},
			discussionPostEntity: {
				attribute: false,
				type: Object
			}
		};
	}

	static get styles() {
		return [bodyCompactStyles, bodySmallStyles, linkStyles, css`
			.d2l-consistent-evaluation-discussion-evidence-body-title {
				font-weight: bold;
			}

			.d2l-consistent-evaluation-reply-to-container {
				display: flex;
				margin-bottom: 9px;
			}

			.d2l-consistent-evaluation-discussion-evidence-body-container {
				margin: 20px 18px;
				padding-bottom: 10px;
			}

			.d2l-consistent-evaluation-evidence-body-reply-icon {
				display: inline-block;
				flex-shrink: 0;
			}

			.d2l-consistent-evaluation-evidence-body-reply-to-text {
				margin-left: 4px;
				margin-right: 4px;
			}

			d2l-consistent-evaluation-discussion-post-rating {
				float: right;
				margin-left: 12px;
			}

			:host([dir="rtl"]) d2l-consistent-evaluation-discussion-post-rating {
				float: left;
				margin-right: 12px;
			}

			.d2l-consistent-evaluation-discussion-evidence-body-rating-text {
				text-align: right;
			}

			:host([dir="rtl"]) .d2l-consistent-evaluation-discussion-evidence-body-rating-text {
				text-align: left;
			}

			.d2l-separator-icon {
				margin-left: -5px;
				margin-right: -5px;
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

	render() {
		return html`<div class="d2l-consistent-evaluation-discussion-evidence-body-container">
			${this._renderRating()}
			${this._renderRepliedInThread()}
			${this._renderTitle()}
			${this._renderDate()}
			${this._renderWordCount()}
			${this._renderBody()}
			<d2l-list aria-role="attachment list" separators="between">
				${this._renderAttachments()}
			</d2l-list>
			${this._renderPostScore()}
		</div>`;
	}
	_downloadAttachment(href) {
		window.location.href = href;

	}

	_onPostTitleClicked() {
		window.open(this.postHref);
	}

	_onPostTitleKeydown(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			this._onPostTitleClicked();
		}
	}

	_renderAttachments() {
		if (this.attachmentsList) {
			return html`${this.attachmentsList.map((attachment) => {
				const { name, size, extension, href } = attachment.properties;
				const onClickHandler = () => this._downloadAttachment(href);
				const onKeydownHandler = (e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						this._downloadAttachment(href);
					}
				};

				const attachmentType = getAttachmentType(attachment);

				let iconType;
				switch (attachmentType) {
					case AttachmentTypes.LINK:
						iconType = getLinkIconTypeFromUrl(href);
						break;
					case AttachmentTypes.PAGE:
						iconType = 'browser';
						break;
					default:
						iconType = getFileIconTypeFromExtension(extension);
				}

				return html`<d2l-list-item class="d2l-consistent-evaluation-discussion-attachment-list-item-content">
							<div>
								<d2l-icon icon="tier1:${iconType}"></d2l-icon>
								<a
									class="d2l-link d2l-body-compact"
									tabindex="0"
									aria-label="${this.localize('clickToDownloadFile', 'fileName', name)}"
									@keydown=${onKeydownHandler}
									@click=${onClickHandler}
								>${name}</a>
								${attachmentType === AttachmentTypes.LINK ? html`` : html`<span class="d2l-body-compact">(${getReadableFileSizeString(size, this.localize.bind(this))})</span>` }
							</div>
						</d2l-list-item>`;
			})}`;
		}
	}
	_renderBody() {
		return html `<div class="d2l-body-compact d2l-consistent-evaluation-discussion-evidence-body-text">
				${unsafeHTML(this.postBody)}
			</div>`;
	}
	_renderDate() {
		return html `<span class="d2l-body-small">${formatDateTime(this.postDate, 'medium')}</span>`;
	}
	_renderPostScore() {
		if (this.discussionPostEntity && this.discussionPostEntity.properties && this.discussionPostEntity.properties.outOf) {
			return html`<d2l-consistent-evaluation-discussion-post-score .discussionPostEntity=${this.discussionPostEntity}></d2l-consistent-evaluation-discussion-post-score>`;
		}
	}
	_renderRating() {
		return html`
			<d2l-consistent-evaluation-discussion-post-rating
				rating-method=${this.ratingMethod}
				.ratingInformation=${this.ratingInformation}>
			</d2l-consistent-evaluation-discussion-post-rating>`;
	}
	_renderRepliedInThread() {
		if (this.isReply) {
			return html `<div class="d2l-consistent-evaluation-reply-to-container">
				<d2l-icon class="d2l-consistent-evaluation-evidence-body-reply-icon" icon="d2l-tier1:reply"></d2l-icon>
				<span class="d2l-body-small d2l-consistent-evaluation-evidence-body-reply-to-text d2l-truncate">
					${this.localize('repliedInThread', 'threadTitle', this.threadTitle)}
				</span>
			</div>`;
		} else {
			return html``;
		}
	}
	_renderTitle() {
		return html `<div
			class="d2l-body-compact d2l-link d2l-consistent-evaluation-discussion-evidence-body-title"
			tabindex="0"
			@click=${this._onPostTitleClicked}
			@keydown=${this._onPostTitleKeydown}
		>${this.postTitle}</div>`;
	}
	_renderWordCount() {
		if (this.wordCount === undefined) {
			return html``;
		}
		return html`
			<d2l-icon class="d2l-separator-icon" aria-hidden="true" icon="tier1:dot"></d2l-icon>
			<span class="d2l-body-small">
				${(this.wordCount > 9999) ? this.localize('maxWordCount') : this.localize('wordCount', { num : this.wordCount })}
			</span>
		`;
	}

}

customElements.define('d2l-consistent-evaluation-discussion-evidence-body', ConsistentEvaluationDiscussionEvidenceBody);
