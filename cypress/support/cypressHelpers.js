const formatCurrency = (value) =>
  value.toFixed(2)

module.exports = {
  determinSubtotal (itemPrices) {
    const numItems = itemPrices.length
    let subtotal = 0
    for (let i = 0; i < Number(numItems); i++) {
      subtotal += Number(itemPrices[i])
    }
    subtotal = Number(subtotal).toFixed(2)
    return subtotal
  },

  formatCurrency: formatCurrency,

  determinTax (subtotal) {
    let taxes = Number(subtotal) * 0.07
    taxes = formatCurrency(taxes)
    return taxes
  },

  determinTotal (subtotal, taxes) {
    let total = Number(subtotal) + Number(taxes)
    total = formatCurrency(Number(total))
    return total
  },

  tenderExactAmountDue (itemPrices) {
    const subtotal = this.determinSubtotal(itemPrices)
    const tax = this.determinTax(subtotal)
    const total = this.determinTotal(subtotal, tax)
    return total
  }
}
