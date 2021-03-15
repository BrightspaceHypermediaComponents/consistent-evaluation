import { css, html, LitElement } from 'lit-element';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export class ConsistentEvaluationRightPanelSkeleton extends SkeletonMixin(LitElement) {

	static get styles() {
		return  [super.styles, css`
			:host([skeleton]) .d2l-skeleton-feedback-title {
				height: 0.5rem;
				margin-top: 2rem;
				width: 4rem;
			}

			:host([skeleton]) .d2l-skeleton-file-upload {
				height: 2rem;
				margin-top: 0.375rem;
			}

			:host([skeleton]) .d2l-skeleton-feedback-box {
				border-radius: 8px;
				border-style: solid;
				border-width: 2px;
				height: 8rem;
				margin-top: 0.75rem;
			}

			:host([skeleton]) .d2l-skeleton-grade-title {
				height: 0.5rem;
				margin-top: 1.5rem;
				width: 4rem;
			}
			:host([skeleton]) .d2l-skeleton-grade-presentation {
				height: 0.5rem;
				margin-top: 1.5rem;
				width: 8rem;
			}

			:host([skeleton]) .d2l-skeleton-rubrics-title {
				height: 0.5rem;
				margin-bottom: 1rem;
				width: 4rem;
			}

			:host([skeleton]) .d2l-skeleton-rubric-icon {
				height: 1.5rem;
				margin: 0 0.75rem;
				width: 1.5rem;
			}

			:host([skeleton]) .d2l-skeleton-rubric-title {
				height: 0.5rem;
				width: 8rem;
			}

			:host([skeleton]) .d2l-skeleton-rubric-score {
				height: 0.5rem;
				margin-top: 0.5rem;
				width: 2rem;
			}

			:host([skeleton]) .d2l-skeleton-rubric-container {
				border-radius: 8px;
				border-style: solid;
				border-width: 2px;
				display: flex;
				padding: 0.825rem;
			}

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
		`];
	}

	_renderRubricSkeleton() {
		return html`
			<div class="d2l-skeleton-rubrics-title d2l-skeletize"></div>
			<div class="d2l-skeleton-rubric-container d2l-skeletize-container">
				<div class="d2l-skeleton-rubric-icon d2l-skeletize"></div>
				<div>
					<div class="d2l-skeleton-rubric-title d2l-skeletize"></div>
					<div class="d2l-skeleton-rubric-score d2l-skeletize"></div>
				</div>
			</div>
		`;
	}

	_renderGradeSkeleton() {
		return html`
			<div class="d2l-skeleton-grade-title d2l-skeletize"></div>
			<div class="d2l-skeleton-grade-presentation d2l-skeletize"></div>
		`;
	}

	_renderFeedbackSkeleton() {
		return html`
			<div class="d2l-skeleton-feedback-title d2l-skeletize"></div>
			<div class="d2l-skeleton-feedback-box d2l-skeletize-container"></div>
			<div class="d2l-skeleton-file-upload d2l-skeletize"></div>
		`;
	}

	_renderOutcomesSkeleton() {
		return html`
			<div class="d2l-skeleton-outcomes-title d2l-skeletize"></div>
			<div class="d2l-skeleton-outcomes-container">
				<div class="d2l-skeleton-outcomes-text d2l-skeletize"></div>
				<div class="d2l-skeleton-outcomes-text d2l-skeletize"></div>
				<div class="d2l-skeleton-outcomes-text d2l-skeletize"></div>
				<div class="d2l-skeleton-outcomes-text-short d2l-skeletize"></div>
				<div class="d2l-skeleton-outcomes-footer d2l-skeletize"></div>
			</div>
		`;
	}

	render() {
		return html`
			<div class="d2l-skeleton-consistent-evaluation-right-panel-block" aria-hidden="${!this.skeleton}" aria-busy="${this.skeleton}">
				${this._renderRubricSkeleton()}
				${this._renderGradeSkeleton()}
				${this._renderFeedbackSkeleton()}
				${this._renderOutcomesSkeleton()}
			</div>
		`;
	}
}

customElements.define('consistent-evaluation-right-panel-skeleton', ConsistentEvaluationRightPanelSkeleton);
