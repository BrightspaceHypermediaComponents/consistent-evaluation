/* eslint-disable prefer-arrow-callback */
import '../components/footer/consistent-evaluation-footer-presentational.js';
import { expect, fixture, html } from '@open-wc/testing';

const getButton = (el, id) => el.shadowRoot.querySelector(`#${id}`);

const getPublishButton = (el) => getButton(el, 'consistent-evaluation-footer-publish');

const getSaveDraftButton = (el) => getButton(el, 'consistent-evaluation-footer-save-draft');

const getRetractButton = (el) => getButton(el, 'consistent-evaluation-footer-retract');

const getUpdateButton = (el) => getButton(el, 'consistent-evaluation-footer-update');

const getNextStudentButton = (el) => getButton(el, 'consistent-evaluation-footer-next-student');

const anonymousInfoAnonymousAssignment = {
	isAnonymous: true,
	assignmentHasPublishedSubmission: false
};

const defaultComponent = html`
	<d2l-consistent-evaluation-footer-presentational
		allow-evaluation-write
		allow-evaluation-delete
	></d2l-consistent-evaluation-footer-presentational>
`;

const publishedComponent = html`
	<d2l-consistent-evaluation-footer-presentational
		allow-evaluation-write
		allow-evaluation-delete
		published
	></d2l-consistent-evaluation-footer-presentational>
`;

const anonymousAssignmentComponent = html`
	<d2l-consistent-evaluation-footer-presentational
		.anonymousInfo=${anonymousInfoAnonymousAssignment}
		allow-evaluation-write
		allow-evaluation-delete
	></d2l-consistent-evaluation-footer-presentational>
`;

const noPermissionNotPublishedComponent = html`
	<d2l-consistent-evaluation-footer-presentational></d2l-consistent-evaluation-footer-presentational>
`;

const noPermissionPublishedComponent = html`
	<d2l-consistent-evaluation-footer-presentational published></d2l-consistent-evaluation-footer-presentational>
`;

const nextStudentComponent = html`
	<d2l-consistent-evaluation-footer-presentational show-next-student></d2l-consistent-evaluation-footer-presentational>
`;

const eventTimeoutMS = 1000;

describe('d2l-consistent-evaluation-footer event tests', () => {
	it('should pass all axe tests', async() => {
		const el = await fixture(defaultComponent);
		await expect(el).to.be.accessible();
	});

	it('should emit a publish event', function() {
		return new Promise((resolve, reject) => {
			fixture(defaultComponent).then(el => {
				const event = 'd2l-consistent-evaluation-on-publish';
				el.addEventListener(event, resolve);
				getPublishButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});

	it('should emit a save draft event', function() {
		return new Promise((resolve, reject) => {
			fixture(defaultComponent).then(el => {
				const event = 'd2l-consistent-evaluation-on-save-draft';
				el.addEventListener(event, resolve);
				getSaveDraftButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});

	it('should emit a retract event', function() {
		return new Promise((resolve, reject) => {
			fixture(publishedComponent).then(el => {
				const event = 'd2l-consistent-evaluation-on-retract';
				el.addEventListener(event, resolve);
				getRetractButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});

	it('should emit a update event', function() {
		return new Promise((resolve, reject) => {
			fixture(publishedComponent).then(el => {
				const event = 'd2l-consistent-evaluation-on-update';
				el.addEventListener(event, resolve);
				getUpdateButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});

	it('should emit a d2l-consistent-evaluation-navigate event', function() {
		return new Promise((resolve, reject) => {
			fixture(nextStudentComponent).then(el => {
				const event = 'd2l-consistent-evaluation-navigate';
				el.addEventListener(event, resolve);
				getNextStudentButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});

	it('should not show publish or save button', function() {
		fixture(noPermissionNotPublishedComponent).then(el => {
			const publishButtion = getPublishButton(el);
			expect(publishButtion).to.be.null();
			const saveButton = getSaveDraftButton(el);
			expect(saveButton).to.be.null();
		});
	});

	it('should not show retract or update button', function() {
		fixture(noPermissionPublishedComponent).then(el => {
			const retractButton = getRetractButton(el);
			expect(retractButton).to.be.null();
			const updateButton = getUpdateButton(el);
			expect(updateButton).to.be.null();
		});
	});

	it('should show disabled publish button', function() {
		fixture(anonymousAssignmentComponent).then(el => {
			const publishButtion = getPublishButton(el);
			expect(publishButtion).to.have.property('disabled', true);
		});
	});
});
