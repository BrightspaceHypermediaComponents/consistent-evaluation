/* global moment:false */
import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import { css, html, LitElement } from 'lit-element';
import {getSubmissionFiles, getSubmissions} from '../helpers/submissionsAndFilesHelpers.js';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';
import { submissions } from '../controllers/constants';

export class ConsistentEvaluationLcbFileContext extends RtlMixin(LocalizeMixin(LitElement)) {

	static get properties() {
		return {
			selectedFile: {
				attribute: false,
				type: Object
			},
			submissionInfo: {
				attribute: false,
				type: Object
			},
			_files: {
				attribute: false,
				type: Array
			},
			specialAccessHref: {
				attribute: 'special-access-href',
				type: String
			},
			_showFiles: {
				attribute: false,
				type: Boolean
			},
			_selectedFileName : {
				attribute: false,
				type: String
			},
			_selectedFileLateness : {
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
			this._files = await getSubmissions(this.submissionInfo, this.token);
		}

		this._showFiles = (this._files && this._files.length > 0);
		if (this.selectedFile) {
			this._selectedFileName = this.selectedFile.name;
			this._selectedFileLateness = this.selectedFile.lateness;
		}
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

		this._submissionLateness = submission.latenessTimespan;
	}

	_dispatchRenderEvidenceFileEvent(sf) {
		const event = new CustomEvent('d2l-consistent-evaluation-submission-item-render-evidence-file', {
			detail: {
				url: sf.fileViewer,
				submissionFile: {
					name: sf.name,
					lateness: sf.latenessTimespan,
					id: sf.id
				}
			},
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);
	}

	_dispatchRenderEvidenceTextEvent(sf) {
		const event = new CustomEvent('d2l-consistent-evaluation-submission-item-render-evidence-text', {
			detail: {
				submissionFile:{
					name: sf.name,
					lateness: sf.latenessTimespan,
					id: sf.id
				},
				textSubmissionEvidence: {
					title: `${this.localize('textSubmission')} ${sf.displayNumber}`,
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

	_renderLateButton() {
		if (this._selectedFileName === submissions || !this._selectedFileLateness)
		{
			return html``;
		} else {
			return html`
				<d2l-button-subtle
					text="${moment.duration(Number(this.selectedFile.lateness), 'seconds').humanize()} ${this.localize('late')}"
					icon="tier1:access-special"
					@click="${this._openSpecialAccessDialog}"
				></d2l-button-subtle>`;
		}
	}

	_openSpecialAccessDialog() {
		const specialAccess = this.specialAccessHref;

		if (!specialAccess) {
			console.error('Consistent-Eval: Expected special access item dialog URL, but none found');
			return;
		}

		const location = new D2L.LP.Web.Http.UrlLocation(specialAccess);

		const buttons = [
			{
				Key: 'save',
				Text: this.localize('saveBtn'),
				ResponseType: 1, // D2L.Dialog.ResponseType.Positive
				IsPrimary: true,
				IsEnabled: true
			},
			{
				Text: this.localize('cancelBtn'),
				ResponseType: 2, // D2L.Dialog.ResponseType.Negative
				IsPrimary: false,
				IsEnabled: true
			}
		];

		D2L.LP.Web.UI.Legacy.MasterPages.Dialog.Open(
			/*               opener: */ this.shadowRoot.querySelector('d2l-button-subtle'),
			/*             location: */ location,
			/*          srcCallback: */ 'SrcCallback',
			/*       resizeCallback: */ '',
			/*      responseDataKey: */ 'result',
			/*                width: */ 1920,
			/*               height: */ 1080,
			/*            closeText: */ this.localize('closeBtn'),
			/*              buttons: */ buttons,
			/* forceTriggerOnCancel: */ false
		);
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
				<option label=${this.localize('userSubmissions')} value=${submissions} ?selected=${this._selectedFileName === submissions}></option>
				${this._files && this._files.map(submission => html`
					<optgroup label=${this.localize('submissionNumber', 'number', submission.submissionNumber)}>
						${getSubmissionFiles(submission, this.token).map(sf => html`
							<option value=${JSON.stringify(sf)} label=${this._truncateFileName(sf.name)} ?selected=${sf.name === this._selectedFileName} class="select-option"></option>
						`)}
					</optgroup>
				`)};
			</select>
			${this._renderLateButton()}
 		`;
	}
}

customElements.define('d2l-consistent-evaluation-lcb-file-context', ConsistentEvaluationLcbFileContext);
