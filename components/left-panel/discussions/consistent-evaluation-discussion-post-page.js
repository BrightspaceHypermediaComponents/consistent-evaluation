import './consistent-evaluation-discussion-evidence-body';
import { attachmentClassName, attachmentListClassName, lmsSourceRel } from '../../controllers/constants.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';
import { css, html, LitElement } from 'lit-element';
import { filterDiscussionPosts, sortDiscussionPosts } from '../../helpers/discussionPostsHelper.js';
import { LocalizeConsistentEvaluation } from '../../../localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export class ConsistentEvaluationDiscussionPostPage extends SkeletonMixin(RtlMixin(LocalizeConsistentEvaluation(LitElement))) {
	static get properties() {
		return {
			discussionPostList: {
				attribute: false,
				type: Array
			},
			sortingMethod: {
				attribute: 'sorting-method',
				type: String
			},
			selectedPostFilters: {
				attribute: false,
				type: Array
			},
			selectedScoreFilters: {
				attribute: false,
				type: Array
			},
			token: { type: Object },
			_discussionPostEntities: {
				attribute: false,
				type: Array
			},
			_displayedDiscussionPostObjects: {
				attribute: false,
				type: Array
			}
		};
	}

	static get styles() {
		return [super.styles, css`
			:host([skeleton]) d2l-consistent-evaluation-discussion-evidence-body {
				display: none;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-item-skeleton {
				padding: 18px;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-post-title-skeleton {
				height: 11px;
				margin-top: 6px;
				width: 240px;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-post-date-skeleton {
				height: 10px;
				margin-bottom: 24px;
				margin-top: 16px;
				width: 132px;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-post-text-skeleton {
				height: 11px;
				margin-top: 12px;
				width: 100%;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-post-last-text-skeleton {
				height: 11px;
				margin-top: 12px;
				width: 80%;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-evidence-body-rating-skeleton {
				height: 10px;
				text-align: right;
				width: 66px;
			}

			:host([skeleton][dir="rtl"]) .d2l-consistent-evaluation-discussion-evidence-body-rating-skeleton {
				text-align: left;
			}

			:host([skeleton]) .d2l-consistent-evaluation-discussion-evidence-body-rating-container-skeleton {
				float: right;
				margin-left: 12px;
				margin-top: 6px;
			}

			:host([skeleton][dir="rtl"]) .d2l-consistent-evaluation-discussion-evidence-body-rating-container-skeleton {
				float: left;
				margin-right: 12px;
			}

			:host([skeleton]) .d2l-consistent-evaluation-no-posts-in-range-padding {
				display: none;
			}

			.d2l-consistent-evaluation-no-posts-in-range-padding {
				display: inline-block;
				width: 100%;
			}

			.d2l-consistent-evaluation-no-posts-in-range-container {
				background: white;
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				margin: 1rem;
				padding: 1rem;
			}

			.d2l-consistent-evaluation-no-posts-in-range {
				background: var(--d2l-color-regolith);
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				padding: 2rem;
				width: 100%;
			}
		`];
	}

	constructor() {
		super();
		this._discussionPostList = [];
		this._token = undefined;
		this._discussionPostObjects = [];
		this._currentSortingMethod = undefined;
		this.selectedPostFilters = [];
		this.selectedScoreFilters = [];
	}

	get discussionPostList() {
		return this._discussionPostList;
	}

	set discussionPostList(val) {
		const oldVal = this.discussionPostList;
		if (oldVal !== val) {
			this._discussionPostList = val;
			if (this._discussionPostList && this._token) {
				this._getDiscussionPostEntities().then(() => this.requestUpdate());
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
			if (this._discussionPostList && this._token) {
				this._getDiscussionPostEntities().then(() => this.requestUpdate());
			}
		}
	}

	render() {
		if (this._currentSortingMethod !== this.sortingMethod && this._discussionPostObjects.length > 0) {
			this._currentSortingMethod = this.sortingMethod;
			sortDiscussionPosts(this._discussionPostObjects, this._currentSortingMethod);
		}

		this._displayedDiscussionPostObjects = filterDiscussionPosts(this._discussionPostObjects, this.selectedPostFilters, this.selectedScoreFilters);

		return html`
			${this._renderDiscussionItemSkeleton()}
			${this._renderDiscussionItemSkeleton()}
			${this._renderDiscussionPostEntities()}
		`;
	}
	_finishedLoading() {
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-loading-finished', {
			composed: true,
			bubbles: true,
			detail: {
				component: 'discussions'
			}
		}));
	}
	async _formatDiscussionPostObject(discussionPostEntity, discussionPostEvaluationEntity) {
		const postHref = discussionPostEntity.getLinkByRel(lmsSourceRel).href;
		const postTitle = discussionPostEntity.properties.subject;
		const postBody = discussionPostEntity.properties.message;
		const ratingInformation = { upVotes: 0, downVotes: 0 };

		let createdDate = undefined;
		let createdDateString = undefined;
		if (discussionPostEntity.hasSubEntityByClass(Classes.assignments.date)) {
			createdDateString = discussionPostEntity.getSubEntityByClass(Classes.assignments.date).properties.date;
			createdDate = new Date(createdDateString);
		} else {
			console.warn('Consistent Evaluation discussion post date not found');
		}

		let threadTitle = undefined;
		let isReply = false;
		if (discussionPostEntity.hasLinkByRel(Rels.Discussions.thread)) {
			isReply = true;
			const threadHref = discussionPostEntity.getLinkByRel(Rels.Discussions.thread).href;
			const threadEntity = await this._getDiscussionPostEntity(threadHref);
			if (threadEntity && threadEntity.entity) {
				threadTitle = threadEntity.entity.properties.subject;
			}
		}

		let attachmentList = undefined;
		if (discussionPostEntity.hasSubEntityByClass(attachmentListClassName)) {
			const attachmentListEntity = discussionPostEntity.getSubEntityByClass(attachmentListClassName);
			attachmentList = attachmentListEntity.getSubEntitiesByClass(attachmentClassName);
		}

		return {
			createdDate,
			createdDateString,
			postHref,
			postTitle,
			postBody,
			ratingInformation,
			isReply,
			threadTitle,
			attachmentList,
			discussionPostEvaluationEntity
		};
	}
	async _getDiscussionPostEntities() {
		this._discussionPostObjects = [];
		if (this._discussionPostList !== undefined) {
			for (const discussionPostEvaluationEntity of this._discussionPostList) {
				if (discussionPostEvaluationEntity.links && discussionPostEvaluationEntity.links[0].href) {
					const discussionPost = await this._getDiscussionPostEntity(discussionPostEvaluationEntity.links[0].href);
					if (discussionPost && discussionPost.entity) {
						const discussionPostObject = await this._formatDiscussionPostObject(discussionPost.entity, discussionPostEvaluationEntity);
						this._discussionPostObjects.push(discussionPostObject);
					}
				}
			}

			this._currentSortingMethod = this.sortingMethod;
			sortDiscussionPosts(this._discussionPostObjects, this._currentSortingMethod);
			this._finishedLoading();
		}
	}
	async _getDiscussionPostEntity(discussionPostHref, bypassCache = false) {
		return await window.D2L.Siren.EntityStore.fetch(discussionPostHref, this._token, bypassCache);
	}
	_renderDiscussionItemSkeleton() {
		return html`
			<div class="d2l-consistent-evaluation-submission-list-item-skeleton" >
				${this._renderDiscussionRatingSkeleton()}
				<div class="d2l-skeletize d2l-consistent-evaluation-discussion-post-title-skeleton"></div>
				<div class="d2l-skeletize d2l-consistent-evaluation-discussion-post-date-skeleton"></div>
				<div class="d2l-skeletize d2l-skeletize d2l-consistent-evaluation-discussion-post-text-skeleton"></div>
				<div class="d2l-skeletize d2l-skeletize d2l-consistent-evaluation-discussion-post-text-skeleton"></div>
				<div class="d2l-skeletize d2l-skeletize d2l-consistent-evaluation-discussion-post-last-text-skeleton"></div>
			</div>
		`;
	}
	_renderDiscussionPostEntities() {
		if (this._displayedDiscussionPostObjects.length === 0) {
			return html`${this._renderNoPostsInFilteredRange()}`;
		}

		const itemTemplate = [];
		for (let i = 0; i < this._displayedDiscussionPostObjects.length; i++) {
			if (this._displayedDiscussionPostObjects[i]) {
				const discussionPost = this._displayedDiscussionPostObjects[i];
				itemTemplate.push(html`
					<d2l-consistent-evaluation-discussion-evidence-body
						aria-hidden="${this.skeleton}"
						post-href=${discussionPost.postHref}
						post-title=${discussionPost.postTitle}
						post-body=${discussionPost.postBody}
						post-date=${discussionPost.createdDateString}
						?is-reply=${discussionPost.isReply}
						thread-title=${discussionPost.threadTitle}
						.attachmentsList=${discussionPost.attachmentList}
						.ratingInformation=${discussionPost.ratingInformation}
						.discussionPostEntity=${discussionPost.discussionPostEvaluationEntity}
					></d2l-consistent-evaluation-discussion-evidence-body>`);
			}
		}
		return html`${itemTemplate}`;
	}
	_renderDiscussionRatingSkeleton() {
		return html`<div class="d2l-consistent-evaluation-discussion-evidence-body-rating-container-skeleton">
				<div class="d2l-skeletize d2l-consistent-evaluation-discussion-evidence-body-rating-skeleton"></div>
			</div>`;
	}
	_renderNoPostsInFilteredRange() {
		return html`
			<div class="d2l-consistent-evaluation-no-posts-in-range-padding">
				<div class="d2l-consistent-evaluation-no-posts-in-range-container">
					<div class="d2l-consistent-evaluation-no-posts-in-range d2l-body-standard">${this.localize('noPostsInFilteredRange')}</div>
				</div>
			</div>`;
	}

}

customElements.define('d2l-consistent-evaluation-discussion-post-page', ConsistentEvaluationDiscussionPostPage);
