import './consistent-evaluation-discussion-evidence-body';
import './consistent-evaluation-discussion-post-score.js';
import { attachmentClassName, attachmentListClassName, fivestarRatingClass, lmsSourceRel, upvoteDownvoteRatingClass, upvoteOnlyRatingClass } from '../../controllers/constants.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';
import { css, html, LitElement } from 'lit-element';
import { filterDiscussionPosts, sortDiscussionPosts } from '../../helpers/discussionPostsHelper.js';
import { bodyCompactStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../../localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';

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
			},
			_ratingMethod: {
				attribute: false,
				type: String
			}
		};
	}

	static get styles() {
		return [super.styles, bodyCompactStyles, tableStyles, css`
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

			.d2l-consistent-evaluation-discussion-posts-counts {
				float: left;
			}

			:host([dir="rtl"]) .d2l-consistent-evaluation-discussion-posts-counts {
				float: right;
			}

			.d2l-consistent-evaluation-unscored-status-indicator {
				float: left;
				margin-left: 1rem;
				margin-right: 1rem;
				margin-top: 0.2rem;
				text-transform: none;
			}

			:host([dir="rtl"]) .d2l-consistent-evaluation-unscored-status-indicator {
				float: right;
			}

			.d2l-consistent-evaluation-discussion-table {
				display: flex;
			}

			.d2l-table-wrapper {
				margin-left: 1rem;
				margin-right: 1rem;
			}
		`];
	}

	constructor() {
		super();
		this._discussionPostList = [];
		this._token = undefined;
		this._discussionPostObjects = [];
		this._currentSortingMethod = undefined;
		this._currentPostFilteringMethod = undefined;
		this._currentScoreFilteringMethod = undefined;
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

		if (this.selectedPostFilters.length === 0 && this.selectedScoreFilters.length === 0) {
			this._displayedDiscussionPostObjects = this._discussionPostObjects;
		}

		if (this._currentPostFilteringMethod !== this.selectedPostFilters || this._currentScoreFilteringMethod !== this.selectedScoreFilters) {
			this._currentPostFilteringMethod = this.selectedPostFilters;
			this._currentScoreFilteringMethod = this.selectedScoreFilters;
			this._displayedDiscussionPostObjects = filterDiscussionPosts(this._discussionPostObjects, this.selectedPostFilters, this.selectedScoreFilters);
		}

		return html`
			${this._renderDiscussionItemSkeleton()}
			${this._renderDiscussionItemSkeleton()}
			${this._renderTable()}
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
		const ratingInformation = this._formatDiscussionRatings(discussionPostEntity);
		const isUnscored = discussionPostEvaluationEntity.properties ? discussionPostEvaluationEntity.properties.score === null : false;
		const wordCount = discussionPostEntity.properties.wordCount;

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
			isUnscored,
			threadTitle,
			attachmentList,
			discussionPostEvaluationEntity,
			wordCount
		};
	}
	_formatDiscussionRatings(discussionPostEntity) {
		if (discussionPostEntity.class.includes(fivestarRatingClass)) {
			return this._getRatingsInfo(fivestarRatingClass, discussionPostEntity);
		} else if (discussionPostEntity.class.includes(upvoteDownvoteRatingClass)) {
			return this._getRatingsInfo(upvoteDownvoteRatingClass, discussionPostEntity);
		} else if (discussionPostEntity.class.includes(upvoteOnlyRatingClass)) {
			return this._getRatingsInfo(upvoteOnlyRatingClass, discussionPostEntity);
		}
		return {};
	}
	async _getDiscussionPostEntities() {
		this._discussionPostObjects = [];
		if (this._discussionPostList !== undefined) {
			this._discussionPostObjects = await Promise.all(this._discussionPostList.map(async discussionPostEvaluationEntity => {
				if (discussionPostEvaluationEntity.links && discussionPostEvaluationEntity.links[0].href) {
					const discussionPost = await this._getDiscussionPostEntity(discussionPostEvaluationEntity.links[0].href);
					if (discussionPost && discussionPost.entity) {
						const discussionPostObject = await this._formatDiscussionPostObject(discussionPost.entity, discussionPostEvaluationEntity);
						return discussionPostObject;
					}
				}
			}));

			this._currentSortingMethod = this.sortingMethod;
			sortDiscussionPosts(this._discussionPostObjects, this._currentSortingMethod);
			this._finishedLoading();
		}
	}
	async _getDiscussionPostEntity(discussionPostHref, bypassCache = false) {
		return await window.D2L.Siren.EntityStore.fetch(discussionPostHref, this._token, bypassCache);
	}
	_getPostsCounts() {
		let threads = 0;
		let replies = 0;
		this._displayedDiscussionPostObjects.forEach(discussionPost => {
			discussionPost.isReply ? replies++ : threads++;
		});

		return {
			threads: threads,
			replies: replies
		};
	}
	_getRatingsInfo(ratingMethod, discussionPostEntity) {
		this._ratingMethod = ratingMethod;
		switch (ratingMethod) {
			case fivestarRatingClass:
				if (discussionPostEntity.properties.ratingAverage !== undefined && discussionPostEntity.properties.numRatings !== undefined) {
					return { ratingAverage : discussionPostEntity.properties.ratingAverage,
						numRatings : discussionPostEntity.properties.numRatings };
				}
				break;
			case upvoteDownvoteRatingClass:
				if (discussionPostEntity.properties.numUpVotes !== undefined && discussionPostEntity.properties.numDownVotes !== undefined) {
					return { numUpVotes : discussionPostEntity.properties.numUpVotes,
						numDownVotes : discussionPostEntity.properties.numDownVotes };
				}
				break;
			case upvoteOnlyRatingClass:
				if (discussionPostEntity.properties.numUpVotes !== undefined) {
					return { numUpVotes : discussionPostEntity.properties.numUpVotes };
				}
				break;
		}
	}
	_getUnscoredPostsCount() {
		// if the posts aren't individually scored return 'NaN'
		if (this._discussionPostList !== undefined && this._discussionPostList[0] !== undefined && !('properties' in this._discussionPostList[0])) {
			return 'NaN';
		}

		let unscoredPosts = 0;
		if (this._displayedDiscussionPostObjects) {
			this._displayedDiscussionPostObjects.forEach(postEntity => {
				if (postEntity.isUnscored) {
					unscoredPosts++;
				}
			});
		}
		return unscoredPosts;
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
	_renderPostsCounts() {
		const postsCountInfo = this._getPostsCounts();

		if (postsCountInfo.threads === 0 && postsCountInfo.replies === 0) {
			return html``;
		}

		const postsCountsText = this.localize('postsCount', { numThreads: postsCountInfo.threads, numReplies: postsCountInfo.replies });

		return html`
			<span class="d2l-body-compact d2l-consistent-evaluation-discussion-posts-counts">
				${postsCountsText}
			</span>
		`;
	}
	_renderPostsHeader() {
		return html`
			${this._renderPostsCounts()}
			${this._renderUnscoredStatus()}
		`;
	}
	_renderTable() {
		return html`
			<div class="d2l-consistent-evaluation-discussion-table">
				<d2l-table-wrapper class="d2l-table-wrapper">
					<table class="d2l-table">
						<thead>
							<tr>${this._renderTableHeader()}</tr>
						</thead>
						<tbody>
							${this._renderTableBody()}
						</tbody>
					</table>
				</d2l-table-wrapper>
			</div>
		`;
	}
	_renderTableBody() {
		if (this._displayedDiscussionPostObjects.length === 0) {
			return html`<tr><td>${this._renderNoPostsInFilteredRange()}</td></tr>`;
		}

		const itemTemplate = [];
		for (let i = 0; i < this._displayedDiscussionPostObjects.length; i++) {
			if (this._displayedDiscussionPostObjects[i]) {
				const discussionPost = this._displayedDiscussionPostObjects[i];
				const discussionPostEntity = discussionPost.discussionPostEvaluationEntity;

				if (discussionPostEntity && discussionPostEntity.properties && discussionPostEntity.properties.outOf) {
					itemTemplate.push(html`
						<tr>
							<td>
								<d2l-consistent-evaluation-discussion-evidence-body
									aria-hidden="${this.skeleton}"
									post-href=${discussionPost.postHref}
									post-title=${discussionPost.postTitle}
									post-body=${discussionPost.postBody}
									post-date=${discussionPost.createdDateString}
									?is-reply=${discussionPost.isReply}
									thread-title=${discussionPost.threadTitle}
									rating-method=${ifDefined(this._ratingMethod)}
									word-count=${ifDefined(discussionPost.wordCount)}
									.attachmentsList=${discussionPost.attachmentList}
									.ratingInformation=${discussionPost.ratingInformation}
								></d2l-consistent-evaluation-discussion-evidence-body>
							</td>
							<td>
								<d2l-consistent-evaluation-discussion-post-score
									.discussionPostEntity=${discussionPostEntity}
								></d2l-consistent-evaluation-discussion-post-score>
							</td>
						</tr>
					`);
				} else {
					itemTemplate.push(html`
						<tr>
							<td>
								<d2l-consistent-evaluation-discussion-evidence-body
									aria-hidden="${this.skeleton}"
									post-href=${discussionPost.postHref}
									post-title=${discussionPost.postTitle}
									post-body=${discussionPost.postBody}
									post-date=${discussionPost.createdDateString}
									?is-reply=${discussionPost.isReply}
									thread-title=${discussionPost.threadTitle}
									rating-method=${ifDefined(this._ratingMethod)}
									word-count=${ifDefined(discussionPost.wordCount)}
									.attachmentsList=${discussionPost.attachmentList}
									.ratingInformation=${discussionPost.ratingInformation}
								></d2l-consistent-evaluation-discussion-evidence-body>
							</td>
						</tr>
					`);
				}
			}
		}
		return html`${itemTemplate}`;
	}
	_renderTableHeader() {
		if (this._displayedDiscussionPostObjects.length > 0) {
			const discussionPost = this._displayedDiscussionPostObjects[0];
			const discussionPostEntity = discussionPost.discussionPostEvaluationEntity;

			if (discussionPostEntity && discussionPostEntity.properties && discussionPostEntity.properties.outOf) {
				return html`
					<th>${this._renderPostsHeader()}</th>
					<th>${this.localize('score')}</th>
				`;
			}
		}
		return html`
			<th>${this._renderPostsHeader()}</th>
		`;
	}
	_renderUnscoredStatus() {
		const unscoredPosts = this._getUnscoredPostsCount();
		if (!isNaN(unscoredPosts)) {
			return html`
				<d2l-status-indicator
					class="d2l-consistent-evaluation-unscored-status-indicator"
					?hidden=${this.skeleton}
					state=${(unscoredPosts === 0 ? 'success' : 'default')}
					text=${(unscoredPosts === 0 ? this.localize('allPostsScored') : this.localize('unscoredPosts', { num: this._getUnscoredPostsCount() }))}>
				</d2l-status-indicator>
			`;
		}
	}

}

customElements.define('d2l-consistent-evaluation-discussion-post-page', ConsistentEvaluationDiscussionPostPage);
