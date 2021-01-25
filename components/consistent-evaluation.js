import './consistent-evaluation-page.js';
import { css, html, LitElement } from 'lit-element';
import { ConsistentEvalTelemetry } from './helpers/consistent-eval-telemetry.js';
import { ConsistentEvaluationHrefController } from './controllers/ConsistentEvaluationHrefController.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';

export class ConsistentEvaluation extends LitElement {

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
			_rubricReadOnly: { type: Boolean },
			_childHrefs: { type: Object },
			_rubricInfos: { type: Array },
			_submissionInfo: { type: Object },
			_gradeItemInfo: { type: Object },
			_assignmentName: { type: String },
			_organizationName: { type: String },
			_userName: { type: String },
			_iteratorTotal: { type: Number },
			_iteratorIndex: { type: Number },
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

		this.href = undefined;
		this.token = undefined;
		this._rubricReadOnly = false;
		this._richTextEditorDisabled = false;
		this._childHrefs = undefined;
		this._rubricInfos = undefined;
		this._submissionInfo = undefined;
		this._gradeItemInfo = undefined;
		this.returnHref = undefined;
		this.returnHrefText = undefined;
		this._loading = true;
		this._loadingComponents = {
			main : true,
			submissions: true
		};
	}

	async updated(changedProperties) {
		super.updated();
		if (changedProperties.has('dataTelemetryEndpoint')) {
			this._telemetry = new ConsistentEvalTelemetry(this.dataTelemetryEndpoint);
		}
		if (changedProperties.has('href')) {
			const controller = new ConsistentEvaluationHrefController(this.href, this.token);
			this._childHrefs = await controller.getHrefs();
			this._rubricInfos = await controller.getRubricInfos(false);
			this._submissionInfo = await controller.getSubmissionInfo();
			this._gradeItemInfo = await controller.getGradeItemInfo();
			this._assignmentName = await controller.getAssignmentOrganizationName('assignment');
			this._organizationName = await controller.getAssignmentOrganizationName('organization');
			this._userName = await controller.getUserName();
			this._iteratorTotal = await controller.getIteratorInfo('total');
			this._iteratorIndex = await controller.getIteratorInfo('index');
			const stripped = this._stripFileIdFromUrl();
			if (!stripped) {
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

	_onNextStudentClick() {
		this.href = this._childHrefs?.nextHref;
		this._setLoading();
	}

	_onPreviousStudentClick() {
		this.href = this._childHrefs?.previousHref;
		this._setLoading();
	}

	_shouldHideLearnerContextBar() {
		return this._childHrefs && this._childHrefs.userProgressOutcomeHref;
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
		if (this._telemetry && this._submissionInfo.submissionList) {
			this._telemetry.logLoadEvent('consistentEvalMain', this._submissionInfo.submissionList.length);
		}
	}

	_setLoading() {
		for (const component in this._loadingComponents) {
			this._loadingComponents[component] = true;
		}
		this._loading = true;
	}

	async _refreshRubrics() {
		const controller = new ConsistentEvaluationHrefController(this.href, this.token);
		this._rubricInfos = await controller.getRubricInfos(true);
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
				current-file-id=${ifDefined(this.currentFileId)}
				data-telemetry-endpoint=${ifDefined(this.dataTelemetryEndpoint)}
				rubric-popout-location=${ifDefined(this._childHrefs && this._childHrefs.rubricPopoutLocation)}
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
				?rubric-read-only=${this._rubricReadOnly}
				?hide-learner-context-bar=${this._shouldHideLearnerContextBar()}
				@d2l-consistent-evaluation-previous-student-click=${this._onPreviousStudentClick}
				@d2l-consistent-evaluation-next-student-click=${this._onNextStudentClick}
				@d2l-consistent-evaluation-loading-finished=${this._finishedLoading}
				@d2l-consistent-eval-rubric-popup-closed=${this._refreshRubrics}
			></d2l-consistent-evaluation-page>
		`;
	}
}

customElements.define('d2l-consistent-evaluation', ConsistentEvaluation);
