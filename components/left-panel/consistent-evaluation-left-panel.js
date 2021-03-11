import './assignments/consistent-evaluation-evidence-assignment.js';
import './discussions/consistent-evaluation-evidence-discussion.js';
import { html, LitElement } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export class ConsistentEvaluationLeftPanel extends SkeletonMixin(LocalizeConsistentEvaluation(LitElement)) {

	static get properties() {
		return {
			submissionInfo: {
				attribute: false,
				type: Object
			},
			token: { type: Object },
			fileNonViewable: {
				attribute: false,
				type: Object
			},
			userProgressOutcomeHref: {
				attribute: 'user-progress-outcome-href',
				type: String
			},
			downloadAllSubmissionLink: {
				attribute: 'download-all-submissions-location',
				type: String
			},
			currentFileId: {
				attribute: 'current-file-id',
				type: String
			},
			hideUseGrade: {
				attribute: 'hide-use-grade',
				type: Boolean
			},
			dataTelemetryEndpoint: {
				attribute: 'data-telemetry-endpoint',
				type: String
			}
		};
	}

	_renderAssignments() {
		return html`
			<d2l-consistent-evaluation-evidence-assignment
				?skeleton=${this.skeleton}
				.submissionInfo=${this.submissionInfo}
				.token=${this.token}
				user-progress-outcome-href=${ifDefined(this.userProgressOutcomeHref)}
				download-all-submissions-location=${ifDefined(this.downloadAllSubmissionLink)}
				.currentFileId=${this.currentFileId}
				?hide-use-grade=${this.hideUseGrade}
				?display-conversion-warning=${this.displayConversionWarning}
				@d2l-consistent-eval-annotations-update=${this.transientSaveAnnotations}
				@d2l-consistent-eval-annotations-will-change=${this.updateAnnotationsViewerEditingStart}
				@d2l-consistent-evaluation-use-tii-grade=${this.transientSaveGrade}
				@d2l-consistent-evaluation-refresh-grade-item=${this.refreshEvaluationEntity}
				@d2l-consistent-evaluation-download-all-failed=${this.handleDownloadAllFailure}
				data-telemetry-endpoint=${this.dataTelemetryEndpoint}
			></d2l-consistent-evaluation-evidence-assignment>
		`;
	}

	_renderDiscussions() {
		return html`
			<d2l-consistent-evaluation-evidence-discussion></d2l-consistent-evaluation-evidence-discussion>
		`;
	}

	render() {
		return html`
			${this._renderAssignments()}
		`;
	}
}

customElements.define('d2l-consistent-evaluation-left-panel', ConsistentEvaluationLeftPanel);
