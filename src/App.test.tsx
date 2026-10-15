import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { UsageCode } from './options';

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function requestParams(index = 0): URLSearchParams {
  const call = fetchMock.mock.calls[index];
  if (!call) throw new Error(`Expected request ${index + 1}`);
  const [input] = call;
  return new URL(input instanceof Request ? input.url : input).searchParams;
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => jsonResponse({ names: ['Camille'] }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function renderGenerator(usage: UsageCode[] = []) {
  const ref = React.createRef<App>();
  const view = render(<App ref={ref} />);
  const app = ref.current;
  if (!app) throw new Error('App did not mount');
  act(() => app.updateUsage(usage));
  const [female, unisex, male] = view.getAllByLabelText('genderButton');
  if (!female || !unisex || !male) throw new Error('Gender buttons are missing');
  return { ...view, app, buttons: [female, unisex, male] as const };
}

test.each<[number, UsageCode]>([
  [0, 'dan'],
  [0.5, 'eng'],
  [0.999999, 'fre'],
])('each selected language can be chosen (random value %s)', async (random, usage) => {
  vi.spyOn(Math, 'random').mockReturnValue(random);
  const { buttons, findByText } = renderGenerator(['dan', 'eng', 'fre']);

  fireEvent.click(buttons[0]);
  await findByText('Camille');

  expect(fetchMock).toHaveBeenCalledTimes(1);
  const params = requestParams();
  expect(params.getAll('usage')).toEqual([usage]);
  expect(Array.from(params.keys()).sort()).toEqual(['gender', 'key', 'number', 'usage']);
});

test.each<[0 | 1 | 2, string]>([
  [0, 'f'],
  [1, 'u'],
  [2, 'm'],
])('preserves gender %s with a single selected language', async (button, gender) => {
  const { buttons, findByText } = renderGenerator(['fre']);

  fireEvent.click(buttons[button]);
  await findByText('Camille');

  const params = requestParams();
  expect(params.get('usage')).toBe('fre');
  expect(params.get('gender')).toBe(gender);
  expect(params.get('number')).toBe('1');
});

test('omits usage after clearing the language selection', async () => {
  const { app, buttons, findByText } = renderGenerator(['dan', 'eng', 'fre']);
  act(() => app.updateUsage([]));

  fireEvent.click(buttons[0]);
  await findByText('Camille');

  expect(requestParams().has('usage')).toBe(false);
});

test.each([
  { names: [] },
  { error: 'No matching name' },
])('shows a no-match message for an empty/API error result: %j', async result => {
  fetchMock.mockImplementation(async () => jsonResponse(result));
  const { buttons, findByText } = renderGenerator(['fre']);

  fireEvent.click(buttons[0]);

  await findByText('Sorry, no match');
  buttons.forEach(button => expect(button).not.toBeDisabled());
});

test.each<[string, () => Response]>([
  ['HTTP', () => new Response(null, { status: 429 })],
  ['JSON', () => new Response('{')],
])('recovers from %s errors', async (_error, response) => {
  fetchMock.mockImplementation(async () => response());
  const { buttons, findByText } = renderGenerator(['dan', 'eng', 'fre']);

  fireEvent.click(buttons[0]);

  await findByText('Sorry, please try again');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  buttons.forEach(button => expect(button).not.toBeDisabled());
});

test('disables buttons while loading and allows retry after a network failure', async () => {
  let rejectRequest: ((reason?: unknown) => void) | undefined;
  fetchMock.mockImplementationOnce(() => new Promise<Response>((_resolve, reject) => {
    rejectRequest = reject;
  }));
  const { buttons, findByText, getByLabelText, queryByLabelText } = renderGenerator(['dan', 'eng', 'fre']);

  fireEvent.click(buttons[0]);
  buttons.forEach(button => expect(button).toBeDisabled());
  expect(getByLabelText('Loading names')).toBeInTheDocument();

  const reject = rejectRequest;
  if (!reject) throw new Error('Request did not start');
  await act(async () => { reject(new Error('Network error')); });
  await findByText('Sorry, please try again');
  buttons.forEach(button => expect(button).not.toBeDisabled());
  expect(queryByLabelText('Loading names')).not.toBeInTheDocument();

  fireEvent.click(buttons[0]);
  await findByText('Camille');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('the upgraded dropdown supports selecting, removing, and clearing languages', async () => {
  const user = userEvent.setup();
  const ref = React.createRef<App>();
  const { getByRole, getByLabelText, getByText } = render(<App ref={ref} />);
  const input = getByRole('combobox', { name: 'Languages' });

  await user.click(input);
  await user.click(getByRole('option', { name: 'Danish' }));
  await user.type(input, 'French');
  await user.click(getByRole('option', { name: 'French' }));
  expect(ref.current?.state.usage).toEqual(['dan', 'fre']);

  await user.click(getByLabelText('Remove Danish'));
  expect(ref.current?.state.usage).toEqual(['fre']);
  await user.click(input);
  await user.clear(input);
  await user.keyboard('{Backspace}');
  expect(ref.current?.state.usage).toEqual([]);
  expect(getByText('Select language(s)... Type to narrow your search.')).toBeInTheDocument();
});

test('tries another selected language after no match and stops at the first name', async () => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  fetchMock.mockResolvedValueOnce(jsonResponse({ names: [] }));
  const { app, buttons, getByText, queryByText } = renderGenerator(['dan', 'eng', 'fre']);

  await act(async () => { fireEvent.click(buttons[2]); });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(queryByText('Sorry, no match')).not.toBeInTheDocument();
  buttons.forEach(button => expect(button).toBeDisabled());

  // Editing the selection during a retry must not change the current search.
  act(() => app.updateUsage(['ita']));
  await act(async () => { vi.advanceTimersByTime(549); });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => { vi.advanceTimersByTime(1); });

  expect(getByText('Camille')).toBeInTheDocument();
  buttons.forEach(button => expect(button).not.toBeDisabled());
  const requests = fetchMock.mock.calls.map((_, index) => requestParams(index));
  expect(requests.map(params => params.get('usage'))).toEqual(['dan', 'eng']);
  requests.forEach(params => {
    expect(params.get('gender')).toBe('m');
    expect(params.getAll('usage')).toHaveLength(1);
    expect(params.get('number')).toBe('1');
  });
  await act(async () => { vi.advanceTimersByTime(550); });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('shows no match only after trying every distinct selected language once', async () => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  fetchMock.mockImplementation(async () => jsonResponse({ names: [] }));
  const { app, buttons, getByText, queryByText } = renderGenerator(['dan', 'eng', 'fre', 'eng']);

  await act(async () => { fireEvent.click(buttons[1]); });
  await act(async () => { vi.advanceTimersByTime(550); });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(queryByText('Sorry, no match')).not.toBeInTheDocument();
  buttons.forEach(button => expect(button).toBeDisabled());

  await act(async () => { vi.advanceTimersByTime(550); });
  expect(getByText('Sorry, no match')).toBeInTheDocument();
  buttons.forEach(button => expect(button).not.toBeDisabled());
  expect(fetchMock.mock.calls.map((_, index) => {
    const params = requestParams(index);
    expect(params.get('gender')).toBe('u');
    return params.get('usage');
  })).toEqual(['dan', 'eng', 'fre']);
  expect(app.state.usage).toEqual(['dan', 'eng', 'fre', 'eng']);
  await act(async () => { vi.advanceTimersByTime(550); });
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

test('makes only one unfiltered request when no language is selected and no name is found', async () => {
  vi.useFakeTimers();
  fetchMock.mockImplementation(async () => jsonResponse({ names: [] }));
  const { buttons, getByText } = renderGenerator();

  await act(async () => { fireEvent.click(buttons[0]); });
  expect(getByText('Sorry, no match')).toBeInTheDocument();
  await act(async () => { vi.advanceTimersByTime(550); });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(requestParams().has('usage')).toBe(false);
});

test('stops and releases loading if a later language request fails', async () => {
  vi.useFakeTimers();
  fetchMock
    .mockResolvedValueOnce(jsonResponse({ names: [] }))
    .mockResolvedValueOnce(new Response(null, { status: 429 }));
  const { buttons, getByText } = renderGenerator(['dan', 'eng', 'fre']);

  await act(async () => { fireEvent.click(buttons[0]); });
  await act(async () => { vi.advanceTimersByTime(550); });
  expect(getByText('Sorry, please try again')).toBeInTheDocument();
  buttons.forEach(button => expect(button).not.toBeDisabled());
  await act(async () => { vi.advanceTimersByTime(550); });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
