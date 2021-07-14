import 'd2l-activities/components/d2l-activity-editor/d2l-activity-text-editor.js';
import './consistent-evaluation-right-panel-block';
import './consistent-evaluation-attachments-editor.js';
import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import '@brightspace-ui/core/components/html-block/html-block.js';
import '@brightspace-ui/core/components/inputs/input-search.js';
import '@brightspace-ui/core/components/list/list.js';
import '@brightspace-ui/core/components/list/list-item.js';
import '@brightspace-ui/core/components/list/list-item-content.js';
import { css, html, LitElement } from 'lit-element';
import { convertToken } from '../helpers/converterHelpers.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { deleteCommentActionName } from '../controllers/constants.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../localize-consistent-evaluation.js';
import { radioStyles } from '@brightspace-ui/core/components/inputs/input-radio-styles.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

class ConsistentEvaluationFeedbackPresentational extends LocalizeConsistentEvaluation(LitElement) {
	static get properties() {
		return {
			canEditFeedback: {
				attribute: 'can-edit-feedback',
				type: Boolean
			},
			canAddFile: {
				attribute: 'can-add-file',
				type: Boolean
			},
			canRecordVideo: {
				attribute: 'can-record-video',
				type: Boolean
			},
			canRecordAudio: {
				attribute: 'can-record-audio',
				type: Boolean
			},
			canAddFeedbackLink: {
				attribute: 'allow-add-link',
				type: Boolean
			},
			canAddFeedbackGoogleDriveLink: {
				attribute: 'allow-add-link-google-drive',
				type: Boolean
			},
			canAddFeedbackOneDriveLink: {
				attribute: 'allow-add-link-one-drive',
				type: Boolean
			},
			feedbackText: {
				attribute: false
			},
			attachments: {
				attribute: false
			},
			commentBankOpen: {
				attribute: false
			},
			href: {
				type: String
			},
			richTextEditorConfig: {
				attribute: false,
				type: Object
			},
			useNewHtmlEditor: {
				attribute: 'use-new-html-editor',
				type: Boolean
			},
			mySavedFeedback: {
				attribute: false,
				type: Array
			},
			token: {
				type: Object,
				reflect: true,
				converter: (value) => convertToken(value),
			},
			_key: {
				type: String
			},
			_feedbackSummaryInfo: {
				type: String
			}
		};
	}

	static get styles() {
		return [radioStyles, css`
			#comment-bank-button {
				float: right
			}
			.d2l-consistent-evaluation-right-panel-clearfix {
				height: 1rem;
			}
			#comment-bank-button {
				float: right
			}
			.d2l-clickable-list-item {
				width: 100%;
				cursor: pointer;
			}
			.d2l-dialog-outer {
				min-height: 500px !important;
			}
		`];
	}

	constructor() {
		super();
		this.commentBankOption = 0;
		this.canEditFeedback = false;
		this.canAddFile = false;
		this.canRecordVideo = false;
		this.canRecordAudio = false;
		this.canAddFeedbackLink = false;
		this.canAddFeedbackGoogleDriveLink = false;
		this.canAddFeedbackOneDriveLink = false;
		this.useNewHtmlEditor = false;
		this.commentBankOpen = false;
		this._debounceJobs = {};
		this.flush = this.flush.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('d2l-request-provider', this.htmlEditorEnabled);
		window.addEventListener('d2l-flush', this.flush);
	}
	disconnectedCallback() {
		this.removeEventListener('d2l-request-provider', this.htmlEditorEnabled);
		window.removeEventListener('d2l-flush', this.flush);
		super.disconnectedCallback();
	}
	render() {
		if (this.href && this.token && this.richTextEditorConfig) {
			const attachmentsComponent = this.canEditFeedback || this.attachments.length !== 0
				? html`
					<div>
						<d2l-consistent-evaluation-attachments-editor
							.attachments=${this.attachments}
							.canEditFeedback="${this.canEditFeedback}"
							.canAddFile="${this.canAddFile}"
							.canRecordVideo="${this.canRecordVideo}"
							.canRecordAudio="${this.canRecordAudio}"
							.canAddFeedbackLink="${this.canAddFeedbackLink}"
							.canAddFeedbackGoogleDriveLink="${this.canAddFeedbackGoogleDriveLink}"
							.canAddFeedbackOneDriveLink="${this.canAddFeedbackOneDriveLink}">
						</d2l-consistent-evaluation-attachments-editor>
					</div>`
				: null;
			this._setFeedbackSummaryInfo();
			return html`
				<d2l-button id="comment-bank-button" class="d2l-desktop" @click="${this._onCommentBankOpen}">Comment Bank</d2l-button>
				<d2l-consistent-evaluation-right-panel-block
					class="d2l-consistent-evaluation-feedback-block"
					supportingInfo=${ifDefined(this._feedbackSummaryInfo)}
					title="${this.localize('overallFeedback')}">
						${this._getHtmlEditor()}
						${this._getCommentBank()}
						<div class="d2l-consistent-evaluation-right-panel-clearfix"></div>
						${this._renderCommentBankOptions()}
						${attachmentsComponent}
				</d2l-consistent-evaluation-right-panel-block>
			`;
		} else {
			return html``;
		}
	}
	updated(changedProperties) {
		super.updated(changedProperties);

		if (changedProperties.has('feedbackText')) {
			this._key = this.href;
		}

		if (changedProperties.has('mySavedFeedback')) {
			this._resizeDialog();
		}
	}
	flush() {
		if (this._debounceJobs.feedback && this._debounceJobs.feedback.isActive()) {
			this._debounceJobs.feedback.flush();
		}
	}
	htmlEditorEnabled(e) {
		if (e.detail.key === 'd2l-provider-html-editor-enabled') {
			e.detail.provider = true;
		}
	}

	_addFeedbackFromBank(text) {
		this.feedbackText += ' ' + text;
		this.commentBankOpen = false;
	}

	_deleteFeedbackFromBank(commentId) {
		this._emitDeleteSavedFeedbackEvent(commentId);
	}

	_emitDeleteSavedFeedbackEvent(commentId) {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-evaluation-delete-saved-feedback', {
			composed: true,
			bubbles: true,
			detail: {
				commentIdToDelete: commentId
			}
		}));
	}

	_emitFeedbackEditEvent(feedback) {
		const commentBankOption = this.commentBankOption;
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-feedback-edit', {
			composed: true,
			bubbles: true,
			detail: {
				comment: feedback,
				storageSetting: commentBankOption
			}
		}));
	}

	_emitFeedbackTextEditorChangeEvent() {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-feedback-text-editor-change', {
			composed: true,
			bubbles: true
		}));
	}

	_emitGetMySavedFeedbackEvent(search) {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-evaluation-get-my-saved-feedback', {
			composed: true,
			bubbles: true,
			detail: search
		}));
	}

	_getCommentBank() {
		return html`
			<d2l-dialog
				title-text='Comment BANK!'
				?opened=${this.commentBankOpen}
				width=1000
				id="comment-bank-dialog"
				@d2l-dialog-close=${this._onCommentBankClose}>
					${this._renderCommentBankSearch()}
					${this._renderCommentBank()}
			</d2l-dialog>
		`;
	}

	_getHtmlEditor() {
		if (this.useNewHtmlEditor) {
			import('@brightspace-ui/htmleditor/htmleditor.js');
			return html `
				<d2l-htmleditor
					html="${this.feedbackText}"
					label="${this.localize('overallFeedback')}"
					label-hidden
					paste-local-images
					height="15rem"
					@d2l-htmleditor-blur="${this._saveOnFeedbackChangeNewEditor}">
				</d2l-htmleditor>

			`;
		} else {
			return html `
				<d2l-activity-text-editor
					.key="${this._key}"
					.value="${this.feedbackText}"
					.richtextEditorConfig="${this.richTextEditorConfig}"
					@d2l-activity-text-editor-change="${this._saveOnFeedbackChange}"
					ariaLabel="${this.localize('overallFeedback')}">
				</d2l-activity-text-editor>
			`;
		}
	}

	_onCommentBankClose() {
		this.commentBankOpen = false;
	}

	_onCommentBankOpen() {
		this._emitGetMySavedFeedbackEvent(null);
		this.commentBankOpen = true;
	}

	_onCommentBankOptionChange(e) {
		this.commentBankOption = e.target.value;
	}

	_onCommentBankSearch(e) {
		const searchTerm = e.detail.value;
		this._emitGetMySavedFeedbackEvent(searchTerm);
	}

	_renderCommentBank() {
		if (!this.mySavedFeedback) {
			return html``;
		}

		if (this.mySavedFeedback.length === 0) {
			return html`
				<d2l-list separators="between">
					<d2l-list-item>
						<d2l-list-item-content class="d2l-list-item-content">
							No saved comments to display.
						</d2l-list-item-content>
					</d2l-list-item>
				</d2l-list>
			`;
		}

		const itemTemplate = this.mySavedFeedback.map(feedback => {
			const onClickHandler = () => this._addFeedbackFromBank(feedback.properties.text);

			return html`
				<d2l-list-item>
						<d2l-list-item-content @click=${onClickHandler} class="d2l-clickable-list-item">
							<div>
								<d2l-html-block>
									<template>
										<d2l-more-less>${unsafeHTML(feedback.properties.text)}</d2l-more-less>
									</template>
								</d2l-html-block>
							</div>
							<div slot="secondary">Times Used: ${feedback.properties.timesUsed}</div>
						</d2l-list-item-content>
					<div slot="actions">
						${this._renderDeleteButton(feedback)}
					</div>
				</d2l-list-item>
			`;
		});

		return html`
			<d2l-list separators="between">
				${itemTemplate}
			</d2l-list>
			<div class="d2l-consistent-evaluation-right-panel-clearfix"></div>
		`;
	}

	_renderCommentBankOptions() {
		return html`
			<label class="d2l-input-radio-label">
				<input type="radio" name="commentBankGroup" checked value=0  @change="${this._onCommentBankOptionChange}">
				Do not store comment
			</label>
			<label class="d2l-input-radio-label">
				<input type="radio" name="commentBankGroup" value=1 @change="${this._onCommentBankOptionChange}">
				Store comment in personal bank
			</label>
			<label class="d2l-input-radio-label">
				<input type="radio" name="commentBankGroup" value=2 @change="${this._onCommentBankOptionChange}">
				Store comment in public bank
			</label>
		`;
	}

	_renderCommentBankSearch() {
		return html`
			<d2l-input-search
				label="Search"
				placeholder="Search comments"
				@d2l-input-search-searched=${this._onCommentBankSearch}>
			</d2l-input-search>
			<div class="d2l-consistent-evaluation-right-panel-clearfix"></div>
		`;
	}

	_renderDeleteButton(feedback) {
		if (feedback.hasActionByName(deleteCommentActionName)) {
			const onDeleteHandler = () => this._deleteFeedbackFromBank(feedback.properties.commentId);
			return html`
				<d2l-button-icon
					id='delete-comment-button'
					text='Delete comment'
					icon='tier1:delete'
					@click=${onDeleteHandler}
				></d2l-button-icon>
			`;
		}
		return html``;
	}

	_resizeDialog() {
		const dialog = this.shadowRoot.querySelector('d2l-consistent-evaluation-right-panel-block').querySelector('d2l-dialog');
		dialog.resize();
	}

	_saveOnFeedbackChange(e) {
		const feedback = e.detail.content;
		this._emitFeedbackTextEditorChangeEvent();
		this._debounceJobs.feedback = Debouncer.debounce(
			this._debounceJobs.feedback,
			timeOut.after(800),
			() => this._emitFeedbackEditEvent(feedback)
		);
	}

	_saveOnFeedbackChangeNewEditor() {
		const feedback = this.shadowRoot.querySelector('d2l-htmleditor').html;
		if (this.feedbackText === feedback) {
			return;
		}
		this._emitFeedbackTextEditorChangeEvent();
		this._debounceJobs.feedback = Debouncer.debounce(
			this._debounceJobs.feedback,
			timeOut.after(800),
			() => this._emitFeedbackEditEvent(feedback)
		);
	}

	_setFeedbackSummaryInfo() {
		let summary = '';
		if (this.feedbackText === null || this.feedbackText === '') {
			summary = this.localize('noFeedbackSummary');
		} else {
			const tmpDiv = document.createElement('div');
			tmpDiv.innerHTML = this.feedbackText;
			summary = tmpDiv.textContent || tmpDiv.innerText || '';
		}
		this._feedbackSummaryInfo = summary;
	}

}

customElements.define('d2l-consistent-evaluation-feedback-presentational', ConsistentEvaluationFeedbackPresentational);
