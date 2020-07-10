import '@brightspace-ui/core/components/button/button-icon.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/dropdown/dropdown-more.js';
import '@brightspace-ui/core/components/dropdown/dropdown-menu.js';
import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/list/list.js';
import '@brightspace-ui/core/components/list/list-item.js';
import '@brightspace-ui/core/components/list/list-item-content.js';
import '@brightspace-ui/core/components/menu/menu.js';
import '@brightspace-ui/core/components/menu/menu-item-link.js';
import '@brightspace-ui/core/components/more-less/more-less.js';
import '@brightspace-ui/core/components/status-indicator/status-indicator.js';
import { bodySmallStyles, heading3Styles, labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { fileSubmission, textSubmission } from '../controllers/constants';
import { formatDateTime } from '@brightspace-ui/intl/lib/dateTime.js';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export class ConsistentEvaluationSubmissionItem extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			dateStr : {
				attribute: 'date-str',
				type: String
			},
			displayNumber : {
				attribute: 'display-number',
				type: Number
			},
			evaluationState : {
				attribute: 'evaluation-state',
				type: String
			},
			late: {
				type: Boolean
			},
			submissionEntity : {
				attribute: 'submission-entity',
				type: Object
			},
			submissionType: {
				attribute: 'submission-type',
				type: String
			}
		};
	}

	static get styles() {
		return [heading3Styles, labelStyles, bodySmallStyles, css`
		:host {
			background-color: white;
			border: 1px solid var(--d2l-color-gypsum);
			border-radius: 6px;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			position: relative;
		}
		.d2l-heading-3 {
			margin: 0;
		}
		.consistent-eval-submission-attachment-item {
			display: inline-block;
			vertical-align: middle;
			padding-left: 0.5rem;
		}
		.consistent-eval-submission-attachment-item-container:hover {
			background-color: var(--d2l-color-regolith);
		}
		.consistent-eval-submission-attachment-item-container {
			justify-content: space-between;
		}
	`];
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	constructor() {
		super();

		this._submissionEntity = undefined;
		this._date = undefined;
		this._attachments = [];
		this._comment = '';
	}

	get submissionEntity() {
		return this._submissionEntity;
	}

	set submissionEntity(newSubmission) {
		const oldVal = this.submissionList;
		if (oldVal !== newSubmission) {
			this._submissionEntity = newSubmission;
			this._initializeSubmissionProperties();
			this.requestUpdate();
		}
	}

	_initializeSubmissionProperties() {
		this._date = this.dateStr ? new Date(this.dateStr) : undefined;
		const attachmentsListEntity = this.submissionEntity.getSubEntityByClass('attachment-list');
		if (attachmentsListEntity && attachmentsListEntity.entities) {
			this._attachments = attachmentsListEntity.entities;
		}
		if (this.submissionEntity.getSubEntityByClass('submission-comment')) {
			this._comment = this.submissionEntity.getSubEntityByClass('submission-comment').properties.html;
		}
	}

	//Helper methods

	_getIcon(filename) {
		const ext = this._getFileType(filename);
		if (ext === 'PNG' || ext === 'JPG' || ext === 'TIF' || ext === 'TIFF') {
			return 'file-image';
		}
		else {
			return 'file-document';
		}
	}

	_getFileTitle(filename) {
		return filename.split('.')[0];
	}

	_getFileType(filename) {
		return filename.split('.')[1].toUpperCase();
	}

	_getReadableFileSizeString(fileSizeBytes) {
		let i = -1;
		const byteUnits = ['kB', 'MB', 'GB'];
		do {
			fileSizeBytes = fileSizeBytes / 1024;
			i++;
		} while (fileSizeBytes > 1024);
		const unit = this.localize(byteUnits[i]);
		return Math.max(fileSizeBytes, 0.1).toFixed(1) + unit;
	}

	_formatDate() {
		const formattedDate = (this._date) ? formatDateTime(
			this._date,
			{format: 'full'}) : '';
		return formattedDate;
	}

	//Helper rendering methods

	_renderFileSubmissionTitle() {
		return html`
		<d2l-list-item>
		<d2l-list-item-content>
			<h3 class="d2l-heading-3">${this.localize('submission')} ${this.displayNumber}</h3>
			<div class="d2l-body-small">
				${this._renderLateStatus()}
				${this._renderEvaluationState()}
				${this._formatDate()}
			</div>
		</d2l-list-item-content>
		</d2l-list-item>`;
	}

	_renderTextSubmissionTitle() {
		// There is only one attachment for text submissions: an html file
		const file = this._attachments[0];
		const flagged = file.properties.flagged;
		const read = file.properties.read;
		const href = file.properties.href;
		return html`
		<d2l-list-item>
		<d2l-list-item-content>
			<h3 class="d2l-heading-3">${this.localize('textSubmission')} ${this.displayNumber}${this._renderReadStatus(read)}</h3>
			<div class="d2l-body-small">
				${this._renderLateStatus()}
				${this._renderEvaluationState()}
				${this._renderFlaggedStatus(flagged)}
				${this._formatDate()}
			</div>
		</d2l-list-item-content>
		${this._addMenuOptions(href)}
		</d2l-list-item>`;
	}

	_renderReadStatus(read) {
		if (!read) {
			return html`<d2l-icon icon="tier1:dot" style="color: #E87511; vertical-align: top; position: relative; top: 0px;
			right: 0px;"></d2l-icon>`;
		}
	}

	_renderLateStatus() {
		if (this.late) {
			return html`<d2l-status-indicator state="alert" text="${this.localize('late')}" bold></d2l-status-indicator>`;
		} else {
			return html ``;
		}
	}

	_renderEvaluationState() {
		if (this.evaluationState) {
			return html`<d2l-status-indicator state="default" text="${this.evaluationState}"></d2l-status-indicator>`;
		} else {
			return html``;
		}
	}

	_renderFlaggedStatus(flag) {
		if (flag) {
			return html`<d2l-status-indicator state="alert" text="${this.localize('flagged')}"></d2l-status-indicator>`;
		}
	}

	_renderAttachments() {
		return html`${this._attachments.map((file) => html`
			<d2l-list-item class="consistent-eval-submission-attachment-item-container">
			<d2l-list-item-content>
				<d2l-icon class="consistent-eval-submission-attachment-item" icon="tier2:${this._getIcon(file.properties.name)}">
				</d2l-icon>
				${this._renderReadStatus(file.properties.read)}
				<div class="consistent-eval-submission-attachment-item">
					<span>${this._getFileTitle(file.properties.name)}</span>
					<div slot="secondary" class="d2l-body-small">
						${this._renderFlaggedStatus(file.properties.flagged)}
						${this._getFileType(file.properties.name)}
						<d2l-icon icon="tier1:dot"></d2l-icon>${this._getReadableFileSizeString(file.properties.size)}
					</div>
				</div>
			</d2l-list-item-content>
			${this._addMenuOptions(file.properties.href)}
			</d2l-list-item>
			`)}`;
	}

	_addMenuOptions(downloadHref) {
		// Placeholder for menu presentational
		return html`<div slot="actions" style="z-index: inherit;">
			<d2l-dropdown-more text="More Options">
			<d2l-dropdown-menu id="dropdown">
				<d2l-menu label="Options">
					<d2l-menu-item-link text="Download" href="${downloadHref}"></d2l-menu-item-link>
					<d2l-menu-item-link text="Mark as Read" href="https://en.wikipedia.org/wiki/Universe"></d2l-menu-item-link>
					<d2l-menu-item-link text="Flag" href="https://en.wikipedia.org/wiki/Universe"></d2l-menu-item-link>
					<d2l-menu-item-link text="Edit a Copy" href="https://en.wikipedia.org/wiki/Universe"></d2l-menu-item-link>
				</d2l-menu>
			</d2l-dropdown-menu>
			</d2l-dropdown-more>
			</div>`;
	}

	_renderComment() {
		const peekHeight = this.submissionType === fileSubmission ? '5em' : '8em';
		if (this._comment) {
			return html`
				<d2l-list-item>
				<d2l-list-item-content>
					${this._renderCommentTitle()}
					<div slot="secondary">
						<d2l-more-less height=${peekHeight} h-align>${unsafeHTML(this._comment)}</d2l-more-less>
					</div>
				</d2l-list-item-content>
				</d2l-list-item>`;
		}
		return html``;
	}

	_renderCommentTitle() {
		if (this.submissionType === fileSubmission) {
			return html`<div class="d2l-label-text">${this.localize('comments')}</div>`;
		} else {
			return html``;
		}
	}

	_renderFileSubmission() {
		return html`
		${this._renderFileSubmissionTitle()}
		<d2l-list separators="between">
			${this._renderAttachments()}
		</d2l-list>
		${this._renderComment()}
		`;
	}

	_renderTextSubmission() {
		return html`
		${this._renderTextSubmissionTitle()}
		${this._renderComment()}
		`;
	}

	render() {
		if (this.submissionType === fileSubmission) {
			return html`${this._renderFileSubmission()}`;
		} else if (this.submissionType === textSubmission) {
			return html`${this._renderTextSubmission()}`;
		}
	}
}
customElements.define('d2l-consistent-evaluation-submission-item', ConsistentEvaluationSubmissionItem);
