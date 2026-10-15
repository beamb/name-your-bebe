import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import App from './App';

jest.mock('./InnerLoadingIndicator', () => () => null);

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ names: ['Camille'] }),
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function renderGenerator(usage = []) {
  const ref = React.createRef();
  const view = render(<App ref={ref} />);
  act(() => ref.current.updateUsage(usage));
  return { ...view, app: ref.current, buttons: view.getAllByLabelText('genderButton') };
}

test.each([
  [0, 'dan'],
  [0.5, 'eng'],
  [0.999999, 'fre'],
])('each selected language can be chosen (random value %s)', async (random, usage) => {
  jest.spyOn(Math, 'random').mockReturnValue(random);
  const { buttons, findByText } = renderGenerator(['dan', 'eng', 'fre']);

  fireEvent.click(buttons[0]);
  await findByText('Camille');

  expect(global.fetch).toHaveBeenCalledTimes(1);
  const params = new URL(global.fetch.mock.calls[0][0]).searchParams;
  expect(params.getAll('usage')).toEqual([usage]);
  expect(Array.from(params.keys()).sort()).toEqual(['gender', 'key', 'number', 'usage']);
});

test.each([
  [0, 'f'],
  [1, 'u'],
  [2, 'm'],
])('preserves gender %s with a single selected language', async (button, gender) => {
  const { buttons, findByText } = renderGenerator(['fre']);

  fireEvent.click(buttons[button]);
  await findByText('Camille');

  const params = new URL(global.fetch.mock.calls[0][0]).searchParams;
  expect(params.get('usage')).toBe('fre');
  expect(params.get('gender')).toBe(gender);
  expect(params.get('number')).toBe('1');
});

test('omits usage after clearing the language selection', async () => {
  const { app, buttons, findByText } = renderGenerator(['dan', 'eng', 'fre']);
  act(() => app.updateUsage([]));

  fireEvent.click(buttons[0]);
  await findByText('Camille');

  expect(new URL(global.fetch.mock.calls[0][0]).searchParams.has('usage')).toBe(false);
});

test.each([
  { names: [] },
  { error: 'No matching name' },
])('shows a no-match message for an empty/API error result: %j', async result => {
  global.fetch.mockResolvedValue({ ok: true, json: async () => result });
  const { buttons, findByText } = renderGenerator(['fre']);

  fireEvent.click(buttons[0]);

  await findByText('Sorry, no match');
  buttons.forEach(button => expect(button).not.toBeDisabled());
});

test.each([
  { ok: false, status: 429 },
  { ok: true, json: async () => { throw new Error('Invalid JSON'); } },
])('recovers from HTTP or JSON errors', async response => {
  global.fetch.mockResolvedValue(response);
  const { buttons, findByText } = renderGenerator(['dan', 'eng', 'fre']);

  fireEvent.click(buttons[0]);

  await findByText('Sorry, please try again');
  expect(global.fetch).toHaveBeenCalledTimes(1);
  buttons.forEach(button => expect(button).not.toBeDisabled());
});

test('disables buttons while loading and allows retry after a network failure', async () => {
  let rejectRequest;
  global.fetch.mockImplementationOnce(() => new Promise((resolve, reject) => {
    rejectRequest = reject;
  }));
  const { buttons, findByText } = renderGenerator(['dan', 'eng', 'fre']);

  fireEvent.click(buttons[0]);
  buttons.forEach(button => expect(button).toBeDisabled());

  await act(async () => rejectRequest(new Error('Network error')));
  await findByText('Sorry, please try again');
  buttons.forEach(button => expect(button).not.toBeDisabled());

  fireEvent.click(buttons[0]);
  await findByText('Camille');
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('tries another selected language after no match and stops at the first name', async () => {
  jest.useFakeTimers();
  jest.spyOn(Math, 'random').mockReturnValue(0);
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ names: [] }) });
  const { app, buttons, getByText, queryByText } = renderGenerator(['dan', 'eng', 'fre']);

  await act(async () => fireEvent.click(buttons[2]));
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(queryByText('Sorry, no match')).not.toBeInTheDocument();
  buttons.forEach(button => expect(button).toBeDisabled());

  // Editing the selection during a retry must not change the current search.
  act(() => app.updateUsage(['ita']));
  await act(async () => jest.advanceTimersByTime(549));
  expect(global.fetch).toHaveBeenCalledTimes(1);
  await act(async () => jest.advanceTimersByTime(1));

  expect(getByText('Camille')).toBeInTheDocument();
  buttons.forEach(button => expect(button).not.toBeDisabled());
  const requests = global.fetch.mock.calls.map(([url]) => new URL(url).searchParams);
  expect(requests.map(params => params.get('usage'))).toEqual(['dan', 'eng']);
  requests.forEach(params => {
    expect(params.get('gender')).toBe('m');
    expect(params.getAll('usage')).toHaveLength(1);
    expect(params.get('number')).toBe('1');
  });
  await act(async () => jest.advanceTimersByTime(550));
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('shows no match only after trying every distinct selected language once', async () => {
  jest.useFakeTimers();
  jest.spyOn(Math, 'random').mockReturnValue(0);
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ names: [] }) });
  const { app, buttons, getByText, queryByText } = renderGenerator(['dan', 'eng', 'fre', 'eng']);

  await act(async () => fireEvent.click(buttons[1]));
  await act(async () => jest.advanceTimersByTime(550));
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(queryByText('Sorry, no match')).not.toBeInTheDocument();
  buttons.forEach(button => expect(button).toBeDisabled());

  await act(async () => jest.advanceTimersByTime(550));
  expect(getByText('Sorry, no match')).toBeInTheDocument();
  buttons.forEach(button => expect(button).not.toBeDisabled());
  expect(global.fetch.mock.calls.map(([url]) => {
    const params = new URL(url).searchParams;
    expect(params.get('gender')).toBe('u');
    return params.get('usage');
  })).toEqual(['dan', 'eng', 'fre']);
  expect(app.state.usage).toEqual(['dan', 'eng', 'fre', 'eng']);
  await act(async () => jest.advanceTimersByTime(550));
  expect(global.fetch).toHaveBeenCalledTimes(3);
});

test('makes only one unfiltered request when no language is selected and no name is found', async () => {
  jest.useFakeTimers();
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ names: [] }) });
  const { buttons, getByText } = renderGenerator();

  await act(async () => fireEvent.click(buttons[0]));
  expect(getByText('Sorry, no match')).toBeInTheDocument();
  await act(async () => jest.advanceTimersByTime(550));
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(new URL(global.fetch.mock.calls[0][0]).searchParams.has('usage')).toBe(false);
});

test('stops and releases loading if a later language request fails', async () => {
  jest.useFakeTimers();
  global.fetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ names: [] }) })
    .mockResolvedValueOnce({ ok: false, status: 429 });
  const { buttons, getByText } = renderGenerator(['dan', 'eng', 'fre']);

  await act(async () => fireEvent.click(buttons[0]));
  await act(async () => jest.advanceTimersByTime(550));
  expect(getByText('Sorry, please try again')).toBeInTheDocument();
  buttons.forEach(button => expect(button).not.toBeDisabled());
  await act(async () => jest.advanceTimersByTime(550));
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
