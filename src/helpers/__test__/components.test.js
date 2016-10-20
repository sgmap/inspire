import Promise from 'bluebird'
import React, { Component } from 'react'
import { shallow } from 'enzyme'
import { cancelAllPromises, waitDataAndSetState  } from '../components'
import { makeCancelable } from '../promises'

class TestComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {errors: []}
  }

  render() {
    return <div/>
  }
}

function fakePromise() {
  return new Promise((resolve) => {
    setImmediate(() => resolve())
  })
}

function rejectedPromise() {
  return new Promise((resolve, reject) => {
    setImmediate(() => reject('fakeReject'))
  })

}

describe('components', () => {
  describe('cancelAllPromises', () => {

    it('should return when component has no promises', () => {
      const component = shallow(<TestComponent />)

      expect(cancelAllPromises(component)).toBeUndefined()
    })

    it('should return cancelAll function', () => {
      const component = shallow(<TestComponent />);
      component.cancelablePromises = [makeCancelable(fakePromise()), makeCancelable(fakePromise())]
      cancelAllPromises(component)
      const canceledPromises = component.cancelablePromises.map(c => c.promise.reflect())

      return Promise.all(canceledPromises, canceledPromise => {
        expect(canceledPromise.isRejected()).toBe(true)
        expect(canceledPromise.reason.isCanceled).toBe(true)
      })
    })
  })

  describe('waitDataAndSetState', () => {
    it('should create a cancelablePromises array to component when no exist', () => {
      const component = shallow(<TestComponent />).instance()

      expect(component.cancelablePromises).toBeUndefined()
      waitDataAndSetState(fakePromise(), component, 'stateName')
      expect(component.cancelablePromises).not.toBeUndefined()
    })

    it('should add to cancelablePromises component array new cancelablePromise', () => {
      const component = shallow(<TestComponent />).instance()
      component.cancelablePromises = []

      waitDataAndSetState(fakePromise(), component, 'stateName')
      expect(component.cancelablePromises.length).toEqual(1)
    })

    describe('resolve', () => {
      it('should assing data to state when promise resolve', () => {
        const component = shallow(<TestComponent />).instance()

        return waitDataAndSetState(Promise.resolve('fakeResolve'), component, 'stateName')
          .then(() => expect(component.state.stateName).not.toBeUndefined())
      })
    })

    describe('reject', () => {
      it('should assing error to state when promise reject', () => {
        const component = shallow(<TestComponent />).instance()

        return waitDataAndSetState(rejectedPromise(), component, 'stateName')
          .then(() => expect(component.state.errors.length).toEqual(1))
      })

      it('should not assing twice error to state', () => {
        const component = shallow(<TestComponent />).instance()

        return waitDataAndSetState(rejectedPromise(), component, 'stateName')
          .then(() => {
            expect(component.state.errors.length).toEqual(1)
            return waitDataAndSetState(rejectedPromise(), component, 'stateName')
              .then(() => expect(component.state.errors.length).toEqual(1))
        })
      })
    })
  })
})
