import { expect, fixture, html, unsafeStatic } from '@open-wc/testing';

import sinon from 'sinon';

import '@lion/input/lion-input.js';
import '@lion/input-amount/lion-input-amount.js';
import '@lion/input-date/lion-input-date.js';
import '@lion/input-datepicker/lion-input-datepicker.js';
import '@lion/input-email/lion-input-email.js';
import '@lion/input-iban/lion-input-iban.js';
import '@lion/input-range/lion-input-range.js';
import '@lion/textarea/lion-textarea.js';

import '@lion/checkbox-group/lion-checkbox-group.js';
import '@lion/checkbox-group/lion-checkbox.js';

import '@lion/radio-group/lion-radio-group.js';
import '@lion/radio-group/lion-radio.js';

import '@lion/select/lion-select.js';

import '@lion/select-rich/lion-select-rich.js';
import '@lion/select-rich/lion-options.js';
import '@lion/select-rich/lion-option.js';

const featureName = 'model value';

const firstStampCount = 1;
const interactionCount = 1;

const fieldDispatchesCountOnFirstPaint = (tagname, count) => {
  const tag = unsafeStatic(tagname);
  const spy = sinon.spy();
  it(`should dispatch ${count} time(s) on first paint`, async () => {
    await fixture(html`<${tag} @model-value-changed="${spy}"></${tag}>`);
    expect(spy.callCount).to.equal(count);
  });
};

const fieldDispatchesCountOnInteraction = (tagname, count) => {
  const tag = unsafeStatic(tagname);
  const spy = sinon.spy();
  it(`should dispatch ${count} time(s) on interaction`, async () => {
    const el = await fixture(html`<${tag}></${tag}>`);
    el.addEventListener('model-value-changed', spy);
    // TODO: discuss if this is the "correct" way to interact with component
    el.value = 'foo';
    await el.updateComplete;
    expect(spy.callCount).to.equal(count);
  });
};

const choiceDispatchesCountOnFirstPaint = (tagname, count) => {
  const tag = unsafeStatic(tagname);
  const spy = sinon.spy();
  it(`should dispatch ${count} time(s) on first paint`, async () => {
    await fixture(html`<${tag} @model-value-changed="${spy}" .choiceValue="${'option'}"></${tag}>`);
    expect(spy.callCount).to.equal(count);
  });
};

const choiceDispatchesCountOnInteraction = (tagname, count) => {
  const tag = unsafeStatic(tagname);
  const spy = sinon.spy();
  it(`should dispatch ${count} time(s) on interaction`, async () => {
    const el = await fixture(html`<${tag} .choiceValue="${'option'}"></${tag}>`);
    el.addEventListener('model-value-changed', spy);
    el.checked = true;
    expect(spy.callCount).to.equal(count);
  });
};

const choiceGroupDispatchesCountOnFirstPaint = (groupTagname, itemTagname, count) => {
  const groupTag = unsafeStatic(groupTagname);
  const itemTag = unsafeStatic(itemTagname);
  it(`should dispatch ${count} time(s) on first paint`, async () => {
    const spy = sinon.spy();
    await fixture(html`
      <${groupTag} @model-value-changed="${spy}">
        <${itemTag} .choiceValue="${'option1'}"></${itemTag}>
        <${itemTag} .choiceValue="${'option2'}"></${itemTag}>
        <${itemTag} .choiceValue="${'option3'}"></${itemTag}>
      </${groupTag}>
    `);
    expect(spy.callCount).to.equal(count);
  });
};

const choiceGroupDispatchesCountOnInteraction = (groupTagname, itemTagname, count) => {
  const groupTag = unsafeStatic(groupTagname);
  const itemTag = unsafeStatic(itemTagname);
  it(`should dispatch ${count} time(s) on interaction`, async () => {
    const spy = sinon.spy();
    const el = await fixture(html`
      <${groupTag}>
        <${itemTag} .choiceValue="${'option1'}"></${itemTag}>
        <${itemTag} .choiceValue="${'option2'}"></${itemTag}>
        <${itemTag} .choiceValue="${'option3'}"></${itemTag}>
      </${groupTag}>
    `);
    el.addEventListener('model-value-changed', spy);
    const option2 = el.querySelector(`${itemTagname}:nth-child(2)`);
    option2.checked = true;
    expect(spy.callCount).to.equal(count);

    spy.resetHistory();

    const option3 = el.querySelector(`${itemTagname}:nth-child(3)`);
    option3.checked = true;
    expect(spy.callCount).to.equal(count);
  });
};

[
  'input',
  'input-amount',
  'input-date',
  'input-datepicker',
  'input-email',
  'input-iban',
  'input-range',
  'textarea',
].forEach(chunk => {
  const tagname = `lion-${chunk}`;
  describe(`${tagname}`, () => {
    describe(featureName, () => {
      fieldDispatchesCountOnFirstPaint(tagname, firstStampCount);
      fieldDispatchesCountOnInteraction(tagname, interactionCount);
    });
  });
});

['checkbox', 'radio'].forEach(chunk => {
  const groupTagname = `lion-${chunk}-group`;
  const itemTagname = `lion-${chunk}`;

  describe(`${itemTagname}`, () => {
    describe(featureName, () => {
      choiceDispatchesCountOnFirstPaint(itemTagname, firstStampCount);
      choiceDispatchesCountOnInteraction(itemTagname, interactionCount);
    });
  });

  describe(`${groupTagname}`, () => {
    describe(featureName, () => {
      choiceGroupDispatchesCountOnFirstPaint(groupTagname, itemTagname, firstStampCount);
      choiceGroupDispatchesCountOnInteraction(groupTagname, itemTagname, interactionCount);
    });
  });
});

describe('lion-select', () => {
  describe(featureName, () => {
    it(`should dispatch ${firstStampCount} time(s) on first paint`, async () => {
      const spy = sinon.spy();
      await fixture(html`
        <lion-select @model-value-changed="${spy}">
          <select slot="input">
            <option value="option1"></option>
            <option value="option2"></option>
            <option value="option3"></option>
          </select>
        </lion-select>
      `);
      expect(spy.callCount).to.equal(firstStampCount);
    });

    it(`should dispatch ${interactionCount} time(s) on interaction`, async () => {
      const spy = sinon.spy();
      const el = await fixture(html`
        <lion-select>
          <select slot="input">
            <option value="option1"></option>
            <option value="option2"></option>
            <option value="option3"></option>
          </select>
        </lion-select>
      `);
      el.addEventListener('model-value-changed', spy);
      const option2 = el.querySelector('option:nth-child(2)');
      option2.selected = true;
      expect(spy.callCount).to.equal(interactionCount);

      spy.resetHistory();

      const option3 = el.querySelector('option:nth-child(3)');
      option3.selected = true;
      expect(spy.callCount).to.equal(interactionCount);
    });
  });
});

describe('lion-select-rich', () => {
  describe(featureName, () => {
    it(`should dispatch ${firstStampCount} time(s) on first paint`, async () => {
      const spy = sinon.spy();
      await fixture(html`
        <lion-select-rich @model-value-changed="${spy}">
          <lion-options slot="input">
            <lion-option .choiceValue="${'option1'}"></lion-option>
            <lion-option .choiceValue="${'option2'}"></lion-option>
            <lion-option .choiceValue="${'option3'}"></lion-option>
          </lion-options>
        </lion-select-rich>
      `);
      expect(spy.callCount).to.equal(firstStampCount);
    });

    it(`should dispatch ${interactionCount} time(s) on interaction`, async () => {
      const spy = sinon.spy();
      const el = await fixture(html`
        <lion-select-rich>
          <lion-options slot="input">
            <lion-option .choiceValue="${'option1'}"></lion-option>
            <lion-option .choiceValue="${'option2'}"></lion-option>
            <lion-option .choiceValue="${'option3'}"></lion-option>
          </lion-options>
        </lion-select-rich>
      `);
      el.addEventListener('model-value-changed', spy);
      const option2 = el.querySelector('lion-option:nth-child(2)');
      option2.checked = true;
      expect(spy.callCount).to.equal(interactionCount);

      spy.resetHistory();

      const option3 = el.querySelector('lion-option:nth-child(3)');
      option3.checked = true;
      expect(spy.callCount).to.equal(interactionCount);
    });
  });
});
