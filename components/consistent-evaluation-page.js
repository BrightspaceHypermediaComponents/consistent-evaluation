import './header/d2l-consistent-evaluation-learner-context-bar.js';
import './left-panel/consistent-evaluation-left-panel.js';
import './footer/consistent-evaluation-footer-presentational.js';
import './right-panel/consistent-evaluation-right-panel.js';
import './left-panel/consistent-evaluation-submissions-page.js';
import './header/consistent-evaluation-nav-bar.js';
import '@brightspace-ui/core/components/alert/alert-toast.js';
import '@brightspace-ui/core/components/inputs/input-text.js';
import '@brightspace-ui/core/templates/primary-secondary/primary-secondary.js';
import '@brightspace-ui/core/components/dialog/dialog-confirm.js';
import '@brightspace-ui/core/components/button/button.js';
import { attachmentsRel, draftState, publishActionName, publishedState, retractActionName, saveActionName, updateActionName } from './controllers/constants.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { Grade, GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { Awaiter } from './awaiter.js';
import { ConsistentEvaluationController } from './controllers/ConsistentEvaluationController.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../lang/localize-consistent-evaluation.js';
import { Rels } from 'd2l-hypermedia-constants';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';
import { TransientSaveAwaiter } from './transient-save-awaiter.js';

const DIALOG_ACTION_LEAVE = 'leave';
const DIALOG_ACTION_DISCARD = 'discard';

export default class ConsistentEvaluationPage extends SkeletonMixin(LocalizeConsistentEvaluation(LitElement)) {

	static get properties() {
		return {
			evaluationHref: {
				attribute: 'evaluation-href',
				type: String
			},
			nextStudentHref: {
				attribute: 'next-student-href',
				type: String
			},
			returnHref: {
				attribute: 'return-href',
				type: String
			},
			returnHrefText: {
				attribute: 'return-href-text',
				type: String
			},
			outcomesHref: {
				attribute: 'outcomes-href',
				type: String
			},
			specialAccessHref: {
				attribute: 'special-access-href',
				type: String
			},
			rubricInfos: {
				attribute: false,
				type: Array
			},
			rubricReadOnly: {
				attribute: 'rubric-read-only',
				type: Boolean
			},
			userHref: {
				attribute: 'user-href',
				type: String
			},
			groupHref: {
				attribute: 'group-href',
				type: String
			},
			userProgressOutcomeHref: {
				attribute: 'user-progress-outcome-href',
				type: String
			},
			coaDemonstrationHref: {
				attribute: 'coa-demonstration-href',
				type: String
			},
			hideLearnerContextBar: {
				attribute: 'hide-learner-context-bar',
				type: Boolean
			},
			currentFileId: {
				attribute: 'current-file-id',
				type: String
			},
			submissionInfo: {
				attribute: false,
				type: Object
			},
			gradeItemInfo: {
				attribute: false,
				type: Object
			},
			assignmentName: {
				attribute: false,
				type: String
			},
			organizationName: {
				attribute: false,
				type: String
			},
			userName: {
				attribute: false,
				type: String
			},
			iteratorTotal: {
				attribute: false,
				type: Number
			},
			iteratorIndex: {
				attribute: false,
				type: Number
			},
			token: {
				type: Object
			},
			rubricPopoutLocation: {
				attribute: 'rubric-popout-location',
				type: String
			},
			_displayToast: {
				type: Boolean
			},
			_toastMessage: {
				type: String
			},
			_feedbackText: {
				attribute: false
			},
			_attachmentsInfo: {
				attribute: false
			},
			_grade: {
				attribute: false
			},
			_feedbackEntity: {
				attribute: false
			},
			_gradeEntity: {
				attribute: false
			},
			_unsavedChangesDialogOpened: {
				attribute: false
			},
			_unsavedAnnotationsDialogOpened: {
				type: Boolean,
				attribute: false
			},
			dataTelemetryEndpoint: {
				attribute: 'data-telemetry-endpoint',
				type: String
			},
			_activeScoringRubric: {
				attribute: 'active-scoring-rubric',
				type: String
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-consistent-evaluation-page-primary-slot {
				height: 100%;
			}
		`;
	}

	constructor() {
		super();
		/* global moment:false */
		moment.relativeTimeThreshold('s', 60);
		moment.relativeTimeThreshold('m', 60);
		moment.relativeTimeThreshold('h', 24);
		moment.relativeTimeThreshold('d', Number.MAX_SAFE_INTEGER);
		moment.relativeTimeRounding(Math.floor);

		this._evaluationHref = undefined;
		this._token = undefined;
		this._controller = undefined;
		this._evaluationEntity = undefined;
		this._attachmentsInfo = {
			canAddFeedbackFile: false,
			canRecordFeedbackVideo: false,
			canRecordFeedbackAudio: false,
			attachments: []
		};
		this._displayToast = false;
		this._toastMessage = '';
		this._mutex = new Awaiter();
		this._unsavedChangesDialogOpened = false;
		this.unsavedChangesHandler = this._confirmUnsavedChangesBeforeUnload.bind(this);
		this._transientSaveAwaiter = new TransientSaveAwaiter();
	}

	get evaluationEntity() {
		return this._evaluationEntity;
	}

	set evaluationEntity(entity) {
		const oldVal = this.evaluationEntity;
		if (oldVal !== entity) {
			this._evaluationEntity = entity;
			this.requestUpdate();
		}
	}

	get evaluationHref() {
		return this._evaluationHref;
	}

	set evaluationHref(val) {
		const oldVal = this.evaluationHref;
		if (oldVal !== val) {
			this._evaluationHref = val;
			if (this._evaluationHref && this._token) {
				this._initializeController().then(() => this.requestUpdate());
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
			if (this._evaluationHref && this._token) {
				this._initializeController().then(() => this.requestUpdate());
			}
		}
	}

	get _feedbackText() {
		if (this._feedbackEntity && this._feedbackEntity.properties) {
			return this._feedbackEntity.properties.html || '';
		}
		return undefined;
	}

	get _grade() {
		if (this._gradeEntity) {
			return this._controller.parseGrade(this._gradeEntity);
		}
		return new Grade(GradeType.Number, 0, 0, null, null, this._gradeEntity);
	}

	get _feedbackEntity() {
		if (this.evaluationEntity) {
			return this.evaluationEntity.getSubEntityByRel('feedback');
		}
		return undefined;
	}

	get _gradeEntity() {
		if (this.evaluationEntity) {
			return this.evaluationEntity.getSubEntityByRel('grade');
		}
		return undefined;
	}

	get _navBarTitleText() {
		if (this.assignmentName) return this.assignmentName;

		return this.userName;
	}

	get _navBarSubtitleText() {
		if (this.userProgressOutcomeHref) {
			return this.localize('overallAchievement');
		}
		return this.organizationName;
	}

	get _activeScoringRubric() {
		if (this.evaluationEntity) {
			const activeScoringRubricEntity = this.evaluationEntity.getSubEntityByRel('active-scoring-rubric');
			if (activeScoringRubricEntity) {
				if (activeScoringRubricEntity.properties) {
					return activeScoringRubricEntity.properties.activeScoringRubric;
				}
			}
		}
		return undefined;
	}

	async _initializeController() {
		this._controller = new ConsistentEvaluationController(this._evaluationHref, this._token);
		const bypassCache = true;
		this.evaluationEntity = await this._controller.fetchEvaluationEntity(bypassCache);
		this._attachmentsInfo = await this._controller.fetchAttachments(this.evaluationEntity);
	}

	_noFeedbackComponent() {
		return this.evaluationEntity && this.evaluationEntity.getSubEntityByRel('feedback') === undefined;
	}

	_noGradeComponent() {
		return this.evaluationEntity && this.evaluationEntity.getSubEntityByRel('grade') === undefined;
	}

	_isEvaluationPublished() {
		if (!this.evaluationEntity) {
			return false;
		}
		return this.evaluationEntity.properties.state === publishedState;
	}

	async _onNextStudentClick() {
		this.shadowRoot.querySelector('consistent-evaluation-right-panel')._closeRubric();
		this._resetFocusToUser();
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-next-student-click', {
			composed: true,
			bubbles: true
		}));
	}

	async _onPreviousStudentClick() {
		this.shadowRoot.querySelector('consistent-evaluation-right-panel')._closeRubric();
		this._resetFocusToUser();
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-previous-student-click', {
			composed: true,
			bubbles: true
		}));
	}

	async _transientSaveFeedback(e) {
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				const newFeedbackVal = e.detail;

				this.evaluationEntity = await this._controller.transientSaveFeedback(entity, newFeedbackVal);
			}
		);
	}

	async _transientAddAttachment(e) {
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);

				const files = e.detail.files;
				this.evaluationEntity = await this._controller.transientAddFeedbackAttachment(entity, files);
			}
		);

		this._attachmentsInfo = await this._controller.fetchAttachments(this.evaluationEntity);
	}

	async _transientRemoveAttachment(e) {
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);

				const fileIdentifier = e.detail.file;
				this.evaluationEntity = await this._controller.transientRemoveFeedbackAttachment(entity, fileIdentifier);
			}
		);

		this._attachmentsInfo = await this._controller.fetchAttachments(this.evaluationEntity);
	}

	async _transientSaveGrade(e) {
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				let newGradeVal;
				const type = e.detail.grade.scoreType;
				if (type === GradeType.Letter) {
					newGradeVal = e.detail.grade.letterGrade;
				}
				else if (type === GradeType.Number) {
					newGradeVal = e.detail.grade.score;
				}
				this.evaluationEntity = await this._controller.transientSaveGrade(entity, newGradeVal);
			}
		);
	}

	async _transientSaveAnnotations(e) {
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				const annotationsData = e.detail;
				const fileId = this.currentFileId;

				this.evaluationEntity = await this._controller.transientSaveAnnotations(entity, annotationsData, fileId);
			}
		);
	}

	async _transientSaveActiveScoringRubric(e) {
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				const rubricId = e.detail.rubricId;

				this.evaluationEntity = await this._controller.transientSaveActiveScoringRubric(entity, rubricId);
			}
		);
	}

	async _transientSaveCoaEvalOverride(e) {
		// Call transientSaveFeedback to 'unsave' the evaluation
		if (e.detail && e.detail.sirenActionPromise) {
			this._transientSaveAwaiter.addTransientSave(e.detail.sirenActionPromise);
		}

		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.transientSaveFeedback(entity, this._feedbackText);
			}
		);
	}

	async _saveEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._transientSaveAwaiter.awaitAllTransientSaves();
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.save(entity);
				if (!(this.evaluationEntity instanceof Error)) {
					this._showToast(this.localize('saved'));
					this._fireSaveEvaluationEvent();
				} else {
					this._showToast(this.localize('saveError'));
				}
			}
		);
	}

	async _updateEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._transientSaveAwaiter.awaitAllTransientSaves();
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.update(entity);
				if (!(this.evaluationEntity instanceof Error)) {
					this._showToast(this.localize('updated'));
					this._fireSaveEvaluationEvent();
				} else {
					this._showToast(this.localize('updatedError'));
				}
			}
		);
	}

	async _publishEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._transientSaveAwaiter.awaitAllTransientSaves();
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.publish(entity);
				if (!(this.evaluationEntity instanceof Error)) {
					this._showToast(this.localize('published'));
					this._fireSaveEvaluationEvent();
				} else {
					this._showToast(this.localize('publishError'));
				}
				this.submissionInfo.evaluationState = publishedState;
			}
		);
	}

	async _retractEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._transientSaveAwaiter.awaitAllTransientSaves();
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.retract(entity);
				if (!(this.evaluationEntity instanceof Error)) {
					this._showToast(this.localize('retracted'));
					this._fireSaveEvaluationEvent();
				} else {
					this._showToast(this.localize('retractError'));
				}
				this.submissionInfo.evaluationState = draftState;
			}
		);
	}

	_showToast(message) {
		this._toastMessage = message;
		this._displayToast = true;
	}

	_onToastClose() {
		this._displayToast = false;
	}

	async _showUnsavedChangesDialog(e) {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.navigationTarget = e.detail.key;
				if (entity.hasClass('unsaved')) {
					this._unsavedChangesDialogOpened = true;
				} else {
					this._navigate();
				}
			}
		);
	}

	_onUnsavedChangesDialogClose(e) {
		this._unsavedChangesDialogOpened = false;
		if (e.detail.action === DIALOG_ACTION_LEAVE) {
			this._navigate();
		}
	}

	_resetFocusToUser() {
		try {
			this.shadowRoot.querySelector('d2l-consistent-evaluation-learner-context-bar')
				.shadowRoot.querySelector('d2l-consistent-evaluation-lcb-user-context')
				.shadowRoot.querySelector('h2').focus();
		} catch (e) {
			console.warn('Unable to reset focus');
		}
	}

	async _navigate() {
		switch (this.navigationTarget) {
			case 'back':
				if (this.evaluationEntity.hasClass('unsaved')) {
					window.removeEventListener('beforeunload', this.unsavedChangesHandler);
				}
				window.location.assign(this.returnHref);
				break;
			case 'next':
				await this._onNextStudentClick();
				break;
			case 'previous':
				await this._onPreviousStudentClick();
				break;
		}
	}

	_confirmUnsavedChangesBeforeUnload(e) {
		if (this.evaluationEntity.hasClass('unsaved')) {
			//Triggers the native browser confirmation dialog
			e.preventDefault();
			e.returnValue = 'Unsaved changes';
		}
	}

	_renderToast() {
		return html`<d2l-alert-toast
			?open=${this._displayToast}
			button-text=""
			@d2l-alert-toast-close=${this._onToastClose}>${this._toastMessage}</d2l-alert-toast>`;
	}

	_renderLearnerContextBar() {
		if (!this.hideLearnerContextBar) {
			return html`
				<d2l-consistent-evaluation-learner-context-bar
					user-href=${ifDefined(this.userHref)}
					group-href=${ifDefined(this.groupHref)}
					special-access-href=${ifDefined(this.specialAccessHref)}
					.token=${this.token}
					.currentFileId=${this.currentFileId}
					.submissionInfo=${this.submissionInfo}
					?skeleton=${this.skeleton}
				></d2l-consistent-evaluation-learner-context-bar>
			`;
		}
	}

	async _selectFile(e) {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));
		const newFileId = e.detail.fileId;
		const shouldSelectFile = await this._checkUnsavedAnnotations(newFileId);
		if (!shouldSelectFile) {
			return;
		}
		this._changeFile(newFileId);
	}

	_changeFile(newFileId) {
		this.currentFileId = newFileId;
	}

	async _setSubmissionsView() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		const shouldShowSubmissions = await this._checkUnsavedAnnotations();
		if (!shouldShowSubmissions) {
			return;
		}
		this.displaySubmissions();
	}

	displaySubmissions() {
		this.currentFileId = undefined;
	}

	async _checkUnsavedAnnotations(newFileId) {
		return await this._mutex.dispatch(
			async() => {
				if (this.currentFileId !== undefined) {
					const entity = await this._controller.fetchEvaluationEntity(false);
					const annotationsEntity = entity.getSubEntityByRel('annotations');
					if (!annotationsEntity) {
						return true;
					}

					const unsavedAnnotations = annotationsEntity.hasClass('unsaved');
					if (unsavedAnnotations) {
						this.nextFileId = newFileId;
						this._unsavedAnnotationsDialogOpened = true;
						return false;
					}
				}
				return true;
			}
		);
	}

	async _onUnsavedAnnotationsDialogClosed(e) {
		this._unsavedAnnotationsDialogOpened = false;
		if (e.detail.action === DIALOG_ACTION_DISCARD) {
			await this._discardAnnotationsChanges();
			if (this.nextFileId) {
				this._changeFile(this.nextFileId);
			} else {
				this.displaySubmissions();
			}
		} else {
			// need to reset the file selector
			await this.shadowRoot.querySelector('d2l-consistent-evaluation-learner-context-bar')
				.shadowRoot.querySelector('d2l-consistent-evaluation-lcb-file-context')
				.refreshSelect();
		}
	}

	async _discardAnnotationsChanges() {
		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.transientDiscardAnnotations(entity);
			}
		);
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('beforeunload', this.unsavedChangesHandler);
	}

	disconnectedCallback() {
		window.removeEventListener('beforeunload', this.unsavedChangesHandler);
		super.disconnectedCallback();
	}

	async _fireSaveEvaluationEvent() {
		const entity = await this._controller.fetchEvaluationEntity(false);
		window.dispatchEvent(new CustomEvent('d2l-save-evaluation', {
			composed: true,
			bubbles: true,
			detail: {
				evaluationEntity: entity
			}
		}));
	}

	_getAttachmentsLink() {
		if (!this.evaluationEntity || !this.evaluationEntity.hasLinkByRel(attachmentsRel)) {
			return undefined;
		}

		return this.evaluationEntity.getLinkByRel(attachmentsRel).href;
	}

	_allowEvaluationWrite() {
		if (!this.evaluationEntity) {
			return undefined;
		}

		const hasWritePermission = (this.evaluationEntity.hasActionByName(saveActionName) && this.evaluationEntity.hasActionByName(publishActionName)) ||
			this.evaluationEntity.hasActionByName(updateActionName);

		return hasWritePermission;
	}

	_allowEvaluationDelete() {
		if (!this.evaluationEntity) {
			return undefined;
		}

		return this.evaluationEntity.hasActionByName(retractActionName);
	}

	_getRichTextEditorConfig() {
		if (this.evaluationEntity &&
			this.evaluationEntity.getSubEntityByRel('feedback') &&
			this.evaluationEntity.getSubEntityByRel('feedback').getSubEntityByRel(Rels.richTextEditorConfig)
		) {
			return this.evaluationEntity.getSubEntityByRel('feedback').getSubEntityByRel(Rels.richTextEditorConfig).properties;
		}

		return undefined;
	}

	render() {
		const canAddFeedbackFile = this._attachmentsInfo.canAddFeedbackFile;
		const canRecordFeedbackVideo = this._attachmentsInfo.canRecordFeedbackVideo;
		const canRecordFeedbackAudio = this._attachmentsInfo.canRecordFeedbackAudio;
		const attachments = this._attachmentsInfo.attachments;

		return html`
			<d2l-template-primary-secondary
				resizable
				@d2l-consistent-evaluation-evidence-back-to-user-submissions=${this._setSubmissionsView}
				@d2l-consistent-evaluation-file-selected=${this._selectFile}
			>
				<div slot="header">
					<d2l-consistent-evaluation-nav-bar
						return-href=${ifDefined(this.returnHref)}
						return-href-text=${ifDefined(this.returnHrefText)}
						.titleName=${this._navBarTitleText}
						.subtitleName=${this._navBarSubtitleText}
						.iteratorIndex=${this.iteratorIndex}
						.iteratorTotal=${this.iteratorTotal}
						?is-group-activity="${this.groupHref}"
						@d2l-consistent-evaluation-navigate=${this._showUnsavedChangesDialog}
					></d2l-consistent-evaluation-nav-bar>
					${this._renderLearnerContextBar()}
				</div>
				<div slot="primary" class="d2l-consistent-evaluation-page-primary-slot">
					<d2l-consistent-evaluation-left-panel
						?skeleton=${this.skeleton}
						.submissionInfo=${this.submissionInfo}
						.token=${this.token}
						user-progress-outcome-href=${ifDefined(this.userProgressOutcomeHref)}
						.currentFileId=${this.currentFileId}
						@d2l-consistent-eval-annotations-update=${this._transientSaveAnnotations}
						data-telemetry-endpoint=${this.dataTelemetryEndpoint}
					></d2l-consistent-evaluation-left-panel>
				</div>
				<div slot="secondary">
					<consistent-evaluation-right-panel
						evaluation-href=${ifDefined(this.evaluationHref)}
						.feedbackText=${this._feedbackText}
						.rubricInfos=${this.rubricInfos}
						active-scoring-rubric=${ifDefined(this._activeScoringRubric)}
						.feedbackAttachments=${attachments}
						rubric-assessment-href=${ifDefined(this.rubricAssessmentHref)}
						outcomes-href=${ifDefined(this.outcomesHref)}
						coa-eval-override-href=${ifDefined(this.coaDemonstrationHref)}
						rubric-popout-location=${ifDefined(this.rubricPopoutLocation)}
						.richTextEditorConfig=${this._getRichTextEditorConfig()}
						.grade=${this._grade}
						.gradeItemInfo=${this.gradeItemInfo}
						.token=${this.token}
						?rubric-read-only=${this.rubricReadOnly}
						?hide-grade=${this._noGradeComponent()}
						?hide-outcomes=${this.outcomesHref === undefined}
						?hide-feedback=${this._noFeedbackComponent()}
						?hide-coa-eval-override=${this.coaDemonstrationHref === undefined}
						?allow-evaluation-write=${this._allowEvaluationWrite()}
						?allow-add-file=${canAddFeedbackFile}
						?allow-record-video=${canRecordFeedbackVideo}
						?allow-record-audio=${canRecordFeedbackAudio}
						@on-d2l-consistent-eval-feedback-edit=${this._transientSaveFeedback}
						@on-d2l-consistent-eval-feedback-attachments-add=${this._transientAddAttachment}
						@on-d2l-consistent-eval-feedback-attachments-remove=${this._transientRemoveAttachment}
						@on-d2l-consistent-eval-grade-changed=${this._transientSaveGrade}
						@d2l-outcomes-coa-eval-override-change=${this._transientSaveCoaEvalOverride}
						@d2l-consistent-eval-active-scoring-rubric-change=${this._transientSaveActiveScoringRubric}
					></consistent-evaluation-right-panel>
				</div>
				<div slot="footer">
					${this._renderToast()}
					<d2l-consistent-evaluation-footer-presentational
						?show-next-student=${this.nextStudentHref}
						?published=${this._isEvaluationPublished()}
						?allow-evaluation-write=${this._allowEvaluationWrite()}
						?allow-evaluation-delete=${this._allowEvaluationDelete()}
						@d2l-consistent-evaluation-on-publish=${this._publishEvaluation}
						@d2l-consistent-evaluation-on-save-draft=${this._saveEvaluation}
						@d2l-consistent-evaluation-on-retract=${this._retractEvaluation}
						@d2l-consistent-evaluation-on-update=${this._updateEvaluation}
						@d2l-consistent-evaluation-navigate=${this._showUnsavedChangesDialog}
					></d2l-consistent-evaluation-footer-presentational>
				</div>
			</d2l-template-primary-secondary>
			<d2l-dialog-confirm
				title-text=${this.localize('unsavedChangesTitle')}
				text=${this.localize('unsavedChangesBody')}
				?opened=${this._unsavedChangesDialogOpened}
				@d2l-dialog-close=${this._onUnsavedChangesDialogClose}>
					<d2l-button slot="footer" primary data-dialog-action=${DIALOG_ACTION_LEAVE}>${this.localize('leaveBtn')}</d2l-button>
					<d2l-button slot="footer" data-dialog-action>${this.localize('cancelBtn')}</d2l-button>
			</d2l-dialog-confirm>
			<d2l-dialog-confirm
				title-text=${this.localize('unsavedAnnotationsTitle')}
				text=${this.localize('unsavedAnnotationsBody')}
				?opened=${this._unsavedAnnotationsDialogOpened}
				@d2l-dialog-close=${this._onUnsavedAnnotationsDialogClosed}>
					<d2l-button slot="footer" primary data-dialog-action=${DIALOG_ACTION_DISCARD}>${this.localize('unsavedAnnotationsDiscardButton')}</d2l-button>
					<d2l-button slot="footer" data-dialog-action>${this.localize('cancelBtn')}</d2l-button>
			</d2l-dialog-confirm>
		`;
	}

}
customElements.define('d2l-consistent-evaluation-page', ConsistentEvaluationPage);
