/* eslint-disable prefer-arrow-callback */
import '../components/footer/consistent-evaluation-footer-presentational.js';
import { expect, fixture, html } from '@open-wc/testing';

const getButton = (el, id) => el.shadowRoot.querySelector(`#${id}`);

const getPublishButton = (el) => getButton(el, 'consistent-evaluation-footer-publish');

const getSaveDraftButton = (el) => getButton(el, 'consistent-evaluation-footer-save-draft');

const getRetractButton = (el) => getButton(el, 'consistent-evaluation-footer-retract');

const getUpdateButton = (el) => getButton(el, 'consistent-evaluation-footer-update');

const getNextStudentButton = (el) => getButton(el, 'consistent-evaluation-footer-next-student');

const defaultComponent = html`
	<d2l-consistent-evaluation-footer-presentational></d2l-consistent-evaluation-footer-presentational>
`;

const publishedComponent = html`
	<d2l-consistent-evaluation-footer-presentational published></d2l-consistent-evaluation-footer-presentational>
`;

const nextStudentComponent = html`
	<d2l-consistent-evaluation-footer-presentational shownextstudent></d2l-consistent-evaluation-footer-presentational>
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
				const event = 'on-publish';
				el.addEventListener(event, resolve);
				getPublishButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});

	it('should emit a save draft event', function() {
		return new Promise((resolve, reject) => {
			fixture(defaultComponent).then(el => {
				const event = 'on-save-draft';
				el.addEventListener(event, resolve);
				getSaveDraftButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});

	it('should emit a retract event', function() {
		return new Promise((resolve, reject) => {
			fixture(publishedComponent).then(el => {
				const event = 'on-retract';
				el.addEventListener(event, resolve);
				getRetractButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});

	it('should emit a update event', function() {
		return new Promise((resolve, reject) => {
			fixture(publishedComponent).then(el => {
				const event = 'on-update';
				el.addEventListener(event, resolve);
				getUpdateButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});

	it('should emit a next student event', function() {
		return new Promise((resolve, reject) => {
			fixture(nextStudentComponent).then(el => {
				const event = 'on-next-student';
				el.addEventListener(event, resolve);
				getNextStudentButton(el).click();
				setTimeout(() => reject(`timeout waiting for ${event} event`), eventTimeoutMS);
			});
		});
	});
});
