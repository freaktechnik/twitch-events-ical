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
    const res = mockResponse();

    await sendCalendar(cal, res);
    t.true(res.send.calledWith(content));
    t.true(res.type.calledWith('text/calendar'));
    t.true(res.type.calledBefore(res.send));
});

test('Fail get', async (t) => {
    const error = 'lorem ipsum';
    const cal = Promise.reject(error);
    const res = mockResponse();

    await sendCalendar(cal, res);
    t.true(res.send.calledWith(error));
    t.true(res.status.calledWith(500));
    t.true(res.status.calledBefore(res.send));
    t.false(res.type.called);
});
