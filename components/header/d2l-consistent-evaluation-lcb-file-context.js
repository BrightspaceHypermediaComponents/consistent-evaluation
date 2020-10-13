import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { attachmentListRel, submissions } from '../controllers/constants';
import { css, html, LitElement } from 'lit-element';
import { Classes } from 'd2l-hypermedia-constants';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

export class ConsistentEvaluationLcbFileContext extends RtlMixin(LocalizeMixin(LitElement)) {

	static get properties() {
		return {
			selectedItemName: {
				attribute: 'selected-item-name',
				type: String
			},
			submissionInfo: {
				attribute: false,
				type: Object
			},
			_files: {
				attribute: false,
				type: Array
			},
			_showFiles: {
				attribute: false,
				type: Boolean
			}
		};
	}

	static get styles() {
		return [selectStyles,
			css`
				:host {
					margin-left: 0.7rem;
				}
				.d2l-input-select {
					max-width: 15rem;
				}
				:host([dir="rtl"]) {
					margin-left: 0;
					margin-right: 0.7rem;
				}
				.d2l-truncate {
					overflow: hidden;
					overflow-wrap: break-word;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				@media (max-width: 930px) {
					:host {
						display: none;
					}
				}
			`
		];
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	constructor() {
		super();

		this._showFiles = false;
	}

	async updated(changedProperties) {
		super.updated(changedProperties);

		if (changedProperties.has('submissionInfo')) {
			this._files = await this.getSubmissions();
		}

		this._showFiles = (this._files && this._files.length > 0);
	}

	async getSubmissions() {
		if (this.submissionInfo && this. submissionInfo.submissionList) {
			const totalSubmissions = this.submissionInfo.submissionList.length;

			const submissionEntities = this.submissionInfo.submissionList.map(async(sub, index) => {
				const file = await window.D2L.Siren.EntityStore.fetch(sub.href, this.token, false);
				file.submissionNumber = totalSubmissions - index;
				return file;
			});
			return Promise.all(submissionEntities);
		}
	}

	getSubmissionFiles(submission) {
		const attachments = submission.entity.getSubEntityByRel(attachmentListRel);
		let displayNum = 0;
		return attachments.entities.map(sf => {
			displayNum += displayNum;
			if (submission.entity.getSubEntityByClass(Classes.assignments.submissionComment)) {
				sf.properties.comment = submission.entity.getSubEntityByClass(Classes.assignments.submissionComment).properties.html;
			}
			sf.properties.date = submission.entity.getSubEntityByClass(Classes.assignments.submissionDate).properties.date;
			sf.properties.displayNumber = displayNum;
			return sf.properties;
		});
	}

	_onSelectChange(e) {
		if (e.target.value === submissions) {
			const event = new Event('d2l-consistent-evaluation-evidence-back-to-user-submissions', {
				composed: true,
				bubbles: true
			});
			this.dispatchEvent(event);
			return;
		}

		const submission = JSON.parse(e.target.value);
		if (submission.comment === undefined) {
			this._dispatchRenderEvidenceFileEvent(submission);
		} else {
			this._dispatchRenderEvidenceTextEvent(submission);
		}
	}

	_dispatchRenderEvidenceFileEvent(sf) {
		const event = new CustomEvent('d2l-consistent-evaluation-submission-item-render-evidence-file', {
			detail: {
				url: sf.fileViewer,
				name: sf.name
			},
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);
	}

	_dispatchRenderEvidenceTextEvent(sf) {
		const event = new CustomEvent('d2l-consistent-evaluation-submission-item-render-evidence-text', {
			detail: {
				textSubmissionEvidence: {
					title: `${this.localize('textSubmission')} ${sf.displayNumber}`,
					name: sf.name,
					date: sf.date,
					downloadUrl: sf.href,
					content: sf.comment
				}
			},
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);
	}

	_truncateFileName(fileName) {
		const maxFileLength = 50;
		if (fileName.length <= maxFileLength) {
			return fileName;
		}

		const ext = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
		return  `${fileName.substring(0, maxFileLength)}…${ext}`;
	}

	render() {
		if (!this._showFiles) return html ``;

		return html`
			<select class="d2l-input-select d2l-truncate" aria-label=${this.localize('userSubmissions')} @change=${this._onSelectChange}>
				<option label=${this.localize('userSubmissions')} value=${submissions} ?selected=${this.selectedItemName === submissions}></option>
				${this._files && this._files.map(submission => html`
					<optgroup label=${this.localize('submissionNumber', 'number', submission.submissionNumber)}>
						${this.getSubmissionFiles(submission).map(sf => html`
							<option value=${JSON.stringify(sf)} label=${this._truncateFileName(sf.name)} ?selected=${sf.name === this.selectedItemName} class="select-option"></option>
						`)}
					</optgroup>
				`)};
			</select>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-lcb-file-context', ConsistentEvaluationLcbFileContext);
