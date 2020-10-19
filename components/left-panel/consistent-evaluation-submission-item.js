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
import { formatDate, formatTime } from '@brightspace-ui/intl/lib/dateTime.js';
import { getFileIconTypeFromExtension } from '@brightspace-ui/core/components/icons/getFileIconType';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin';
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver.es.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export class ConsistentEvaluationSubmissionItem extends RtlMixin(LocalizeMixin(LitElement)) {
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
		d2l-list-item, d2l-list-item:hover {
			--d2l-list-item-content-text-color: var(--d2l-color-ferrite);
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
	`];
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	constructor() {
		super();
		this.late = false;
		this.comment = '';
		this.attachments = [];
		this._updateFilenameTooltips = this._updateFilenameTooltips.bind(this);
		this._dispatchRenderEvidence = this._dispatchRenderEvidence.bind(this);
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

	_dispatchRenderEvidence(extension, fileViewer, name) {
		this._dispatchRenderEvidenceFileEvent(fileViewer, name);
	}

	_dispatchRenderEvidenceFileEvent(url, name) {
		const event = new CustomEvent('d2l-consistent-evaluation-submission-item-render-evidence-file', {
			detail: {
				url: url,
				name: name
			},
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);
	}

	_dispatchRenderEvidenceTextEvent(name) {
		const event = new CustomEvent('d2l-consistent-evaluation-submission-item-render-evidence-text', {
			detail: {
				textSubmissionEvidence: {
					title: `${this.localize('textSubmission')} ${this.displayNumber}`,
					name: name,
					date: this._formatDateTime(),
					downloadUrl: this.attachments[0].properties.href,
					content: this.comment
				}
			},
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);
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
		${this._addMenuOptions(read, flagged, href)}
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

	_renderAttachments() {
		return html`${this.attachments.map((file) => {
			const {name, size, extension, flagged, read, href, fileViewer} = file.properties;
			return html`
			<d2l-list-item>
				<div slot="illustration" class="d2l-submission-attachment-icon-container">
					<d2l-icon class="d2l-submission-attachment-icon-container-inner"
						icon="tier2:${getFileIconTypeFromExtension(extension)}"
						aria-label="${getFileIconTypeFromExtension(extension)}"></d2l-icon>
					${this._renderReadStatus(read)}
				</div>
				<d2l-list-item-content
				@click="${
	// eslint-disable-next-line lit/no-template-arrow
	() => this._dispatchRenderEvidence(extension, fileViewer, name)}">
					<div class="truncate" aria-label="heading">${this._getFileTitle(name)}</div>
					<div slot="supporting-info">
						${this._renderFlaggedStatus(flagged)}
						${extension.toUpperCase()}
						<d2l-icon class="d2l-separator-icon" aria-hidden="true" icon="tier1:dot"></d2l-icon>
						${this._getReadableFileSizeString(size)}
					</div>
				</d2l-list-item-content>
				${this._addMenuOptions(read, flagged, href)}
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

	_addMenuOptions(read, flagged, downloadHref) {
		// Placeholder for menu presentational
		const oppositeReadState = read ? this.localize('markUnread') : this.localize('markRead');
		const oppositeFlagState = flagged ? this.localize('unflag') : this.localize('flag');
		return html`<div slot="actions" style="z-index: inherit;">
			<d2l-dropdown-more text="More Options">
			<d2l-dropdown-menu id="dropdown" boundary="{&quot;right&quot;:10}">
				<d2l-menu label="More Options">
				${this.submissionType === textSubmission ? html`
						<d2l-menu-item-link text="${this.localize('viewFullSubmission')}"
							href="javascript:void(0);"
							@click="${this._dispatchRenderEvidenceTextEvent}"></d2l-menu-item-link>` : null }
					<d2l-menu-item-link text="${this.localize('download')}" href="${downloadHref}"></d2l-menu-item-link>
					<d2l-menu-item-link text="${oppositeReadState}" href="#"></d2l-menu-item-link>
					<d2l-menu-item-link text="${oppositeFlagState}" href="#"></d2l-menu-item-link>
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
		<d2l-list aria-role="list" separators="all">
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
