import { expect, fixture, html, unsafeStatic } from '@open-wc/testing';

import sinon from 'sinon';

import '@lion/checkbox-group/lion-checkbox-group.js';
import '@lion/checkbox-group/lion-checkbox.js';

import '@lion/radio-group/lion-radio-group.js';
import '@lion/radio-group/lion-radio.js';

import '@lion/select/lion-select.js';

import '@lion/select-rich/lion-select-rich.js';
import '@lion/select-rich/lion-options.js';
import '@lion/select-rich/lion-option.js';

import '@lion/input/lion-input.js';
import '@lion/input-amount/lion-input-amount.js';
import '@lion/input-date/lion-input-date.js';
import '@lion/input-datepicker/lion-input-datepicker.js';
import '@lion/input-email/lion-input-email.js';
import '@lion/input-iban/lion-input-iban.js';
import '@lion/input-range/lion-input-range.js';
import '@lion/textarea/lion-textarea.js';

describe('model value event', () => {
  describe('dispatch count consistency', () => {
    describe('initial', () => {
      const consistentCount = 1;

      let eventSpy;
      beforeEach(() => {
        eventSpy = sinon.spy();
      });

      ['checkbox', 'radio'].forEach(chunk => {
        const groupTag = unsafeStatic(`lion-${chunk}-group`);
        const itemTag = unsafeStatic(`lion-${chunk}`);

        it(`should apply to ${chunk}-group`, async () => {
          await fixture(html`
            <${groupTag} @model-value-changed="${eventSpy}">
              <${itemTag} .choiceValue="${'option1'}"></${itemTag}>
              <${itemTag} .choiceValue="${'option2'}"></${itemTag}>
              <${itemTag} .choiceValue="${'option3'}"></${itemTag}>
            </${groupTag}>
          `);
          expect(eventSpy.callCount).to.equal(consistentCount);
        });

        it(`should apply to ${chunk}`, async () => {
          await fixture(html`
            <${itemTag}
              @model-value-changed="${eventSpy}"
              .choiceValue="${'option'}">
            </${itemTag}>
          `);
          expect(eventSpy.callCount).to.equal(consistentCount);
        });
      });

      it('should apply to select', async () => {
        await fixture(html`
          <lion-select @model-value-changed="${eventSpy}">
            <select slot="input">
              <option value="option1"></option>
              <option value="option2"></option>
              <option value="option3"></option>
            </select>
          </lion-select>
        `);
        expect(eventSpy.callCount).to.equal(consistentCount);
      });

      it('should apply to select-rich', async () => {
        await fixture(html`
          <lion-select-rich @model-value-changed="${eventSpy}">
            <lion-options slot="input">
              <lion-option .choiceValue="${'option1'}"></lion-option>
              <lion-option .choiceValue="${'option2'}"></lion-option>
              <lion-option .choiceValue="${'option3'}"></lion-option>
            </lion-options>
          </lion-select-rich>
        `);
        expect(eventSpy.callCount).to.equal(consistentCount);
      });

      it('should apply to option', async () => {
        await fixture(html`
          <lion-option @model-value-changed="${eventSpy}" .choiceValue="${'option'}"> </lion-option>
        `);
        expect(eventSpy.callCount).to.equal(consistentCount);
      });

      [
        'input',
        'input-amount',
        'input-date',
        'input-datepicker',
        'input-email',
        'input-iban',
        'input-range',
        'textarea',
      ].forEach(suffix => {
        const tag = unsafeStatic(`lion-${suffix}`);
        it(`should apply to ${suffix}`, async () => {
          await fixture(html`
            <${tag} @model-value-changed="${eventSpy}"></${tag}>
          `);
          expect(eventSpy.callCount).to.equal(consistentCount);
        });
      });
    });

    describe('interaction', () => {
      ['checkbox', 'radio'].forEach(chunk => {
        const groupTag = unsafeStatic(`lion-${chunk}-group`);
        const itemTag = unsafeStatic(`lion-${chunk}`);

        it(`should apply to ${chunk}-group`, async () => {
          const el = await fixture(html`
            <${groupTag}>
              <${itemTag} .choiceValue="${'option1'}"></${itemTag}>
              <${itemTag} .choiceValue="${'option2'}"></${itemTag}>
              <${itemTag} .choiceValue="${'option3'}"></${itemTag}>
            </${groupTag}>
          `);
          const spy = sinon.spy();
          el.addEventListener('model-value-changed', spy);

          const option2 = el.querySelector(`lion-${chunk}:nth-child(2)`);
          option2.checked = true;
          expect(spy.callCount).to.equal(1);

          spy.resetHistory();

          const option3 = el.querySelector(`lion-${chunk}:nth-child(3)`);
          option3.checked = true;
          expect(spy.callCount).to.equal(1);
        });

        it(`should apply to ${chunk}`, async () => {
          const el = await fixture(html`
            <${itemTag} .choiceValue="${'option'}"></${itemTag}>
          `);
          const spy = sinon.spy();
          el.addEventListener('model-value-changed', spy);

          el.checked = true;
          expect(spy.callCount).to.equal(1);

          spy.resetHistory();

          el.checked = false;
          expect(spy.callCount).to.equal(1);
        });
      });

      // TODO: test for select, select-rich, option
      // TODO: test for input, input-amount, input-date, input-datepicker, input-email, input-iban, input-range, textarea
    });
  });

  describe('form path', () => {
    const validateEvent = (ev, formPath) => {
      expect(ev.detail).to.have.a.property('formPath');
      expect(ev.detail.formPath).to.eql(formPath);
    };

    let eventSpy;
    beforeEach(() => {
      eventSpy = sinon.spy();
    });

    describe('contains self', () => {
      ['checkbox', 'radio'].forEach(chunk => {
        const tag = unsafeStatic(`lion-${chunk}`);
        it(`should apply to ${chunk}`, async () => {
          const el = await fixture(html`<${tag}></${tag}>`);
          el.addEventListener('model-value-changed', eventSpy);
          el.checked = true;
          const ev = eventSpy.firstCall.args[0];
          validateEvent(ev, [el]);
        });
      });

      [
        'input',
        'input-amount',
        'input-date',
        'input-datepicker',
        'input-email',
        'input-iban',
        'input-range',
        'textarea',
      ].forEach(suffix => {
        const tag = unsafeStatic(`lion-${suffix}`);
        it(`should apply to ${suffix}`, async () => {
          const el = await fixture(html`<${tag}></${tag}>`);
          el.addEventListener('model-value-changed', eventSpy);
          el.value = 'foo';
          const ev = eventSpy.firstCall.args[0];
          validateEvent(ev, [el]);
        });
      });

      // TODO: test for select, select-rich, option
    });

    describe('contains group and field', () => {
      ['checkbox', 'radio'].forEach(chunk => {
        const groupTag = unsafeStatic(`lion-${chunk}-group`);
        const itemTagname = `lion-${chunk}`;
        const itemTag = unsafeStatic(itemTagname);
        it(`should apply to ${chunk}`, async () => {
          const group = await fixture(html`
            <${groupTag}>
              <${itemTag} .choiceValue="${'option1'}"></${itemTag}>
              <${itemTag} .choiceValue="${'option1'}"></${itemTag}>
              <${itemTag} .choiceValue="${'option1'}"></${itemTag}>
            </${groupTag}>
          `);
          group.addEventListener('model-value-changed', eventSpy);
          const field = group.querySelector(`${itemTagname}:nth-child(2)`);
          field.checked = true;
          const ev = eventSpy.firstCall.args[0];
          validateEvent(ev, [field, group]);
        });
      });

      [
        'input',
        'input-amount',
        'input-date',
        'input-datepicker',
        'input-email',
        'input-iban',
        'input-range',
        'textarea',
      ].forEach(suffix => {
        const tagname = `lion-${suffix}`;
        const tag = unsafeStatic(tagname);
        it(`should apply to ${suffix}`, async () => {
          const group = await fixture(html`
            <lion-fieldset>
              <${tag}></${tag}>
            </lion-fieldset>
          `);
          group.addEventListener('model-value-changed', eventSpy);
          const field = group.querySelector(tagname);
          field.value = 'foo';
          expect(eventSpy.firstCall).not.to.be.null;
          const ev = eventSpy.firstCall.args[0];
          validateEvent(ev, [field, group]);
        });
      });

      // TODO: test for select, select-rich, option
    });

    describe('ignores elements that are not field or fieldsets', () => {
      // TODO: test checkbox, checkbox-group, radio, radio-group
      // TODO: test for select, select-rich, option

      [
        'input',
        'input-amount',
        'input-date',
        'input-datepicker',
        'input-email',
        'input-iban',
        'input-range',
        'textarea',
      ].forEach(suffix => {
        const tagname = `lion-${suffix}`;
        const tag = unsafeStatic(tagname);
        it(`should apply to ${suffix}`, async () => {
          const group = await fixture(html`
            <lion-fieldset>
              <div>
                <${tag}><${tag}>
              </div>
            </lion-fieldset>
          `);
          const field = group.querySelector(tagname);
          field.value = 'foo';
          expect(eventSpy.firstCall).not.to.null;
          const ev = eventSpy.firstCall.args[0];
          validateEvent(ev, [field, group]);
        });
      });
    });

    describe('contains deeply nested elements', () => {
      // TODO: test checkbox, checkbox-group, radio, radio-group
      // TODO: test for select, select-rich, option

      [
        'input',
        'input-amount',
        'input-date',
        'input-datepicker',
        'input-email',
        'input-iban',
        'input-range',
        'textarea',
      ].forEach(suffix => {
        const tagname = `lion-${suffix}`;
        const tag = unsafeStatic(tagname);
        it(`should apply to ${suffix}`, async () => {
          const fieldset1 = await fixture(html`
            <lion-fieldset>
              <lion-fieldset>
                <${tag}></${tag}>
              </lion-fieldset>
            </lion-fieldset>
          `);
          const fieldset2 = fieldset1.querySelector('lion-fieldset');
          const field = fieldset1.querySelector(tagname);
          field.value = 'foo';
          expect(eventSpy.firstCall).not.to.null;
          const ev = eventSpy.firstCall.args[0];
          validateEvent(ev, [field, fieldset2, fieldset1]);
        });
      });
    });
  });
});
