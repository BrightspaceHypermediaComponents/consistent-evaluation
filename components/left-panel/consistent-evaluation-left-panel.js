import './consistent-evaluation-evidence-file.js';
import './consistent-evaluation-evidence-non-viewable.js';
import './consistent-evaluation-evidence-text.js';
import './consistent-evaluation-submissions-page.js';
import './consistent-evaluation-outcomes-overall-achievement.js';
import { bodyStandardStyles, heading2Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { fileSubmission, observedInPerson, onPaperSubmission, submissionTypesWithNoEvidence, textSubmission } from '../controllers/constants';
import { findFile, getSubmissions } from '../helpers/submissionsAndFilesHelpers.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { performSirenAction } from 'siren-sdk/src/es6/SirenAction.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';
import { toggleIsReadActionName } from '../controllers/constants.js';

function getSubmissionTypeName(type) {
	switch (type) {
		case fileSubmission:
			return 'fileSubmission';
		case textSubmission:
			return 'textSubmission';
		case observedInPerson:
			return 'observedInPerson';
		case onPaperSubmission:
			return 'onPaperSubmission';
		default:
			console.error(`Consistent-Eval: Unknown submission type "${type}"`);
	}
}

export class ConsistentEvaluationLeftPanel extends SkeletonMixin(LocalizeConsistentEvaluation(LitElement)) {

	static get properties() {
		return {
			submissionInfo: {
				attribute: false,
				type: Object
			},
			token: { type: Object },
			fileEvidenceUrl: {
				attribute: 'file-evidence-url',
				type: String
			},
			textEvidence: {
				attribute: false,
				type: Object
			},
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

	static get styles() {
		return [bodyStandardStyles, heading2Styles, css`
			d2l-consistent-evaluation-evidence {
				overflow: hidden;
			}

			.d2l-consistent-evaluation-no-evidence {
				align-items: center;
				display: flex;
				flex-direction: column;
				height: 100%;
				justify-content: center;
				margin: 0 1rem;
				text-align: center;
			}

			.d2l-consistent-evaluation-no-submissions-container {
				background: white;
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				margin: 1rem;
				padding: 1rem;
			}

			.d2l-consistent-evaluation-no-submissions {
				background: var(--d2l-color-regolith);
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				padding: 2rem;
				width: 100%;
			}

			d2l-consistent-evaluation-submissions-page {
				width: 100%;
			}
		`];
	}

	async updated(changedProperties) {
		super.updated();

		if ((changedProperties.has('currentFileId') || changedProperties.has('token') || changedProperties.has('submissionInfo'))
			&& this.currentFileId
			&& this.token
			&& this.submissionInfo
		) {
			await this.getFileFromId();
		} else if (changedProperties.has('currentFileId') && !this.currentFileId) {
			this.textEvidence = undefined;
			this.fileEvidenceUrl = undefined;
			this.fileNonViewable = undefined;
		}

	}

	async getFileFromId() {
		const submissions = await getSubmissions(this.submissionInfo, this.token);
		const currentFile = findFile(this.currentFileId, submissions);

		if (!currentFile) {
			console.error(`Cannot find fileId ${this.currentFileId}`);
			return;
		}

		const action = currentFile.getActionByName(toggleIsReadActionName);
		if (action.fields.some(f => f.name === 'isRead' && f.value)) {
			// If the action value is true it means it can be called to set the IsRead value to true, otherwise it is already read and we dont want to unread it
			await performSirenAction(this.token, action, undefined, true);
		}

		if (this.submissionInfo.submissionType === fileSubmission) {
			this.textEvidence = undefined;
			if (currentFile.properties.fileViewer) {
				// file is viewable
				this.fileEvidenceUrl = currentFile.properties.fileViewer;
				this.fileNonViewable = undefined;
			} else {
				// file is unviewable
				this.fileEvidenceUrl = undefined;
				this.fileNonViewable = {
					title: currentFile.properties.name,
					downloadUrl: currentFile.properties.href
				};
			}
		} else if (this.submissionInfo.submissionType === textSubmission) {
			this.fileEvidenceUrl = undefined;
			this.textEvidence = {
				title: `${this.localize('textSubmission')} ${currentFile.properties.displayNumber}`,
				date: currentFile.properties.date,
				downloadUrl: currentFile.properties.href,
				content: currentFile.properties.comment
			};
			this.fileNonViewable = undefined;
		} else {
			this.textEvidence = undefined;
			this.fileEvidenceUrl = undefined;
			this.fileNonViewable = undefined;
		}
	}

	_renderFileEvidence() {
		return html`
		<d2l-consistent-evaluation-evidence-file
			url=${this.fileEvidenceUrl}
			.token=${this.token}
		></d2l-consistent-evaluation-evidence-file>`;
	}

	_renderNoEvidenceSubmissionType() {
		return html`
		<div class="d2l-consistent-evaluation-no-evidence">
			<h2 class="d2l-heading-2">${this.localize(getSubmissionTypeName(this.submissionInfo.submissionType))}</h2>
			<p class="d2l-body-standard">${this.localize('noEvidence')}</p>
		</div>`;
	}

	_renderNoSubmissions() {
		return html`
		<div class="d2l-consistent-evaluation-no-submissions-container">
			<div class="d2l-consistent-evaluation-no-submissions d2l-body-standard">${this.localize('noSubmissions')}</div>
		</div>`;
	}

	_renderOverallAchievement() {
		return html`
			<d2l-consistent-evaluation-outcomes-overall-achievement
				href=${this.userProgressOutcomeHref}
				.token=${this.token}
			></d2l-consistent-evaluation-outcomes-overall-achievement>
		`;
	}

	_renderSubmissionList() {
		return html`
		<d2l-consistent-evaluation-submissions-page
			submission-type=${this.submissionInfo && this.submissionInfo.submissionType}
			.submissionList=${this.submissionInfo && this.submissionInfo.submissionList}
			.token=${this.token}
			data-telemetry-endpoint=${this.dataTelemetryEndpoint}
			download-all-submissions-location=${ifDefined(this.downloadAllSubmissionLink)}
			?skeleton=${this.skeleton}
			?hide-use-grade=${this.hideUseGrade}
		></d2l-consistent-evaluation-submissions-page>`;
	}

	_renderTextEvidence() {
		return html`
		<d2l-consistent-evaluation-evidence-text
			title=${this.textEvidence.title}
			date=${this.textEvidence.date}
			download-url=${this.textEvidence.downloadUrl}
			.content=${this.textEvidence.content}
		></d2l-consistent-evaluation-evidence-text>`;
	}

	_renderNonViewableFile() {
		return html`
		<d2l-consistent-evaluation-evidence-non-viewable
			title=${this.fileNonViewable.title}
			download-url=${this.fileNonViewable.downloadUrl}
		></d2l-consistent-evaluation-evidence-non-viewable>`;
	}

	render() {
		if (this.userProgressOutcomeHref) {
			return this._renderOverallAchievement();
		}

		if (this.submissionInfo) {
			if (submissionTypesWithNoEvidence.includes(this.submissionInfo.submissionType)) {
				return this._renderNoEvidenceSubmissionType();
			}

			if (this.submissionInfo.submissionList === undefined) {
				return this._renderNoSubmissions();
			}
		}

		if (this.fileEvidenceUrl) {
			return this._renderFileEvidence();
		}

		if (this.textEvidence) {
			return this._renderTextEvidence();
		}

		if (this.fileNonViewable) {
			return this._renderNonViewableFile();
		}

		if (this.submissionInfo) {
			return this._renderSubmissionList();
		}
	}
}

customElements.define('d2l-consistent-evaluation-left-panel', ConsistentEvaluationLeftPanel);
