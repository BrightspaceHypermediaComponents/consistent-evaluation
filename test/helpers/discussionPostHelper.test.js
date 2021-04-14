import { sortByNewestFirst, sortByOldestFirst, sortBySubject } from '../../components/controllers/constants.js';
import { assert } from '@open-wc/testing';
import { sortDiscussionPosts } from '../../components/helpers/discussionPostsHelper.js';

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
});
