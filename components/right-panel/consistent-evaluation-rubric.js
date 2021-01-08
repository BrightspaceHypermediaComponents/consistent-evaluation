import './consistent-evaluation-right-panel-block';
import 'd2l-rubric/d2l-rubric.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/icons/icon.js';
import { css, html, LitElement } from 'lit-element';
import { labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

class ConsistentEvaluationRubric extends LocalizeConsistentEvaluation(LitElement) {
	static get properties() {
		return {
			header: {
				type: String
			},
			rubricInfos: {
				attribute: false,
				type: Array
			},
			activeScoringRubric: {
				attribute: 'active-scoring-rubric',
				type: String
			},
			showActiveScoringRubricOptions: {
				attribute: 'show-active-scoring-rubric-options',
				type: Boolean
			},
			isPopout: {
				attribute: 'is-popout',
				type: Boolean
			},
			rubricPopoutLocation: {
				attribute: 'rubric-popout-location',
				type: String
			},
			token: {
				type: String
			},
			readonly: {
				attribute: 'read-only',
				type: Boolean
			}
		};
	}

	static get styles() {
		return  [labelStyles, selectStyles, css`
			.d2l-consistent-evaluation-rubric:nth-child(n + 2) {
				margin-top: 0.7rem;
			}
			.d2l-label-text {
				font-size: 0.55rem;
				font-weight: 600;
				margin-bottom: 0.4rem;
			}
			d2l-icon {
				cursor: pointer;
				display: flex;
				margin-left: auto;
				margin-right: 0;
			}

			.d2l-consistent-evaluation-open-rubrics {
				float: right;
				margin-top: -1.5rem;
			}

			.d2l-consistent-evaluation-active-scoring-rubric {
				max-width: 100%;
				overflow: hidden;
				overflow-wrap: break-word;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.d2l-consistent-evaluation-rubric-title {
				margin-bottom: -0.5rem;
			}

			.d2l-consistent-evaluation-rubric.d2l-consistent-evaluation-popout {
				margin: 0.5rem 1rem 1rem 1rem;
			}

			.d2l-consistent-evaluation-rubric.d2l-consistent-evaluation-popout:nth-child(n+2) {
				margin-top: 2rem;
			}
		`];
	}

	constructor() {
		super();
		this.isPopout = false;
		this.rubricWindowPopout = undefined;
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('beforeunload', this._closePopout);
	}

	disconnectedCallback() {
		window.removeEventListener('beforeunload', this._closePopout);
		super.disconnectedCallback();
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('activeScoringRubric')) {
			const activeRubricDropdown = this.shadowRoot.querySelector('.d2l-consistent-evaluation-active-scoring-rubric');
			if (activeRubricDropdown) {
				activeRubricDropdown.value = this.activeScoringRubric ?
					this.activeScoringRubric :
					'-1';
			}
		}

		if (changedProperties.get('rubricPopoutLocation') && this.rubricWindowPopout) {
			this.rubricWindowPopout.close();
		}
	}

	_closePopout() {
		if (this.rubricWindowPopout) {
			this.rubricWindowPopout.close();
		}
	}

	_syncActiveScoringRubricGradeHandler(e) {

		const score = e.detail.score;
		if (score === null) {
			return;
		}

		const targetRubricId = e.target.getAttribute('data-rubric-id');

		if (this.isPopout) {
			window.postMessage({message:'total-score-changed', rubricData: {score: score, targetRubricId: targetRubricId}});
		}
		else {
			this._syncActiveRubricGrade(score, targetRubricId, false);
		}

	}

	_syncActiveRubricGrade(score, targetRubricId, bypassRubricState) {
		if (this.showActiveScoringRubricOptions && this.activeScoringRubric !== targetRubricId) {
			return;
		}

		const currentRubricInfo = this.rubricInfos.find(rubric => rubric.rubricId === targetRubricId);

		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-rubric-total-score-changed', {
			composed: true,
			bubbles: true,
			detail: {
				score: score,
				rubricInfo: currentRubricInfo,
				bypassRubricState: bypassRubricState
			}
		}));
	}

	_onActiveScoringRubricChange(e) {
		const rubricId = (e.target.value === 'null') ? null : e.target.value;

		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-active-scoring-rubric-change', {
			composed: true,
			bubbles: true,
			detail: {
				rubricId: rubricId
			}
		}));
	}

	_getRubrics() {
		const rubrics =	this.rubricInfos.map(rubric => {
			if (!rubric) {
				return html``;
			}
			return html`
				<div class="d2l-consistent-evaluation-rubric ${this.isPopout ? 'd2l-consistent-evaluation-popout' : ''}">
					${this._renderRubricTitle(rubric.rubricTitle)}
					<d2l-rubric
						data-rubric-id=${rubric.rubricId}
						href=${rubric.rubricHref}
						assessment-href=${rubric.rubricAssessmentHref}
						.token=${this.token}
						?read-only=${this.readonly}
						?force-compact=${!this.isPopout}
						overall-score-flag
						selected
						@d2l-rubric-total-score-changed=${this._syncActiveScoringRubricGradeHandler}
					></d2l-rubric>
				</div>
			`;
		});

		return html`${rubrics}`;
	}

	_getActiveScoringRubricSelectDropdown() {
		if (!this.showActiveScoringRubricOptions) {
			return html``;
		}
		const scoringRubrics = this.rubricInfos.filter(rubric => rubric.rubricScoringMethod !== 0);
		if (scoringRubrics.length <= 0) {
			return html``;
		}
		return html`
			<h2 class="d2l-label-text">${this.localize('gradingRubric')}</h2>
			<select class="d2l-input-select d2l-consistent-evaluation-active-scoring-rubric" aria-label=${this.localize('activeGradingRubric')} @change=${this._onActiveScoringRubricChange}>
				<option label=${this.localize('noActiveGradingRubric')} ?selected=${!this.activeScoringRubric} value='-1'></option>
				${scoringRubrics.map(rubric => html`
					<option value="${rubric.rubricId}" label=${this._truncateRubricTitle(rubric.rubricTitle)} class="select-option"></option>
				`)}
			</select>
		`;
	}

	_truncateRubricTitle(rubricTitle) {
		const maxTitleLength = 60;
		return (rubricTitle.length <= maxTitleLength) ? rubricTitle : `${rubricTitle.substring(0, maxTitleLength)}…`;
	}

	_getSummaryText() {
		const numAttached = this.rubricInfos.length;
		if (numAttached > 1) {
			return this.localize('rubricsSummary', 'num', numAttached);
		}
		return this.localize('rubricSummary');
	}

	_openRubricPopout() {
		this.rubricWindowPopout = window.open(
			this.rubricPopoutLocation,
			'rubricPopout',
			'width=1000,height=1000,scrollbars=no,toolbar=no,screenx=0,screeny=0,location=no,titlebar=no,directories=no,status=no,menubar=no'
		);

		this.rubricWindowPopout.addEventListener('message', (e) => {
			if (e.data.message === 'total-score-changed') {
				const bypassRubricState = true;
				this._syncActiveRubricGrade(e.data.rubricData.score, e.data.rubricData.targetRubricId, bypassRubricState);
			}
		}, false);

		this.rubricWindowPopout.onunload = async() => {
			this.dispatchEvent(new CustomEvent('d2l-consistent-eval-rubric-popup-closed', {
				composed: true,
				bubbles: true
			}));
		};
	}

	_renderPopoutIcon() {
		return this.isPopout ?
			html`` :
			html` <d2l-icon class='d2l-consistent-evaluation-open-rubrics' icon="tier1:new-window" @click=${this._openRubricPopout}></d2l-icon>`;
	}

	_renderRubricTitle(rubricTitle) {
		return !this.isPopout ?
			html`` :
			html`<h2 aria-label=${this.localize('rubricTitle')} class='d2l-consistent-evaluation-rubric-title'>${rubricTitle}</h2>`;
	}

	render() {
		return html`
			<d2l-consistent-evaluation-right-panel-block
				title=${this.isPopout ? '' : this.header}
				supportingInfo=${this._getSummaryText()}>
					${this._renderPopoutIcon()}
					${this._getRubrics()}
					${this._getActiveScoringRubricSelectDropdown()}
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-rubric', ConsistentEvaluationRubric);
