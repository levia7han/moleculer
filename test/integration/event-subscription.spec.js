const ServiceBroker = require("../../src/service-broker");

describe("Nats catch all Wildcard Event Subscription Tests", () => {
	let eventHandler = jest.fn();
	let events = [];
	let b1 = new ServiceBroker({
		transporter: "Fake",
		logger: false,
		nodeID: "node-1"
	});

	b1.createService({
		name: "subscriber1",
		events: {
			">"(payload, sender, event) {
				events.push(event);
				eventHandler();
			}
		}
	});

	let b2 = new ServiceBroker({
		transporter: "Fake",
		logger: false,
		nodeID: "node-2"
	});

	b2.createService({
		name: "echo",
		actions: {
			emit(ctx) {
				const {
					event
				} = ctx.params;
				ctx.emit(event);
			},
			broadcast(ctx) {
				const {
					event
				} = ctx.params;
				ctx.broadcast(event);
			},
		}
	});

	beforeAll(() => Promise.all([b1.start(), b2.start()]));
	afterAll(() => Promise.all([b1.stop(), b2.stop()]));

	it("should receive emit event from b2", () => {
		return b1.call("echo.emit", {
			event: "event.for.testing"
		}).then(() => {
			expect(eventHandler).toHaveBeenCalled();
			expect(events).toContain("event.for.testing");
		});
	});

	it("should receive broadcast event from b2", () => {
		return b1.call("echo.emit", {
			event: "broadcast.event.for.testing"
		}).then(() => {
			expect(eventHandler).toHaveBeenCalled();
			expect(events).toContain("broadcast.event.for.testing");
		});
	});

	it("should receive short event from b2", () => {
		return b1.call("echo.emit", {
			event: "event.1"
		}).then(() => {
			expect(eventHandler).toHaveBeenCalled();
			expect(events).toContain("event.1");
		});
	});

	it("should receive long event from b2", () => {
		return b1.call("echo.emit", {
			event: "this.is.a.long.event.for.testing"
		}).then(() => {
			expect(eventHandler).toHaveBeenCalled();
			expect(events).toContain("this.is.a.long.event.for.testing");
		});
	});
});

describe("Nats Wildcard With Prefix Event Subscription Tests", () => {
	let eventHandler = jest.fn();
	let events = [];
	let b1 = new ServiceBroker({
		transporter: "Fake",
		logger: false,
		nodeID: "node-3"
	});

	b1.createService({
		name: "subscriber1",
		events: {
			"domain.>"(payload, sender, event) {
				events.push(event);
				eventHandler();
			}
		}
	});

	let b2 = new ServiceBroker({
		transporter: "Fake",
		logger: false,
		nodeID: "node-4"
	});

	b2.createService({
		name: "echo",
		actions: {
			emit(ctx) {
				const {
					event
				} = ctx.params;
				ctx.emit(event);
			},
			broadcast(ctx) {
				const {
					event
				} = ctx.params;
				ctx.broadcast(event);
			},
		}
	});

	beforeAll(() => Promise.all([b1.start(), b2.start()]));
	afterAll(() => Promise.all([b1.stop(), b2.stop()]));
	beforeEach(() => {
		jest.clearAllMocks()
	});

	it("should receive emit event from b2", () => {
		return b1.call("echo.emit", {
			event: "domain.event.for.testing"
		}).then(() => {
			expect(eventHandler).toHaveBeenCalled();
			expect(events).toContain("domain.event.for.testing");
		});
	});

	it("should receive broadcast event from b2", () => {
		return b1.call("echo.emit", {
			event: "domain.broadcast.event.for.testing"
		}).then(() => {
			expect(eventHandler).toHaveBeenCalled();
			expect(events).toContain("domain.broadcast.event.for.testing");
		});
	});

	it("should receive short event from b2", () => {
		return b1.call("echo.emit", {
			event: "domain.1"
		}).then(() => {
			expect(eventHandler).toHaveBeenCalled();
			expect(events).toContain("domain.1");
		});
	});

	it("should receive long event from b2", () => {
		return b1.call("echo.emit", {
			event: "domain.this.is.a.long.event.for.testing"
		}).then(() => {
			expect(eventHandler).toHaveBeenCalled();
			expect(events).toContain("domain.this.is.a.long.event.for.testing");
		});
	});
});
