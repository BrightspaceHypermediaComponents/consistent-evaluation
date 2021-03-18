import './consistent-evaluation-page.js';
import { attachmentClassName, attachmentListRel } from './controllers/constants';
import { css, html, LitElement } from 'lit-element';
import { Awaiter } from './awaiter.js';
import { ConsistentEvalTelemetry } from './helpers/consistent-eval-telemetry.js';
import { ConsistentEvaluationHrefController } from './controllers/ConsistentEvaluationHrefController.js';
import { getSubmissions } from './helpers/submissionsAndFilesHelpers.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../localize-consistent-evaluation.js';

export class ConsistentEvaluation extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			_loading: {
				type: Boolean,
				attribute: false
			},
			href: { type: String },
			token: { type: Object },
			returnHref: {
				attribute: 'return-href',
				type: String
			},
			returnHrefText: {
				attribute: 'return-href-text',
				type: String
			},
			dataTelemetryEndpoint: {
				attribute: 'data-telemetry-endpoint',
				type: String
			},
			useNewHtmlEditor: {
				attribute: 'use-new-html-editor',
				type: Boolean
			},
			displayConversionWarning: {
				attribute: 'display-conversion-warning',
				type: Boolean
			},
			_rubricReadOnly: { type: Boolean },
			_childHrefs: { type: Object },
			_rubricInfos: { type: Array },
			_submissionInfo: { type: Object },
			_gradeItemInfo: { type: Object },
			_enrolledUser: { type: Object },
			_groupInfo: { type: Object },
			_assignmentName: { type: String },
			_organizationName: { type: String },
			_userName: { type: String },
			_iteratorTotal: { type: Number },
			_iteratorIndex: { type: Number },
			_editActivityPath: { type: String },
			fileId: {
				attribute: 'file-id',
				type: String
			},
			currentFileId: {
				type: String
			}
		};
	}

	static get styles() {
		return css`
			d2l-consistent-evaluation-page {
				width: 100%;
			}
		`;
	}

	constructor() {
		super();

		// Only show the scrollbar when necessary
		document.body.style.overflow = 'auto';
		document.documentElement.style.overflow = 'auto'; // needed for FF bug

		this.href = undefined;
		this.token = undefined;
		this._rubricReadOnly = false;
		this._richTextEditorDisabled = false;
		this._childHrefs = undefined;
		this._rubricInfos = undefined;
		this._submissionInfo = undefined;
		this._gradeItemInfo = undefined;
		this._groupInfo = undefined;
		this._anonymousInfo = undefined;
		this._editActivityPath = undefined;
		this.returnHref = undefined;
		this.returnHrefText = undefined;
		this._mutex = new Awaiter();
		this._loading = true;
		this._loadingComponents = {
			main : true,
			submissions: true
		};
	}

	render() {
		return html`
			<d2l-consistent-evaluation-page
				?skeleton=${this._loading}
				outcomes-href=${ifDefined(this._childHrefs && this._childHrefs.alignmentsHref)}
				evaluation-href=${ifDefined(this._childHrefs && this._childHrefs.evaluationHref)}
				next-student-href=${ifDefined(this._childHrefs && this._childHrefs.nextHref)}
				user-href=${ifDefined(this._childHrefs && this._childHrefs.userHref)}
				group-href=${ifDefined(this._childHrefs && this._childHrefs.groupHref)}
				user-progress-outcome-href=${ifDefined(this._childHrefs && this._childHrefs.userProgressOutcomeHref)}
				coa-demonstration-href=${ifDefined(this._childHrefs && this._childHrefs.coaDemonstrationHref)}
				special-access-href=${ifDefined(this._childHrefs && this._childHrefs.specialAccessHref)}
				return-href=${ifDefined(this.returnHref)}
				return-href-text=${ifDefined(this.returnHrefText)}
				data-telemetry-endpoint=${ifDefined(this.dataTelemetryEndpoint)}
				rubric-popout-location=${ifDefined(this._childHrefs && this._childHrefs.rubricPopoutLocation)}
				download-all-submissions-location=${ifDefined(this._childHrefs && this._childHrefs.downloadAllSubmissionLink)}
				edit-activity-path=${ifDefined(this._editActivityPath)}
				.currentFileId=${this.currentFileId}
				.rubricInfos=${this._rubricInfos}
				.submissionInfo=${this._submissionInfo}
				.gradeItemInfo=${this._gradeItemInfo}
				.assignmentName=${this._assignmentName}
				.organizationName=${this._organizationName}
				.userName=${this._userName}
				.iteratorTotal=${this._iteratorTotal}
				.iteratorIndex=${this._iteratorIndex}
				.token=${this.token}
				.href=${this.href}
				.enrolledUser=${this._enrolledUser}
				.groupInfo=${this._groupInfo}
				.anonymousInfo=${this._anonymousInfo}
				?rubric-read-only=${this._rubricReadOnly}
				?hide-learner-context-bar=${this._shouldHideLearnerContextBar()}
				?use-new-html-editor=${this.useNewHtmlEditor}
				?display-conversion-warning=${this.displayConversionWarning}
				@d2l-consistent-evaluation-previous-student-click=${this._onPreviousStudentClick}
				@d2l-consistent-evaluation-next-student-click=${this._onNextStudentClick}
				@d2l-consistent-evaluation-loading-finished=${this._finishedLoading}
				@d2l-consistent-eval-rubric-popup-closed=${this._refreshRubrics}
			></d2l-consistent-evaluation-page>
		`;
	}
	async updated(changedProperties) {
		super.updated();
		if (changedProperties.has('dataTelemetryEndpoint')) {
			this._telemetry = new ConsistentEvalTelemetry(this.dataTelemetryEndpoint);
		}
		if (changedProperties.has('href')) {
			await this._mutex.dispatch(
				async() => {
					const controller = new ConsistentEvaluationHrefController(this.href, this.token);
					this._childHrefs = await controller.getHrefs();
					this._rubricInfos = await controller.getRubricInfos(false);
					this._submissionInfo = await controller.getSubmissionInfo();
					this._gradeItemInfo = await controller.getGradeItemInfo();
					this._assignmentName = await controller.getAssignmentOrganizationName('assignment');
					this._organizationName = await controller.getAssignmentOrganizationName('organization');
					this._userName = await controller.getUserName();
					this._enrolledUser = await controller.getEnrolledUser();
					this._groupInfo = await controller.getGroupInfo();
					this._anonymousInfo = await controller.getAnonymousInfo();
					this._iteratorTotal = await controller.getIteratorInfo('total');
					this._iteratorIndex = await controller.getIteratorInfo('index');
					this._editActivityPath = await controller.getEditActivityPath();
					const stripped = this._stripFileIdFromUrl();
					const hasOneFileAndSubmission = await this._hasOneFileAndOneSubmission();
					if (!stripped && !hasOneFileAndSubmission) {
						this.currentFileId = undefined;
						this.shadowRoot.querySelector('d2l-consistent-evaluation-page')._setSubmissionsView();
					} else {
						this._loadingComponents.submissions = false;
					}

					if (!this._submissionInfo || !this._submissionInfo.submissionList) {
						this._loadingComponents.submissions = false;
					}

					this._loadingComponents.main = false;
					this._finishedLoading();
				}
			);
		}
	}

	_finishedLoading(e) {
		if (e) {
			this._loadingComponents[e.detail.component] = false;
		}

		for (const component in this._loadingComponents) {
			if (this._loadingComponents[component] === true) {
				return;
			}
		}
		this._loading = false;
		this._setTitle();
		if (this._telemetry && this._submissionInfo.submissionList) {
			this._telemetry.logLoadEvent('consistentEvalMain', this._submissionInfo.submissionList.length);
		}
	}
	async _hasOneFileAndOneSubmission() {
		if (this._submissionInfo && this._submissionInfo.submissionList && this._submissionInfo.submissionList.length === 1) {
			const submissions = await getSubmissions(this._submissionInfo, this.token);
			const attachmentList = submissions[0].entity.getSubEntityByRel(attachmentListRel);
			const numberOfSubmittedFiles = attachmentList.entities.length;
			if (numberOfSubmittedFiles === 1) {
				const fileId = attachmentList.getSubEntityByClass(attachmentClassName).properties.id;
				this.currentFileId = fileId;
				return true;
			}
		}
		return false;
	}

	async _onNextStudentClick() {
		await this._mutex.dispatch(
			async() => {
				const nextStudentHref = this._childHrefs?.nextHref;
				if (nextStudentHref) {
					this._updateCurrentUrl(nextStudentHref);
					this.href = nextStudentHref;
					this._setLoading();
				}
			}
		);
	}
	async _onPreviousStudentClick() {
		await this._mutex.dispatch(
			async() => {
				const previousStudentHref = this._childHrefs?.previousHref;
				if (previousStudentHref) {
					this._updateCurrentUrl(previousStudentHref);
					this.href = previousStudentHref;
					this._setLoading();
				}
			}
		);
	}
	async _refreshRubrics() {
		const controller = new ConsistentEvaluationHrefController(this.href, this.token);
		this._rubricInfos = await controller.getRubricInfos(true);
	}
	_setLoading() {
		for (const component in this._loadingComponents) {
			this._loadingComponents[component] = true;
		}
		this._loading = true;
	}
	_setTitle() {
		if (this._userName && this._assignmentName) {
			const title = document.createElement('title');
			title.textContent = this.localize('assignmentPageTitle', { userName: this._userName, activityName: this._assignmentName });
			document.head.insertBefore(title, document.head.firstChild);
		}
	}
	_shouldHideLearnerContextBar() {
		return this._childHrefs && this._childHrefs.userProgressOutcomeHref;
	}
	_stripFileIdFromUrl() {
		if (this.fileId) {
			const fileIdQueryName = 'fileId';
			const urlWithoutFileQuery = window.location.href.replace(`&${fileIdQueryName}=${this.fileId}`, '');
			history.replaceState({}, document.title, urlWithoutFileQuery);

			this.currentFileId = this.fileId;
			this.fileId = undefined;

			return true;
		}

		return false;
	}

	_updateCurrentUrl(targetHref) {
		const targetHrefUrl = new URL(targetHref);
		if (targetHrefUrl) {
			const queryString = targetHrefUrl.search;
			const searchParams = new URLSearchParams(queryString);
			const nextActorUsageId = searchParams.get('currentActorUsageId');

			if (nextActorUsageId) {
				const currentUrl = new URL(window.location.href);
				const currentUrlQueryString = currentUrl.search;
				const currentUrlSearchParams = new URLSearchParams(currentUrlQueryString);
				currentUrlSearchParams.set('currentActorActivityUsage', nextActorUsageId);
				currentUrl.search = currentUrlSearchParams.toString();

				window.history.replaceState(null, null, currentUrl.toString());
			}
		}
	}

}

customElements.define('d2l-consistent-evaluation', ConsistentEvaluation);
