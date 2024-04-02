// https://medium.com/@karenmarkosyan/how-to-manage-promises-into-dynamic-queue-with-vanilla-javascript-9d0d1f8d4df5

/**
 * Class that queues promises
 */
export default class Queue {
  static queue = []
  static queueOperation = []
  static pendingPromise = false
  static workingOnPromise = false
  static allowDequeue = true

  /**
   * Queues a promise
   * @param {Promise} promise
   * @returns {Promise} New promise
   */
  static enqueue (promise, operation): Promise<Response> {
    console.info('ENTER: utils > queue > enqueue > operation > ' + operation)
    return new Promise((resolve, reject) => {
      this.queueOperation.push(operation)
      this.queue.push({
        promise,
        resolve,
        reject
      })
    })
  }

  static setAllowDequeue (val) {
    console.trace('ENTER: utils > queue > setAllowDequeue\n' + JSON.stringify({ val: val }))
    this.allowDequeue = val
  }

  static clearQueue () {
    console.trace('ENTER: utils > queue > clearQueue')
    this.queue = []
    this.queueOperation = []
    this.allowDequeue = true
  }

  /**
   * Removes a promise from the queue
   * @returns {boolean} True/false
   */
  static dequeue (): boolean {
    console.trace('ENTER: utils > queue > dequeue')
    if (this.workingOnPromise) {
      return false
    }
    const item = this.queue.shift()
    this.queueOperation.shift()
    if (!item) {
      return false
    }
    try {
      this.workingOnPromise = true
      item
        .promise()
        .then(value => {
          this.workingOnPromise = false
          item.resolve(value)
        })
        .catch(err => {
          console.warn('utils > queue > dequeue: promise error\n' + JSON.stringify(err))
          this.workingOnPromise = false
          item.reject(err)
          this.dequeue()
        })
    } catch (err) {
      console.error('utils > queue > dequeue: Error\n' + JSON.stringify(err))
      this.workingOnPromise = false
      item.reject(err)
      this.dequeue()
    }
    return true
  }
}
