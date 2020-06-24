/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable func-names */
/* eslint-disable no-param-reassign */

import type UIHandlerModifier from './uiHandlerModifier';
import type UIHandler from './uiHandler';

const uiHandlerDecoratorManager = function () {
  const modifiers: UIHandlerModifier[] = [];

  function addModifier(modifier: UIHandlerModifier) {
    modifiers.push(modifier);
  }

  function removeModifier(name: string) {
    const index = modifiers.findIndex((item) => item.name === name);
    modifiers.splice(index, 1);
  }


  function uiHandlerDecorator() {
    return function (target: UIHandler, key: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value;

      descriptor.value = function (...args: any[]) {
      // convert list of greet arguments to string

        let passed = true;
        modifiers.forEach((modifier) => {
          if (modifier.subscriptions[`before${key}`]) {
            console.log('calling a before modifier', key, modifier);
            //@ts-ignore
            const result = modifier[`before${key}`](this, ...args);
            if (!result) {
              passed = false;
            }
          }
        });

        // invoke greet() and get its return value
        if (passed) {
          const result = method.apply(this, args);

          // convert result to string
          modifiers.forEach((modifier) => {
            if (modifier.subscriptions[`after${key}`]) {
              console.log('calling an after modifier', key, modifier);
              //@ts-ignore
              modifier[`after${key}`](this, ...args);
            }
          });

          // display in console the function call details

          // return the result of invoking the method
          return result;
        }
        return null;
      };
      return descriptor;
    };
  }
  return { uiHandlerDecorator, addModifier, removeModifier };
};

const uiHandlers = uiHandlerDecoratorManager();
export default uiHandlers;
