import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/dropdown/dropdown-more.js';
import '@brightspace-ui/core/components/dropdown/dropdown-menu.js';
import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/list/list.js';
import '@brightspace-ui/core/components/list/list-item.js';
import '@brightspace-ui/core/components/list/list-item-content.js';
import '@brightspace-ui/core/components/menu/menu.js';
import '@brightspace-ui/core/components/menu/menu-item.js';
import '@brightspace-ui/core/components/menu/menu-item-link.js';
import '@brightspace-ui/core/components/more-less/more-less.js';
import '@brightspace-ui/core/components/status-indicator/status-indicator.js';
import './consistent-evaluation-tii-grade-mark.js';
import './consistent-evaluation-tii-similarity.js';
import { bodySmallStyles, heading3Styles, labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { fileSubmission, textSubmission } from '../controllers/constants';
import { formatDate, formatTime } from '@brightspace-ui/intl/lib/dateTime.js';
import { toggleFlagActionName, toggleIsReadActionName } from '../controllers/constants.js';
import { getFileIconTypeFromExtension } from '@brightspace-ui/core/components/icons/getFileIconType';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver.es.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export class ConsistentEvaluationSubmissionItem extends RtlMixin(LocalizeConsistentEvaluation(LitElement)) {
	static get properties() {
		return {
			dateStr : {
				attribute: 'date-str',
				type: String
			},
			displayNumber : {
				attribute: 'display-number',
				type: String
			},
			evaluationState : {
				attribute: 'evaluation-state',
				type: String
			},
			late: {
				type: Boolean
			},
			lateness: {
				type: String
			},
			attachments: {
				type: Array
			},
			comment: {
				type: String
			},
			submissionType: {
				attribute: 'submission-type',
				type: String
			},
			hideUseGrade: {
				attribute: 'hide-use-grade',
				type: Boolean
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
			margin: 0.5rem 0.65rem;
			padding: 1px 1.2rem 0.75rem 1.2rem;
			position: relative;
		}
		d2l-list-item, d2l-list-item:hover {
			--d2l-list-item-content-text-color: var(--d2l-color-ferrite);
		}
		d2l-list-item-content:focus {
			border: 2px solid var(--d2l-color-celestine);
			border-radius: 6px;
			outline: none 0;
		}
		.d2l-heading-3 {
			margin: 0;
			padding-right: 0.5rem;
		}
		:host([dir="rtl"]) .d2l-heading-3 {
			padding-left: 0.5rem;
			padding-right: 0;
		}
		.d2l-label-text {
			padding-top: 0.5rem;
		}
		.d2l-submission-attachment-icon-container {
			border-radius: 0;
			display: inline-block;
			left: 0;
			position: relative;
			top: 0;
		}
		.d2l-submission-attachment-icon-container-inner {
			left: 0;
			margin: 0.5rem;
			position: relative;
			top: 0;
		}
		.d2l-submission-attachment-list-item-content:hover {
			cursor: pointer;
		}
		.d2l-submission-attachment-list-item-flexbox {
			display: flex;
			flex-direction: column;
		}
		.d2l-submission-attachment-list-item-tii {
			display: flex;
			padding-bottom: 0.3rem;
			padding-top: 0.5rem;
		}
		.d2l-consistent-evaluation-submission-item-submissions-list {
			z-index: 0;
		}
		.d2l-attachment-read-status {
			color: var(--d2l-color-carnelian);
			position: absolute;
			right: -4px;
			top: 0;
		}
		:host([dir="rtl"]) .d2l-attachment-read-status {
			left: -4px;
			right: unset;
		}
		.d2l-separator-icon {
			height: 10px;
			padding: 0.2rem;
			width: 10px;
		}
		d2l-more-less p, ul {
			margin-bottom: 0.5rem;
			margin-top: 0.5rem;
		}
		d2l-status-indicator {
			margin-right: 0.5rem;
			text-transform: none;
		}
		d2l-consistent-evaluation-tii-similarity {
			margin-right: 2.5rem;
		}
		:host([dir="rtl"]) d2l-consistent-evaluation-tii-similarity {
			margin-left: 2.5rem;
			margin-right: 0;
		}
		:host([dir="rtl"]) d2l-status-indicator {
			margin-left: 0.5rem;
			margin-right: 0;
		}
		.d2l-truncate {
			-webkit-box-orient: vertical;
			display: -webkit-box;
			-webkit-line-clamp: 3;
			overflow: hidden;
			overflow-wrap: break-word;
			text-overflow: ellipsis;
			white-space: break-spaces;
		}
		@media (max-width: 929px) and (min-width: 768px) {
			:host {
				margin: 0.5rem 0.6rem;
				padding: 1px 0.9rem 0.75rem 0.9rem;
			}
		}
		@media (max-width: 767px) {
			:host {
				margin: 0.5rem 0.35rem;
				padding: 1px 0.85rem 0.5rem 0.85rem;
			}
		}
	`];
	}

	constructor() {
		super();
		this.late = false;
		this.comment = '';
		this.attachments = [];
		this._updateFilenameTooltips = this._updateFilenameTooltips.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('load', this._updateFilenameTooltips);
		this._resizeObserver = new ResizeObserver(this._updateFilenameTooltips);
	}

	disconnectedCallback() {
		window.removeEventListener('load', this._updateFilenameTooltips);
		const filenames = this.shadowRoot.querySelectorAll('.d2l-truncate');
		for (const filename of filenames) {
			this._resizeObserver.unobserve(filename);
		}
		super.disconnectedCallback();
	}

	firstUpdated() {
		super.firstUpdated();
		const filenames = this.shadowRoot.querySelectorAll('.d2l-truncate');
		for (const filename of filenames) {
			this._resizeObserver.observe(filename);
		}
	}

	//Helper methods

	_getFileTitle(filename) {
		const index = filename.lastIndexOf('.');
		if (index < 0) {
			return '';
		} else {
			return filename.substring(0, index);
		}
	}

	_getFileExtension(filename) {
		const index = filename.lastIndexOf('.');
		if (index < 0) {
			return '';
		} else {
			return filename.substring(index + 1).toUpperCase();
		}
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

	_dispatchFileSelectedKeyboardEvent(e) {
		const fileId = e.target.getAttribute('file-id');

		if (e.key === 'Enter' || e.key === ' ') {
			this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-file-selected', {
				detail: {
					fileId: fileId
				},
				composed: true,
				bubbles: true
			}));
		}
	}

	_dispatchFileSelectedEvent(fileId) {
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-file-selected', {
			detail: {
				fileId: fileId
			},
			composed: true,
			bubbles: true
		}));
	}

	_dispatchToggleEvent(e) {
		const action = e.target.getAttribute('data-action');
		const fileId = e.target.getAttribute('data-key');
		const event = new CustomEvent('d2l-consistent-evaluation-evidence-toggle-action', {
			detail: {
				fileId: fileId,
				action: action
			},
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);
	}

	_dispatchDownloadEvent(e) {
		const fileId = e.target.getAttribute('data-key');
		const downloadHref = e.target.getAttribute('data-href');
		const event = new CustomEvent('d2l-consistent-evaluation-evidence-file-download', {
			detail: {
				fileId: fileId
			},
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);

		window.location = downloadHref;
	}

	_formatDateTime() {
		const date = this.dateStr ? new Date(this.dateStr) : undefined;

		const formattedDate = (date) ? formatDate(
			date,
			{format: 'full'}) : '';
		const formattedTime = (date) ? formatTime(
			date,
			{format: 'short'}) : '';
		return `${formattedDate} ${formattedTime}`;
	}

	//Helper rendering methods

	_renderFileSubmissionTitle() {
		return html`
		<d2l-list-item>
		<d2l-list-item-content>
			<h3 class="d2l-heading-3">${this.localize('submission')} ${this.displayNumber}</h3>
			<div slot="supporting-info">
			<span>
				${this._renderLateStatus()}
				${this._renderEvaluationState()}
			</span>
			<span class="d2l-body-small">
				${this._formatDateTime()}
			</span>
			</div>
		</d2l-list-item-content>
		</d2l-list-item>`;
	}

	_renderTextSubmissionTitle() {
		// There is only one attachment for text submissions: an html file
		const file = this.attachments[0];
		const flagged = file.properties.flagged;
		const read = file.properties.read;
		const href = file.properties.href;
		const id = file.properties.id;
		return html`
		<d2l-list-item>
		<d2l-list-item-content>
			<div class="d2l-submission-attachment-icon-container">
				<h3 class="d2l-heading-3">${this.localize('textSubmission')} ${this.displayNumber}</h3>
				${this._renderReadStatus(read)}
			</div>
			<div slot="supporting-info">
				${this._renderLateStatus()}
				${this._renderEvaluationState()}
				${this._renderFlaggedStatus(flagged)}
				<span class="d2l-body-small">${this._formatDateTime()}</span>
			</div>
		</d2l-list-item-content>
		${this._addMenuOptions(read, flagged, href, id)}
		</d2l-list-item>`;
	}

	_renderReadStatus(read) {
		if (!read) {
			return html`
			<d2l-icon
				icon="tier1:dot"
				class="d2l-attachment-read-status"
				role="img"
				aria-label="Unread">
			</d2l-icon>`;
		}
	}

	_renderLateStatus() {
		if (this.late) {
			return html`
			<d2l-status-indicator bold
				state="alert"
				text="${this.lateness} ${this.localize('late')}">
			</d2l-status-indicator>`;
		} else {
			return html ``;
		}
	}

	_renderEvaluationState() {
		if (this.evaluationState === 'Unevaluated') {
			return html`<d2l-status-indicator state="default" text="${this.localize('unevaluated')}"></d2l-status-indicator>`;
		} else {
			return html``;
		}
	}

	_renderFlaggedStatus(flag) {
		if (flag) {
			return html`<d2l-status-indicator state="alert" text="${this.localize('flagged')}"></d2l-status-indicator>`;
		}
	}

	_renderTii(id, name, file) {
		if (!file.entities) {
			return html``;
		}

		const tii = file.entities[0].properties;

		return html`
			<div class="d2l-submission-attachment-list-item-tii">
				<d2l-consistent-evaluation-tii-similarity
					colour="${tii.originalityReportScoreColour}"
					error-message="${tii.errorMessage}"
					file-id="${id}"
					file-name="${name}"
					originality-report-href="${tii.originalityReportHref}"
					report-status="${tii.reportStatus}"
					score="${tii.originalityReportScore}"
				></d2l-consistent-evaluation-tii-similarity>
				<d2l-consistent-evaluation-tii-grade-mark
					file-id=${id}
					grade-mark-file-name=${name}
					grade-mark-href=${tii.gradeMarkHref}
					grade-mark-out-of=${tii.gradeMarkOutOf}
					grade-mark-score=${tii.gradeMarkScore}
					?has-feedback=${tii.hasFeedback}
					?grade-mark-auto-transfer=${tii.gradeMarkAutoTransfer}
					?hide-use-grade=${this.hideUseGrade}
				></d2l-consistent-evaluation-tii-grade-mark>
			</div>
		`;
	}

	_renderAttachments() {
		return html`${this.attachments.map((file) => {
			const {id, name, size, extension, flagged, read, href} = file.properties;

			return html`
			<d2l-list-item>
				<div slot="illustration" class="d2l-submission-attachment-icon-container">
					<d2l-icon class="d2l-submission-attachment-icon-container-inner"
						icon="tier2:${getFileIconTypeFromExtension(extension)}"
						aria-label="${getFileIconTypeFromExtension(extension)}"></d2l-icon>
					${this._renderReadStatus(read)}
				</div>
				<div class="d2l-submission-attachment-list-item-flexbox">
					<d2l-list-item-content
						class="d2l-submission-attachment-list-item-content"
						file-id="${id}"
						tabindex=0
						@keydown=${this._dispatchFileSelectedKeyboardEvent}
						@click="${
	// eslint-disable-next-line lit/no-template-arrow
	() => this._dispatchFileSelectedEvent(id)}">
						<div class="truncate" aria-label="heading">${this._getFileTitle(name)}</div>
						<div slot="supporting-info">
							${this._renderFlaggedStatus(flagged)}
							${extension.toUpperCase()}
							<d2l-icon class="d2l-separator-icon" aria-hidden="true" icon="tier1:dot"></d2l-icon>
							${this._getReadableFileSizeString(size)}
						</div>
					</d2l-list-item-content>
					${this._renderTii(id, name, file)}
				</div>
				${this._addMenuOptions(read, flagged, href, id)}
			</d2l-list-item>`;
		})}`;
	}

	_isClamped(element) {
		return element.clientHeight < element.scrollHeight;
	}

	_updateFilenameTooltips() {
		const filenames = this.shadowRoot.querySelectorAll('.d2l-truncate');
		filenames.forEach(element => {
			if (this._isClamped(element)) {
				element.title = element.innerText;
			} else {
				element.removeAttribute('title');
			}
		});
	}

	_addMenuOptions(read, flagged, downloadHref, id) {
		const oppositeReadState = read ? this.localize('markUnread') : this.localize('markRead');
		const oppositeFlagState = flagged ? this.localize('unflag') : this.localize('flag');
		return html`<div slot="actions" style="z-index: inherit;">
			<d2l-dropdown-more text="${this.localize('moreOptions')}">
			<d2l-dropdown-menu id="dropdown" boundary="{&quot;right&quot;:10}">
				<d2l-menu label="${this.localize('moreOptions')}">
					${this.submissionType === textSubmission ? html`
						<d2l-menu-item-link text="${this.localize('viewFullSubmission')}"
							href="javascript:void(0);"
							@click="${
	// eslint-disable-next-line lit/no-template-arrow
	() => this._dispatchFileSelectedEvent(id)}"></d2l-menu-item-link>` : null}
					<d2l-menu-item text="${this.localize('download')}" data-key="${id}" data-href="${downloadHref}" @d2l-menu-item-select="${this._dispatchDownloadEvent}"></d2l-menu-item>
					<d2l-menu-item text="${oppositeReadState}" data-action="${toggleIsReadActionName}" data-key="${id}" @d2l-menu-item-select="${this._dispatchToggleEvent}"></d2l-menu-item>
					<d2l-menu-item text="${oppositeFlagState}" data-action="${toggleFlagActionName}" data-key="${id}" @d2l-menu-item-select="${this._dispatchToggleEvent}"></d2l-menu-item>
				</d2l-menu>
			</d2l-dropdown-menu>
			</d2l-dropdown-more>
		</div>`;
	}

	_renderComment() {
		const peekHeight = this.submissionType === fileSubmission ? '5em' : '8em';
		if (this.comment) {
			return html`
					${this._renderCommentTitle()}
					<d2l-more-less height=${peekHeight}>${unsafeHTML(this.comment)}</d2l-more-less>
				`;
		}
		return html``;
	}

	_renderCommentTitle() {
		if (this.submissionType === fileSubmission) {
			return html`
			<div class="d2l-label-text">
				${this.localize('comments')}
			</div>`;
		} else {
			return html``;
		}
	}

	_renderFileSubmission() {
		return html`
		${this._renderFileSubmissionTitle()}
		<d2l-list class="d2l-consistent-evaluation-submission-item-submissions-list" aria-role="list" separators="all">
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
