import '@brightspace-ui/core/components/icons/icon.js';
import { css, html, LitElement } from 'lit-element';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

export class ConsistentEvaluationDiscussionPostScore extends LitElement {
	static get properties() {
		return {
			discussionPostEntity: {
				attribute: false,
				type: Object
			}
		};
	}

	static get styles() {
		return css`
			d2l-labs-d2l-grade-result-presentational {
				white-space: nowrap;
			}
		`;
	}

	constructor() {
		super();
		this.score = 0;
		this.outOf = 0;
		this._debounceJobs = {};
		this.flush = this.flush.bind(this);
	}
	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('d2l-flush', this.flush);
	}

	disconnectedCallback() {
		window.removeEventListener('d2l-flush', this.flush);
		super.disconnectedCallback();
	}
	render() {
		const score = this.discussionPostEntity.properties.score;
		const scoreOutOf =  this.discussionPostEntity.properties.outOf;
		return html`
			<d2l-labs-d2l-grade-result-presentational
				.gradeType=${GradeType.Number}
				scoreNumerator=${score}
				scoreDenominator=${scoreOutOf}

				@d2l-grade-result-grade-change=${this.onGradeChanged}
			></d2l-labs-d2l-grade-result-presentational>
		`;
	}
	flush() {
		if (this._debounceJobs.grade && this._debounceJobs.grade.isActive()) {
			this._debounceJobs.grade.flush();
		}
	}
	onGradeChanged(e) {
		const score = e.detail.value;
		this._debounceJobs.grade = Debouncer.debounce(
			this._debounceJobs.grade,
			timeOut.after(800),
			() => this._emitGradeChangeEvent(score)
		);
	}
	_emitGradeChangeEvent(score) {
		if (score === undefined) {
			this.score = '';
		} else if (score >= 0) {
			this.score = score;
		} else {
			return;
		}
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-discussion-score-changed', {
			composed: true,
			bubbles: true,
			detail: {
				score: this.score,
				entity: this.discussionPostEntity
			}
		}));
	}
}

customElements.define('d2l-consistent-evaluation-discussion-post-score', ConsistentEvaluationDiscussionPostScore);
