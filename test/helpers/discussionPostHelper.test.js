import { filterByReplies, filterByScored, filterByThreads, filterByUnscored, sortByNewestFirst, sortByOldestFirst, sortBySubject } from '../../components/controllers/constants.js';
import { filterDiscussionPosts, sortDiscussionPosts } from '../../components/helpers/discussionPostsHelper.js';
import { assert } from '@open-wc/testing';

describe('discussionPostHelpers', () => {
	describe('sortDiscussionPosts', () => {
		const discussionPostObjects = [
			{
				'createdDate': new Date('2021-04-13T14:28:19.657Z'),
				'createdDateString': '2021-04-13T14:28:19.657Z',
				'postTitle': '2 discussion post',
			},
			{
				'createdDate': new Date('2021-04-12T18:35:05.527Z'),
				'createdDateString': '2021-04-12T18:35:05.527Z',
				'postTitle': 'See discussion Post',
			},
			{
				'createdDate': new Date('2021-04-12T18:35:27.027Z'),
				'createdDateString': '2021-04-12T18:35:27.027Z',
				'postTitle': '1 discussion post',
			},
			{
				'createdDate': new Date('2021-04-12T18:34:53.273Z'),
				'createdDateString': '2021-04-12T18:34:53.273Z',
				'postTitle': 'Zee discussion Post',
			}
		];

		const discussionPostObjectsSortedByNewest = [
			{
				'createdDate': new Date('2021-04-13T14:28:19.657Z'),
				'createdDateString': '2021-04-13T14:28:19.657Z',
				'postTitle': '2 discussion post',
			},
			{
				'createdDate': new Date('2021-04-12T18:35:27.027Z'),
				'createdDateString': '2021-04-12T18:35:27.027Z',
				'postTitle': '1 discussion post',
			},
			{
				'createdDate': new Date('2021-04-12T18:35:05.527Z'),
				'createdDateString': '2021-04-12T18:35:05.527Z',
				'postTitle': 'See discussion Post',
			},
			{
				'createdDate': new Date('2021-04-12T18:34:53.273Z'),
				'createdDateString': '2021-04-12T18:34:53.273Z',
				'postTitle': 'Zee discussion Post',
			}
		];

		const discussionPostObjectsSortedByOldest = [
			{
				'createdDate': new Date('2021-04-12T18:34:53.273Z'),
				'createdDateString': '2021-04-12T18:34:53.273Z',
				'postTitle': 'Zee discussion Post',
			},
			{
				'createdDate': new Date('2021-04-12T18:35:05.527Z'),
				'createdDateString': '2021-04-12T18:35:05.527Z',
				'postTitle': 'See discussion Post',
			},
			{
				'createdDate': new Date('2021-04-12T18:35:27.027Z'),
				'createdDateString': '2021-04-12T18:35:27.027Z',
				'postTitle': '1 discussion post',
			},
			{
				'createdDate': new Date('2021-04-13T14:28:19.657Z'),
				'createdDateString': '2021-04-13T14:28:19.657Z',
				'postTitle': '2 discussion post',
			}
		];

		const discussionPostObjectsSortedBySubject = [
			{
				'createdDate': new Date('2021-04-12T18:35:27.027Z'),
				'createdDateString': '2021-04-12T18:35:27.027Z',
				'postTitle': '1 discussion post',
			},
			{
				'createdDate': new Date('2021-04-13T14:28:19.657Z'),
				'createdDateString': '2021-04-13T14:28:19.657Z',
				'postTitle': '2 discussion post',
			},
			{
				'createdDate': new Date('2021-04-12T18:35:05.527Z'),
				'createdDateString': '2021-04-12T18:35:05.527Z',
				'postTitle': 'See discussion Post',
			},
			{
				'createdDate': new Date('2021-04-12T18:34:53.273Z'),
				'createdDateString': '2021-04-12T18:34:53.273Z',
				'postTitle': 'Zee discussion Post',
			}
		];

		it('correctly sorts by newest', async() => {
			const actualResult = sortDiscussionPosts(discussionPostObjects, sortByNewestFirst);
			assert.equal(actualResult.length, discussionPostObjectsSortedByNewest.length);
			assert.deepEqual(actualResult, discussionPostObjectsSortedByNewest);
		});

		it('correctly sorts by oldest', async() => {
			const actualResult = sortDiscussionPosts(discussionPostObjects, sortByOldestFirst);
			assert.equal(actualResult.length, discussionPostObjectsSortedByNewest.length);
			assert.deepEqual(actualResult, discussionPostObjectsSortedByOldest);
		});

		it('correctly sorts by subject', async() => {
			const actualResult = sortDiscussionPosts(discussionPostObjects, sortBySubject);
			assert.equal(actualResult.length, discussionPostObjectsSortedByNewest.length);
			assert.deepEqual(actualResult, discussionPostObjectsSortedBySubject);
		});
	});
	describe('filterDiscussionPosts', () => {
		const discussionPostObjects = [
			{
				'postTitle': '1 discussion post',
				'isReply': false,
				'discussionPostEvaluationEntity': {
					'properties': { 'score': null }
				}
			},
			{
				'postTitle': '2 discussion Post',
				'isReply': false,
				'discussionPostEvaluationEntity': {
					'properties': { 'score': '5' }
				}
			},
			{
				'postTitle': '3 discussion post',
				'isReply': true,
				'discussionPostEvaluationEntity': {
					'properties': { 'score': null }
				}
			},
			{
				'postTitle': '4 discussion Post',
				'isReply': true,
				'discussionPostEvaluationEntity': {
					'properties': { 'score': '5' }
				}
			}
		];
		const discussionPostObjectsTwoFiltersExpected = [
			{
				'postTitle': '4 discussion Post',
				'isReply': true,
				'discussionPostEvaluationEntity': {
					'properties': { 'score': '5' }
				}
			}
		];
		const discussionPostObjectsOnePostFilterExpected = [
			{
				'postTitle': '3 discussion post',
				'isReply': true,
				'discussionPostEvaluationEntity': {
					'properties': { 'score': null }
				}
			},
			{
				'postTitle': '4 discussion Post',
				'isReply': true,
				'discussionPostEvaluationEntity': {
					'properties': { 'score': '5' }
				}
			}
		];
		const discussionPostObjectsOneScoreFilterExpected = [
			{
				'postTitle': '1 discussion post',
				'isReply': false,
				'discussionPostEvaluationEntity': {
					'properties': { 'score': null }
				}
			},
			{
				'postTitle': '3 discussion post',
				'isReply': true,
				'discussionPostEvaluationEntity': {
					'properties': { 'score': null }
				}
			}
		];

		it('correctly filters with no filters', async() => {
			const actualResult = filterDiscussionPosts(discussionPostObjects, []);
			assert.equal(actualResult.length, 4);
			assert.deepEqual(actualResult, discussionPostObjects);
		});
		it('correctly filters with all filters', async() => {
			const actualResult = filterDiscussionPosts(
				discussionPostObjects,
				[filterByReplies, filterByThreads, filterByScored, filterByUnscored]
			);
			assert.equal(actualResult.length, 4);
			assert.deepEqual(actualResult, discussionPostObjects);
		});

		it('correctly filters with multiple filters', async() => {
			const actualResult = filterDiscussionPosts(discussionPostObjects, [filterByReplies, filterByScored]);
			assert.equal(actualResult.length, 1);
			assert.deepEqual(actualResult, discussionPostObjectsTwoFiltersExpected);
		});

		it('correctly filters one post filter', async() => {
			const actualResult = filterDiscussionPosts(discussionPostObjects, [filterByReplies]);
			assert.equal(actualResult.length, 2);
			assert.deepEqual(actualResult, discussionPostObjectsOnePostFilterExpected);
		});

		it('correctly filters one scored filter', async() => {
			const actualResult = filterDiscussionPosts(discussionPostObjects, [filterByUnscored]);
			assert.equal(actualResult.length, 2);
			assert.deepEqual(actualResult, discussionPostObjectsOneScoreFilterExpected);
		});

		it('correctly filters two post filters', async() => {
			const actualResult = sortDiscussionPosts(discussionPostObjects, [filterByReplies, filterByThreads]);
			assert.equal(actualResult.length, 4);
			assert.deepEqual(actualResult, discussionPostObjects);
		});
	});
});
