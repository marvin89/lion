import { expect, fixture, html, unsafeStatic, defineCE } from '@open-wc/testing';
import { localizeTearDown } from '@lion/localize/test-helpers.js';
import { FormControlMixin } from '@lion/field';
import { LitElement } from '@lion/core';
import { FormGroupMixin } from '../src/FormGroupMixin.js';
import '@lion/field/lion-field.js';

const childTagString = defineCE(class extends FormControlMixin(LitElement) {});

const tagString = defineCE(class extends FormGroupMixin(LitElement) {});
const tag = unsafeStatic(tagString);
const childTag = unsafeStatic(childTagString);

beforeEach(() => {
  localizeTearDown();
});

describe('FormGroupMixin', () => {
  // describe('Model-value-changed event propagation', () => {
  //   describe('On initialization', () => {
  //     it('redispatches one event from host', async () => {
  //       let eventForm;
  //       let eventFieldset;
  //       let countForm = 0;
  //       let countFieldset = 0;
  //       function formHandler(ev) {
  //         eventForm = ev;
  //         countForm += 1;
  //       }
  //       function fieldsetHandler(ev) {
  //         eventFieldset = ev;
  //         countFieldset += 1;
  //       }
  //       const formEl = await fixture(html`
  //         <${tag} name="form" @model-value-changed=${formHandler}>
  //           <${tag} name="fieldset" @model-value-changed=${fieldsetHandler}>
  //             <${childTag} name="field"></${childTag}>
  //           </${tag}>
  //         </${tag}>
  //       `);
  //       const fieldsetEl = formEl.querySelector('[name=fieldset]');
  //       expect(countFieldset).to.equal(1);
  //       expect(eventFieldset.target).to.equal(fieldsetEl);
  //       expect(eventFieldset.detail.formPath).to.eql([fieldsetEl]);
  //       expect(countForm).to.equal(1);
  //       expect(eventForm.target).to.equal(formEl);
  //       expect(eventForm.detail.formPath).to.eql([formEl]);
  //     });
  //   });
  //   describe('After initialization', () => {
  //     it('redispatches one event from host and keeps formPath history', async () => {
  //       let eventForm;
  //       let eventFieldset;
  //       let countForm = 0;
  //       let countFieldset = 0;
  //       function formHandler(ev) {
  //         eventForm = ev;
  //         countForm += 1;
  //       }
  //       function fieldsetHandler(ev) {
  //         eventFieldset = ev;
  //         countFieldset += 1;
  //       }
  //       const formEl = await fixture(html`
  //         <${tag} name="form">
  //           <${tag} name="fieldset">
  //             <${childTag} name="field"></${childTag}>
  //           </${tag}>
  //         </${tag}>
  //       `);
  //       const fieldEl = formEl.querySelector('[name=field]');
  //       const fieldsetEl = formEl.querySelector('[name=fieldset]');
  //       formEl.addEventListener('model-value-changed', formHandler);
  //       fieldsetEl.addEventListener('model-value-changed', fieldsetHandler);
  //       fieldEl.dispatchEvent(new Event('model-value-changed', { bubbles: true }));
  //       expect(countFieldset).to.equal(1);
  //       expect(eventFieldset.target).to.equal(fieldsetEl);
  //       expect(eventFieldset.detail.formPath).to.eql([fieldEl, fieldsetEl]);
  //       expect(countForm).to.equal(1);
  //       expect(eventForm.target).to.equal(formEl);
  //       expect(eventForm.detail.formPath).to.eql([fieldEl, fieldsetEl, formEl]);
  //     });
  //     it.only('sends one event for single select choice-groups', async () => {
  //       let eventForm;
  //       let countForm = 0;
  //       let eventChoiceGroup;
  //       let countChoiceGroup = 0;
  //       function formHandler(ev) {
  //         eventForm = ev;
  //         countForm += 1;
  //       }
  //       function choiceGroupHandler(ev) {
  //         eventChoiceGroup = ev;
  //         countChoiceGroup += 1;
  //       }
  //       const formEl = await fixture(html`
  //         <${tag} name="form">
  //           <${tag} name="choice-group" ._repropagateRule=${'choice-group'}>
  //             <${childTag} name="choice-group" id="option1" .checked=${true}></${childTag}>
  //             <${childTag} name="choice-group" id="option2"></${childTag}>
  //           </${tag}>
  //         </${tag}>
  //       `);
  //       const choiceGroupEl = formEl.querySelector('[name=choice-group]');
  //       const option1El = formEl.querySelector('#option1');
  //       const option2El = formEl.querySelector('#option2');
  //       formEl.addEventListener('model-value-changed', formHandler);
  //       choiceGroupEl.addEventListener('model-value-changed', choiceGroupHandler);
  //       // Simulate check
  //       option2El.checked = true;
  //       option2El.dispatchEvent(new Event('model-value-changed', { bubbles: true }));
  //       option1El.checked = false;
  //       option1El.dispatchEvent(new Event('model-value-changed', { bubbles: true }));
  //       // expect(countChoiceGroup).to.equal(1);
  //       expect(eventChoiceGroup.target).to.equal(choiceGroupEl);
  //       expect(eventChoiceGroup.detail.formPath).to.eql([choiceGroupEl]);
  //       // expect(countForm).to.equal(1);
  //       // expect(eventForm.target).to.equal(formEl);
  //       // expect(eventForm.detail.formPath).to.eql([choiceGroupEl, formEl]);
  //     });
  //   });
  // });
});
