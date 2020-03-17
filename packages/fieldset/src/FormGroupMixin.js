import { html, dedupeMixin, SlotMixin } from '@lion/core';
import { DisabledMixin } from '@lion/core/src/DisabledMixin.js';
import { FormControlMixin, FormRegistrarMixin, FormControlsCollection } from '@lion/field';
import { getAriaElementsInRightDomOrder } from '@lion/field/src/utils/getAriaElementsInRightDomOrder.js';
import { ValidateMixin } from '@lion/validate';
import { FormElementsHaveNoError } from './FormElementsHaveNoError.js';

/**
 * @desc Form group mixin serves as the basis for (sub) forms. Designed to be put on
 * elements with role=group (or radiogroup)
 * It bridges all the functionality of the child form controls:
 * ValidateMixin, InteractionStateMixin, FormatMixin, FormControlMixin etc.
 * It is designed to be used on top of FormRegstrarMixin and ChoiceGroupMixin
 * Also, the LionFieldset element (which supports name based retrieval of children via formElements
 * and the automatic grouping of formElements via '[]')
 *
 */
export const FormGroupMixin = dedupeMixin(
  superclass =>
    // eslint-disable-next-line no-shadow
    class FormGroupMixin extends FormRegistrarMixin(
      FormControlMixin(ValidateMixin(DisabledMixin(SlotMixin(superclass)))),
    ) {
      static get properties() {
        return {
          /**
           * Interaction state that can be used to compute the visibility of
           * feedback messages
           */
          // TODO: Move property submitted to InteractionStateMixin.
          submitted: {
            type: Boolean,
            reflect: true,
          },
          /**
           * Interaction state that will be active when any of the children
           * is focused.
           */
          focused: {
            type: Boolean,
            reflect: true,
          },
          /**
           * Interaction state that will be active when any of the children
           * is dirty (see InteractionStateMixin for more details.)
           */
          dirty: {
            type: Boolean,
            reflect: true,
          },
          /**
           * Interaction state that will be active when the group as a whole is
           * blurred
           */
          touched: {
            type: Boolean,
            reflect: true,
          },
          /**
           * Interaction state that will be active when all of the children
           * are prefilled (see InteractionStateMixin for more details.)
           */
          prefilled: {
            type: Boolean,
            reflect: true,
          },
        };
      }

      get _inputNode() {
        return this;
      }

      get modelValue() {
        return this._getFromAllFormElements('modelValue');
      }

      set modelValue(values) {
        this._setValueMapForAllFormElements('modelValue', values);
      }

      get serializedValue() {
        return this._getFromAllFormElements('serializedValue');
      }

      set serializedValue(values) {
        this._setValueMapForAllFormElements('serializedValue', values);
      }

      get formattedValue() {
        return this._getFromAllFormElements('formattedValue');
      }

      set formattedValue(values) {
        this._setValueMapForAllFormElements('formattedValue', values);
      }

      get prefilled() {
        return this._everyFormElementHas('prefilled');
      }

      constructor() {
        super();
        this.disabled = false;
        this.submitted = false;
        this.dirty = false;
        this.touched = false;
        this.focused = false;
        this.__addedSubValidators = false;
        this._isChoiceGroup = false;

        this._checkForOutsideClick = this._checkForOutsideClick.bind(this);

        this.addEventListener('focusin', this._syncFocused);
        this.addEventListener('focusout', this._onFocusOut);
        this.addEventListener('dirty-changed', this._syncDirty);
        this.addEventListener('validate-performed', this.__onChildValidatePerformed);
        this.addEventListener('model-value-changed', this.__repropagateChildrenValues);

        this.defaultValidators = [new FormElementsHaveNoError()];
      }

      connectedCallback() {
        // eslint-disable-next-line wc/guard-super-call
        super.connectedCallback();
        this.setAttribute('role', 'group');
        this.__initInteractionStates();
      }

      disconnectedCallback() {
        super.disconnectedCallback(); // eslint-disable-line wc/guard-super-call

        if (this.__hasActiveOutsideClickHandling) {
          document.removeEventListener('click', this._checkForOutsideClick);
          this.__hasActiveOutsideClickHandling = false;
        }
      }

      async __initInteractionStates() {
        if (!this.__readyForRegistration) {
          await this.registrationReady;
        }
        this.formElements.forEach(el => {
          if (typeof el.initInteractionState === 'function') {
            el.initInteractionState();
          }
        });
      }

      updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('disabled')) {
          if (this.disabled) {
            this.__requestChildrenToBeDisabled();
          } else {
            this.__retractRequestChildrenToBeDisabled();
          }
        }

        if (changedProperties.has('focused')) {
          if (this.focused === true) {
            this.__setupOutsideClickHandling();
          }
        }
      }

      __setupOutsideClickHandling() {
        if (!this.__hasActiveOutsideClickHandling) {
          document.addEventListener('click', this._checkForOutsideClick);
          this.__hasActiveOutsideClickHandling = true;
        }
      }

      _checkForOutsideClick(event) {
        const outsideGroupClicked = !this.contains(event.target);
        if (outsideGroupClicked) {
          this.touched = true;
        }
      }

      __requestChildrenToBeDisabled() {
        this.formElements.forEach(child => {
          if (child.makeRequestToBeDisabled) {
            child.makeRequestToBeDisabled();
          }
        });
      }

      __retractRequestChildrenToBeDisabled() {
        this.formElements.forEach(child => {
          if (child.retractRequestToBeDisabled) {
            child.retractRequestToBeDisabled();
          }
        });
      }

      // eslint-disable-next-line class-methods-use-this
      _inputGroupTemplate() {
        return html`
          <div class="input-group">
            <slot></slot>
          </div>
        `;
      }

      /**
       * @desc Handles interaction state 'submitted'.
       * This allows children to enable visibility of validation feedback
       */
      submitGroup() {
        this.submitted = true;
        this.formElements.forEach(child => {
          if (typeof child.submitGroup === 'function') {
            child.submitGroup();
          } else {
            child.submitted = true; // eslint-disable-line no-param-reassign
          }
        });
      }

      resetGroup() {
        this.formElements.forEach(child => {
          if (typeof child.resetGroup === 'function') {
            child.resetGroup();
          } else if (typeof child.reset === 'function') {
            child.reset();
          }
        });

        this.resetInteractionState();
      }

      resetInteractionState() {
        this.submitted = false;
        this.touched = false;
        this.dirty = false;
        this.formElements.forEach(formElement => {
          if (typeof formElement.resetInteractionState === 'function') {
            formElement.resetInteractionState();
          }
        });
      }

      _getFromAllFormElements(property, filterCondition = el => !el.disabled) {
        const result = {};
        this.formElements.keys().forEach(name => {
          const elem = this.formElements[name];
          if (elem instanceof FormControlsCollection) {
            result[name] = elem.filter(el => filterCondition(el)).map(el => el[property]);
          } else if (filterCondition(elem)) {
            if (typeof elem._getFromAllFormElements === 'function') {
              result[name] = elem._getFromAllFormElements(property, filterCondition);
            } else {
              result[name] = elem[property];
            }
          }
        });
        return result;
      }

      _setValueForAllFormElements(property, value) {
        this.formElements.forEach(el => {
          el[property] = value; // eslint-disable-line no-param-reassign
        });
      }

      async _setValueMapForAllFormElements(property, values) {
        if (!this.__readyForRegistration) {
          await this.registrationReady;
        }

        if (values && typeof values === 'object') {
          Object.keys(values).forEach(name => {
            if (Array.isArray(this.formElements[name])) {
              this.formElements[name].forEach((el, index) => {
                el[property] = values[name][index]; // eslint-disable-line no-param-reassign
              });
            }
            this.formElements[name][property] = values[name];
          });
        }
      }

      _anyFormElementHas(property) {
        return Object.keys(this.formElements).some(name => {
          if (Array.isArray(this.formElements[name])) {
            return this.formElements[name].some(el => !!el[property]);
          }
          return !!this.formElements[name][property];
        });
      }

      _anyFormElementHasFeedbackFor(state) {
        return Object.keys(this.formElements).some(name => {
          if (Array.isArray(this.formElements[name])) {
            return this.formElements[name].some(el => !!el.hasFeedbackFor.includes(state));
          }
          return !!this.formElements[name].hasFeedbackFor.includes(state);
        });
      }

      _everyFormElementHas(property) {
        return Object.keys(this.formElements).every(name => {
          if (Array.isArray(this.formElements[name])) {
            return this.formElements[name].every(el => !!el[property]);
          }
          return !!this.formElements[name][property];
        });
      }

      /**
       * Gets triggered by event 'validate-performed' which enabled us to handle 2 different situations
       *   - react on modelValue change, which says something about the validity as a whole
       *       (at least two checkboxes for instance) and nothing about the children's values
       *   - children validity states have changed, so fieldset needs to update itself based on that
       */
      __onChildValidatePerformed(ev) {
        if (ev && this.isRegisteredFormElement(ev.target)) {
          this.validate();
        }
      }

      _syncFocused() {
        this.focused = this._anyFormElementHas('focused');
      }

      _onFocusOut(ev) {
        const lastEl = this.formElements[this.formElements.length - 1];
        if (ev.target === lastEl) {
          this.touched = true;
        }
        this.focused = false;
      }

      _syncDirty() {
        this.dirty = this._anyFormElementHas('dirty');
      }

      __linkChildrenMessagesToParent(child) {
        // aria-describedby of (nested) children
        let parent = this;
        while (parent) {
          this.constructor._addDescriptionElementIdsToField(
            child,
            parent._getAriaDescriptionElements(),
          );
          // Also check if the newly added child needs to refer grandparents
          parent = parent.__parentFormGroup;
        }
      }

      /**
       * @override of FormRegistrarMixin.
       * @desc Connects ValidateMixin and DisabledMixin
       * On top of this, error messages of children are linked to their parents
       */
      addFormElement(child, indexToInsertAt) {
        super.addFormElement(child, indexToInsertAt);
        if (this.disabled) {
          // eslint-disable-next-line no-param-reassign
          child.makeRequestToBeDisabled();
        }
        // TODO: Unlink in removeFormElement
        this.__linkChildrenMessagesToParent(child);
        this.validate();
      }

      /**
       * Gathers initial model values of all children. Used
       * when resetGroup() is called.
       */
      get _initialModelValue() {
        return this._getFromAllFormElements('_initialModelValue');
      }

      /**
       * Add aria-describedby to child element(field), so that it points to feedback/help-text of
       * parent(fieldset)
       * @param {LionField} field - the child: lion-field/lion-input/lion-textarea
       * @param {array} descriptionElements  - description elements like feedback and help-text
       */
      static _addDescriptionElementIdsToField(field, descriptionElements) {
        const orderedEls = getAriaElementsInRightDomOrder(descriptionElements, { reverse: true });
        orderedEls.forEach(el => {
          if (field.addToAriaDescribedBy) {
            field.addToAriaDescribedBy(el, { reorder: false });
          }
        });
      }

      /**
       * @override of FormRegistrarMixin. Connects ValidateMixin
       */
      removeFormElement(...args) {
        super.removeFormElement(...args);
        this.validate();
      }

      // __onModelValueChanged(e) {
      //   // TODO (@tlouisse): explain why this early return is needed.
      //   if (e.target === this) {
      //     return;
      //   }
      //   e.stopImmediatePropagation();
      //   this.dispatchEvent(
      //     new CustomEvent('model-value-changed', {
      //       bubbles: true,
      //       detail: {
      //         formPath: [...e.detail.formPath, this],
      //       },
      //     }),
      //   );
      // }

      // eslint-disable-next-line class-methods-use-this, no-unused-vars
      _onBeforeRepropagateChildrenValues(ev) {}

      __repropagateChildrenValues(ev) {
        // Allows parent classes to internally listen to the children change events
        // (before stopImmediatePropagation is called below).
        this._onBeforeRepropagateChildrenValues(ev);

        // Prevent eternal loops when we sent the event below.
        if (ev.target === this) {
          return;
        }
        // This makes sure our siblings will not be handled. In this way (combined with the fact
        // that __repropagateChildrenValues callback is added in constructor(so before the outside
        // world gets the chance to listen to model-value-changed)), an Application
        // developer that uses <lion-fieldset @model-value-changed=${myListener}> will only
        // get the event that will be dispatched right below.
        ev.stopImmediatePropagation();

        // We only send the checked changed up (not the unchecked). In this way a choice group
        // (radio-group, checkbox-group, select/listbox) acts as an 'endpoint' (a single Field)
        // just like the native <select>
        if (this._isChoiceGroup && !this.multipleChoice && !ev.target.checked) {
          return;
        }

        // Compute the formPath. This gives the Application Developer informat
        let parentFormPath = [];
        if (!this._isChoiceGroup) {
          parentFormPath = (ev.detail && ev.detail.formPath) || [ev.target];
        }
        const formPath = [...parentFormPath, this];
        // Since for a11y everything needs to be in lightdom, we don't add 'composed:true'
        this.dispatchEvent(
          new CustomEvent('model-value-changed', { bubbles: true, detail: { formPath } }),
        );
      }
    },
);
