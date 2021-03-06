import './consistent-evaluation-right-panel-block';
import 'd2l-activity-alignments/d2l-activity-alignments.js';
import { html, LitElement } from 'lit-element';
import { bodySmallStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { convertToken } from '../helpers/converterHelpers.js';
import { LocalizeConsistentEvaluation } from '../../localize-consistent-evaluation.js';

class ConsistentEvaluationOutcomes extends LocalizeConsistentEvaluation(LitElement) {
	static get properties() {
		return {
			href: {
				type: String
			},
			token: {
				type: Object,
				reflect: true,
				converter: (value) => convertToken(value),
			},
			outcomeTerm: {
				attribute: 'outcome-term',
				type: String
			},
			description: {
				type: String
			}
		};
	}

	static get styles() {
		return [bodySmallStyles];
	}

	render() {
		return html`
			<d2l-consistent-evaluation-right-panel-block
				class="d2l-consistent-evaluation-outcomes-block"
				supportingInfo=${this.localize('outcomesSummary', 'outcome', this.outcomeTerm)}
				title=${this.localize('outcomeTerm', 'outcome', this.outcomeTerm)}>
					<d2l-activity-alignments
						href=${this.href}
						.token=${this.token}>
					</d2l-activity-alignments>
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-outcomes', ConsistentEvaluationOutcomes);
