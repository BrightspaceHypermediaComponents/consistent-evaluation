/* global moment:false */
import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import '@brightspace-ui/core/components/list/list.js';
import '@brightspace-ui/core/components/colors/colors.js';
import './consistent-evaluation-submission-item.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { tiiRefreshAction, tiiRel, tiiSubmitActionName, toggleFlagActionName, toggleIsReadActionName } from '../controllers/constants.js';
import { Classes } from 'd2l-hypermedia-constants';
import { ConsistentEvalTelemetry } from '../helpers/consistent-eval-telemetry.js';
import { convertToken } from '../helpers/converterHelpers.js';
import { findFile } from '../helpers/submissionsAndFilesHelpers.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { performSirenAction } from 'siren-sdk/src/es6/SirenAction.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export class ConsistentEvaluationSubmissionsPage extends SkeletonMixin(RtlMixin(LocalizeConsistentEvaluation(LitElement))) {
	static get properties() {
		return {
			submissionList: {
				attribute: false,
				type: Array
			},
			submissionType: {
				attribute: 'submission-type',
				type: String
			},
			downloadAllSubmissionLink: {
				attribute: 'download-all-submissions-location',
				type: String
			},
			token: {
				type: Object,
				reflect: true,
				converter: (value) => convertToken(value)
			},
			hideUseGrade: {
				attribute: 'hide-use-grade',
				type: Boolean
			},
			dataTelemetryEndpoint: {
				attribute: 'data-telemetry-endpoint',
				type: String
			},
			_downloading : {
				attribute: false,
				type: Boolean
			}
		};
	}

	static get styles() {
		return [super.styles, css`
			:host {
				background-color: var(--d2l-color-sylvite);
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-consistent-evaluation-submission-list-view-skeleton {
				display: none;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-view-skeleton {
				background-color: white;
				border-radius: 6px;
				display: block;
				margin: 0.5rem;
				padding: 0.5rem;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-item-skeleton {
				display: block;
				height: 100%;
				margin-top: 0.5rem;
				width: 100%;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-view {
				display: none;
			}
			:host([skeleton]) .d2l-consistent-evaluation-list-item-submission-skeleton {
				display: flex;
				flex-flow: row wrap;
				margin-left: 1rem;
				margin-top: 1.3rem;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-header-title-skeleton {
				height: 0.65rem;
				margin-bottom: 1rem;
				margin-top: 1rem;
				width: 5rem;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-header-body-skeleton {
				height: 0.55rem;
				margin-bottom: 0.8rem;
				margin-top: 0.5rem;
				width: 7rem;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-footer-title-skeleton {
				height: 0.65rem;
				width: 6rem;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-file-image-skeleton {
				bottom: 0.5rem;
				height: 1.8rem;
				width: 1.8rem;
			}
			:host([skeleton][dir="rtl"]) .d2l-consistent-evaluation-submission-list-file-image-skeleton {
				margin-left: 0.7rem;
			}
			:host([skeleton][dir="rtl"]) .d2l-consistent-evaluation-list-item-submission-skeleton {
				margin-right: 1rem;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-file-name-skeleton {
				bottom: 0.5rem;
				height: 1rem;
				margin-left: 0.7rem;
				width: 12rem;
			}
			.d2l-consistent-evaluation-list-item-submission-skeleton > br {
				content: '';
				width: 100%;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-file-information-skeleton {
				bottom: 0.5rem;
				height: 0.8rem;
				margin-left: 2.5rem;
				width: 5rem;
			}
			:host([skeleton][dir="rtl"]) .d2l-consistent-evaluation-submission-list-file-information-skeleton {
				margin-right: 2.5rem;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-separator-skeleton {
				height: 0.1rem;
				margin-bottom: 1rem;
				margin-top: 0.4rem;
			}
			:host([skeleton]) {
				height: 100%;
			}
			#download-all-button {
				margin: 0 0.65rem 0.65rem 0.65rem;
			}
		`];
	}

	constructor() {
		super();
		this._submissionList = [];
		this._token = undefined;
		this._submissionEntities = [];
		this._perfRenderEventName = 'submissionsComponentRender';
		this._downloading = false;
		this._expectedCookieName = 'd2lConsistentEvaluationDownloadAll';
	}

	get submissionList() {
		return this._submissionList;
	}

	set submissionList(val) {
		const oldVal = this.submissionList;
		if (oldVal !== val) {
			this._submissionList = val;
			if (this._submissionList && this._token) {
				this._initializeSubmissionEntities().then(() => this.requestUpdate());
			}
		}
	}
	get token() {
		return this._token;
	}

	set token(val) {
		const oldVal = this.token;
		if (oldVal !== val) {
			this._token = val;
			if (this._submissionList && this._token) {
				this._initializeSubmissionEntities().then(() => this.requestUpdate());
			}
		}
	}

	updated(changedProperties) {
		if (changedProperties.has('dataTelemetryEndpoint')) {
			this._telemetry = new ConsistentEvalTelemetry(this.dataTelemetryEndpoint);
			this._telemetry.markEventStart(this._perfRenderEventName);
		}
	}

	async _initializeSubmissionEntities() {
		this._submissionEntities = [];
		if (this._submissionList !== undefined) {
			for (const submissionLink of this._submissionList) {
				if (submissionLink.href) {
					const submission = await this._getSubmissionEntity(submissionLink.href);
					this._submissionEntities.push(submission);
				}
			}

			this._finishedLoading();
		}
	}

	async _getSubmissionEntity(submissionHref, byPassCache = false) {
		return await window.D2L.Siren.EntityStore.fetch(submissionHref, this._token, byPassCache);
	}

	_getComment(submissionEntity) {
		if (submissionEntity.getSubEntityByClass(Classes.assignments.submissionComment)) {
			return submissionEntity.getSubEntityByClass(Classes.assignments.submissionComment).properties.html;
		}
		return '';
	}

	_getAttachments(submissionEntity) {
		const attachmentsListEntity = submissionEntity.getSubEntityByClass(Classes.assignments.attachmentList);
		if (attachmentsListEntity) {
			return attachmentsListEntity.getSubEntitiesByClass(Classes.assignments.attachment);
		}
		return [];
	}

	_getAttachmentEntity(fileId) {
		for (let i = 0;i < this._submissionEntities.length; i++) {
			const attachments = this._getAttachments(this._submissionEntities[i].entity);
			for (let y = 0;y < attachments.length; y++) {
				if (attachments[y].properties.id === fileId) {
					return attachments[y];
				}
			}
		}
		return null;
	}

	_finishedLoading() {
		if (this._telemetry) {
			this._telemetry.markEventEndAndLog(this._perfRenderEventName, this._submissionList.length);
		}
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-loading-finished', {
			composed: true,
			bubbles: true,
			detail: {
				component: 'submissions'
			}
		}));
	}

	async _updateSubmissionEntity(submissionEntity, submissionSelfLinkHref) {
		for (let i = 0;i < this._submissionEntities.length; i++) {
			const oldSubmissionEntity = await this._submissionEntities[i].entity.getLinkByRel('self');

			if (oldSubmissionEntity.href === submissionSelfLinkHref) {
				this._submissionEntities[i].entity = submissionEntity;
				return;
			}
		}
	}

	async _toggleAction(e) {
		const fileId = e.detail.fileId;
		const actionName = e.detail.action;

		const attachmentEntity = this._getAttachmentEntity(fileId);
		if (!attachmentEntity) {
			throw new Error('Invalid entity provided for attachment');
		}

		// Assume toggle worked so we can update UI instantly
		if (actionName === toggleIsReadActionName) {
			attachmentEntity.properties.read = !attachmentEntity.properties.read;
			await this.requestUpdate();
		} else if (actionName === toggleFlagActionName) {
			attachmentEntity.properties.flagged = !attachmentEntity.properties.flagged;
			await this.requestUpdate();
		}

		const action = attachmentEntity.getActionByName(actionName);
		const newSubmissionEntity = await this._doSirenActionAndRefreshFileStatus(action);
		const newAttachmentEntity = findFile(fileId, [{ entity: newSubmissionEntity }]);

		// Detect if our assumption was correct
		if (
			actionName === toggleIsReadActionName
			&& attachmentEntity.properties.read !== newAttachmentEntity.properties.read
		) {
			console.warn('Toggle read failed');
		} else if (
			actionName === toggleFlagActionName
			&& attachmentEntity.properties.flagged !== newAttachmentEntity.properties.flagged
		) {
			console.warn('Toggle flag failed');
		}
	}

	async _downloadAction(e) {
		const fileId = e.detail.fileId;

		const attachmentEntity = this._getAttachmentEntity(fileId);
		if (!attachmentEntity) {
			throw new Error('Invalid entity provided for attachment');
		}

		const action = attachmentEntity.getActionByName(toggleIsReadActionName);
		if (action.fields.some(f => f.name === 'isRead' && f.value)) {
			// If the action value is true it means it can be called to set the IsRead value to true, otherwise it is already read and we dont want to unread it
			await this._doSirenActionAndRefreshFileStatus(action);
		}
	}

	async _refreshGradeMarkTiiAction(e) {
		const fileId = e.detail.fileId;

		const attachmentEntity = this._getAttachmentEntity(fileId);
		if (!attachmentEntity) {
			throw new Error('Invalid entity provided for attachment');
		}

		const tiiEntity = attachmentEntity.getSubEntityByRel(tiiRel);
		if (!tiiEntity) {
			throw new Error('Turnitin entity not present on attachment');
		}

		const refreshAction = tiiEntity.getActionByName(tiiRefreshAction);
		if (!refreshAction) {
			throw new Error('Refresh action not present on Turnitin entity');
		}

		await this._doSirenActionAndRefreshFileStatus(refreshAction);

		if (e.detail.gradeMarkAutoTransfer) {
			this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-refresh-grade-item', {
				composed: true,
				bubbles: true
			}));
		}
	}

	async _submitFileTiiAction(e) {
		const fileId = e.detail.fileId;

		const attachmentEntity = this._getAttachmentEntity(fileId);
		if (!attachmentEntity) {
			throw new Error('Invalid entity provided for attachment');
		}

		const tiiEntity = attachmentEntity.getSubEntityByRel(tiiRel);
		if (!tiiEntity) {
			throw new Error('Turnitin entity not present on attachment');
		}

		const submitAction = tiiEntity.getActionByName(tiiSubmitActionName);
		if (!submitAction) {
			throw new Error('Submit action not present on Turnitin entity');
		}

		await this._doSirenActionAndRefreshFileStatus(submitAction);
	}

	async _doSirenActionAndRefreshFileStatus(action) {
		const newSubmissionEntity = await performSirenAction(this.token, action, undefined, true);
		const submissionSelfLink = newSubmissionEntity.getLinkByRel('self');
		await this._updateSubmissionEntity(newSubmissionEntity, submissionSelfLink.href) ;
		await this.requestUpdate();
		return newSubmissionEntity;
	}

	_handleAllSubmissionDownload() {
		this._deleteCookie();
		this._downloading = true;
		window.location.href = this.downloadAllSubmissionLink;
		this._checkDownloadStatus();
	}

	_checkDownloadStatus() {
		const cookieValue = this._getCookieValue();
		switch (cookieValue) {
			case null:
				setTimeout(this._checkDownloadStatus.bind(this), 1000);
				break;
			case 'failed':
				this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-download-all-failed', {
					composed: true,
					bubbles: true
				}));
				this._deleteCookie();
				this._downloading = false;
				break;
			case 'succeeded':
			default:
				this._deleteCookie();
				this._downloading = false;
				this._refreshAllSubmissionEntities();
				break;
		}
	}

	async _refreshAllSubmissionEntities() {
		if (this._submissionList !== undefined) {
			for (let i = 0; i < this._submissionList.length; i++) {
				if (this._submissionList[i].href) {
					const submission = await this._getSubmissionEntity(this._submissionList[i].href, true);
					this._submissionEntities[i] = submission;
				}
			}
			this.requestUpdate();
		}
	}

	_deleteCookie() {
		const d = new Date();
		d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * -1);
		document.cookie = `${this._expectedCookieName}= ;path=/;expires=${d.toGMTString()}`;
	}

	_getCookieValue() {
		const b = document.cookie.match(`(^|;)\\s*${this._expectedCookieName}\\s*=\\s*([^;]+)`);
		return b ? b.pop() : null;
	}

	_getDownloadButtonText() {
		if (this._downloading) {
			return this.localize('downloadAllPleaseWait');
		} else {
			return this.localize('downloadAll');
		}
	}

	_renderListItems() {
		const itemTemplate = [];
		for (let i = 0; i < this._submissionEntities.length; i++) {
			if (this._submissionEntities[i].entity) {
				const submissionEntity = this._submissionEntities[i].entity;
				if (submissionEntity.getSubEntityByClass(Classes.assignments.submissionDate)) {
					const submissionDate = submissionEntity.getSubEntityByClass(Classes.assignments.submissionDate).properties.date;
					const evaluationState = submissionEntity.properties.evaluationStatus;
					const latenessTimespan = submissionEntity.properties.lateTimeSpan;
					const submissionNumber = submissionEntity.properties.submissionNumber;
					itemTemplate.push(html`
						<d2l-consistent-evaluation-submission-item
							date-str=${submissionDate}
							display-number=${submissionNumber}
							evaluation-state=${evaluationState}
							lateness=${moment.duration(Number(latenessTimespan), 'seconds').humanize()}
							submission-type=${this.submissionType}
							comment=${this._getComment(submissionEntity)}
							.attachments=${this._getAttachments(submissionEntity)}
							?late=${latenessTimespan !== undefined}
							?hide-use-grade=${this.hideUseGrade}
							@d2l-consistent-evaluation-evidence-toggle-action=${this._toggleAction}
							@d2l-consistent-evaluation-evidence-file-download=${this._downloadAction}
							@d2l-consistent-evaluation-evidence-refresh-grade-mark=${this._refreshGradeMarkTiiAction}
							@d2l-consistent-evaluation-evidence-tii-submit-file-action=${this._submitFileTiiAction}
						></d2l-consistent-evaluation-submission-item>`);
				} else {
					console.warn('Consistent Evaluation submission date property not found');
				}
			}
		}
		return html`${itemTemplate}`;
	}

	_renderSkeleton() {
		return html`
			<div class="d2l-consistent-evaluation-submission-list-item-skeleton" >
				<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-header-title-skeleton"></div>
				<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-header-body-skeleton"></div>
			</div>
			<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-separator-skeleton"></div>
			<div class="d2l-consistent-evaluation-submission-list-item-skeleton d2l-consistent-evaluation-list-item-submission-skeleton" >
				<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-file-image-skeleton"></div>
				<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-file-name-skeleton"></div>
				<br />
				<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-file-information-skeleton"></div>
			</div>
			<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-separator-skeleton"></div>
			<div class="d2l-consistent-evaluation-submission-list-item-skeleton d2l-consistent-evaluation-list-item-submission-skeleton">
				<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-file-image-skeleton"></div>
				<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-file-name-skeleton"></div>
				<br />
				<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-file-information-skeleton"></div>
			</div>
			<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-separator-skeleton"></div>
			<div class="d2l-consistent-evaluation-submission-list-item-skeleton">
				<div class="d2l-skeletize d2l-consistent-evaluation-submission-list-footer-title-skeleton"></div>
				<p class="d2l-body-compact d2l-skeletize-paragraph-2"></div>
			</div>
		`;
	}

	render() {
		return html`
			<div class="d2l-consistent-evaluation-submission-list-view-skeleton" aria-hidden="${!this.skeleton}" aria-busy="${this.skeleton}">
				${this._renderSkeleton()}
			</div>
			<div class="d2l-consistent-evaluation-submission-list-view" aria-hidden="${this.skeleton}">
				<d2l-list separators="between">
					${this._renderListItems()}
				</d2l-list>
				<d2l-button-subtle
					id="download-all-button"
					icon="tier2:download"
					?hidden="${this._submissionEntities.length === 0}"
					?disabled="${this._downloading}"
					text="${this._getDownloadButtonText()}"
					@click="${this._handleAllSubmissionDownload}">
				</d2l-button-subtle>
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-submissions-page', ConsistentEvaluationSubmissionsPage);
