import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import '@brightspace-ui/core/components/list/list.js';
import '@brightspace-ui/core/components/list/list-item.js';
import '@brightspace-ui/core/components/colors/colors.js';
import './consistent-evaluation-submission-item.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { Classes } from 'd2l-hypermedia-constants';

export class ConsistentEvaluationSubmissionsPage extends LitElement {
	static get properties() {
		return {
			dueDate: {
				attribute: 'due-date',
				type: String
			},
			evaluationState: {
				attribute: 'evaluation-state',
				type: String
			},
			submissionList: {
				attribute: false,
				type: Array
			},
			submissionType: {
				attribute: 'submission-type',
				type: String
			},
			token: {
				type: String
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
				background-color: var(--d2l-color-sylvite);
			}
			:host([hidden]) {
				display: none;
			}
			d2l-consistent-evaluation-submission-item {
				padding: 0.5rem;
				margin: 0.5rem;
			}
		`;
	}

	constructor() {
		super();
		this._submissionList = [];
		this._token = undefined;
		this._submissionEntities = [];
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

	async _initializeSubmissionEntities() {
		if (this._submissionList !== undefined) {
			for (const submissionLink of this._submissionList) {
				if (submissionLink.href) {
					const submission = await this._getSubmissionEntity(submissionLink.href);
					this._submissionEntities.push(submission);
				}
			}
		}
	}

	async _getSubmissionEntity(submissionHref) {
		return await window.D2L.Siren.EntityStore.fetch(submissionHref, this._token, false);
	}

	_renderListItems() {
		const itemTemplate = [];
		for (let i = 0; i < this._submissionEntities.length; i++) {
			if (this._submissionEntities[i].entity) {
				const submissionEntity = this._submissionEntities[i].entity;
				if (submissionEntity.getSubEntityByClass(Classes.assignments.submissionDate)) {
					const submissionDate = submissionEntity.getSubEntityByClass(Classes.assignments.submissionDate).properties.date;
					itemTemplate.push(html`
						<d2l-consistent-evaluation-submission-item
							date-str=${submissionDate}
							display-number=${this._submissionEntities.length - i}
							evaluation-state=${this.evaluationState}
							submission-type=${this.submissionType}
							.submissionEntity=${submissionEntity}
							?late=${new Date(this.dueDate) < new Date(submissionDate)}
						></d2l-consistent-evaluation-submission-item>`);
				} else {
					console.warn('Consistent Evaluation submission date property not found');
				}
			}
		}
		return html`${itemTemplate}`;
	}

	render() {
		return html`<d2l-list separators="between">
				${this._renderListItems()}
				</d2l-list>`;
	}
}

customElements.define('d2l-consistent-evaluation-submissions-page', ConsistentEvaluationSubmissionsPage);
