import { type } from 'os';

export default {
  afterFindOne(event) {
    const {result} = event
    const {coupons} = result

    if (typeof coupons !== 'undefined' && coupons.length >= 1) {
      result.sum = coupons.reduce((sum, coupon) => {
        let discountAmount = coupon.discount

        if (coupon.discount_type === 'percent') {
          discountAmount = result.sum / 100 * discountAmount
        }

        return sum < 0 ? 0 : sum - discountAmount
      }, result.sum)
    }
  }
}
