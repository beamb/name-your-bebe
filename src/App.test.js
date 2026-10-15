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
  const { buttons, findByText } = renderGenerator(['fre']);

  fireEvent.click(buttons[0]);

  await findByText('Sorry, please try again');
  buttons.forEach(button => expect(button).not.toBeDisabled());
});

test('disables buttons while loading and allows retry after a network failure', async () => {
  let rejectRequest;
  global.fetch.mockImplementationOnce(() => new Promise((resolve, reject) => {
    rejectRequest = reject;
  }));
  const { buttons, findByText } = renderGenerator(['fre']);

  fireEvent.click(buttons[0]);
  buttons.forEach(button => expect(button).toBeDisabled());

  await act(async () => rejectRequest(new Error('Network error')));
  await findByText('Sorry, please try again');
  buttons.forEach(button => expect(button).not.toBeDisabled());

  fireEvent.click(buttons[0]);
  await findByText('Camille');
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
