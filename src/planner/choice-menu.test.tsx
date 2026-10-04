import { render, screen } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { ChoiceMenu } from './choice-menu';

type Glyph = { readonly name: string };

const AARD: Glyph = { name: 'Glyph of Aard' };
const IGNI: Glyph = { name: 'Glyph of Igni' };
const QUEN: Glyph = { name: 'Glyph of Quen' };

type Menu = {
  readonly user: UserEvent;
  readonly field: HTMLElement;
  readonly onPick: Mock<(glyph: Glyph | null) => void>;
  readonly onHover: Mock<(glyph: Glyph) => void>;
};

const renderMenu = (held: Glyph | null = null): Menu => {
  const user = userEvent.setup();
  const onPick = vi.fn<(glyph: Glyph | null) => void>();
  const onHover = vi.fn<(glyph: Glyph) => void>();
  render(
    <ChoiceMenu
      label="Socket 1"
      options={[AARD, IGNI, QUEN]}
      held={held}
      empty="Empty"
      describe={(glyph) => glyph.name}
      onPick={onPick}
      onHover={onHover}
    />,
  );
  return { user, field: screen.getByRole('combobox', { name: 'Socket 1' }), onPick, onHover };
};

describe('ChoiceMenu', () => {
  it('opens on a click at the option it holds, marked as selected and shown in the info panel', async () => {
    const { user, field, onHover } = renderMenu(IGNI);

    await user.click(field);

    expect(field).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('option', { name: 'Glyph of Igni' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(onHover).toHaveBeenLastCalledWith(IGNI);
  });

  it('shows each option browsed with the arrow keys in the info panel', async () => {
    const { user, field, onHover } = renderMenu();

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');

    expect(onHover.mock.calls).toEqual([[AARD], [IGNI]]);
    expect(field).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Glyph of Igni' }).id,
    );
  });

  it('shows the option under the pointer in the info panel', async () => {
    const { user, field, onHover } = renderMenu();
    await user.click(field);

    await user.hover(screen.getByRole('option', { name: 'Glyph of Quen' }));

    expect(onHover).toHaveBeenLastCalledWith(QUEN);
  });

  it('picks the browsed option with Enter, closes and keeps the focus', async () => {
    const { user, field, onPick } = renderMenu();

    await user.tab();
    await user.keyboard('{ArrowDown}{End}{Enter}');

    expect(onPick.mock.calls).toEqual([[QUEN]]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(field).toHaveFocus();
  });

  it('gives the focus to the field after a pick with the pointer', async () => {
    const { user, field } = renderMenu();
    await user.click(field);
    // Safari does not focus a button it clicks.
    field.blur();

    await user.click(screen.getByRole('option', { name: 'Glyph of Aard' }));

    expect(field).toHaveFocus();
  });

  it('closes on Escape without picking', async () => {
    const { user, field, onPick } = renderMenu(AARD);

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Escape}');

    expect(onPick).not.toHaveBeenCalled();
    expect(field).toHaveAttribute('aria-expanded', 'false');
  });

  it('picks nothing when the empty entry is clicked', async () => {
    const { user, field, onPick } = renderMenu(IGNI);
    await user.click(field);

    await user.click(screen.getByRole('option', { name: 'Empty' }));

    expect(onPick.mock.calls).toEqual([[null]]);
  });

  it('closes without picking when the pointer presses outside it', async () => {
    const { user, field, onPick } = renderMenu();
    await user.click(field);

    await user.click(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onPick).not.toHaveBeenCalled();
  });
});
