import Events from 'd2l-telemetry-browser-client';

export class ConsistentEvalTelemetry {

	constructor(dataTelemetryEndpoint) {
		this._dataTelemetryEndpoint = dataTelemetryEndpoint;
	}

	//Mark that a page has been loaded
	logLoadEvent(type, activityType, submissionCount) {
		if (!type) { return; }

		const measureName = `d2l-consistent-eval-${type}.page.rendered`;
		performance.measure(measureName);
		this._logUserEvent(window.location.hostname, 'LoadView', type, measureName, activityType, submissionCount);
	}

	//Submit an event measure
	markEventEndAndLog(type, activityType, submissionCount) {
		if (!type) { return; }

		const measureName = `d2l-consistent-eval-event-${type}`;
		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.measure(measureName, eventStartMarkName);
		this._logUserEvent(window.location.hostname, 'MeasureTiming', type, measureName, activityType, submissionCount);
	}

	//Begin measuring an event
	markEventStart(type) {
		if (!type) { return; }
		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.clearMarks(eventStartMarkName);
		performance.mark(eventStartMarkName);
	}

	_getEventStartMarkName(type) {
		return `d2l-consistent-eval-event-${type}`;
	}

	async _logUserEvent(href, action, type, performanceMeasureName, activityType, submissionCount) {
		if (!href || !action || !type || !performanceMeasureName || !this._dataTelemetryEndpoint) { return; }
		const eventBody = new Events.PerformanceEventBody()
			.setAction(action)
			.setObject(href, type)
			.addUserTiming(performance.getEntriesByName(performanceMeasureName))
			.addCustom('Referer', document.referrer)
			.addCustom('UserAgent', navigator.userAgent);
		if (activityType) {
			eventBody.addCustom('ActivityType', `${activityType}`);
		}
		if (submissionCount) {
			eventBody.addCustom('SubmissionCount', `${submissionCount}`);
		}
		const event = new Events.TelemetryEvent()
			.setType('PerformanceEvent')
			.setDate(new Date())
			.setSourceId('consistent-eval')
			.setBody(eventBody);
		const client = new Events.Client({ endpoint: this._dataTelemetryEndpoint });
		client.logUserEvent(event);
	}

}
