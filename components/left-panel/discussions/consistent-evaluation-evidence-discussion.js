import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui-labs/facet-filter-sort/components/sort-by-dropdown/sort-by-dropdown.js';
import '@brightspace-ui-labs/facet-filter-sort/components/sort-by-dropdown/sort-by-dropdown-option.js';
import { css, html, LitElement } from 'lit-element';
import { LocalizeConsistentEvaluation } from '../../../lang/localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

export class ConsistentEvaluationEvidenceDiscussion extends RtlMixin(LocalizeConsistentEvaluation(LitElement)) {

	static get styles() {
		return css`
			.d2l-consistent-evaluation-evidence-discussion-sort-by-dropdown {
				float: right;
				margin-left: 1rem;
				margin-right: 1rem;
				margin-top: 1rem;
			}
			:host([dir="rtl"]) .d2l-consistent-evaluation-evidence-discussion-sort-by-dropdown {
				float: left;
			}

			.d2l-consistent-evaluation-evidence-discussion-load-more {
				float: right;
				margin-left: 1rem;
				margin-right: 1rem;
				padding-bottom: 3rem;
			}

			:host([dir="rtl"]) .d2l-consistent-evaluation-evidence-discussion-load-more {
				float: left;
			}


			.d2l-consistent-evaluation-no-assessable-posts-container {
				background: white;
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				margin: 1rem;
				padding: 1rem;
			}

			.d2l-consistent-evaluation-no-assessable-posts {
				background: var(--d2l-color-regolith);
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				padding: 2rem;
				width: 100%;
			}
		`;
	}

	_renderNoAssessablePosts() {
		return html`
			<div class="d2l-consistent-evaluation-no-assessable-posts-container">
				<div class="d2l-consistent-evaluation-no-assessable-posts d2l-body-standard">${this.localize('noAssessablePosts')}</div>
			</div>`;
	}

	_renderSortDropDownList() {
		return html`
			<d2l-labs-sort-by-dropdown
				class="d2l-consistent-evaluation-evidence-discussion-sort-by-dropdown"
			>
				<d2l-labs-sort-by-dropdown-option value="date" text="Date"></d2l-labs-sort-by-dropdown-option>
			</d2l-labs-sort-by-dropdown>
			<div style="clear: both;"></div>
		`;
	}

	_renderLoadMoreButton() {
		return html`
			<d2l-button
				class="d2l-consistent-evaluation-evidence-discussion-load-more"
				secondary
			>${this.localize('loadMore')}</d2l-button>`;
	}

	render() {
		return html`
			${this._renderSortDropDownList()}
			${this._renderNoAssessablePosts()}
			${this._renderLoadMoreButton()}
		`;
	}
}

customElements.define('d2l-consistent-evaluation-evidence-discussion', ConsistentEvaluationEvidenceDiscussion);
