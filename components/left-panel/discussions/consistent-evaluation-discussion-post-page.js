import './consistent-evaluation-discussion-evidence-body';
import { html, LitElement } from 'lit-element';
import { Classes } from 'd2l-hypermedia-constants';
import { LocalizeConsistentEvaluation } from '../../../localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { threadRel } from '../../controllers/constants.js';

export class ConsistentEvaluationDiscussionPostPage extends RtlMixin(LocalizeConsistentEvaluation(LitElement)) {
	static get properties() {
		return {
			discussionPostList: {
				attribute: false,
				type: Array
			},
			token: { type: Object },
			_discussionPostEntities: {
				attribute: false,
				type: Array
			}
		};
	}

	constructor() {
		super();
		this._discussionPostList = [];
		this._token = undefined;
		this._discussionPostObjects = [];
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
		return html`
			${this._renderDiscussionPostEntities()}
		`;
	}
	async _formatDiscussionPostObject(discussionPostEntity) {
		const postTitle = discussionPostEntity.properties.subject;
		const postBody = discussionPostEntity.properties.message;
		const ratingInformation = { upVotes: 0, downVotes: 0 };

		let createdDate = undefined;
		if (discussionPostEntity.getSubEntityByClass(Classes.assignments.date)) {
			createdDate = discussionPostEntity.getSubEntityByClass(Classes.assignments.date).properties.date;
		} else {
			console.warn('Consistent Evaluation discussion post date not found');
		}

		let threadTitle = undefined;
		let isReply = false;
		if (discussionPostEntity.hasLinkByRel(threadRel)) {
			isReply = true;
			const threadHref = discussionPostEntity.getLinkByRel(threadRel).href;
			const threadEntity = await this._getDiscussionPostEntity(threadHref);
			threadTitle = threadEntity.entity.properties.subject;
		}

		return {
			createdDate,
			postTitle,
			postBody,
			ratingInformation,
			isReply,
			threadTitle
		};
	}
	async _getDiscussionPostEntities() {
		this._discussionPostObjects = [];
		if (this._discussionPostList !== undefined) {
			for (const discussionPostLink of this._discussionPostList) {
				if (discussionPostLink.href) {
					const discussionPost = await this._getDiscussionPostEntity(discussionPostLink.href);
					const discussionPostEntity = discussionPost.entity;

					const discussionPostObject = await this._formatDiscussionPostObject(discussionPostEntity);
					this._discussionPostObjects.push(discussionPostObject);
				}
			}
		}
	}
	async _getDiscussionPostEntity(discussionPostHref, bypassCache = false) {
		return await window.D2L.Siren.EntityStore.fetch(discussionPostHref, this._token, bypassCache);
	}

	_renderDiscussionPostEntities() {
		const itemTemplate = [];
		for (let i = 0; i < this._discussionPostObjects.length; i++) {
			if (this._discussionPostObjects[i]) {
				const discussionPost = this._discussionPostObjects[i];
				itemTemplate.push(html`
					<d2l-consistent-evaluation-discussion-evidence-body
						post-title=${discussionPost.postTitle}
						post-body=${discussionPost.postBody}
						post-date=${discussionPost.createdDate}
						?is-reply=${discussionPost.isReply}
						thread-title=${discussionPost.threadTitle}
						.ratingInformation=${discussionPost.ratingInformation}
					></d2l-consistent-evaluation-discussion-evidence-body>`);
			}
		}
		return html`${itemTemplate}`;
	}

}

customElements.define('d2l-consistent-evaluation-discussion-post-page', ConsistentEvaluationDiscussionPostPage);
