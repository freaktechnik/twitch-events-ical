import test from 'ava';
import sendCalendar from '../lib/send-calendar';
import sinon from 'sinon';

const mockResponse = () => ({
    send: sinon.spy(),
    type: sinon.spy(),
    status: sinon.spy()
});

test('Correctly get', async (t) => {
    const content = 'lorem ipsum';
    const cal = Promise.resolve(content);
    const response = mockResponse();

    await sendCalendar(cal, response);
    t.true(response.send.calledWith(content));
    t.true(response.type.calledWith('text/calendar'));
    t.true(response.type.calledBefore(response.send));
});

test('Fail get', async (t) => {
    const error = 'lorem ipsum';
    const cal = Promise.reject(error);
    const response = mockResponse();

    await sendCalendar(cal, response);
    t.true(response.send.calledWith(error));
    t.true(response.status.calledWith(500));
    t.true(response.status.calledBefore(response.send));
    t.false(response.type.called);
});
