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
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { draftState, publishedState } from './controllers/constants.js';
import {getSubmissionFiles, getSubmissions} from './helpers/submissionsAndFilesHelpers.js';
import { Grade, GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { Awaiter } from './awaiter.js';
import { ConsistentEvaluationController } from './controllers/ConsistentEvaluationController.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { loadLocalizationResources } from './locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';
import { submissions } from './controllers/constants';

const DIALOG_ACTION_LEAVE = 'leave';

export default class ConsistentEvaluationPage extends LocalizeMixin(LitElement) {

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
			richTextEditorDisabled: {
				attribute: 'rich-text-editor-disabled',
				type: Boolean
			},
			richtextEditorConfig: {
				attribute: false,
				type: Object
			},
			rubricAssessmentHref: {
				attribute: 'rubric-assessment-href',
				type: String
			},
			rubricHref: {
				attribute: 'rubric-href',
				type: String
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
			_displayToast: {
				type: Boolean
			},
			_toastMessage: {
				type: String
			},
			_feedbackText: {
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
			_scrollbarStatus: {
				attribute: false
			},
			_fileEvidenceUrl: {
				attribute: false,
				type: String
			},
			_textEvidence: {
				attribute: false,
				type: Object
			},
			_selectedFile: {
				attribute: false,
				type: String
			},
			_dialogOpened: {
				attribute: false
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

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
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
		this._displayToast = false;
		this._toastMessage = '';
		this._scrollbarStatus = 'default';
		this._mutex = new Awaiter();
		this._setSubmissionsView = this._setSubmissionsView.bind(this);
		this._dialogOpened = false;
		this.allowEvaluationWrite = false;
		this.allowEvaluationDelete = false;
		this.unsavedChangesHandler = this._confirmUnsavedChangesBeforeUnload.bind(this);
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
			return this._feedbackEntity.properties.text || '';
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

	async updated(changedProperties) {
		super.updated(changedProperties);

		if (changedProperties.has('submissionInfo') && this.token) {
			await this.setSubmissionViewFromUrl();
		}
	}

	async _initializeController() {
		this._controller = new ConsistentEvaluationController(this._evaluationHref, this._token);
		const bypassCache = true;
		this.evaluationEntity = await this._controller.fetchEvaluationEntity(bypassCache);
		this.evaluationState = this.evaluationEntity.properties.state;
		this.allowEvaluationWrite = this._controller.userHasWritePermission(this.evaluationEntity);
		this.allowEvaluationDelete = this._controller.userHasDeletePermission(this.evaluationEntity);
		this.richtextEditorConfig = this._controller.getRichTextEditorConfig(this.evaluationEntity);

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
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-next-student-click', {
			composed: true,
			bubbles: true
		}));
	}

	async _onPreviousStudentClick() {
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-previous-student-click', {
			composed: true,
			bubbles: true
		}));
	}

	_resetEvidence() {
		this.submissionInfo = undefined;
		this._fileEvidenceUrl = undefined;
		this._textEvidence = undefined;
	}

	_hideScrollbars() {
		this._scrollbarStatus = 'hidden';
	}

	_showScrollbars() {
		this._scrollbarStatus = 'default';
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

	async _saveEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.save(entity);
				if (!(this.evaluationEntity instanceof Error)) {
					this._showToast(this.localize('saved'));
				} else {
					this._showToast(this.localize('saveError'));
				}
				this.evaluationState = this.evaluationEntity.properties.state;
			}
		);
	}

	async _updateEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.update(entity);
				if (!(this.evaluationEntity instanceof Error)) {
					this._showToast(this.localize('updated'));
				} else {
					this._showToast(this.localize('updatedError'));
				}
				this.evaluationState = this.evaluationEntity.properties.state;
			}
		);
	}

	async _publishEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.publish(entity);
				this.evaluationState = this.evaluationEntity.properties.state;
				if (!(this.evaluationEntity instanceof Error)) {
					this._showToast(this.localize('published'));
				} else {
					this._showToast(this.localize('publishError'));
				}
				this.submissionInfo.evaluationState = publishedState;
				this.allowEvaluationDelete = this._controller.userHasDeletePermission(this.evaluationEntity);
			}
		);
	}

	async _retractEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.evaluationEntity = await this._controller.retract(entity);
				if (!(this.evaluationEntity instanceof Error)) {
					this._showToast(this.localize('retracted'));
				} else {
					this._showToast(this.localize('retractError'));
				}
				this.evaluationState = this.evaluationEntity.properties.state;
				this.submissionInfo.evaluationState = draftState;
				this.allowEvaluationWrite = this._controller.userHasWritePermission(this.evaluationEntity);
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

	async _showDialog(e) {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		await this._mutex.dispatch(
			async() => {
				const entity = await this._controller.fetchEvaluationEntity(false);
				this.navigationTarget = e.detail.key;
				if (entity.hasClass('unsaved')) {
					this._dialogOpened = true;
				} else {
					this._navigate();
				}
			}
		);
	}

	_onDialogClose(e) {
		this._dialogOpened = false;
		if (e.detail.action === DIALOG_ACTION_LEAVE) {
			this._navigate();
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
					selected-item-name=${this._selectedFile}
					special-access-href=${ifDefined(this.specialAccessHref)}
					.token=${this.token}
					.submissionInfo=${this.submissionInfo}
				></d2l-consistent-evaluation-learner-context-bar>
			`;
		}
	}

	_setSubmissionsView() {
		this._fileEvidenceUrl = undefined;
		this._textEvidence = undefined;
		this._selectedFile = submissions;
		this._showScrollbars();
	}
	_setFileEvidence(e) {
		this._fileEvidenceUrl = e.detail.url;
		this._selectedFile = e.detail.name;
		this._textEvidence = undefined;
		this._hideScrollbars();
	}
	_setTextEvidence(e) {
		this._textEvidence = e.detail.textSubmissionEvidence;
		this._selectedFile = e.detail.textSubmissionEvidence.name;
		this._fileEvidenceUrl = undefined;
		this._hideScrollbars();
	}

	async setSubmissionViewFromUrl() {

		const submissions = await getSubmissions(this.submissionInfo, this.token);
		if (this.currentFileId && submissions) {
			submissions.forEach(file => {
				const fileProps = getSubmissionFiles(file);
				for (const sf of fileProps) {
					if (sf.id === this.currentFileId) {
						if (sf.comment === undefined) {
							this._setFileEvidence({
								detail: {
									url: sf.fileViewer,
									name: sf.name
								}
							});
						} else {
							this._setTextEvidence({
								detail: {
									textSubmissionEvidence: {
										title: `${this.localize('textSubmission')} ${sf.displayNumber}`,
										name: sf.name,
										date: sf.date,
										downloadUrl: sf.href,
										content: sf.comment
									}
								}});
						}
					}
				}
			});
		}
	}
	_handleAnnotationsUpdate() {
		// purposefully empty for now
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('beforeunload', this.unsavedChangesHandler);
	}

	disconnectedCallback() {
		window.removeEventListener('beforeunload', this.unsavedChangesHandler);
		super.disconnectedCallback();
	}

	render() {
		return html`
			<d2l-template-primary-secondary primary-overflow="${this._scrollbarStatus}"
			@d2l-consistent-evaluation-submission-item-render-evidence-file=${this._setFileEvidence}
			@d2l-consistent-evaluation-submission-item-render-evidence-text=${this._setTextEvidence}
			@d2l-consistent-evaluation-evidence-back-to-user-submissions=${this._setSubmissionsView}
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
						@d2l-consistent-evaluation-navigate=${this._showDialog}
					></d2l-consistent-evaluation-nav-bar>
					${this._renderLearnerContextBar()}
				</div>
				<div slot="primary" class="d2l-consistent-evaluation-page-primary-slot">
					<d2l-consistent-evaluation-left-panel
						.submissionInfo=${this.submissionInfo}
						.token=${this.token}
						file-evidence-url=${ifDefined(this._fileEvidenceUrl)}
						.textEvidence=${this._textEvidence}
						user-progress-outcome-href=${ifDefined(this.userProgressOutcomeHref)}
						@d2l-consistent-eval-annotations-update=${this._handleAnnotationsUpdate}
					></d2l-consistent-evaluation-left-panel>
				</div>
				<div slot="secondary">
					<consistent-evaluation-right-panel
						evaluation-href=${ifDefined(this.evaluationHref)}
						.feedbackText=${this._feedbackText}
						rubric-href=${ifDefined(this.rubricHref)}
						rubric-assessment-href=${ifDefined(this.rubricAssessmentHref)}
						outcomes-href=${ifDefined(this.outcomesHref)}
						coa-eval-override-href=${ifDefined(this.coaDemonstrationHref)}
						.richTextEditorConfig=${this.richtextEditorConfig}
						.grade=${this._grade}
						.gradeItemInfo=${this.gradeItemInfo}
						.token=${this.token}
						?rubric-read-only=${this.rubricReadOnly}
						?rich-text-editor-disabled=${this.richTextEditorDisabled}
						?hide-rubric=${this.rubricHref === undefined}
						?hide-grade=${this._noGradeComponent()}
						?hide-outcomes=${this.outcomesHref === undefined}
						?hide-feedback=${this._noFeedbackComponent()}
						?hide-coa-eval-override=${this.coaDemonstrationHref === undefined}
						?allow-evaluation-write=${this.allowEvaluationWrite}
						@on-d2l-consistent-eval-feedback-edit=${this._transientSaveFeedback}
						@on-d2l-consistent-eval-grade-changed=${this._transientSaveGrade}
					></consistent-evaluation-right-panel>
				</div>
				<div slot="footer">
					${this._renderToast()}
					<d2l-consistent-evaluation-footer-presentational
						?show-next-student=${this.nextStudentHref !== undefined}
						?published=${this._isEvaluationPublished()}
						?allow-evaluation-write=${this.allowEvaluationWrite}
						?allow-evaluation-delete=${this.allowEvaluationDelete}
						@d2l-consistent-evaluation-on-publish=${this._publishEvaluation}
						@d2l-consistent-evaluation-on-save-draft=${this._saveEvaluation}
						@d2l-consistent-evaluation-on-retract=${this._retractEvaluation}
						@d2l-consistent-evaluation-on-update=${this._updateEvaluation}
						@d2l-consistent-evaluation-navigate=${this._showDialog}
					></d2l-consistent-evaluation-footer-presentational>
				</div>
			</d2l-template-primary-secondary>
			<d2l-dialog-confirm
				title-text=${this.localize('unsavedChangesTitle')}
				text=${this.localize('unsavedChangesBody')}
				?opened=${this._dialogOpened}
				@d2l-dialog-close=${this._onDialogClose}
			>
				<d2l-button slot="footer" primary data-dialog-action=${DIALOG_ACTION_LEAVE}>${this.localize('leaveBtn')}</d2l-button>
				<d2l-button slot="footer" data-dialog-action>${this.localize('cancelBtn')}</d2l-button>
			</d2l-dialog-confirm>
		`;
	}

}
customElements.define('d2l-consistent-evaluation-page', ConsistentEvaluationPage);
