import Events from 'd2l-telemetry-browser-client';

export class ConsistentEvalTelemetry {

	constructor(dataTelemetryEndpoint) {
		this._dataTelemetryEndpoint = dataTelemetryEndpoint;
	}

	//Mark that a page has been loaded
	logLoadEvent(type) {
		if (!type) return;

		const measureName = `d2l-consistent-eval-${type}.page.rendered`;
		performance.measure(measureName);
		this._logUserEvent(window.location.hostname, 'LoadView', type, measureName);
	}

	//Submit an event measure
	markEventEndAndLog(type) {
		if (!type) return;

		const measureName = `d2l-consistent-eval-event-${type}`;
		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.measure(measureName, eventStartMarkName);
		this._logUserEvent(window.location.hostname, 'MeasureTiming', type, measureName);
	}

	//Begin measuring an event
	markEventStart(type) {
		if (!type) return;
		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.clearMarks(eventStartMarkName);
		performance.mark(eventStartMarkName);
	}

	_getEventStartMarkName(type) {
		return `d2l-consistent-eval-event-${type}`;
	}

	async _logUserEvent(href, action, type, performanceMeasureName) {
		if (!href || !action || !type || !performanceMeasureName) return;

		const eventBody = new Events.PerformanceEventBody()
			.setAction(action)
			.setObject(href, type)
			.addUserTiming(performance.getEntriesByName(performanceMeasureName));
		const event = new Events.TelemetryEvent()
			.setType('PerformanceEvent')
			.setDate(new Date())
			.setSourceId('consistent-eval')
			.setBody(eventBody);
		const client = await D2L.Telemetry.CreateClient({endpoint: this._dataTelemetryEndpoint});
		client.logUserEvent(event);
	}

}
