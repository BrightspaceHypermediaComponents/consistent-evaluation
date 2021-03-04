import './consistent-evaluation-right-panel-block';
import 'd2l-activity-alignments/d2l-activity-alignments.js';
import { css, html, LitElement } from 'lit-element';
import { bodySmallStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { convertToken } from '../helpers/converterHelpers.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

class ConsistentEvaluationOutcomes extends SkeletonMixin(LocalizeConsistentEvaluation(LitElement)) {
	static get properties() {
		return {
			header: {
				type: String
			},
			href: {
				type: String
			},
			token: {
				type: Object,
				reflect: true,
				converter: (value) => convertToken(value),
			},
			description: {
				type: String
			}
		};
	}

	static get styles() {
		return [bodySmallStyles, super.styles, css`
			:host([skeleton]) .d2l-skeleton-outcomes-title {
				height: 0.5rem;
				margin-top: 2rem;
				width: 4rem;
			}

			:host([skeleton]) .d2l-skeleton-outcomes-container {
				padding: 0.5rem 1rem;
			}

			:host([skeleton]) .d2l-skeleton-outcomes-text {
				height: 0.5rem;
				margin-top: 0.25rem;
				width: 10rem;
			}

			:host([skeleton]) .d2l-skeleton-outcomes-text-short {
				height: 0.5rem;
				margin-top: 0.25rem;
				width: 9rem;
			}

			:host([skeleton]) .d2l-skeleton-outcomes-footer {
				height: 1.5rem;
				margin-top: 0.5rem;
			}

			@media (max-width: 767px) {
				:host([skeleton]) .d2l-skeleton-consistent-evaluation-right-panel-block {
					display: none;
				}
			}

			:host([skeleton]) .d2l-consistent-evaluation-outcomes-block {
				display: none;
			}
		`];
	}

	_renderSkeleton() {
		return html `
		<div class="d2l-skeleton-consistent-evaluation-right-panel-block" aria-hidden="${!this.skeleton}" aria-busy="${this.skeleton}">
			<div class="d2l-skeleton-outcomes-title d2l-skeletize"></div>
			<div class="d2l-skeleton-outcomes-container">
				<div class="d2l-skeleton-outcomes-text d2l-skeletize"></div>
				<div class="d2l-skeleton-outcomes-text d2l-skeletize"></div>
				<div class="d2l-skeleton-outcomes-text d2l-skeletize"></div>
				<div class="d2l-skeleton-outcomes-text-short d2l-skeletize"></div>
				<div class="d2l-skeleton-outcomes-footer d2l-skeletize"></div>
			</div>
		</div>`;
	}

	render() {
		return html`
			${this._renderSkeleton()}
			<d2l-consistent-evaluation-right-panel-block
				class="d2l-consistent-evaluation-outcomes-block"
				aria-hidden="${this.skeleton}"
				supportingInfo=${this.localize('outcomesSummary')}
				title=${this.header}>
					<d2l-activity-alignments
						href=${this.href}
						.token=${this.token}>
					</d2l-activity-alignments>
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-outcomes', ConsistentEvaluationOutcomes);
