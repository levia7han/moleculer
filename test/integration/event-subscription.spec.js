const ServiceBroker = require("../../src/service-broker");

describe("Nats Wildcard Event Subscription Tests", () => {

	let b1 = new ServiceBroker({
		transporter: "Fake",
		logger: false,
		nodeID: "node-1"
	});

	let eventHandler = jest.fn();
	let events = [];

	b1.createService({
		name: "subscriber",
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
